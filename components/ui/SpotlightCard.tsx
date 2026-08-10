"use client";

import { useRef, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * A surface that lights up under the pointer.
 *
 * Two layers ride the cursor: a soft accent wash inside the card, and a
 * brighter ring painted on the border. The border layer is what sells it —
 * a plain glow reads as a hover state, but a border that catches the light
 * reads as a physical edge.
 *
 * Position is pushed to CSS custom properties rather than React state so
 * pointer movement never triggers a re-render.
 */

interface SpotlightCardProps {
  children: ReactNode;
  /** Applied to the outer shell — sizing and border treatment (h-full, rounded-*). */
  className?: string;
  /**
   * Applied to the content wrapper — padding and inner layout (flex, grid).
   *
   * The two are separate because the light layers have to be absolute siblings
   * of the content, which means the content lives one level below the shell.
   * Putting `grid` or `flex` on the shell would lay out that single wrapper
   * rather than the children inside it.
   */
  contentClassName?: string;
  /** Radius of the light pool in px. */
  radius?: number;
  /** 0–1. Higher reads as a harder light. */
  intensity?: number;
  as?: "div" | "article" | "li";
}

export function SpotlightCard({
  children,
  className,
  contentClassName,
  radius = 380,
  intensity = 0.12,
  as: Tag = "div",
}: SpotlightCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  function handlePointerMove(event: React.PointerEvent<HTMLElement>) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  }

  return (
    <Tag
      // @ts-expect-error -- the ref type narrows per tag; all three are HTMLElements.
      ref={ref}
      onPointerMove={handlePointerMove}
      className={cn(
        "group/spot relative overflow-hidden rounded-2xl border border-border bg-surface",
        "transition-colors duration-500 ease-smooth hover:border-border-hover",
        className
      )}
      style={
        {
          "--spot-radius": `${radius}px`,
          "--spot-intensity": intensity,
        } as React.CSSProperties
      }
    >
      {/* Inner wash. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          background:
            "radial-gradient(var(--spot-radius) circle at var(--mx, 50%) var(--my, 50%), rgb(var(--accent) / var(--spot-intensity)), transparent 70%)",
        }}
      />

      {/* Border catch-light: a full-bleed gradient masked down to the 1px frame
          so only the edge nearest the cursor brightens. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100"
        style={{
          padding: "1px",
          background:
            "radial-gradient(var(--spot-radius) circle at var(--mx, 50%) var(--my, 50%), rgb(var(--accent) / 0.55), transparent 60%)",
          WebkitMask: "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      <div className={cn("relative", contentClassName)}>{children}</div>
    </Tag>
  );
}
