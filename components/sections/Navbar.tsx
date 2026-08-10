"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "framer-motion";
import { Download, Menu, Moon, Sun, X } from "lucide-react";
import { navLinks, siteConfig } from "@/data/portfolio";
import { useActiveSection } from "@/lib/useActiveSection";
import { registerCvDownload } from "@/lib/cvDownloads";
import { cn } from "@/lib/utils";

/**
 * A floating command bar rather than a full-width header.
 *
 * At the top of the page it sits wide and transparent; once scrolling starts it
 * contracts into a glass pill. That transition does the work a border used to:
 * it separates the nav from the hero without ever drawing a hard line across
 * the design.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const [scrolled, setScrolled] = useState(false);

  const sectionIds = navLinks.map((link) => link.href.replace("#", ""));
  const activeId = useActiveSection(sectionIds);

  const { scrollY } = useScroll();
  useMotionValueEvent(scrollY, "change", (value) => setScrolled(value > 40));

  // The inline script in the layout has already applied the stored theme; read
  // it back so the icon matches what the visitor is actually looking at.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  // The palette can flip the theme too; stay in step with it.
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setIsDark(document.documentElement.classList.contains("dark"))
    );
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const toggleTheme = () => {
    const next = !isDark;
    setIsDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private mode with storage disabled: the theme still applies this visit.
    }
  };

  return (
    <motion.header
      initial={{ y: -24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
      className="fixed inset-x-0 top-0 z-[95] px-4 pt-4 sm:px-6 sm:pt-5"
    >
      <nav
        className={cn(
          "mx-auto flex items-center justify-between gap-6 rounded-full transition-all duration-700 ease-smooth",
          scrolled
            ? "max-w-3xl border border-border bg-card/70 px-4 py-2.5 shadow-lift backdrop-blur-xl"
            : "max-w-[88rem] border border-transparent px-2 py-3"
        )}
      >
        <a
          href="#home"
          className="group flex shrink-0 items-center gap-2.5 font-mono text-sm tracking-tight text-foreground"
        >
          {/* A live dot beats a generic code-bracket logo: it says something. */}
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-accent animate-pulse-ring" />
            <span className="relative h-2 w-2 rounded-full bg-accent" />
          </span>
          <span className="font-semibold">banuka</span>
          <span className="text-muted transition-colors group-hover:text-accent-fg">.dev</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = activeId === id;

            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "relative block rounded-full px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.14em] transition-colors duration-300",
                    isActive ? "text-accent-contrast" : "text-muted hover:text-foreground"
                  )}
                >
                  {/* layoutId lets the lime pill slide between items instead of
                      cross-fading, which is what makes the nav feel connected. */}
                  {isActive && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-accent"
                      transition={{ type: "spring", stiffness: 400, damping: 34 }}
                    />
                  )}
                  <span className="relative">{link.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden shrink-0 items-center gap-2 md:flex">
          <a
            href={siteConfig.resumeUrl}
            download
            onClick={registerCvDownload}
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground transition-colors duration-300 hover:border-accent hover:text-accent-fg"
          >
            CV
            <Download className="h-3.5 w-3.5" aria-hidden="true" />
          </a>

          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle isDark={isDark} onToggle={toggleTheme} />
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-foreground"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            className="mt-2 overflow-hidden rounded-2xl border border-border bg-card/95 backdrop-blur-xl md:hidden"
          >
            <ul className="flex flex-col p-2">
              {navLinks.map((link, index) => {
                const id = link.href.replace("#", "");
                const isActive = activeId === id;

                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "flex items-center justify-between rounded-xl px-4 py-3 font-mono text-xs uppercase tracking-[0.14em] transition-colors",
                        isActive ? "bg-accent text-accent-contrast" : "text-muted hover:bg-surface"
                      )}
                    >
                      {link.label}
                      <span className={cn("text-[10px]", isActive ? "opacity-60" : "opacity-40")}>
                        {String(index + 1).padStart(2, "0")}
                      </span>
                    </a>
                  </li>
                );
              })}

              <li className="p-2 pt-3">
                <a
                  href={siteConfig.resumeUrl}
                  download
                  onClick={registerCvDownload}
                  className="flex items-center justify-center gap-2 rounded-full border border-border-hover px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-foreground"
                >
                  Download CV
                  <Download className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function ThemeToggle({ isDark, onToggle }: { isDark: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className="group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border text-foreground transition-colors duration-300 hover:border-accent"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={isDark ? "sun" : "moon"}
          initial={{ y: 14, opacity: 0, rotate: -45 }}
          animate={{ y: 0, opacity: 1, rotate: 0 }}
          exit={{ y: -14, opacity: 0, rotate: 45 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="absolute"
        >
          {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
