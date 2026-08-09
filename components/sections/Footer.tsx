"use client";

import { ChevronUp } from "lucide-react";
import { footerContent } from "@/data/portfolio";

export function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="border-t border-white/5 py-8">
      <div className="section-container relative flex flex-col items-center gap-4 text-center sm:flex-row sm:justify-between sm:text-left">
        <p className="text-sm text-muted">{footerContent.copyright}</p>

        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Scroll to top"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary p-3 text-white transition-transform duration-200 hover:-translate-y-0.5 sm:absolute sm:left-1/2 sm:-translate-x-1/2"
        >
          <ChevronUp className="h-4 w-4" aria-hidden="true" />
        </button>

      </div>
    </footer>
  );
}
