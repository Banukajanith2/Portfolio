"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";
import { terminalSession } from "@/data/portfolio";
import { cn } from "@/lib/utils";

/**
 * A scripted terminal session that types itself out.
 *
 * Replaces the old "fake IDE window with a JS object in it" — this shows the
 * same information but in the idiom the audience actually reads all day, and
 * the git-log step slips in the project list without another card.
 *
 * The whole session is stored as one growing line buffer so React only ever
 * re-renders the tail; commands type character by character, their output
 * prints whole.
 */

type Line = { text: string; kind: "command" | "output" | "accent" };

const TYPE_MS = 34;
const AFTER_COMMAND_MS = 260;
const AFTER_OUTPUT_MS = 620;

export function Terminal({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  const [lines, setLines] = useState<Line[]>([]);
  const [typing, setTyping] = useState("");
  const [done, setDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduced) {
      // Skip the performance and just present the finished transcript.
      setLines(
        terminalSession.flatMap<Line>((step) => [
          { text: step.command, kind: "command" },
          ...step.out.map<Line>((line) => ({
            text: line.text,
            kind: line.accent ? "accent" : "output",
          })),
        ])
      );
      setDone(true);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(setTimeout(resolve, ms));
      });

    async function play() {
      for (const step of terminalSession) {
        // Type the command one character at a time.
        for (let i = 1; i <= step.command.length; i++) {
          if (cancelled) return;
          setTyping(step.command.slice(0, i));
          await wait(TYPE_MS);
        }
        if (cancelled) return;

        // Commit the finished command and print its output in one go.
        setTyping("");
        setLines((current) => [
          ...current,
          { text: step.command, kind: "command" },
          ...step.out.map<Line>((line) => ({
            text: line.text,
            kind: line.accent ? "accent" : "output",
          })),
        ]);

        await wait(AFTER_COMMAND_MS);
        if (cancelled) return;
        await wait(AFTER_OUTPUT_MS);
      }

      if (!cancelled) setDone(true);
    }

    play();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
    };
  }, [reduced]);

  // Keep the newest line visible as the transcript outgrows the window.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing]);

  return (
    // `dark` pins this to the dark palette in both themes: a terminal that turns
    // white in light mode stops reading as a terminal.
    <div
      className={cn(
        "dark overflow-hidden rounded-xl border border-border bg-card shadow-lift",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
        <span className="ml-2 font-mono text-[11px] text-muted">banuka@portfolio — zsh</span>
      </div>

      <div
        ref={scrollRef}
        // Tall enough for the full transcript, so the session ends settled
        // rather than with the first command scrolled half out of view.
        className="h-[340px] overflow-y-auto px-4 py-3.5 font-mono text-[11px] leading-[1.75] sm:text-xs"
      >
        {lines.map((line, index) => (
          <div key={index} className="whitespace-pre-wrap break-words">
            {line.kind === "command" ? (
              <>
                <span className="text-accent">➜</span>{" "}
                <span className="text-muted">~</span>{" "}
                <span className="text-foreground">{line.text}</span>
              </>
            ) : (
              <span className={line.kind === "accent" ? "text-accent" : "text-muted"}>
                {line.text}
              </span>
            )}
          </div>
        ))}

        {!done && (
          <div className="whitespace-pre-wrap break-words">
            <span className="text-accent">➜</span> <span className="text-muted">~</span>{" "}
            <span className="text-foreground">{typing}</span>
            <span className="ml-0.5 inline-block animate-blink text-accent">▍</span>
          </div>
        )}

        {done && (
          <div>
            <span className="text-accent">➜</span> <span className="text-muted">~</span>{" "}
            <span className="ml-0.5 inline-block animate-blink text-accent">▍</span>
          </div>
        )}
      </div>
    </div>
  );
}
