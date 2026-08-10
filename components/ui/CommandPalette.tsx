"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Check,
  Copy,
  CornerDownLeft,
  Download,
  FileText,
  Mail,
  Moon,
  Search,
  Sun,
} from "lucide-react";
// Lucide dropped its brand glyphs, so the social marks come from react-icons —
// the same source Icon.tsx uses.
import { SiGithub } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa6";
import { navLinks, siteConfig } from "@/data/portfolio";
import { registerCvDownload } from "@/lib/cvDownloads";
import { cn } from "@/lib/utils";

/**
 * ⌘K command palette.
 *
 * The single most "built by an engineer" thing on the page, and unlike most
 * portfolio flourishes it is genuinely the fastest way to get around: every
 * section, every external profile, the CV and the theme toggle are one keystroke
 * away. Keyboard-first by design — the mouse path is a fallback, not the point.
 */

/** Display order of the palette's sections. */
const GROUPS = ["Navigate", "Links", "Actions"] as const;

type Action = {
  id: string;
  label: string;
  hint: string;
  group: (typeof GROUPS)[number];
  icon: React.ComponentType<{ className?: string }>;
  run: () => void;
  /** Keeps the palette open so the visitor can see the result (e.g. "Copied"). */
  keepOpen?: boolean;
};

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [cursor, setCursor] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = useCallback(() => {
    const next = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", next);
    setIsDark(next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Private mode with storage disabled: the theme still applies this visit.
    }
  }, []);

  const actions = useMemo<Action[]>(() => {
    const navigate = (href: string) => () => {
      document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
    };

    return [
      ...navLinks.map((link) => ({
        id: `nav-${link.href}`,
        label: link.label,
        hint: "Jump to section",
        group: "Navigate" as const,
        icon: CornerDownLeft,
        run: navigate(link.href),
      })),
      {
        id: "github",
        label: "GitHub",
        hint: siteConfig.github,
        group: "Links",
        icon: SiGithub,
        run: () => window.open(`https://${siteConfig.github}`, "_blank", "noopener,noreferrer"),
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        hint: siteConfig.linkedin,
        group: "Links",
        icon: FaLinkedin,
        run: () => window.open(`https://${siteConfig.linkedin}`, "_blank", "noopener,noreferrer"),
      },
      {
        id: "email",
        label: "Send an email",
        hint: siteConfig.email,
        group: "Links",
        icon: Mail,
        run: () => {
          window.location.href = `mailto:${siteConfig.email}`;
        },
      },
      {
        id: "copy-email",
        label: "Copy email address",
        hint: siteConfig.email,
        group: "Actions",
        icon: copied ? Check : Copy,
        keepOpen: true,
        run: () => {
          navigator.clipboard?.writeText(siteConfig.email).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          });
        },
      },
      {
        id: "cv",
        label: "Download CV",
        hint: "PDF",
        group: "Actions",
        icon: Download,
        run: () => {
          registerCvDownload();
          const link = document.createElement("a");
          link.href = siteConfig.resumeUrl;
          link.download = "";
          link.click();
        },
      },
      {
        id: "theme",
        label: isDark ? "Switch to light mode" : "Switch to dark mode",
        hint: "Theme",
        group: "Actions",
        icon: isDark ? Sun : Moon,
        keepOpen: true,
        run: toggleTheme,
      },
      {
        id: "source",
        label: "View this site's source",
        hint: "GitHub repository",
        group: "Actions",
        icon: FileText,
        run: () =>
          window.open(`https://${siteConfig.github}/Portfolio`, "_blank", "noopener,noreferrer"),
      },
    ];
  }, [copied, isDark, toggleTheme]);

  // Grouped for display, but flattened in the *same* order the groups render in.
  // The keyboard cursor indexes this flat list, so rendering and selection can
  // never disagree regardless of how `actions` above happens to be ordered.
  const { grouped, results } = useMemo(() => {
    const q = query.trim().toLowerCase();
    const matches = q
      ? actions.filter(
          (action) =>
            action.label.toLowerCase().includes(q) ||
            action.hint.toLowerCase().includes(q) ||
            action.group.toLowerCase().includes(q)
        )
      : actions;

    const byGroup = GROUPS.map((group) => ({
      group,
      items: matches.filter((action) => action.group === group),
    })).filter((entry) => entry.items.length > 0);

    return { grouped: byGroup, results: byGroup.flatMap((entry) => entry.items) };
  }, [actions, query]);

  // A shrinking result list can leave the cursor past the end.
  useEffect(() => {
    setCursor((current) => Math.min(current, Math.max(results.length - 1, 0)));
  }, [results.length]);

  // Global open/close shortcut.
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((v) => !v);
      }
      if (event.key === "Escape") setOpen(false);
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Freeze the page behind the dialog so the backdrop can't be scrolled away.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setCursor(0);
    }
  }, [open]);

  function runAction(action: Action) {
    action.run();
    if (!action.keepOpen) setOpen(false);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor((c) => (c + 1) % Math.max(results.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor((c) => (c - 1 + results.length) % Math.max(results.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const action = results[cursor];
      if (action) runAction(action);
    }
  }

  // Keep the highlighted row in view during keyboard navigation.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [cursor]);

  return (
    <>
      <PaletteTrigger onClick={() => setOpen(true)} />

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[120] flex items-start justify-center px-4 pt-[12vh]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <button
              type="button"
              aria-label="Close command palette"
              onClick={() => setOpen(false)}
              className="absolute inset-0 cursor-default bg-background/70 backdrop-blur-md"
            />

            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Command palette"
              initial={{ opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.99 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border-hover bg-card shadow-lift"
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <Search className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
                <input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={onInputKeyDown}
                  placeholder="Search sections, links and actions…"
                  aria-label="Search commands"
                  // The dialog autofocuses this, and the global focus ring would
                  // draw a lime box around the whole field the instant it opens.
                  // The dialog border is the affordance here.
                  className="w-full bg-transparent py-4 text-sm text-foreground outline-none focus-visible:outline-none placeholder:text-muted"
                />
                <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-muted sm:block">
                  ESC
                </kbd>
              </div>

              <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-2">
                {results.length === 0 && (
                  <p className="px-3 py-8 text-center text-sm text-muted">
                    Nothing matches “{query}”.
                  </p>
                )}

                {grouped.map(({ group, items }) => {
                  // Offset of this group's first item within the flat list.
                  const offset = results.indexOf(items[0]);

                  return (
                    <div key={group} className="mb-1">
                      <p className="mono-label px-3 py-2">{group}</p>
                      {items.map((action, itemIndex) => {
                        const index = offset + itemIndex;
                        const active = index === cursor;
                        const ActionIcon = action.icon;

                        return (
                          <button
                            key={action.id}
                            type="button"
                            data-index={index}
                            onMouseEnter={() => setCursor(index)}
                            onClick={() => runAction(action)}
                            className={cn(
                              "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                              active ? "bg-surface-hover" : "hover:bg-surface"
                            )}
                          >
                            <ActionIcon
                              className={cn(
                                "h-4 w-4 shrink-0",
                                active ? "text-accent-fg" : "text-muted"
                              )}
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm text-foreground">
                                {action.label}
                              </span>
                              <span className="block truncate font-mono text-[11px] text-muted">
                                {action.hint}
                              </span>
                            </span>
                            {active && (
                              <ArrowUpRight
                                className="h-3.5 w-3.5 shrink-0 text-muted"
                                aria-hidden="true"
                              />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted">
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border px-1">↑</kbd>
                  <kbd className="rounded border border-border px-1">↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd className="rounded border border-border px-1">↵</kbd>
                  select
                </span>
                {copied && <span className="ml-auto text-accent-fg">Email copied</span>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/**
 * The affordance that tells visitors the palette exists at all. Rendered as a
 * fixed pill on desktop; on touch there is no ⌘K, so it is hidden and the
 * navbar's own controls carry the load.
 */
function PaletteTrigger({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group fixed bottom-6 right-6 z-[80] hidden items-center gap-2.5 rounded-full",
        "border border-border bg-card/80 px-4 py-2.5 backdrop-blur-md",
        "transition-colors duration-300 hover:border-accent md:flex"
      )}
    >
      <Search className="h-3.5 w-3.5 text-muted transition-colors group-hover:text-accent-fg" />
      <span className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted">
        Command
      </span>
      <kbd className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px] text-foreground">
        ⌘K
      </kbd>
    </button>
  );
}
