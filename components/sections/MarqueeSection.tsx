import { tickerWords } from "@/data/portfolio";
import { VelocityMarquee } from "@/components/ui/VelocityMarquee";

/**
 * Two counter-scrolling bands of oversized type.
 *
 * This replaces the old image marquee, which showed eight generated gradient
 * tiles under a "selected work" label - placeholder art presented as work is
 * the fastest way to lose a reviewer's trust. Type carries the same rhythm and
 * says something true.
 */
export function MarqueeSection() {
  return (
    <section aria-hidden="true" className="relative overflow-hidden border-y border-border py-10 sm:py-14">
      <div className="flex flex-col gap-3 sm:gap-4">
        <VelocityMarquee baseSpeed={-55} className="mask-edges">
          <Band words={tickerWords} />
        </VelocityMarquee>

        {/* Reversed so the two bands shear against each other - that opposition
            is what makes the scroll coupling legible. */}
        <VelocityMarquee baseSpeed={38} className="mask-edges">
          <Band words={[...tickerWords].reverse()} outline />
        </VelocityMarquee>
      </div>
    </section>
  );
}

function Band({ words, outline = false }: { words: string[]; outline?: boolean }) {
  return (
    <div className="flex items-center">
      {words.map((word, index) => (
        <span key={`${word}-${index}`} className="flex items-center">
          <span
            className={`display whitespace-nowrap px-5 text-[clamp(1.75rem,4.5vw,3.5rem)] ${
              outline ? "text-outline" : "text-foreground/85"
            }`}
          >
            {word}
          </span>
          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
        </span>
      ))}
    </div>
  );
}
