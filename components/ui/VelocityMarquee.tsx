"use client";

import { useRef, type ReactNode } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * A marquee whose speed and direction respond to scrolling.
 *
 * Idle, it drifts at `baseSpeed`. Scrolling down pushes it along; scrolling up
 * drags it back the other way. That coupling is the whole point - a constant
 * marquee is wallpaper, but one that reacts makes the page feel physical.
 *
 * The track holds two identical copies of `children`, and the offset is wrapped
 * modulo one copy's width, so the seam never becomes visible.
 */

interface VelocityMarqueeProps {
  children: ReactNode;
  /** px per second at rest. Negative scrolls right-to-left. */
  baseSpeed?: number;
  /** How hard scroll velocity multiplies the base speed. */
  sensitivity?: number;
  className?: string;
  trackClassName?: string;
}

export function VelocityMarquee({
  children,
  baseSpeed = -40,
  sensitivity = 4,
  className,
  trackClassName,
}: VelocityMarqueeProps) {
  const copyRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  const x = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  // Smooth the raw velocity, then clamp it: an unbounded multiplier turns a
  // flick of the wheel into a blur.
  const smoothVelocity = useSpring(scrollVelocity, { damping: 46, stiffness: 380 });
  const velocityFactor = useTransform(smoothVelocity, [-1400, 0, 1400], [-1, 0, 1], {
    clamp: true,
  });

  useAnimationFrame((_, delta) => {
    const copyWidth = copyRef.current?.offsetWidth ?? 0;
    if (!copyWidth) return;

    const seconds = delta / 1000;
    const speed = baseSpeed + baseSpeed * velocityFactor.get() * sensitivity;
    // Wrap into [-copyWidth, 0] so copy two slides into copy one's place
    // exactly, with no visible reset.
    const next = (((x.get() + speed * seconds) % copyWidth) + copyWidth) % copyWidth - copyWidth;
    x.set(next);
  });

  if (reduced) {
    return (
      <div className={cn("overflow-hidden", className)}>
        <div className={cn("flex w-max", trackClassName)}>{children}</div>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <motion.div style={{ x }} className={cn("flex w-max will-change-transform", trackClassName)}>
        <div ref={copyRef} className={cn("flex shrink-0", trackClassName)}>
          {children}
        </div>
        <div aria-hidden="true" className={cn("flex shrink-0", trackClassName)}>
          {children}
        </div>
      </motion.div>
    </div>
  );
}
