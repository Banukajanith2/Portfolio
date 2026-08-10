"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Code2, Download, Menu, Moon, Sun, X } from "lucide-react";
import { navLinks, siteConfig } from "@/data/portfolio";
import { useActiveSection } from "@/lib/useActiveSection";
import { registerCvDownload } from "@/lib/cvDownloads";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const sectionIds = navLinks.map((link) => link.href.replace("#", ""));
  const activeId = useActiveSection(sectionIds);

  // The inline script in the layout has already applied the stored theme; read
  // it back so the icon matches what the visitor is actually looking at.
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
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
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
    >
      <nav className="section-container flex h-16 items-center justify-between sm:h-20">
        <a href="#home" className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Code2 className="h-5 w-5 text-primary-400" aria-hidden="true" />
          {siteConfig.firstName}
        </a>

        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => {
            const id = link.href.replace("#", "");
            const isActive = activeId === id;
            return (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={cn(
                    "relative py-1 text-sm font-medium uppercase tracking-wider transition-colors duration-200",
                    isActive ? "text-foreground" : "text-muted hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="navbar-active-indicator"
                      className="absolute -bottom-1 left-0 right-0 h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </a>
              </li>
            );
          })}
        </ul>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            href={siteConfig.resumeUrl}
            download
            variant="primary"
            onClick={registerCvDownload}
            className="px-6 py-2.5 text-xs md:px-6 md:py-2.5"
          >
            Download CV
            <Download className="h-4 w-4" aria-hidden="true" />
          </Button>
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface"
          >
            {isDark ? <Sun className="h-4 w-4" aria-hidden="true" /> : <Moon className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-foreground md:hidden"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
        </button>
      </nav>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <ul className="section-container flex flex-col gap-1 py-4">
              {navLinks.map((link) => {
                const id = link.href.replace("#", "");
                const isActive = activeId === id;
                return (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        "block rounded-lg px-3 py-2.5 text-sm font-medium uppercase tracking-wider transition-colors",
                        isActive ? "bg-surface text-foreground" : "text-muted hover:bg-surface hover:text-foreground"
                      )}
                    >
                      {link.label}
                    </a>
                  </li>
                );
              })}
              <li className="mt-2 flex items-center gap-3 px-3">
                <Button
                  href={siteConfig.resumeUrl}
                  download
                  variant="primary"
                  onClick={registerCvDownload}
                  className="w-full text-xs"
                >
                  Download CV
                  <Download className="h-4 w-4" aria-hidden="true" />
                </Button>
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface"
                >
                  {isDark ? (
                    <Sun className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Moon className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}
