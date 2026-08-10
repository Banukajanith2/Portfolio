"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";

/**
 * Pulls its child toward the pointer while the pointer is nearby.
 *
 * Replaces the old window-level mousemove listener: this binds to the element's
 * own pointer events, so the cost is proportional to what the user is actually
 * touching rather than firing for every magnet on the page on every mouse move.
 * The `padding` field grows the hit area past the visual bounds so the pull
 * starts *before* the cursor arrives, which is what makes it feel magnetic.
 */

interface MagneticProps {
  children: ReactNode;
  className?: string;
  /** How far outside the element the field extends, in px. */
  padding?: number;
  /** 0-1. Fraction of the cursor offset the element travels. */
  strength?: number;
}

export function Magnetic({ children, className, padding = 28, strength = 0.32 }: MagneticProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.5 });
  const y = useSpring(useMotionValue(0), { stiffness: 260, damping: 20, mass: 0.5 });

  function handlePointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    x.set((event.clientX - centerX) * strength);
    y.set((event.clientY - centerY) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    // The padded wrapper is the sensor; the inner motion element is what moves.
    // Negative margin keeps the extra hit area from affecting layout.
    <div
      ref={ref}
      onPointerMove={handlePointerMove}
      onPointerLeave={reset}
      style={{ padding, margin: -padding }}
      className={className}
    >
      <motion.div style={{ x, y }}>{children}</motion.div>
    </div>
  );
}
