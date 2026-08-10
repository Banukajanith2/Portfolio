"use client";

import { useEffect, useState } from "react";

/**
 * Tracks the active theme by watching the `dark` class the theme toggle writes
 * onto <html>.
 *
 * There is no context provider for the theme - the inline script in the layout
 * sets the class before paint and the toggle mutates it directly - so observing
 * the attribute is how a component downstream stays in step with it.
 *
 * Starts as `true` to match the class <html> ships with, so the first render
 * agrees with the server output.
 */
export function useIsDark(): boolean {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    const root = document.documentElement;
    const sync = () => setIsDark(root.classList.contains("dark"));

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return isDark;
}
