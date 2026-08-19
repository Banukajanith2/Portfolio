"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { otherProjects, type OtherProject } from "@/data/portfolio";
import { buildMarkdown, folderName } from "@/lib/archiveDoc";
import { MarkdownSource } from "@/components/editor/MarkdownSource";
import { EditorTerminal } from "@/components/editor/EditorTerminal";
import {
  ActivityIcon,
  ChevronIcon,
  FolderIcon,
  MarkdownIcon,
  type ActivityIconKey,
} from "@/components/editor/EditorIcons";
import { cn } from "@/lib/utils";

/**
 * The archive as a VS Code window on macOS.
 *
 * Why an editor rather than the index list that was here before: a list of six
 * rows is read in two seconds and forgotten. A file tree shows the same six at
 * rest, and the shape happens to fit - a project really does have a readme, a
 * demo and a repo. It also carries far more per project (full description,
 * stack, tags, status) without any of it being hidden behind a hover.
 *
 * Structure:
 *
 *   explorer      one folder per project, each holding Project-Details.md
 *   click folder  expands it, opens the file, and marks it in the tree
 *   editor        the rendered preview by default; the markdown source is one
 *                 click away, as a split view
 *   panel         a working terminal, collapsed until asked for
 *
 * ── Colour ──────────────────────────────────────────────────────────────
 *
 * Every grey is a site token, so the window resolves to the page's own #0C0D11
 * card and #101116 surface in dark and follows the light theme for free.
 * Everything VS Code paints blue - active tab border, selected row, primary
 * button, headings - is lime here, so the single-accent rule holds. The only
 * two things off-palette are the macOS traffic lights and the tan folder icon,
 * both of which look broken in lime.
 *
 * ── No imagery, by decision ─────────────────────────────────────────────
 *
 * There is no screenshot or video anywhere in this window. An earlier pass gave
 * each project a media slot backed by a generated figure until a real capture
 * existed; that is placeholder art in the frame where the real thing goes, and
 * an empty box is worse. Four of the six projects are notebooks with no UI to
 * capture. The document carries the project on its text, as a README does.
 */

const TAB_LABEL = "Project-Details.md";

const ACTIVITY_VIEWS: { key: ActivityIconKey; label: string }[] = [
  { key: "explorer", label: "Explorer" },
  { key: "search", label: "Search" },
  { key: "branch", label: "Source control" },
  { key: "run", label: "Run and debug" },
  { key: "extensions", label: "Extensions" },
];

type ViewMode = "preview" | "split";

export function EditorWindow() {
  const reduced = useReducedMotion();

  // Newest first: the tree is read top-down, so the strongest work sits at the
  // top rather than under three notebooks.
  const projects = useMemo(
    () => [...otherProjects].sort((a, b) => Number(b.year) - Number(a.year)),
    []
  );

  const [openTabs, setOpenTabs] = useState<string[]>([projects[0].slug]);
  const [activeSlug, setActiveSlug] = useState<string | null>(projects[0].slug);
  const [expanded, setExpanded] = useState<string[]>([projects[0].slug]);
  const [mode, setMode] = useState<ViewMode>("preview");
  const [terminalOpen, setTerminalOpen] = useState(false);
  const [explorerOpen, setExplorerOpen] = useState(true);

  const treeRef = useRef<HTMLDivElement>(null);
  const wideRef = useRef<MediaQueryList>();

  const active = projects.find((project) => project.slug === activeSlug) ?? null;

  /**
   * The explorer's default differs by width - a column that is there wide, a
   * drawer that is not there narrow - so it is re-applied whenever the
   * breakpoint is crossed, not only on mount. Without that, loading wide and
   * then rotating a phone leaves a drawer parked over the editor.
   */
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 900px)");
    wideRef.current = wide;
    const sync = (event: MediaQueryList | MediaQueryListEvent) => setExplorerOpen(event.matches);
    sync(wide);
    wide.addEventListener("change", sync);
    return () => wide.removeEventListener("change", sync);
  }, []);

  const openProject = useCallback((slug: string) => {
    setOpenTabs((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    setActiveSlug(slug);
    setExpanded((prev) => (prev.includes(slug) ? prev : [...prev, slug]));
    // On a phone the drawer covers the editor it just opened a file into, so it
    // has to get out of the way. This is the place to do it: three paths open a
    // project - the folder row, the file row, and `code` in the terminal.
    if (!wideRef.current?.matches) setExplorerOpen(false);
  }, []);

  function closeTab(slug: string) {
    const index = openTabs.indexOf(slug);
    if (index === -1) return;
    const next = openTabs.filter((s) => s !== slug);
    setOpenTabs(next);
    if (activeSlug === slug) {
      // Fall back to the neighbour, the way an editor does - closing the active
      // tab should not empty the pane while other tabs are still open.
      setActiveSlug(next[Math.min(index, next.length - 1)] ?? null);
    }
  }

  function toggleFolder(slug: string) {
    const isOpen = expanded.includes(slug);
    if (isOpen && activeSlug === slug) {
      setExpanded((prev) => prev.filter((s) => s !== slug));
      return;
    }
    // Expanding also opens the file. Making someone expand and then click again
    // to see anything is a click of pure ceremony.
    openProject(slug);
  }

  function handleTreeKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const rows = Array.from(
      treeRef.current?.querySelectorAll<HTMLButtonElement>("[data-tree-row]") ?? []
    );
    const current = rows.indexOf(document.activeElement as HTMLButtonElement);
    const delta = event.key === "ArrowDown" ? 1 : -1;
    rows[(current + delta + rows.length) % rows.length]?.focus();
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-border bg-card text-[13px] shadow-lift">
      <TitleBar active={active} />

      <div className="relative flex h-auto lg:h-[34rem]">
        {/* Scrim, drawer-only. Sits under the sidebar and over the editor. */}
        <AnimatePresence>
          {explorerOpen && (
            <motion.button
              type="button"
              aria-label="Close explorer"
              onClick={() => setExplorerOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 z-[15] bg-black/50 lg:hidden"
            />
          )}
        </AnimatePresence>

        <ActivityBar
          explorerOpen={explorerOpen}
          onToggleExplorer={() => setExplorerOpen((prev) => !prev)}
        />

        <Explorer
          treeRef={treeRef}
          projects={projects}
          expanded={expanded}
          activeSlug={activeSlug}
          open={explorerOpen}
          onToggleFolder={toggleFolder}
          onOpenFile={openProject}
          onKeyDown={handleTreeKeyDown}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-h-0 flex-1 flex-col bg-card">
            <TabStrip
              projects={projects}
              openTabs={openTabs}
              activeSlug={activeSlug}
              onSelect={setActiveSlug}
              onClose={closeTab}
            />

            <div className="flex flex-none items-center border-b border-transparent py-1.5 pl-4 pr-2.5">
              <Breadcrumb project={active} />
              <EditorActions
                mode={mode}
                terminalOpen={terminalOpen}
                onMode={setMode}
                onToggleTerminal={() => setTerminalOpen((prev) => !prev)}
              />
            </div>

            <div className="flex min-h-0 flex-1">
              {/* One pane below 1100px. Two panes at 24 characters each is
                  worse than either alone, and the preview is the half that
                  carries the content. */}
              {mode === "split" && active && (
                <div className="hidden min-w-0 flex-1 overflow-y-auto border-r border-border xl:block">
                  <MarkdownSource key={active.slug} lines={buildMarkdown(active)} />
                </div>
              )}

              <div className="min-h-[22rem] min-w-0 flex-1 overflow-y-auto px-4 pb-7 pt-2 sm:px-7">
                <AnimatePresence mode="wait">
                  {active ? (
                    <DocumentView key={active.slug} project={active} reduced={!!reduced} />
                  ) : (
                    <EmptyState key="empty" onBrowse={() => setExplorerOpen(true)} />
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <TerminalPanel
            open={terminalOpen}
            projects={projects}
            activeSlug={activeSlug}
            onOpen={openProject}
          />
        </div>
      </div>

      <StatusBar count={projects.length} project={active} />
    </div>
  );
}

/* ── Title bar ─────────────────────────────────────────────────────────── */

function TitleBar({ active }: { active: OtherProject | null }) {
  return (
    <div className="flex h-10 items-center gap-2.5 border-b border-border bg-surface px-3">
      {/*
        Real macOS traffic lights: flat fill, hairline ring, and glyphs that
        appear on hover of the *group* rather than the individual button.
        Getting that wrong is the usual tell that a fake mac window is fake.
      */}
      <div className="group flex flex-none items-center gap-2">
        <TrafficLight color="#ff5f57" label="Close">
          <path d="M3 3l6 6M9 3l-6 6" />
        </TrafficLight>
        <TrafficLight color="#febc2e" label="Minimise">
          <path d="M2.5 6h7" />
        </TrafficLight>
        <TrafficLight color="#28c840" label="Full screen">
          <path d="M3.2 2.4h4.1L2.4 7.3V3.2a.8.8 0 0 1 .8-.8Z" fill="currentColor" stroke="none" />
          <path d="M8.8 9.6H4.7l4.9-4.9v4.1a.8.8 0 0 1-.8.8Z" fill="currentColor" stroke="none" />
        </TrafficLight>
      </div>

      <nav aria-hidden="true" className="hidden flex-none gap-0.5 2xl:flex">
        {["File", "Edit", "Selection", "View", "Go", "Run", "···"].map((item) => (
          <span
            key={item}
            className="rounded-[5px] px-2 py-0.5 text-xs text-foreground/80 transition-colors hover:bg-surface-hover"
          >
            {item}
          </span>
        ))}
      </nav>

      <div
        aria-hidden="true"
        className="mx-auto flex h-6 min-w-0 max-w-[32rem] flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-surface-hover px-2 text-xs text-muted"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" className="h-3 w-3 flex-none">
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
        <span className="truncate">
          {active ? `${TAB_LABEL} - ${folderName(active)}` : "Archive"}
        </span>
      </div>

      <div aria-hidden="true" className="hidden flex-none gap-1.5 text-muted lg:flex">
        {[
          "M9 4v16",
          "M3 14h18",
          "M15 4v16",
        ].map((d) => (
          <svg key={d} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-4 w-4">
            <rect x="3" y="4" width="18" height="16" rx="2" />
            <path d={d} />
          </svg>
        ))}
      </div>
    </div>
  );
}

function TrafficLight({
  color,
  label,
  children,
}: {
  color: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <span
      title={label}
      className="grid h-3 w-3 place-items-center rounded-full transition-[filter] active:brightness-75"
      style={{ background: color, boxShadow: "inset 0 0 0 0.5px rgb(0 0 0 / 0.14)" }}
    >
      <svg
        viewBox="0 0 12 12"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        aria-hidden="true"
        className="h-[7px] w-[7px] text-black/55 opacity-0 transition-opacity duration-100 group-hover:opacity-100"
      >
        {children}
      </svg>
    </span>
  );
}

/* ── Activity bar ──────────────────────────────────────────────────────── */

function ActivityBar({
  explorerOpen,
  onToggleExplorer,
}: {
  explorerOpen: boolean;
  onToggleExplorer: () => void;
}) {
  return (
    <nav
      aria-label="Views"
      // Stays at every width. Hiding it below 900px was a real bug: with both
      // it and the sidebar gone, closing the one open tab left a phone with no
      // control that could open a project again, and no hint that an explorer
      // existed at all.
      className="z-[25] flex w-12 flex-none flex-col items-center border-r border-border bg-surface"
    >
      {ACTIVITY_VIEWS.map((view) => {
        const isExplorer = view.key === "explorer";
        const on = isExplorer && explorerOpen;
        return (
          <button
            key={view.key}
            type="button"
            title={view.label}
            aria-expanded={isExplorer ? explorerOpen : undefined}
            onClick={isExplorer ? onToggleExplorer : undefined}
            className={cn(
              "relative grid h-12 w-12 place-items-center transition-colors",
              on ? "text-foreground" : "text-muted hover:text-foreground/80",
              !isExplorer && "cursor-default"
            )}
          >
            {/* In VS Code this marker is the foreground colour, not the accent,
                so it stays neutral here too. */}
            {on && <span className="absolute inset-y-0 left-0 w-0.5 bg-foreground" />}
            <ActivityIcon name={view.key} />
          </button>
        );
      })}
      <span className="mt-auto grid h-12 w-12 place-items-center text-muted" title="Settings">
        <ActivityIcon name="settings" />
      </span>
    </nav>
  );
}

/* ── Explorer ──────────────────────────────────────────────────────────── */

interface ExplorerProps {
  projects: OtherProject[];
  expanded: string[];
  activeSlug: string | null;
  open: boolean;
  onToggleFolder: (slug: string) => void;
  onOpenFile: (slug: string) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLDivElement>) => void;
  /** Handle on the tree, used for arrow-key traversal. Not `ref`: React 18
      does not pass that through to a function component. */
  treeRef: React.RefObject<HTMLDivElement>;
}

function Explorer({
  projects,
  expanded,
  activeSlug,
  open,
  onToggleFolder,
  onOpenFile,
  onKeyDown,
  treeRef,
}: ExplorerProps) {
  const reduced = useReducedMotion();

  return (
    <div
      id="archive-explorer"
      className={cn(
        // Wide: a column that can be collapsed away. Narrow: a drawer over the
        // editor, which is what VS Code itself does at this width.
        "absolute inset-y-0 left-12 z-20 flex w-[min(76vw,300px)] flex-col border-r border-border bg-surface shadow-lift transition-transform duration-300 ease-smooth",
        "lg:static lg:z-auto lg:w-[250px] lg:shadow-none lg:transition-none",
        open ? "translate-x-0" : "-translate-x-[105%] lg:hidden"
      )}
    >
      <div className="flex items-center px-5 pb-1 pt-2.5 text-[11px] uppercase text-foreground/80">
        <span>Explorer</span>
        <span aria-hidden="true" className="ml-auto text-muted">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4">
            <circle cx="5" cy="12" r="1.6" />
            <circle cx="12" cy="12" r="1.6" />
            <circle cx="19" cy="12" r="1.6" />
          </svg>
        </span>
      </div>

      <div className="flex h-[22px] items-center gap-1 px-2 text-[11px] font-bold uppercase text-foreground/80">
        <ChevronIcon className="h-3.5 w-3.5 rotate-90" />
        <span>Projects</span>
      </div>

      <div
        ref={treeRef}
        role="tree"
        aria-label="Archive projects"
        onKeyDown={onKeyDown}
        className="min-h-0 flex-1 overflow-y-auto pb-4"
      >
        {projects.map((project) => {
          const isExpanded = expanded.includes(project.slug);
          const isActive = activeSlug === project.slug;
          return (
            <div key={project.slug}>
              <button
                type="button"
                data-tree-row
                role="treeitem"
                aria-expanded={isExpanded}
                aria-selected={isActive}
                title={project.title}
                onClick={() => onToggleFolder(project.slug)}
                className="flex h-[22px] w-full items-center gap-1.5 whitespace-nowrap px-2 text-left text-[13px] text-foreground/85 transition-colors hover:bg-surface-hover"
              >
                <ChevronIcon
                  className={cn(
                    "h-3.5 w-3.5 flex-none text-muted transition-transform duration-200",
                    isExpanded && "rotate-90"
                  )}
                />
                {/* The one filled, coloured glyph in the window. */}
                <FolderIcon className="h-[15px] w-[15px] flex-none text-[#dcb67a] dark:text-[#dcb67a]" />
                <span className="truncate">{folderName(project)}</span>
                {project.liveUrl && (
                  <span title="has a deployment" className="ml-auto text-[10px] text-accent-fg">
                    ●
                  </span>
                )}
              </button>

              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={reduced ? undefined : { height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={reduced ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <button
                      type="button"
                      data-tree-row
                      role="treeitem"
                      aria-selected={isActive}
                      onClick={() => onOpenFile(project.slug)}
                      className={cn(
                        "relative flex h-[22px] w-full items-center gap-1.5 whitespace-nowrap py-0 pl-[30px] pr-3 text-left text-[13px] transition-colors",
                        isActive
                          ? "bg-border text-foreground"
                          : "text-foreground/85 hover:bg-surface-hover"
                      )}
                    >
                      {/* layoutId slides the marker between files instead of
                          blinking it out of one row and into the next. */}
                      {isActive && (
                        <motion.span
                          layoutId={reduced ? undefined : "archive-active-file"}
                          className="absolute inset-y-0 left-0 w-0.5 bg-accent"
                        />
                      )}
                      <MarkdownIcon className="h-[15px] w-[15px] flex-none" />
                      <span className="truncate">{TAB_LABEL}</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <SidePanelRow label="Outline" />
      <SidePanelRow label="Timeline" />
    </div>
  );
};

function SidePanelRow({ label }: { label: string }) {
  return (
    <div className="flex h-6 flex-none items-center gap-1 border-t border-border px-2 text-[11px] font-bold uppercase text-foreground/80">
      <ChevronIcon className="h-3.5 w-3.5" />
      <span>{label}</span>
    </div>
  );
}

/* ── Tabs ──────────────────────────────────────────────────────────────── */

function TabStrip({
  projects,
  openTabs,
  activeSlug,
  onSelect,
  onClose,
}: {
  projects: OtherProject[];
  openTabs: string[];
  activeSlug: string | null;
  onSelect: (slug: string) => void;
  onClose: (slug: string) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <div
      role="tablist"
      className="flex flex-none overflow-x-auto border-b border-border bg-surface [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <AnimatePresence initial={false}>
        {openTabs.map((slug) => {
          const project = projects.find((p) => p.slug === slug);
          if (!project) return null;
          const isActive = slug === activeSlug;
          return (
            <motion.div
              key={slug}
              layout={!reduced}
              initial={reduced ? undefined : { opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={reduced ? undefined : { opacity: 0, width: 0 }}
              transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
              className="relative flex-none overflow-hidden border-r border-border"
            >
              <button
                type="button"
                role="tab"
                aria-selected={isActive}
                title={project.title}
                onClick={() => onSelect(slug)}
                className={cn(
                  "flex h-[35px] items-center gap-1.5 whitespace-nowrap pl-2.5 pr-1 text-[13px] transition-colors",
                  isActive ? "bg-card text-foreground" : "text-muted hover:text-foreground/85"
                )}
              >
                {/* The top border on the active tab: the single most
                    recognisable pixel in the window, blue in VS Code and lime
                    here. layoutId slides it between tabs. */}
                {isActive && (
                  <motion.span
                    layoutId={reduced ? undefined : "archive-active-tab"}
                    className="absolute inset-x-0 top-0 h-px bg-accent"
                  />
                )}
                <MarkdownIcon className="h-[15px] w-[15px]" />
                <span>{TAB_LABEL}</span>
                <span
                  role="button"
                  aria-label={`Close ${project.title}`}
                  onClick={(event) => {
                    event.stopPropagation();
                    onClose(slug);
                  }}
                  className={cn(
                    "ml-1 grid h-5 w-5 place-items-center rounded-[5px] transition-opacity hover:bg-surface-hover",
                    isActive ? "opacity-75" : "opacity-0 hover:opacity-100"
                  )}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-2.5 w-2.5">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </span>
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function Breadcrumb({ project }: { project: OtherProject | null }) {
  if (!project) return <div className="min-w-0 flex-1" />;
  return (
    <div className="flex min-w-0 flex-1 items-center gap-1 text-xs text-muted">
      <span className="truncate">{folderName(project)}</span>
      <ChevronIcon className="h-3 w-3 flex-none opacity-60" />
      <MarkdownIcon className="h-[13px] w-[13px] flex-none" />
      <span className="truncate">{TAB_LABEL}</span>
    </div>
  );
}

function EditorActions({
  mode,
  terminalOpen,
  onMode,
  onToggleTerminal,
}: {
  mode: ViewMode;
  terminalOpen: boolean;
  onMode: (mode: ViewMode) => void;
  onToggleTerminal: () => void;
}) {
  const button =
    "grid h-[22px] w-[22px] place-items-center rounded-[5px] transition-colors hover:bg-surface-hover";
  return (
    <div className="ml-auto flex flex-none items-center gap-2 text-muted">
      <button
        type="button"
        title="Split editor"
        aria-pressed={mode === "split"}
        onClick={() => onMode("split")}
        className={cn(button, mode === "split" && "text-accent-fg")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" className="h-4 w-4">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M12 4v16" />
        </svg>
      </button>
      <button
        type="button"
        title="Preview only"
        aria-pressed={mode === "preview"}
        onClick={() => onMode("preview")}
        className={cn(button, mode === "preview" && "text-accent-fg")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7-10-7-10-7Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>
      <button
        type="button"
        title="Toggle terminal"
        aria-pressed={terminalOpen}
        onClick={onToggleTerminal}
        className={cn(button, terminalOpen && "text-accent-fg")}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M3 14h18" />
        </svg>
      </button>
    </div>
  );
}

/* ── Document ──────────────────────────────────────────────────────────── */

function DocumentView({ project, reduced }: { project: OtherProject; reduced: boolean }) {
  // The blocks cascade rather than arriving together, which is what makes
  // switching files read as a document being laid out rather than a swap.
  const container: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.045 } },
  };
  const item: Variants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
  };

  return (
    <motion.article
      initial={reduced ? undefined : "hidden"}
      animate="visible"
      exit={reduced ? undefined : { opacity: 0, y: -6, transition: { duration: 0.16 } }}
      variants={container}
    >
      <motion.h3
        variants={reduced ? undefined : item}
        className="border-b border-border pb-2 pt-1 text-2xl font-semibold tracking-tight text-foreground"
      >
        {project.title}
      </motion.h3>

      <motion.div
        variants={reduced ? undefined : item}
        className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-muted"
      >
        <span>{project.year}</span>
        <span>·</span>
        <span>{project.stack}</span>
        {project.liveUrl && (
          <>
            <span>·</span>
            <span className="text-accent-fg">Deployed</span>
          </>
        )}
      </motion.div>

      <motion.h4 variants={reduced ? undefined : item} className="mt-6 border-b border-border pb-1.5 text-[17px] font-semibold text-foreground">
        Overview
      </motion.h4>
      <motion.p variants={reduced ? undefined : item} className="mt-3.5 max-w-[68ch] text-sm leading-relaxed text-foreground/80">
        {project.description}
      </motion.p>

      <motion.h4 variants={reduced ? undefined : item} className="mt-6 border-b border-border pb-1.5 text-[17px] font-semibold text-foreground">
        Stack
      </motion.h4>
      <motion.div variants={reduced ? undefined : item} className="mt-3 flex flex-wrap gap-1.5">
        {project.tags.map((tag) => (
          <span
            key={tag}
            className="rounded-[3px] bg-foreground/[0.08] px-1.5 py-0.5 font-mono text-xs text-foreground/80"
          >
            {tag}
          </span>
        ))}
      </motion.div>

      <motion.h4 variants={reduced ? undefined : item} className="mt-6 border-b border-border pb-1.5 text-[17px] font-semibold text-foreground">
        Links
      </motion.h4>
      <motion.div variants={reduced ? undefined : item} className="mt-3.5 flex flex-wrap gap-2.5">
        {project.liveUrl && (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-[2px] border border-accent bg-accent px-3.5 py-1.5 text-[13px] text-accent-contrast transition-[filter] hover:brightness-110"
          >
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
            Open live demo
          </a>
        )}
        <a
          href={project.sourceCodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-[2px] border border-accent/55 px-3.5 py-1.5 text-[13px] text-accent-fg transition-colors hover:bg-accent hover:text-accent-contrast"
        >
          <SocialIcon name="github" className="h-3.5 w-3.5" />
          View source
        </a>
      </motion.div>
    </motion.article>
  );
}

function EmptyState({ onBrowse }: { onBrowse: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center gap-4 py-16 text-muted"
    >
      <p>No file open.</p>
      {/*
        This state used to be a dead end on a phone: with the explorer hidden
        and the last tab closed, nothing on screen could open anything. The
        button is the way back, and it works at every width.
      */}
      <button
        type="button"
        onClick={onBrowse}
        className="rounded-[2px] border border-accent/55 px-3.5 py-1.5 text-[13px] text-accent-fg transition-colors hover:bg-accent hover:text-accent-contrast"
      >
        Browse projects
      </button>
    </motion.div>
  );
}

/* ── Panel ─────────────────────────────────────────────────────────────── */

function TerminalPanel({
  open,
  projects,
  activeSlug,
  onOpen,
}: {
  open: boolean;
  projects: OtherProject[];
  activeSlug: string | null;
  onOpen: (slug: string) => void;
}) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      // Height animates rather than toggling display, so the editor above it
      // gives way instead of jumping.
      animate={{ height: open ? "11rem" : "2.2rem" }}
      initial={false}
      transition={reduced ? { duration: 0 } : { duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-none flex-col overflow-hidden border-t border-border bg-surface"
    >
      <div className="flex h-[35px] flex-none items-center gap-0.5 px-2">
        {["Terminal", "Problems", "Output", "Debug Console", "Ports"].map((tab, i) => (
          <span
            key={tab}
            className={cn(
              "relative h-[26px] rounded-[5px] px-2 text-xs leading-[26px]",
              i === 0 ? "text-foreground" : "text-muted"
            )}
          >
            {tab}
            {i === 0 && <span className="absolute inset-x-2 -bottom-1.5 h-px bg-accent" />}
          </span>
        ))}
        <span className="ml-auto flex items-center gap-2.5 text-xs text-muted">
          <span className="hidden items-center gap-1.5 text-foreground/80 sm:flex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <path d="m5 8 4 4-4 4" />
              <path d="M13 16h6" />
            </svg>
            zsh
          </span>
        </span>
      </div>

      {/* Mounted only while open: an off-screen terminal running its own
          effects and holding focus is pure cost. */}
      {open && (
        <EditorTerminal projects={projects} activeSlug={activeSlug} onOpen={onOpen} />
      )}
    </motion.div>
  );
}

/* ── Status bar ────────────────────────────────────────────────────────── */

function StatusBar({ count, project }: { count: number; project: OtherProject | null }) {
  return (
    <div className="flex h-[22px] flex-none items-center gap-3 border-t border-border bg-surface px-2.5 text-xs text-foreground/80">
      <span className="flex items-center gap-1">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3">
          <circle cx="18" cy="18" r="3" />
          <circle cx="6" cy="6" r="3" />
          <path d="M6 21V9a9 9 0 0 0 9 9" />
        </svg>
        main
      </span>
      <span className="hidden truncate sm:inline">
        {project ? `${folderName(project)}/${TAB_LABEL}` : ""}
      </span>
      <span className="ml-auto flex gap-3">
        <span className="hidden md:inline">UTF-8</span>
        <span className="hidden md:inline">Markdown</span>
        <span>{count} projects</span>
      </span>
    </div>
  );
}
