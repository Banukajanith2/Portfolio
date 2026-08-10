"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

/**
 * The three page-wide atmospheric layers. All are decorative, all sit behind or
 * above content without ever taking pointer events, and all are cheap enough to
 * leave mounted for the life of the page.
 */

/**
 * Slow-drifting lime blooms. Kept at very low opacity: the point is to stop the
 * flat ink background reading as dead space, not to be seen as "a gradient".
 */
export function Aurora() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="absolute inset-0 grid-backdrop mask-radial" />

      <div
        className="absolute -left-[15%] top-[-10%] h-[55vmax] w-[55vmax] rounded-full opacity-[0.13] blur-[110px] animate-drift"
        style={{ background: "radial-gradient(circle, rgb(var(--accent)), transparent 65%)" }}
      />
      <div
        className="absolute -right-[10%] top-[35%] h-[45vmax] w-[45vmax] rounded-full opacity-[0.08] blur-[120px] animate-drift"
        style={{
          background: "radial-gradient(circle, rgb(var(--accent)), transparent 65%)",
          animationDelay: "-8s",
          animationDirection: "reverse",
        }}
      />
    </div>
  );
}

/**
 * Film grain. A single inline feTurbulence tile repeated across the viewport —
 * no network request, and it's what stops the large flat panels from banding.
 */
export function Grain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[100] mix-blend-overlay"
      style={{
        opacity: "var(--noise-opacity)",
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

/** Reading-progress hairline pinned to the very top of the viewport. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 160, damping: 30, restDelta: 0.001 });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed inset-x-0 top-0 z-[90] h-[2px] origin-left bg-accent"
    />
  );
}

/**
 * A soft light that follows the cursor.
 *
 * Only mounts for devices with a real pointer — on touch there is no cursor to
 * follow and the layer would just be a wasted composite. Positioned by writing
 * to style directly inside a rAF-throttled handler, so it never re-renders.
 */
export function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const fine = window.matchMedia("(pointer: fine)");
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (!fine.matches || calm.matches) return;

    let frame = 0;
    let x = 0;
    let y = 0;

    function paint() {
      frame = 0;
      el!.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    }

    function handleMove(event: MouseEvent) {
      x = event.clientX;
      y = event.clientY;
      el!.style.opacity = "1";
      // Coalesce: pointer events can outpace the display, and only the latest
      // position matters.
      if (!frame) frame = requestAnimationFrame(paint);
    }

    function handleLeave() {
      el!.style.opacity = "0";
    }

    window.addEventListener("mousemove", handleMove, { passive: true });
    document.addEventListener("mouseleave", handleLeave);

    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseleave", handleLeave);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none fixed left-0 top-0 z-0 h-[420px] w-[420px] opacity-0 transition-opacity duration-500 will-change-transform"
      style={{
        // Centre the pool on the cursor via margin, not a translate utility:
        // the rAF handler writes `transform` outright and would overwrite it.
        marginLeft: "-210px",
        marginTop: "-210px",
        background: "radial-gradient(circle, rgb(var(--accent) / 0.06), transparent 60%)",
      }}
    />
  );
}
