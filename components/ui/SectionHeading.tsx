"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { KineticText } from "@/components/ui/KineticText";
import { cn } from "@/lib/utils";

/**
 * The section header used everywhere on the page.
 *
 * The mono index + rule is the device that ties the whole site together - it
 * frames each section as an entry in a numbered document rather than a
 * standalone block, which is most of what separates this from a stack of
 * generic centred headings.
 */

interface SectionHeadingProps {
  /** Two-digit section index, e.g. "03". */
  index: string;
  /** Mono eyebrow label, e.g. "SELECTED WORK". */
  label: string;
  title: string;
  description?: string;
  /** Slot for a link or control that sits opposite the title. */
  action?: ReactNode;
  className?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  index,
  label,
  title,
  description,
  action,
  className,
  align = "left",
}: SectionHeadingProps) {
  const reduced = useReducedMotion();
  const centered = align === "center";

  return (
    <header className={cn("w-full", className)}>
      <div className={cn("flex items-center gap-4", centered && "justify-center")}>
        <span className="mono-label text-accent-fg">{index}</span>
        <span className="mono-label">{label}</span>
        {/* The rule draws itself in as the header enters, which gives the eye
            somewhere to travel before the title lands. */}
        <motion.span
          aria-hidden="true"
          className="h-px flex-1 origin-left bg-border"
          initial={reduced ? undefined : { scaleX: 0 }}
          whileInView={reduced ? undefined : { scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
        />
      </div>

      <div
        className={cn(
          "mt-6 flex flex-wrap items-end gap-x-8 gap-y-4",
          centered ? "justify-center text-center" : "justify-between"
        )}
      >
        {/* Solid fill, not a background-clip gradient: clipping a background to
            text is unreliable once descendants are transformed, and every word
            in here is a transformed span. */}
        <KineticText
          as="h2"
          text={title}
          className="display max-w-4xl text-[clamp(2.25rem,6vw,4.5rem)] text-foreground"
        />
        {action}
      </div>

      {description && (
        <p
          className={cn(
            "mt-5 max-w-xl text-balance text-base leading-relaxed text-muted",
            centered && "mx-auto text-center"
          )}
        >
          {description}
        </p>
      )}
    </header>
  );
}
