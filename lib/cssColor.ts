"use client";

import * as THREE from "three";

/**
 * Reads a palette token out of globals.css so WebGL material colours stay tied
 * to the design system instead of being a second, drifting copy of it.
 *
 * The tokens are stored as bare "R G B" channels (see globals.css) precisely so
 * Tailwind can inject an alpha, which means `getPropertyValue` hands back
 * "214 255 63" rather than anything CSS-colour-shaped. Parsing it here is the
 * price of that storage format.
 *
 * Call this from an effect, never during render: it forces style resolution on
 * <html>, and on the server there is no computed style to read at all.
 */
export function readRgbToken(
  name: string,
  fallback: readonly [number, number, number]
): [number, number, number] {
  if (typeof window === "undefined") return [...fallback];

  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  // Tolerate "214 255 63", "214, 255, 63" and the "R G B / A" slash form.
  const parts = raw.split(/[\s,/]+/).filter(Boolean).slice(0, 3).map(Number);

  if (parts.length < 3 || parts.some((n) => !Number.isFinite(n))) return [...fallback];
  return [parts[0], parts[1], parts[2]];
}

/**
 * Writes a palette token into an existing THREE.Color.
 *
 * The colour space argument is load-bearing. `Color.set("#d6ff3f")` treats the
 * hex as sRGB and converts it into the renderer's linear working space, so a
 * raw `setRGB(214/255, ...)` - which defaults to the *working* space - comes out
 * visibly brighter than the same colour set from hex. Naming sRGB explicitly
 * makes this token-driven path match the hard-coded hexes in the other layers.
 */
export function applyRgbToken(
  target: THREE.Color,
  name: string,
  fallback: readonly [number, number, number]
): THREE.Color {
  const [r, g, b] = readRgbToken(name, fallback);
  return target.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace);
}
