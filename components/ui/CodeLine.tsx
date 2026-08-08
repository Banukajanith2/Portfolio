const KEYWORDS = ["const", "let", "return"];

function tokenize(line: string) {
  const tokens = line.split(/('[^']*')/g).filter((t) => t !== "");

  return tokens.flatMap((token, tokenIndex) => {
    if (token.startsWith("'") && token.endsWith("'")) {
      return [
        <span key={`str-${tokenIndex}`} className="text-emerald-400">
          {token}
        </span>,
      ];
    }

    const words = token.split(/(\b(?:const|let|return)\b)/g).filter((w) => w !== "");
    return words.map((word, wordIndex) =>
      KEYWORDS.includes(word) ? (
        <span key={`kw-${tokenIndex}-${wordIndex}`} className="text-primary-400">
          {word}
        </span>
      ) : (
        <span key={`txt-${tokenIndex}-${wordIndex}`} className="text-foreground/75">
          {word}
        </span>
      )
    );
  });
}

interface CodeLineProps {
  line: string;
}

export function CodeLine({ line }: CodeLineProps) {
  return <>{tokenize(line)}</>;
}
