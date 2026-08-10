"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, X } from "lucide-react";
import { SiGithub } from "react-icons/si";
import type { FeaturedProject } from "@/data/portfolio";
import { TechIcon } from "@/components/ui/TechIcon";
import { cn } from "@/lib/utils";

/**
 * The detail dialog behind each featured project card.
 *
 * Two panes: the write-up on the left, and on the right either a working demo
 * or the project's cover art. The split is the reason this exists at all - a
 * card that can only ever link out to a repository asks a reviewer to leave the
 * page to find out whether the thing works.
 *
 * Dialog mechanics (backdrop, scroll lock, Escape, focus restore) mirror
 * CommandPalette so both modal surfaces on the site behave identically.
 */

/**
 * Loaded only when a project that declares it is opened, so neither the ~23MB
 * WASM runtime nor the 4.6MB corpus touches the initial bundle. ssr: false is
 * mandatory: the model has no meaning outside a browser, and `next build`
 * would try to evaluate it in Node.
 */
const SemanticSearch = dynamic(() => import("@/components/sections/SemanticSearch"), {
  ssr: false,
  loading: () => (
    <div className="space-y-2.5">
      <div className="h-12 animate-pulse rounded-xl bg-surface" />
      <div className="h-[86px] animate-pulse rounded-xl bg-surface" />
      <div className="h-[86px] animate-pulse rounded-xl bg-surface" />
    </div>
  ),
});

interface ProjectModalProps {
  project: FeaturedProject | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  // Whatever had focus before the dialog opened, so it can be handed back on
  // close rather than dumping the visitor at the top of the document.
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  // Portals need a real DOM node, which does not exist during the static
  // export's server render.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const open = project !== null;

  useEffect(() => {
    if (!open) return;

    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    panelRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      restoreFocusRef.current?.focus();
    };
  }, [open, onClose]);

  if (!mounted) return null;

  /*
   * Rendered into <body>, not in place. The card that opens this dialog lives
   * inside a scaled motion.article and a sticky wrapper, and a transformed
   * ancestor makes itself the containing block for position: fixed - the
   * "full screen" backdrop would be pinned to the card instead of the viewport.
   */
  return createPortal(
    <AnimatePresence>
      {project && (
        <motion.div
          className="fixed inset-0 z-[130] flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <button
            type="button"
            aria-label="Close project details"
            onClick={onClose}
            className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-md"
          />

          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.99 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="relative flex h-[min(88vh,52rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border-hover bg-card shadow-lift outline-none"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card/80 text-muted backdrop-blur-md transition-colors duration-300 hover:border-accent hover:text-accent-fg"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>

            {/*
             * Two independently scrolling panes from lg, where there is height
             * to divide. Below lg that split starves both halves - the demo got
             * roughly 40% of an 88vh dialog and its result list collapsed to a
             * sliver - so the whole dialog becomes one scrolling column instead.
             */}
            <div className="min-h-0 flex-1 overflow-y-auto lg:overflow-hidden">
              <div className="grid min-h-full grid-cols-1 lg:h-full lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
                {/* ── Detail pane ───────────────────────────────────────── */}
                <div className="p-6 sm:p-8 lg:min-h-0 lg:overflow-y-auto lg:border-r lg:border-border">
                  <div className="flex items-center gap-4">
                    <span className="display text-[clamp(2.5rem,5vw,3.5rem)] text-outline">
                      {project.number}
                    </span>
                    <div className="flex flex-col gap-1.5">
                      <span className="mono-label text-accent-fg">{project.category}</span>
                      <span className="mono-label">{project.year}</span>
                    </div>
                  </div>

                  <h2
                    id="project-modal-title"
                    className="mt-5 pr-10 text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
                  >
                    {project.title}
                  </h2>

                  <p className="mt-3 text-balance text-base leading-snug text-foreground/80">
                    {project.summary}
                  </p>

                  <p className="mt-4 text-sm leading-relaxed text-muted">{project.description}</p>

                  <dl className="mt-7 space-y-2.5 border-t border-border pt-6">
                    {project.highlights.map((item) => (
                      <div key={item.label} className="flex gap-4 text-sm">
                        <dt className="w-24 shrink-0 font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          {item.label}
                        </dt>
                        <dd className="min-w-0 flex-1 text-foreground/90">{item.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <div className="mt-7 flex flex-wrap gap-2">
                    {project.tech.map((tech) => (
                      <span
                        key={tech}
                        className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-muted"
                      >
                        <TechIcon name={tech} className="h-3.5 w-3.5" />
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-wrap items-center gap-3">
                    {project.liveDemoUrl && (
                      <a
                        href={project.liveDemoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-contrast transition-shadow duration-500 hover:shadow-glow"
                      >
                        Live demo
                        <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                      </a>
                    )}
                    <a
                      href={project.sourceCodeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full border border-border-hover px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors duration-500 hover:border-accent hover:text-accent-fg"
                    >
                      Source
                      <SiGithub className="h-3.5 w-3.5" aria-hidden="true" />
                    </a>
                  </div>
                </div>

                {/* ── Demo pane ─────────────────────────────────────────── */}
                <div
                  className={cn(
                    "flex flex-col border-t border-border bg-background/40 p-6 sm:p-8 lg:min-h-0 lg:border-t-0",
                    // Stacked on mobile, the write-up would push the demo about
                    // 700px below the fold - a long scroll for someone who just
                    // pressed "Try it live". Demo-carrying projects lead with it
                    // and let the prose follow. The dialog is still labelled by
                    // the h2, so reordering costs nothing to assistive tech.
                    project.demo && "order-first border-b border-t-0 lg:order-none lg:border-b-0"
                  )}
                >
                  {project.demo === "semantic-search" ? (
                    <>
                      {/* Clears the floating close button, which sits over this
                          corner whenever the demo pane is first in the flow. */}
                      <div className="shrink-0 pr-10 lg:pr-0">
                        <p className="mono-label text-accent-fg">Live demo</p>
                        <p className="mt-2 text-sm leading-relaxed text-muted">
                          all-MiniLM-L6-v2 runs entirely in your browser via WebAssembly,
                          scored against 3,000 pre-embedded postings. No server, no API calls.
                        </p>
                      </div>
                      <SemanticSearch className="mt-5 flex-1 lg:min-h-0" />

                      {/* Credit line: the library doing the work, the retrieval
                          method, and where the corpus came from. */}
                      <p className="mt-4 shrink-0 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-muted">
                        Built with @xenova/transformers · FAISS-free cosine search · 3,000
                        LinkedIn job postings
                      </p>
                    </>
                  ) : (
                    <div className="relative min-h-[260px] flex-1 overflow-hidden rounded-xl border border-border">
                      <Image
                        src={project.cover}
                        alt={`${project.title} cover artwork`}
                        fill
                        unoptimized
                        sizes="(min-width: 1024px) 50vw, 90vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
