"use client";

import { motion, useReducedMotion } from "framer-motion";
import { tokenizeLine, type Token } from "@/lib/archiveDoc";

/**
 * The source pane: markdown text with a line-number gutter.
 *
 * Laid out as a CSS table rather than a flex row per line. The gutter has to be
 * a single column whose width is set by its widest number, and every line's
 * text has to wrap inside the remaining space - that is a table, and doing it
 * with flex means hard-coding a gutter width that breaks at 100 lines.
 *
 * Token colours replace VS Code's blue headings and orange strings with the
 * site's own accent, so the window keeps one accent hue. The classes still
 * separate the token kinds, which is all syntax colour has to do.
 */

const tokenClass: Record<Token["kind"], string> = {
  head: "font-semibold text-accent-fg",
  hash: "text-accent-fg/55",
  bold: "font-bold text-foreground",
  code: "rounded-[2px] bg-foreground/[0.12] text-foreground",
  link: "text-muted underline underline-offset-2 transition-colors hover:text-accent-fg",
  punct: "text-muted",
  quote: "italic text-muted",
  text: "",
};

export function MarkdownSource({ lines }: { lines: string[] }) {
  const reduced = useReducedMotion();

  return (
    <div className="table w-full py-1.5 pb-6 font-mono text-[12.5px] leading-[19px]">
      {lines.map((line, index) => (
        <motion.div
          key={`${index}-${line}`}
          className="group table-row"
          initial={reduced ? undefined : { opacity: 0 }}
          animate={reduced ? undefined : { opacity: 1 }}
          // Lines resolve top-down like a file being painted, capped so a long
          // document does not take a second and a half to finish arriving.
          transition={{ duration: 0.22, delay: Math.min(index * 0.018, 0.4) }}
        >
          <span className="table-cell w-[42px] select-none pr-3.5 text-right align-top text-muted/70 transition-colors group-hover:text-muted">
            {index + 1}
          </span>
          <span className="table-cell whitespace-pre-wrap break-words pr-5">
            {line === "" ? " " : <LineTokens line={line} />}
          </span>
        </motion.div>
      ))}
    </div>
  );
}

function LineTokens({ line }: { line: string }) {
  return (
    <>
      {tokenizeLine(line).map((token, i) => {
        if (token.kind === "link") {
          return (
            <a
              key={i}
              href={token.href}
              target="_blank"
              rel="noopener noreferrer"
              className={tokenClass.link}
            >
              {token.value}
            </a>
          );
        }
        return (
          <span key={i} className={tokenClass[token.kind]}>
            {token.value}
          </span>
        );
      })}
    </>
  );
}
