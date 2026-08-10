"use client";

import type { ElementType, ReactNode } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

/**
 * The house entrance animation: rise + fade + a short defocus.
 *
 * The blur is what separates this from a stock fade — it reads as the element
 * resolving into place rather than simply appearing. It only animates during
 * the entrance and never re-runs (viewport.once), so the repaint cost is paid
 * once per element.
 */

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait before starting. Use for hand-tuned choreography. */
  delay?: number;
  duration?: number;
  /** Travel distance in px. Negative values fall from above. */
  y?: number;
  x?: number;
  blur?: number;
  /** Fraction of the element that must be visible before it fires. */
  amount?: number;
  as?: ElementType;
}

export function Reveal({
  children,
  className,
  delay = 0,
  duration = 0.85,
  y = 28,
  x = 0,
  blur = 8,
  amount = 0,
  as = "div",
}: RevealProps) {
  const reduced = useReducedMotion();
  const MotionTag = motion[as as keyof typeof motion] as typeof motion.div;

  if (reduced) {
    const Tag = as as ElementType;
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, x, filter: `blur(${blur}px)` }}
      whileInView={{ opacity: 1, y: 0, x: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "0px 0px -80px 0px", amount }}
      transition={{ delay, duration, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </MotionTag>
  );
}

/**
 * Wraps a list so its children cascade instead of arriving together. Pair with
 * <RevealItem> for each child; the stagger is driven by the parent so items
 * don't need to know their own index.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.07,
  delay = 0,
  amount = 0.15,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  amount?: number;
}) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -80px 0px", amount }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: stagger, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

export function RevealItem({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  if (reduced) return <div className={className}>{children}</div>;

  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}
