"use client";

import { useRef, type ReactNode } from "react";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";

interface CharacterProps {
  char: string;
  progress: MotionValue<number>;
  range: [number, number];
}

function Character({ char, progress, range }: CharacterProps) {
  const opacity = useTransform(progress, range, [0.2, 1]);

  return (
    <span className="relative inline-block">
      <span className="opacity-0" aria-hidden="true">
        {char}
      </span>
      <motion.span style={{ opacity }} className="absolute left-0 top-0">
        {char}
      </motion.span>
    </span>
  );
}

interface AnimatedTextProps {
  text: string;
  className?: string;
}

export function AnimatedText({ text, className }: AnimatedTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.9", "end 0.65"],
  });

  const words = text.split(" ");
  const totalChars = text.length;
  let charIndex = 0;
  const content: ReactNode[] = [];

  words.forEach((word, wordIndex) => {
    const chars = Array.from(word).map((char) => {
      const index = charIndex;
      charIndex += 1;
      const start = index / totalChars;
      const end = start + 1 / totalChars;
      return <Character key={index} char={char} progress={scrollYProgress} range={[start, end]} />;
    });

    content.push(
      <span key={`word-${wordIndex}`} className="inline-block">
        {chars}
      </span>
    );

    if (wordIndex < words.length - 1) {
      charIndex += 1;
      content.push(" ");
    }
  });

  return (
    <p ref={ref} className={className}>
      {content}
    </p>
  );
}
