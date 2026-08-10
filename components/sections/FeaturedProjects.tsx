"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight, ExternalLink } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { featuredProjects, type FeaturedProject } from "@/data/portfolio";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechIcon } from "@/components/ui/TechIcon";

const TOTAL = featuredProjects.length;

/**
 * Stacking cards: each project pins to the top of the viewport and the previous
 * one scales down behind it, so the set reads as a deck being dealt.
 *
 * The layout inside each card is deliberately editorial - an oversized index,
 * a one-line thesis, then a labelled spec table. The old three-image collage is
 * gone; it was the same placeholder repeated three times, which added nothing a
 * reviewer could evaluate.
 */
function ProjectCard({ project, index }: { project: FeaturedProject; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"],
  });

  // Cards further down the stack end up slightly smaller, which is what creates
  // the sense of depth once several are layered.
  const targetScale = 1 - (TOTAL - 1 - index) * 0.035;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  // Drifts the cover art inside its frame as the card travels - a small
  // parallax that keeps the image from feeling pasted on.
  const imageY = useTransform(scrollYProgress, [0, 1], ["-8%", "8%"]);

  return (
    // Sticky only from lg up: these cards are taller than a phone viewport, and
    // a pinned card you cannot scroll to the bottom of is worse than no effect.
    <div
      ref={containerRef}
      className="lg:sticky"
      style={{ top: `${96 + index * 26}px` }}
    >
      <motion.article
        style={reduced ? undefined : { scale }}
        className="group relative origin-top overflow-hidden rounded-3xl border border-border bg-card shadow-lift"
      >
        {/* Accent hairline that sweeps in along the top edge on hover. */}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px origin-left scale-x-0 bg-accent transition-transform duration-700 ease-smooth group-hover:scale-x-100"
        />

        <div className="grid grid-cols-1 gap-8 p-6 sm:p-8 lg:grid-cols-2 lg:gap-12 lg:p-10">
          {/* ── Text column ─────────────────────────────────────────── */}
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <span className="display text-[clamp(3rem,7vw,5.5rem)] text-outline">
                {project.number}
              </span>
              <div className="flex flex-col gap-1.5">
                <span className="mono-label text-accent-fg">{project.category}</span>
                <span className="mono-label">{project.year}</span>
              </div>
            </div>

            <h3 className="mt-6 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              {project.title}
            </h3>

            <p className="mt-3 text-balance text-base leading-snug text-foreground/80 sm:text-lg">
              {project.summary}
            </p>

            <p className="mt-4 text-sm leading-relaxed text-muted">{project.description}</p>

            {/* Spec table - the part a reviewer actually scans. */}
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

            <div className="mt-auto flex flex-wrap items-center gap-3 pt-8">
              {project.liveDemoUrl && (
                <a
                  href={project.liveDemoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/link inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.14em] text-accent-contrast transition-shadow duration-500 hover:shadow-glow"
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

          {/* ── Cover art ───────────────────────────────────────────── */}
          <div className="relative min-h-[240px] overflow-hidden rounded-2xl border border-border lg:min-h-full">
            <motion.div style={reduced ? undefined : { y: imageY }} className="absolute -inset-y-[8%] inset-x-0">
              <Image
                src={project.cover}
                alt={`${project.title} cover artwork`}
                fill
                unoptimized
                sizes="(min-width: 1024px) 45vw, 90vw"
                className="object-cover transition-transform duration-[1200ms] ease-smooth group-hover:scale-105"
              />
            </motion.div>

            <a
              href={project.liveDemoUrl ?? project.sourceCodeUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${project.title}`}
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-background/70 backdrop-blur-md transition-all duration-500 ease-smooth hover:bg-accent hover:text-accent-contrast"
            >
              <ArrowUpRight className="h-5 w-5" aria-hidden="true" />
            </a>
          </div>
        </div>
      </motion.article>
    </div>
  );
}

export function FeaturedProjects() {
  return (
    <section id="projects" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading
          index="03"
          label="Selected Work"
          title="Things I've built"
          description="Three projects that best show how I work - from raw data through to a shipped interface."
        />

        {/* The tall spacer under the last card gives the stack room to finish
            unpinning before the next section arrives. */}
        <div className="mt-14 flex flex-col gap-6 pb-[30vh]">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
