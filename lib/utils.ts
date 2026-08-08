import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Prefixes a public/ path with the deploy basePath ("" in dev, "/Portfolio" on
 * GitHub Pages). Needed because raw <a href> is never rewritten, and next/image
 * skips basePath when images.unoptimized is set.
 */
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}
