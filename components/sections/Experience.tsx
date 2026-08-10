"use client";

import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "framer-motion";
import { experience, type ExperienceItem } from "@/data/portfolio";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

type Track = "work" | "education";

/**
 * A single spine with a progress line that fills as the section scrolls.
 *
 * The previous two-column layout paired unrelated jobs and degrees row by row
 * purely because they shared an index, which implied a relationship that isn't
 * there. A tabbed single track keeps each history in its own reading order, and
 * the filling spine gives the section a reason to be scrolled through.
 */
export function Experience() {
  const [track, setTrack] = useState<Track>("work");
  const timelineRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ["start 0.8", "end 0.6"],
  });
  const lineScale = useSpring(scrollYProgress, { stiffness: 140, damping: 30, restDelta: 0.001 });

  const items = experience.filter((item) => item.type === track);

  return (
    <section id="path" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading
          index="05"
          label="Trajectory"
          title="Where I've been"
          action={
            <div className="flex gap-2" role="tablist" aria-label="Switch history">
              {(["work", "education"] as Track[]).map((option) => {
                const isActive = track === option;

                return (
                  <button
                    key={option}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setTrack(option)}
                    className={cn(
                      "relative rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300",
                      isActive ? "text-accent-contrast" : "text-muted hover:text-foreground"
                    )}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="experience-pill"
                        className="absolute inset-0 rounded-full bg-accent"
                        transition={{ type: "spring", stiffness: 420, damping: 36 }}
                      />
                    )}
                    <span className="relative">{option}</span>
                  </button>
                );
              })}
            </div>
          }
        />

        <div ref={timelineRef} className="relative mt-14 pl-8 sm:pl-12">
          {/* Track: a static hairline with the lime progress line drawn over it. */}
          <div
            aria-hidden="true"
            className="absolute bottom-0 left-0 top-0 w-px bg-border sm:left-2"
          />
          <motion.div
            aria-hidden="true"
            style={reduced ? { scaleY: 1 } : { scaleY: lineScale }}
            className="absolute bottom-0 left-0 top-0 w-px origin-top bg-accent sm:left-2"
          />

          <div className="flex flex-col gap-5">
            {items.map((item, index) => (
              <Reveal key={`${track}-${item.org}-${item.role}`} delay={index * 0.06} x={16} y={16}>
                <EntryCard item={item} index={index} />
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function EntryCard({ item, index }: { item: ExperienceItem; index: number }) {
  return (
    <article className="group relative">
      {/* Node on the spine. Sits outside the card so the card can move on hover
          while the marker stays anchored to the timeline. */}
      <span
        aria-hidden="true"
        className="absolute -left-8 top-7 flex h-3 w-3 items-center justify-center sm:-left-[2.6rem]"
      >
        <span className="absolute h-3 w-3 rounded-full bg-accent/25 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
        <span className="relative h-1.5 w-1.5 rounded-full bg-border-hover transition-colors duration-500 group-hover:bg-accent" />
      </span>

      <div className="rounded-2xl border border-border bg-surface p-5 transition-all duration-500 ease-smooth hover:translate-x-1 hover:border-accent/50 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <p className="mono-label text-accent-fg">
              {String(index + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-2.5 text-lg font-semibold tracking-tight text-foreground sm:text-xl">
              {item.role}
            </h3>
            <p className="mt-1 text-sm text-muted">{item.org}</p>
          </div>

          <span className="shrink-0 rounded-full border border-border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
            {item.date}
          </span>
        </div>

        <ul className="mt-5 space-y-2 border-t border-border pt-5">
          {item.bullets.map((bullet, bulletIndex) => (
            <li key={bulletIndex} className="flex gap-3 text-sm leading-relaxed text-muted">
              <span
                aria-hidden="true"
                className="mt-[0.5rem] h-1 w-1 shrink-0 rounded-full bg-accent"
              />
              {bullet}
            </li>
          ))}
        </ul>
      </div>
    </article>
  );
}
