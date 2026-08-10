"use client";

import { useEffect } from "react";
import Lenis from "lenis";

/**
 * Smooth scrolling, via Lenis.
 *
 * Lenis was chosen over GSAP ScrollSmoother for one structural reason: it
 * animates the *native* scroll position rather than transforming a wrapper
 * element. That means everything already built on scroll here - Framer Motion's
 * useScroll and useVelocity, the sticky project stack, IntersectionObserver in
 * useActiveSection, and CSS position: sticky - keeps working untouched. A
 * transform-based smoother breaks all of those, because the document stops
 * actually scrolling.
 *
 * It also avoids adding a second animation engine: this is ~3KB beside the
 * Framer Motion system the site already uses, where GSAP + ScrollTrigger would
 * be roughly 70KB of overlapping capability.
 */
export function SmoothScroll() {
  useEffect(() => {
    // Inertial scrolling is motion the visitor did not ask for, and it is
    // disorienting for anyone sensitive to it. Native scroll is the correct
    // behaviour here.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      // Short enough to still feel like scrolling rather than gliding; past
      // roughly 1.2 the page starts to feel disconnected from the wheel.
      duration: 0.9,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      // Touch devices already have well-tuned native inertia, and overriding it
      // is the single most common way smooth scroll ruins a phone.
      smoothWheel: true,
      syncTouch: false,
    });

    let frame = 0;
    function raf(time: number) {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    }
    frame = requestAnimationFrame(raf);

    // In-page anchors are handled by Lenis so they ease rather than jump.
    //
    // No manual offset here: `scroll-padding-top` in globals.css already
    // reserves room for the fixed navbar and Lenis honours it, so passing an
    // offset as well lands the section twice as far down the page.
    function onClick(event: MouseEvent) {
      const anchor = (event.target as HTMLElement | null)?.closest?.('a[href^="#"]');
      if (!anchor) return;

      const href = anchor.getAttribute("href");
      if (!href || href === "#") return;

      const el = document.querySelector(href);
      if (!el) return;

      event.preventDefault();
      lenis.scrollTo(el as HTMLElement);
    }

    document.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("click", onClick);
      lenis.destroy();
    };
  }, []);

  return null;
}
