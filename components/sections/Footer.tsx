"use client";

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";
import { footerContent, heroSocials, siteConfig } from "@/data/portfolio";
import { SocialIcon } from "@/components/ui/SocialIcon";

/**
 * Closes the page with the name at maximum scale, outlined rather than filled
 * so it reads as a watermark and doesn't compete with the contact CTA above it.
 */
export function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-border pt-16">
      <div className="section-container">
        <div className="flex flex-col gap-10 pb-14 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="mono-label">Available for work</p>
            <a
              href={`mailto:${siteConfig.email}`}
              className="mt-3 block text-lg font-medium tracking-tight text-foreground transition-colors duration-300 hover:text-accent-fg sm:text-xl"
            >
              {siteConfig.email}
            </a>
          </div>

          <div className="flex flex-col gap-4 sm:items-end">
            <div className="flex items-center gap-3">
              {heroSocials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted transition-all duration-500 ease-smooth hover:-translate-y-0.5 hover:border-accent hover:text-accent-fg"
                >
                  <SocialIcon name={social.icon} className="h-4 w-4" />
                </a>
              ))}
            </div>

            <LocalClock />
          </div>
        </div>

        {/*
          Oversized wordmark, kept to one line. The upper clamp bound is what
          stops it running past the container: at 88rem the string is 13
          characters, so anything above ~10rem overflows and clips mid-word.
        */}
        <p
          aria-hidden="true"
          className="display select-none whitespace-nowrap text-outline text-[clamp(2rem,10.5vw,10rem)]"
        >
          {siteConfig.firstName.split(" ")[0]} {siteConfig.lastName}
        </p>

        <div className="flex flex-col gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] text-muted">© {footerContent.copyright}</p>
          <p className="max-w-md font-mono text-[11px] leading-relaxed text-muted">
            {footerContent.note}
          </p>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            className="group flex w-fit items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-muted transition-colors hover:text-accent-fg"
          >
            Back to top
            <ArrowUp className="h-3.5 w-3.5 transition-transform duration-500 ease-smooth group-hover:-translate-y-1" />
          </button>
        </div>
      </div>
    </footer>
  );
}

/**
 * The visitor's-eye view of my local time. Rendered only after mount: the
 * server has no idea what time it is in Colombo, so rendering it during SSR
 * would produce a hydration mismatch.
 */
function LocalClock() {
  const [time, setTime] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      setTime(
        new Intl.DateTimeFormat("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          timeZone: "Asia/Colombo",
        }).format(new Date())
      );
    }

    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <p className="font-mono text-[11px] text-muted" suppressHydrationWarning>
      {siteConfig.location} - {time ?? "--:--"} local
    </p>
  );
}
