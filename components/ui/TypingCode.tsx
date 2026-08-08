"use client";

import { useEffect, useState } from "react";
import { CodeLine } from "@/components/ui/CodeLine";

interface TypingCodeProps {
  lines: string[];
  className?: string;
  typingSpeed?: number;
  linePause?: number;
  loopPause?: number;
}

export function TypingCode({ lines, className, typingSpeed = 32, linePause = 220, loopPause = 2200 }: TypingCodeProps) {
  const [lineIndex, setLineIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    if (lineIndex >= lines.length) {
      const resetTimer = setTimeout(() => {
        setLineIndex(0);
        setCharIndex(0);
      }, loopPause);
      return () => clearTimeout(resetTimer);
    }

    const currentLine = lines[lineIndex];

    if (charIndex < currentLine.length) {
      const typeTimer = setTimeout(() => setCharIndex((c) => c + 1), typingSpeed);
      return () => clearTimeout(typeTimer);
    }

    const nextLineTimer = setTimeout(() => {
      setLineIndex((l) => l + 1);
      setCharIndex(0);
    }, linePause);
    return () => clearTimeout(nextLineTimer);
  }, [lineIndex, charIndex, lines, typingSpeed, linePause, loopPause, reducedMotion]);

  return (
    <pre className={className}>
      {lines.map((line, index) => {
        const isDone = reducedMotion || index < lineIndex;
        const isCurrent = !reducedMotion && index === lineIndex;
        const display = isDone ? line : isCurrent ? line.slice(0, charIndex) : "";

        return (
          <div key={index} className="flex gap-3">
            <span className="shrink-0 select-none text-foreground/30">{index + 1}</span>
            <code className="min-w-0 whitespace-pre-wrap break-words">
              {display.length > 0 ? <CodeLine line={display} /> : <>&nbsp;</>}
              {isCurrent && <span className="animate-blink text-primary-400">▍</span>}
            </code>
          </div>
        );
      })}
    </pre>
  );
}
