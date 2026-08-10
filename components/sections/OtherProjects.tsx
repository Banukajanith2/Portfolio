"use client";

import { useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { otherProjects } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { cn } from "@/lib/utils";

/**
 * A dense index list instead of a grid of cards.
 *
 * Four equal cards give four small projects the same visual weight as the
 * featured work, which flattens the hierarchy. A list reads as an appendix -
 * scannable, clearly secondary - and the row that the cursor is on expands
 * while its neighbours dim, so the page still responds to the pointer.
 *
 * A single floating panel follows the cursor and shows the hovered row's
 * details; one shared element rather than one per row keeps the DOM flat.
 */
export function OtherProjects() {
  const [hovered, setHovered] = useState<number | null>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 260, damping: 28, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 260, damping: 28, mass: 0.5 });

  function handlePointerMove(event: React.PointerEvent<HTMLUListElement>) {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  const active = hovered === null ? null : otherProjects[hovered];

  return (
    <section className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading
          index="04"
          label="Archive"
          title="Everything else"
          description="Smaller builds, experiments and coursework worth keeping around."
        />

        <Reveal className="mt-12">
          <ul
            ref={listRef}
            onPointerMove={handlePointerMove}
            onPointerLeave={() => setHovered(null)}
            className="relative border-t border-border"
          >
            {otherProjects.map((project, index) => (
              <li key={project.title}>
                <a
                  href={project.sourceCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onPointerEnter={() => setHovered(index)}
                  onFocus={() => setHovered(index)}
                  onBlur={() => setHovered(null)}
                  className={cn(
                    "group relative flex items-center gap-5 border-b border-border py-6 transition-all duration-500 ease-smooth sm:gap-8 sm:py-8",
                    // Everything except the hovered row recedes, which is what
                    // makes the pointer feel like it's picking something up.
                    hovered !== null && hovered !== index
                      ? "opacity-40"
                      : "opacity-100"
                  )}
                >
                  {/* Lime wash that wipes in from the left behind the row. */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -inset-x-4 origin-left scale-x-0 rounded-lg bg-accent/[0.06] transition-transform duration-500 ease-smooth group-hover:scale-x-100 sm:-inset-x-6"
                  />

                  <span className="relative mono-label w-8 shrink-0 sm:w-12">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                  <span className="relative flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-baseline sm:gap-6">
                    <span className="text-lg font-semibold tracking-tight text-foreground transition-transform duration-500 ease-smooth group-hover:translate-x-1 sm:text-2xl">
                      {project.title}
                    </span>
                    <span className="truncate text-sm text-muted sm:hidden">
                      {project.description}
                    </span>
                  </span>

                  <span className="relative hidden shrink-0 font-mono text-[11px] uppercase tracking-[0.14em] text-muted md:block">
                    {project.stack}
                  </span>

                  <span className="relative hidden w-14 shrink-0 text-right font-mono text-[11px] text-muted sm:block">
                    {project.year}
                  </span>

                  <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border text-muted transition-all duration-500 ease-smooth group-hover:border-accent group-hover:bg-accent group-hover:text-accent-contrast">
                    <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </a>
              </li>
            ))}

            {/* Cursor-following detail panel. Hidden below lg and whenever the
                visitor prefers reduced motion - the row itself already carries
                the information on those paths. */}
            {!reduced && (
              <motion.div
                aria-hidden="true"
                style={{ x: springX, y: springY }}
                animate={{ opacity: active ? 1 : 0, scale: active ? 1 : 0.9 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="pointer-events-none absolute left-0 top-0 z-20 hidden w-72 lg:block"
              >
                {/* Centring lives on an inner element: Framer writes `transform`
                    inline for x/y, which would overwrite Tailwind's translate
                    utilities if they were on the same node. */}
                <div className="-translate-x-1/2 -translate-y-[calc(100%+1.5rem)] rounded-xl border border-border-hover bg-card/95 p-5 shadow-lift backdrop-blur-md">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/15 text-accent-fg">
                    {active && <Icon name={active.icon} className="h-4 w-4" />}
                  </span>
                  <p className="mt-3 text-sm leading-relaxed text-muted">{active?.description}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-fg">
                    View source →
                  </p>
                </div>
              </motion.div>
            )}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
