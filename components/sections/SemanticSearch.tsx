"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Search } from "lucide-react";
import { initSearch, semanticSearch, type JobResult } from "@/lib/semanticSearch";
import { cn } from "@/lib/utils";

/**
 * The live half of the Semantic Job Search Engine card.
 *
 * Everything here runs in the visitor's browser: the model is fetched once as
 * WebAssembly, the corpus is a static binary, and matching is a dot product.
 * There is no endpoint behind this, which is the whole point of the demo.
 */

/*
 * The corpus is Kaggle's Data Science Job Postings (2024), so the presets stay
 * inside the domain it actually covers - a "React developer" chip retrieves
 * whatever is least unlike it and lands around 0.47, which reads as the demo
 * being broken rather than the corpus not containing frontend roles.
 *
 * Fuller phrasings also score better here: documents are long, so a three-word
 * query has little to align against.
 */
const PRESETS = [
  "Machine learning engineer with Python",
  "Data analyst with SQL and dashboards",
  "Data engineer building pipelines",
  "DevOps AWS",
];

const DEBOUNCE_MS = 500;
const MIN_QUERY = 2;
const TOP_K = 6;

/*
 * Raw cosine against this corpus lands roughly in 0.25-0.80: every document is
 * a title plus a skills list plus 400 characters of description, and that much
 * text pulls even a perfect match well below 1.0. Printing 0.76 as "76%" reads
 * as a weak result when it is actually the best one available, so the bar is
 * rescaled against the range the corpus really produces.
 *
 * The raw figure is never hidden - it sits under the percentage in mono, and
 * the footnote states the scale.
 */
const MATCH_FLOOR = 0.25;
const MATCH_CEIL = 0.8;

function matchPercent(score: number) {
  const t = (score - MATCH_FLOOR) / (MATCH_CEIL - MATCH_FLOOR);
  return Math.round(Math.min(1, Math.max(0, t)) * 100);
}

type Status = "idle" | "loading" | "done" | "empty" | "error";

export function SemanticSearch({ className }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<JobResult[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  // The model is ~23MB on the first search only. Worth saying so, rather than
  // leaving a visitor watching skeletons wondering if it has hung.
  const [warmed, setWarmed] = useState(false);
  const reduced = useReducedMotion();

  // Monotonic token: a slow earlier query must not overwrite a faster later
  // one. Only the newest request is allowed to commit its results.
  const requestId = useRef(0);

  useEffect(() => {
    // Deliberately not awaited and deliberately silent - this is a warm-up, and
    // nothing on screen is waiting for it.
    void initSearch();
  }, []);

  const run = useCallback(async (raw: string) => {
    const trimmed = raw.trim();
    const id = requestId.current + 1;
    requestId.current = id;

    if (trimmed.length < MIN_QUERY) {
      setStatus("idle");
      setResults([]);
      return;
    }

    setStatus("loading");

    try {
      const hits = await semanticSearch(trimmed, TOP_K);
      if (requestId.current !== id) return;
      setResults(hits);
      setStatus(hits.length > 0 ? "done" : "empty");
      setWarmed(true);
    } catch {
      if (requestId.current !== id) return;
      setResults([]);
      setStatus("error");
    }
  }, []);

  // Debounced reaction to typing. Chips call run() directly and skip this.
  useEffect(() => {
    const timer = setTimeout(() => void run(query), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [query, run]);

  function handlePreset(preset: string) {
    setQuery(preset);
    void run(preset);
  }

  return (
    <div className={cn("flex flex-col lg:min-h-0", className)}>
      <div className="flex items-center gap-3 rounded-xl border border-border bg-background px-4 transition-colors duration-300 focus-within:border-accent">
        <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder='Try "someone who builds recommender systems"'
          aria-label="Search job postings by meaning"
          // The container already draws the accent border on focus; the global
          // ring would stack a second lime box on top of it.
          className="w-full bg-transparent py-3.5 text-sm text-foreground outline-none placeholder:text-muted focus-visible:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset}
            type="button"
            onClick={() => handlePreset(preset)}
            className={cn(
              "rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em]",
              "transition-colors duration-300 ease-smooth",
              query === preset
                ? "border-accent bg-accent/10 text-accent-fg"
                : "border-border text-muted hover:border-border-hover hover:text-foreground"
            )}
          >
            {preset}
          </button>
        ))}
      </div>

      {/*
       * From lg the dialog is two fixed-height columns, so min-h-0 lets this
       * pane shrink and take its own scrollbar. Below lg the dialog scrolls as
       * a single column instead - an internal scroller there would be squeezed
       * to nothing by the write-up above it, which is exactly what it did.
       */}
      <div className="mt-4 flex-1 lg:min-h-0 lg:overflow-y-auto lg:pr-1" aria-live="polite">
        {status === "loading" && (
          <div className="space-y-2.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-[86px] animate-pulse rounded-xl bg-surface" />
            ))}
            {!warmed && (
              <p className="pt-1 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                Fetching model weights · first search only
              </p>
            )}
          </div>
        )}

        {status === "idle" && (
          <p className="px-1 py-8 text-center text-sm text-muted">
            Describe a role in your own words. Matching is by meaning, so the words you
            type need not appear in the posting.
          </p>
        )}

        {status === "empty" && (
          <p className="px-1 py-8 text-center text-sm text-muted">
            No matches found - try different keywords
          </p>
        )}

        {status === "error" && (
          <p className="px-1 py-8 text-center text-sm text-muted">
            The model could not be loaded. Check your connection and try again.
          </p>
        )}

        {status === "done" && (
          <AnimatePresence mode="popLayout">
            {results.map((result, index) => (
              <motion.div
                key={result.index}
                layout={!reduced}
                initial={reduced ? undefined : { opacity: 0, y: 12 }}
                animate={reduced ? undefined : { opacity: 1, y: 0 }}
                exit={reduced ? undefined : { opacity: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className="group mb-2.5 rounded-xl border border-border bg-surface p-4 transition-colors duration-300 hover:border-border-hover"
              >
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {result.job_title}
                    </p>
                    <p className="mt-0.5 truncate text-sm text-muted">{result.company}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="block font-mono text-xs text-accent-fg">
                      {matchPercent(result.score)}% match
                    </span>
                    <span className="block font-mono text-[10px] text-muted">
                      {result.score.toFixed(3)} cos
                    </span>
                  </div>
                </div>

                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                  {result.job_location} · {result.job_type}
                </p>

                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-muted">
                  {result.job_skills}
                </p>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {status === "done" && (
        <p className="mt-3 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
          Match % rescales cosine {MATCH_FLOOR}-{MATCH_CEIL}, the range this corpus produces
        </p>
      )}
    </div>
  );
}

export default SemanticSearch;
