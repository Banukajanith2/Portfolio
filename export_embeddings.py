"""
Export the Job Search Engine corpus as static assets the portfolio can search
entirely in the browser.

The original project answers queries with a FAISS IndexFlatL2 sitting behind a
Python process. There is no Python on GitHub Pages, so this script bakes the
same corpus down to two files that a static site can fetch:

  public/search/embeddings.bin - 3000 x 384 float32, row-major, little-endian
  public/search/meta.json      - the display fields for those same 3000 rows

Row i of meta.json describes vector i of embeddings.bin. That ordering is the
only thing tying the two files together, so neither may be sorted or filtered.

Vectors are L2-normalized here, which the FAISS version did not do. Once every
vector is unit length, a dot product *is* the cosine similarity, so the browser
side needs one multiply-accumulate loop and no square roots. It is also the
metric all-MiniLM-L6-v2 was actually trained for - the raw L2 distance the
FAISS index used is a proxy for it, not the real thing.

Must run under the Job Search Engine's own venv. Its pickles were written by
pandas 3.0, and the pandas 2.x on PATH raises NotImplementedError unpickling
their string columns:

    & "D:/9. Programming/Other/Job Search Engine/.venv/Scripts/python.exe" export_embeddings.py
"""

import json
import os

import numpy as np
import pandas as pd
from sentence_transformers import SentenceTransformer

# Resolved against this file, not the shell's working directory, so the script
# works no matter where it is invoked from.
ROOT = os.path.dirname(os.path.abspath(__file__))

SEARCH_TEXTS_PATH = os.path.join(ROOT, "../../Other/Job Search Engine/data/search_texts.pkl")
META_PATH = os.path.join(ROOT, "../../Other/Job Search Engine/data/jobs_meta.pkl")

OUT_DIR = os.path.join(ROOT, "public", "search")

MODEL_NAME = "all-MiniLM-L6-v2"
BATCH_SIZE = 32

# Only the fields the result card actually renders. job_summary and job_link are
# the two biggest columns and neither is displayed, so dropping them is most of
# what keeps meta.json small enough to ship.
META_FIELDS = ["job_title", "company", "job_location", "job_type", "job_skills"]

# The skills column runs to several hundred characters. The card line-clamps to
# two lines, so anything past this is downloaded and never seen.
SKILLS_CHARS = 120


def main():
    search_texts = pd.read_pickle(os.path.abspath(SEARCH_TEXTS_PATH))
    meta = pd.read_pickle(os.path.abspath(META_PATH))
    print(f"Loaded {len(search_texts)} search texts")
    print(f"Loaded metadata {meta.shape}")

    # A mismatch here would silently pair every card with the wrong vector.
    if len(search_texts) != len(meta):
        raise SystemExit(
            f"Row count mismatch: {len(search_texts)} texts vs {len(meta)} meta rows"
        )

    print(f"Loading model '{MODEL_NAME}' (downloads ~90MB on first run)...")
    model = SentenceTransformer(MODEL_NAME)

    embeddings = model.encode(
        search_texts.tolist(),
        batch_size=BATCH_SIZE,
        show_progress_bar=True,
        convert_to_numpy=True,
    )
    embeddings = np.asarray(embeddings, dtype=np.float32)

    # L2-normalize row-wise. keepdims lets the division broadcast back across
    # the 384 columns; the clip guards against a zero vector making it NaN.
    norms = np.linalg.norm(embeddings, axis=1, keepdims=True)
    embeddings = embeddings / np.clip(norms, 1e-12, None)

    os.makedirs(OUT_DIR, exist_ok=True)

    bin_path = os.path.join(OUT_DIR, "embeddings.bin")
    json_path = os.path.join(OUT_DIR, "meta.json")

    # "<f4" pins little-endian float32 regardless of the host architecture,
    # which is what Float32Array assumes on every platform a browser runs on.
    embeddings.astype("<f4").tofile(bin_path)

    records = []
    for row in meta[META_FIELDS].itertuples(index=False):
        record = dict(zip(META_FIELDS, row))
        record = {k: ("" if pd.isna(v) else str(v)) for k, v in record.items()}
        record["job_skills"] = record["job_skills"][:SKILLS_CHARS]
        records.append(record)

    # No indentation and no spaces after separators: this is machine-read only,
    # and pretty-printing it costs roughly a third of the file size.
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(records, f, ensure_ascii=False, separators=(",", ":"))

    count, dims = embeddings.shape
    sample = embeddings[0]
    self_dot = float(np.dot(sample, sample))
    max_norm_error = float(np.abs(np.linalg.norm(embeddings, axis=1) - 1.0).max())

    print()
    print(f"Documents exported   : {count}")
    print(f"Embedding dimensions : {dims}")
    print(f"Unit norm check      : dot(v0, v0) = {self_dot:.6f}  "
          f"(max error across all rows: {max_norm_error:.2e})")
    print(f"embeddings.bin       : {os.path.getsize(bin_path) / 1024:,.1f} KB "
          f"({os.path.getsize(bin_path):,} bytes, expected {count * dims * 4:,})")
    print(f"meta.json            : {os.path.getsize(json_path) / 1024:,.1f} KB")
    print()
    print(f"Wrote -> {bin_path}")
    print(f"Wrote -> {json_path}")


if __name__ == "__main__":
    main()
