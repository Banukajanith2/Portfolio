"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { techStack } from "@/data/portfolio";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { TechIcon } from "@/components/ui/TechIcon";
import { cn } from "@/lib/utils";

const ALL = "All";

/**
 * Filterable stack grid.
 *
 * The old version was four static cards of icons — accurate, but nothing to
 * read. Making the categories filters turns the same data into something the
 * visitor operates, and `layout` on the tiles means switching filters plays as
 * a physical rearrangement rather than a repaint.
 */
export function TechStack() {
  const [active, setActive] = useState<string>(ALL);

  const categories = useMemo(() => [ALL, ...techStack.map((group) => group.category)], []);

  const visible = useMemo(() => {
    const groups = active === ALL ? techStack : techStack.filter((g) => g.category === active);
    return groups.flatMap((group) =>
      group.items.map((item) => ({ ...item, category: group.category }))
    );
  }, [active]);

  return (
    <section id="skills" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading
          index="02"
          label="Capabilities"
          title="The tools I reach for"
          description="Filter by discipline. Everything here is something I've shipped with, not just read about."
        />

        <Reveal className="mt-12">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter technologies">
            {categories.map((category) => {
              const isActive = active === category;

              return (
                <button
                  key={category}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setActive(category)}
                  className={cn(
                    "relative rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300",
                    isActive ? "text-accent-contrast" : "text-muted hover:text-foreground"
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="tech-filter-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 420, damping: 36 }}
                    />
                  )}
                  <span className="relative">{category}</span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <motion.ul
          layout
          className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
        >
          <AnimatePresence mode="popLayout">
            {visible.map((item) => (
              <motion.li
                key={item.name}
                layout
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.92 }}
                transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
                className="group"
              >
                <div
                  className={cn(
                    "flex h-full flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface p-5",
                    "transition-all duration-500 ease-smooth hover:-translate-y-1 hover:border-accent hover:bg-surface-hover"
                  )}
                >
                  <TechIcon
                    name={item.icon}
                    className="h-7 w-7 transition-transform duration-500 ease-smooth group-hover:scale-110"
                  />
                  <span className="text-center text-xs text-muted transition-colors duration-300 group-hover:text-foreground">
                    {item.name}
                  </span>
                </div>
              </motion.li>
            ))}
          </AnimatePresence>
        </motion.ul>
      </div>
    </section>
  );
}
