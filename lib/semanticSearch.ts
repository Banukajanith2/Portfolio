/**
 * Semantic job search, run entirely in the visitor's browser.
 *
 * The corpus was embedded ahead of time by export_embeddings.py and ships as two
 * static files under public/search/. At query time the same model runs in
 * WebAssembly to embed the query, and the match is a dot product against those
 * 3000 pre-computed vectors. There is no server in the loop at any point.
 *
 * Every vector on both sides is L2-normalized - the corpus by numpy at export
 * time, the query by the pipeline's own `normalize: true`. That makes the dot
 * product identical to cosine similarity, so the hot loop below is a plain
 * multiply-accumulate with no square roots in it.
 *
 * Nothing here is imported at module scope by design; see getEmbeddingPipeline.
 */

import { asset } from "@/lib/utils";

export type JobResult = {
  job_title: string;
  company: string;
  job_location: string;
  job_type: string;
  job_skills: string;
  score: number;
  index: number;
};

/** A row of meta.json: the display fields, before a query has scored it. */
type JobMeta = Omit<JobResult, "score" | "index">;

type SearchAssets = {
  embeddings: Float32Array;
  meta: JobMeta[];
  dims: number;
  count: number;
};

/**
 * The single narrow slice of the transformers.js surface this file touches.
 * Declared locally so the package is never imported for its types either - a
 * top-level `import type` is erased at build, but it is one edit away from
 * becoming a real import.
 */
type FeatureExtractionPipeline = (
  text: string,
  options: { pooling: "mean"; normalize: boolean }
) => Promise<{ data: Float32Array }>;

// Module-level, so the 4.6MB of vectors and the ~23MB of model weights are each
// paid for once per page load no matter how many queries get typed.
let cachedAssets: SearchAssets | null = null;
let pipelineCache: FeatureExtractionPipeline | null = null;

// Concurrent callers must await the same in-flight promise rather than each
// kicking off their own fetch. initSearch() and a fast first keystroke race
// exactly this way, and without it the model downloads twice.
let assetsPromise: Promise<SearchAssets> | null = null;
let pipelinePromise: Promise<FeatureExtractionPipeline> | null = null;

/**
 * Loads the pre-computed corpus. `asset()` applies the deploy basePath, which
 * is "" in dev and "/Portfolio" on GitHub Pages - a bare "/search/..." would
 * 404 in production.
 */
async function loadAssets(): Promise<SearchAssets> {
  if (cachedAssets) return cachedAssets;
  if (assetsPromise) return assetsPromise;

  assetsPromise = (async () => {
    const [binRes, metaRes] = await Promise.all([
      fetch(asset("/search/embeddings.bin")),
      fetch(asset("/search/meta.json")),
    ]);

    if (!binRes.ok || !metaRes.ok) {
      throw new Error(`Search assets failed to load (${binRes.status}, ${metaRes.status})`);
    }

    const [buffer, meta] = await Promise.all([
      binRes.arrayBuffer(),
      metaRes.json() as Promise<JobMeta[]>,
    ]);

    // The file is little-endian float32 and so is every platform a browser runs
    // on, so the buffer can be viewed directly with no per-value decoding.
    const embeddings = new Float32Array(buffer);
    const count = meta.length;
    const dims = embeddings.length / count;

    if (!Number.isInteger(dims)) {
      throw new Error(`Corpus mismatch: ${embeddings.length} floats across ${count} rows`);
    }

    cachedAssets = { embeddings, meta, dims, count };
    return cachedAssets;
  })();

  try {
    return await assetsPromise;
  } catch (error) {
    // Clear the rejected promise so a later attempt can retry rather than
    // replaying the same failure forever.
    assetsPromise = null;
    throw error;
  }
}

/**
 * Cosine similarity between the query and document `docIndex`.
 *
 * Both operands are unit length, so their dot product is already the cosine of
 * the angle between them and needs no further normalisation.
 */
function cosineSimilarity(
  queryVec: Float32Array,
  allVecs: Float32Array,
  docIndex: number,
  dims: number
): number {
  const offset = docIndex * dims;
  let dot = 0;
  for (let i = 0; i < dims; i += 1) {
    dot += queryVec[i] * allVecs[offset + i];
  }
  return dot;
}

/**
 * Loads the WASM model on first use.
 *
 * The import has to stay inside the function body. At module scope it would be
 * pulled into the build graph and evaluated during `next build`, which runs in
 * Node with no browser globals - and it would also drag ~23MB of runtime into
 * the initial bundle for every visitor who never touches the search box.
 */
async function getEmbeddingPipeline(): Promise<FeatureExtractionPipeline> {
  if (pipelineCache) return pipelineCache;
  if (pipelinePromise) return pipelinePromise;

  pipelinePromise = (async () => {
    const { pipeline, env } = await import("@xenova/transformers");

    // Without this, transformers.js looks for the weights at /models/... on our
    // own origin first, which is a guaranteed 404 on a static export. Turning
    // local lookup off sends it straight to the Hugging Face CDN.
    env.allowLocalModels = false;

    pipelineCache = (await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2", {
      quantized: true,
    })) as unknown as FeatureExtractionPipeline;

    return pipelineCache;
  })();

  try {
    return await pipelinePromise;
  } catch (error) {
    pipelinePromise = null;
    throw error;
  }
}

/**
 * Embeds a query into the same 384-dimension space as the corpus.
 *
 * `pooling: "mean"` collapses the per-token outputs into one sentence vector,
 * and `normalize: true` makes it unit length to match the exported corpus.
 */
async function encodeQuery(query: string): Promise<Float32Array> {
  const pipe = await getEmbeddingPipeline();
  const output = await pipe(query, { pooling: "mean", normalize: true });
  return output.data;
}

/** Ranks the corpus against `query` and returns the closest `topK` jobs. */
export async function semanticSearch(query: string, topK = 6): Promise<JobResult[]> {
  const [queryVec, { embeddings, meta, dims, count }] = await Promise.all([
    encodeQuery(query),
    loadAssets(),
  ]);

  if (queryVec.length !== dims) {
    throw new Error(`Query is ${queryVec.length}-dim, corpus is ${dims}-dim`);
  }

  // Rank an index array rather than building 3000 objects and sorting those -
  // only the handful that survive need to be materialised.
  const order = new Array<number>(count);
  const scores = new Float32Array(count);
  for (let i = 0; i < count; i += 1) {
    order[i] = i;
    scores[i] = cosineSimilarity(queryVec, embeddings, i, dims);
  }
  order.sort((a, b) => scores[b] - scores[a]);

  return order.slice(0, topK).map((index) => ({
    ...meta[index],
    score: Math.round(scores[index] * 1000) / 1000,
    index,
  }));
}

/**
 * Warms both caches in the background so the first real query is not stuck
 * behind a ~23MB model download.
 *
 * Failures are swallowed on purpose: nothing is on screen waiting for this, and
 * whatever went wrong will surface again - visibly this time - on a real search.
 */
export async function initSearch(): Promise<void> {
  try {
    await Promise.all([loadAssets(), getEmbeddingPipeline()]);
  } catch {
    // Warm-up only. Intentionally silent.
  }
}
