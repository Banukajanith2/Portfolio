import type { OtherProject } from "@/data/portfolio";

/**
 * The archive's editor view renders each project twice: once as markdown source
 * with a line-number gutter, once as a rendered document. Both come from the
 * lines this module builds, so the two panes can never drift apart - building
 * them independently is exactly how a "source" view stops matching its preview.
 *
 * Pure data on purpose. No JSX and no three.js-style side effects, so it can be
 * imported by the terminal (which prints the same lines for `cat`) without
 * dragging any component tree along with it.
 */

/** Folder name in the explorer: the full title, as a filesystem would hold it. */
export function folderName(project: OtherProject): string {
  return project.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function buildMarkdown(project: OtherProject): string[] {
  const lines = [
    `# ${project.title}`,
    "",
    `- **Year:** ${project.year}`,
    `- **Stack:** ${project.stack}`,
    `- **Tags:** ${project.tags.map((tag) => `\`${tag}\``).join(", ")}`,
    `- **Status:** ${project.liveUrl ? "deployed" : "source only"}`,
    "",
    "## Overview",
    "",
    project.description,
    "",
    "## Links",
    "",
  ];
  if (project.liveUrl) lines.push(`- [Live demo](${project.liveUrl})`);
  lines.push(`- [Source code](${project.sourceCodeUrl})`);
  return lines;
}

export type Token =
  | { kind: "text"; value: string }
  | { kind: "punct"; value: string }
  | { kind: "hash"; value: string }
  | { kind: "head"; value: string }
  | { kind: "bold"; value: string }
  | { kind: "code"; value: string }
  | { kind: "quote"; value: string }
  | { kind: "link"; value: string; href: string };

/**
 * A markdown tokeniser small enough to read in one sitting.
 *
 * Order matters: inline code is matched before bold and links, because a
 * backtick span can legally contain either and matching the other way round
 * tears the span in half.
 */
export function tokenizeLine(line: string): Token[] {
  const heading = /^(#{1,6}) (.*)$/.exec(line);
  if (heading) {
    return [
      { kind: "hash", value: heading[1] },
      { kind: "text", value: " " },
      { kind: "head", value: heading[2] },
    ];
  }

  if (line.startsWith("> ")) {
    return [
      { kind: "punct", value: "> " },
      { kind: "quote", value: line.slice(2) },
    ];
  }

  if (line.startsWith("- ")) {
    return [{ kind: "punct", value: "- " }, ...tokenizeInline(line.slice(2))];
  }

  return tokenizeInline(line);
}

function tokenizeInline(input: string): Token[] {
  const tokens: Token[] = [];
  let plain = "";
  let i = 0;

  // Runs of ordinary characters are accumulated and flushed as one token rather
  // than emitted per character, which keeps the rendered span count sane.
  const flush = () => {
    if (plain) {
      tokens.push({ kind: "text", value: plain });
      plain = "";
    }
  };

  while (i < input.length) {
    const rest = input.slice(i);

    const code = /^`([^`]+)`/.exec(rest);
    if (code) {
      flush();
      tokens.push({ kind: "code", value: code[1] });
      i += code[0].length;
      continue;
    }

    const bold = /^\*\*([^*]+)\*\*/.exec(rest);
    if (bold) {
      flush();
      tokens.push({ kind: "punct", value: "**" });
      tokens.push({ kind: "bold", value: bold[1] });
      tokens.push({ kind: "punct", value: "**" });
      i += bold[0].length;
      continue;
    }

    const link = /^\[([^\]]*)\]\(([^)]+)\)/.exec(rest);
    if (link) {
      flush();
      tokens.push({ kind: "punct", value: "[" });
      tokens.push({ kind: "text", value: link[1] });
      tokens.push({ kind: "punct", value: "](" });
      // Real anchors even in the source pane. A markdown source view whose URLs
      // are dead text is a picture of a file.
      tokens.push({ kind: "link", value: link[2], href: link[2] });
      tokens.push({ kind: "punct", value: ")" });
      i += link[0].length;
      continue;
    }

    plain += input[i];
    i += 1;
  }

  flush();
  return tokens;
}
