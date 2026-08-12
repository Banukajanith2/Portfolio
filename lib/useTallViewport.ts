"use client";

import { useEffect, useState } from "react";

/**
 * Whether the viewport is tall enough for the sticky project stack to pin.
 *
 * Mirrors the `tall` screen in tailwind.config.ts, and the two have to be kept
 * in step: the CSS decides whether the cards pin, this decides whether they
 * scale, and a card that shrinks without pinning just looks like it is
 * collapsing on its own.
 *
 * Starts as `false` so the server output and the first client render agree -
 * there is no viewport to measure during the static export.
 */
const TALL_QUERY = "(min-height: 840px)";

export function useTallViewport(): boolean {
  const [tall, setTall] = useState(false);

  useEffect(() => {
    const query = window.matchMedia(TALL_QUERY);
    const sync = () => setTall(query.matches);

    sync();

    query.addEventListener("change", sync);
    return () => query.removeEventListener("change", sync);
  }, []);

  return tall;
}
