"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { buildMarkdown, folderName } from "@/lib/archiveDoc";
import type { OtherProject } from "@/data/portfolio";
import { cn } from "@/lib/utils";

/**
 * A working shell, not a picture of one.
 *
 * Small on purpose - six commands - but every one does something, and `code`
 * drives the editor above it. That is what makes the window feel like one
 * application rather than two widgets sharing a border.
 *
 * Named EditorTerminal because components/ui/Terminal.tsx already exists and is
 * the hero's typing card; the two are unrelated and must not be merged.
 */

type LineTone = "default" | "dim" | "accent" | "strong";
interface Line {
  id: number;
  tone: LineTone;
  text: string;
  /** Rendered before `text` in the accent colour, for prompt echoes. */
  prompt?: boolean;
}

const toneClass: Record<LineTone, string> = {
  default: "text-foreground/80",
  dim: "text-muted",
  accent: "text-accent-fg",
  strong: "text-foreground",
};

interface EditorTerminalProps {
  projects: OtherProject[];
  activeSlug: string | null;
  onOpen: (slug: string) => void;
  className?: string;
}

export function EditorTerminal({ projects, activeSlug, onOpen, className }: EditorTerminalProps) {
  const reduced = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const [typing, setTyping] = useState(false);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);
  const idleTimer = useRef<ReturnType<typeof setTimeout>>();

  const write = useCallback((text: string, tone: LineTone = "default", prompt = false) => {
    setLines((prev) => [...prev, { id: nextId.current++, tone, text, prompt }]);
  }, []);

  const listing = useCallback(() => {
    write(`total ${projects.length}`, "dim");
    projects.forEach((project) => {
      write(
        `drwxr-xr-x  ${project.year}  ${folderName(project)}/${project.liveUrl ? "  ● deployed" : ""}`,
        project.liveUrl ? "strong" : "default"
      );
    });
  }, [projects, write]);

  // The banner runs once on mount rather than during render, so the server and
  // the client agree on an empty terminal and nothing hydrates mismatched.
  useEffect(() => {
    write("Last login: archive of side work, coursework and experiments", "dim");
    write("ls", "default", true);
    write(`total ${projects.length}`, "dim");
    projects.forEach((project) => {
      write(
        `drwxr-xr-x  ${project.year}  ${folderName(project)}/${project.liveUrl ? "  ● deployed" : ""}`,
        project.liveUrl ? "strong" : "default"
      );
    });
    write("Type `help` for what else works here.", "dim");
    // Intentionally mount-only: re-running would duplicate the banner.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Follow the tail as output arrives, the way a real terminal does.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines]);

  useEffect(() => () => clearTimeout(idleTimer.current), []);

  function run(raw: string) {
    const command = raw.trim();
    write(command, "default", true);
    if (!command) return;

    setHistory((prev) => [...prev, command]);
    const [verbRaw, ...rest] = command.split(/\s+/);
    const verb = verbRaw.toLowerCase();
    const arg = rest.join(" ").toLowerCase();

    if (verb === "ls" || verb === "ll" || verb === "dir") {
      listing();
      return;
    }

    if (verb === "code" || verb === "open" || verb === "cd") {
      if (!arg) {
        write("usage: code <project>", "dim");
        return;
      }
      // Matched on any substring of the folder name: requiring the exact
      // 34-character folder name would make this unusable.
      const needle = arg.replace(/\/$/, "");
      const hit = projects.find(
        (project) => folderName(project).includes(needle) || project.slug === needle
      );
      if (!hit) {
        write(`${verb}: no project matching "${arg}"`, "dim");
        return;
      }
      onOpen(hit.slug);
      write(`opened ${folderName(hit)}/Project-Details.md`, "dim");
      return;
    }

    if (verb === "cat") {
      const target =
        projects.find((project) => folderName(project).includes(arg.split("/")[0])) ??
        projects.find((project) => project.slug === activeSlug);
      if (!target) {
        write("cat: no such file", "dim");
        return;
      }
      buildMarkdown(target).forEach((line) => write(line || " ", "default"));
      return;
    }

    if (verb === "git") {
      if (arg.startsWith("log")) {
        projects.forEach((project, i) => {
          const sha = (project.title.length * 7919 + i * 104729).toString(16).slice(0, 7);
          write(`${sha} (${project.year}) ${project.title}`, "accent");
        });
        return;
      }
      write("git: only `git log` is wired up here.", "dim");
      return;
    }

    if (verb === "clear" || verb === "reset") {
      setLines([]);
      return;
    }

    if (verb === "help" || verb === "man") {
      write("ls              list every project", "strong");
      write("code <name>     open a project in the editor", "strong");
      write("cat <name>      print its Project-Details.md", "strong");
      write("git log         the archive as commits", "strong");
      write("clear           clear the terminal", "strong");
      return;
    }

    write(`zsh: command not found: ${verb}. Try \`help\`.`, "dim");
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      run(value);
      setValue("");
      setHistoryIndex(-1);
      return;
    }
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      if (!history.length) return;
      event.preventDefault();
      const from = historyIndex === -1 ? history.length : historyIndex;
      const next = Math.max(0, Math.min(history.length, from + (event.key === "ArrowUp" ? -1 : 1)));
      setHistoryIndex(next);
      setValue(history[next] ?? "");
    }
  }

  return (
    <div
      className={cn("flex min-h-0 flex-1 flex-col", className)}
      onClick={(event) => {
        // Clicking anywhere focuses the prompt, as a terminal does - except on
        // a link, where it would steal the click.
        if ((event.target as HTMLElement).closest("a")) return;
        inputRef.current?.focus();
      }}
    >
      <div
        ref={scrollRef}
        className="min-h-0 flex-1 overflow-y-auto px-3.5 pb-3 pt-1 font-mono text-[12.5px] leading-relaxed"
      >
        <AnimatePresence initial={false}>
          {lines.map((line) => (
            <motion.div
              key={line.id}
              layout={!reduced}
              initial={reduced ? undefined : { opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18 }}
              className={cn("whitespace-pre-wrap break-words", toneClass[line.tone])}
            >
              {line.prompt && <Prompt />}
              {line.text}
            </motion.div>
          ))}
        </AnimatePresence>

        <div className="relative flex items-baseline">
          <Prompt />
          {/* A span mirrors the value so the block caret can sit immediately
              after the typed text. A real <input> box is the full width of the
              row, so a caret element beside it would park at the far right no
              matter what has been typed. */}
          <span className="whitespace-pre text-foreground">{value}</span>
          <span
            aria-hidden="true"
            className={cn(
              "ml-px inline-block h-[15px] w-[7px] translate-y-[2px] bg-foreground/80",
              typing ? "" : "animate-blink"
            )}
          />
          <input
            ref={inputRef}
            value={value}
            onChange={(event) => {
              setValue(event.target.value);
              setTyping(true);
              clearTimeout(idleTimer.current);
              // A block caret blinking under moving text reads as a glitch, so
              // it holds solid while keys are going in.
              idleTimer.current = setTimeout(() => setTyping(false), 700);
            }}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal input"
            className="absolute inset-0 w-full bg-transparent font-mono text-transparent caret-transparent outline-none"
          />
        </div>
      </div>
    </div>
  );
}

function Prompt() {
  return (
    <span className="shrink-0">
      <span className="text-accent-fg">banuka@mac</span>
      <span className="text-muted">:</span>
      <span className="text-foreground">~/dev/archive</span>
      <span className="text-muted">$ </span>
    </span>
  );
}
