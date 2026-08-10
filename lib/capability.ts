"use client";

import { useEffect, useState } from "react";

/**
 * Decides how much 3D a given device should be asked to draw.
 *
 * A WebGL canvas is the one thing on this page that can genuinely ruin a cheap
 * phone: it holds the GPU busy every frame, drains battery, and heats the
 * device until the OS thermally throttles it. So rather than shipping one scene
 * and hoping, the visitor's hardware picks a tier up front, and the scene reads
 * its budget from that.
 *
 * The signals are all cheap, synchronous and widely supported. None of them is
 * precise on its own - `hardwareConcurrency` lies on some Androids and
 * `deviceMemory` is Chromium-only - so they are combined conservatively and the
 * runtime FPS monitor in useAdaptiveQuality corrects whatever this gets wrong.
 */

export type Tier = "off" | "low" | "high";

export interface Capability {
  tier: Tier;
  /** Upper bound for the renderer's pixel ratio. */
  maxDpr: number;
  /** Particle budget for the hero field. */
  particles: number;
  antialias: boolean;
  powerPreference: WebGLPowerPreference;
  /** False when the browser cannot give us a WebGL context at all. */
  supported: boolean;
}

const OFF: Capability = {
  tier: "off",
  maxDpr: 1,
  particles: 0,
  antialias: false,
  powerPreference: "default",
  supported: false,
};

/**
 * Probes for a real WebGL context rather than trusting `!!window.WebGLRenderingContext`.
 * Browsers expose the constructor even when the GPU is blocklisted and context
 * creation will fail, which is exactly the case we need to catch.
 */
function detectWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    if (!gl) return false;

    // Release it immediately; contexts are a limited resource (browsers cap at
    // around 16) and leaking probe contexts can starve the real canvas.
    const lose = (gl as WebGLRenderingContext).getExtension("WEBGL_lose_context");
    lose?.loseContext();
    return true;
  } catch {
    return false;
  }
}

function measure(): Capability {
  if (typeof window === "undefined") return OFF;

  // Motion sensitivity outranks everything: an always-animating background is
  // precisely what this preference exists to suppress.
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return OFF;

  if (!detectWebGL()) return OFF;

  const cores = navigator.hardwareConcurrency ?? 4;
  // Chromium-only, in GB. Absent elsewhere, so treat unknown as "adequate"
  // rather than penalising Safari and Firefox for not reporting.
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  const coarsePointer = window.matchMedia("(pointer: coarse)").matches;
  const narrow = window.matchMedia("(max-width: 768px)").matches;

  // Anything genuinely weak gets no canvas. The CSS aurora already renders a
  // complete background, so this is a downgrade in richness, not a broken page.
  if (cores <= 2 || memory <= 2) return OFF;

  const isMobile = coarsePointer || narrow;
  const midRange = cores <= 4 || memory <= 4;

  if (isMobile || midRange) {
    return {
      tier: "low",
      // 1.25 keeps text-adjacent edges from looking soft while cutting the
      // fragment count roughly in half versus a 3x phone display.
      maxDpr: 1.25,
      particles: 900,
      antialias: false,
      // Explicitly ask for the efficiency GPU: this is decoration, and a
      // background that flattens the battery is a bad trade.
      powerPreference: "low-power",
      supported: true,
    };
  }

  return {
    tier: "high",
    maxDpr: 1.75,
    particles: 2600,
    antialias: true,
    powerPreference: "high-performance",
    supported: true,
  };
}

/**
 * Returns `null` until measured on the client. Callers should render nothing
 * (or the CSS fallback) while it is null - that keeps the server render and the
 * first client render identical, so there is no hydration mismatch.
 */
export function useCapability(): Capability | null {
  const [capability, setCapability] = useState<Capability | null>(null);

  useEffect(() => {
    setCapability(measure());
  }, []);

  return capability;
}
