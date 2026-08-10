"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Word-by-word rise-out-of-a-mask reveal for display headings.
 *
 * Each word sits in an overflow-hidden wrapper and starts fully below it, so
 * the text appears to be uncovered rather than faded in. Splitting by word
 * rather than character keeps the DOM small and - unlike a per-character split -
 * leaves the heading readable to screen readers as a single label.
 *
 * The clipping box is the wrapper's line box, which at the tight display
 * leading (0.86) sits *above* the descenders of g/j/y/p and would shave them
 * off. `pb/-mb` grows the clip box downward without moving anything in layout;
 * both are in em so they track clamp() font sizes.
 */

const CLIP_RELIEF = "pb-[0.18em] -mb-[0.18em]";

interface KineticTextProps {
  text: string;
  className?: string;
  /** Seconds between consecutive words. */
  stagger?: number;
  delay?: number;
  /** Fires on scroll into view instead of immediately on mount. */
  onView?: boolean;
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
}

export function KineticText({
  text,
  className,
  stagger = 0.055,
  delay = 0,
  onView = true,
  as: Tag = "span",
}: KineticTextProps) {
  const reduced = useReducedMotion();
  const words = text.split(" ");

  if (reduced) {
    return <Tag className={className}>{text}</Tag>;
  }

  const animationProps = onView
    ? { whileInView: "visible" as const, viewport: { once: true, amount: 0.3 } }
    : { animate: "visible" as const };

  return (
    <Tag className={className} aria-label={text}>
      <motion.span
        aria-hidden="true"
        initial="hidden"
        {...animationProps}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
      >
        {words.map((word, index) => (
          // inline-block so overflow-hidden actually clips; the trailing space
          // lives outside the clip box so words still wrap naturally.
          <span
            key={`${word}-${index}`}
            className={cn("inline-block overflow-hidden align-bottom", CLIP_RELIEF)}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: { y: "110%" },
                visible: { y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
              }}
            >
              {word}
            </motion.span>
          </span>
        )).flatMap((node, index) =>
          // Spaces are emitted as siblings rather than inside the clip box so a
          // long heading can still break between words.
          index < words.length - 1 ? [node, <span key={`sp-${index}`}> </span>] : [node]
        )}
      </motion.span>
    </Tag>
  );
}

/**
 * Per-character variant, for short strings only (a name, a single word). The
 * DOM cost is one span per glyph, so never point this at a paragraph.
 *
 * Deliberately unmasked: a per-character clip box would need relief on every
 * glyph and still breaks on accents, so this leans on travel + fade instead.
 */
export function KineticChars({
  text,
  className,
  stagger = 0.03,
  delay = 0,
}: {
  text: string;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <span className={className}>{text}</span>;
  }

  return (
    <span className={cn("inline-block", className)} aria-label={text}>
      <motion.span
        aria-hidden="true"
        className="inline-block"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
        }}
      >
        {Array.from(text).map((char, index) => (
          <motion.span
            key={index}
            // A space collapses inside an inline-block, so give it explicit width.
            className={cn("inline-block", char === " " && "w-[0.28em]")}
            variants={{
              hidden: { y: "40%", opacity: 0, filter: "blur(10px)" },
              visible: {
                y: 0,
                opacity: 1,
                filter: "blur(0px)",
                transition: { duration: 1, ease: [0.16, 1, 0.3, 1] },
              },
            }}
          >
            {char === " " ? " " : char}
          </motion.span>
        ))}
      </motion.span>
    </span>
  );
}
