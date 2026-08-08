import { experience, type ExperienceItem } from "@/data/portfolio";
import { FadeIn } from "@/components/ui/FadeIn";

function EntryCard({ item }: { item: ExperienceItem }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-foreground sm:text-base">{item.org}</h3>
          <p className="text-sm text-primary-400">{item.role}</p>
        </div>
        <span className="whitespace-nowrap rounded-full bg-primary/20 px-3 py-1 text-xs text-primary-400">
          {item.date}
        </span>
      </div>

      <ul className="mt-4 space-y-2">
        {item.bullets.map((bullet, index) => (
          <li key={index} className="flex gap-2 text-sm leading-relaxed text-muted">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-400" aria-hidden="true" />
            {bullet}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Experience() {
  const workItems = experience.filter((item) => item.type === "work");
  const educationItems = experience.filter((item) => item.type === "education");
  const rows = workItems.map((work, i) => [work, educationItems[i]] as const);

  return (
    <section className="py-20 sm:py-28">
      <div className="section-container">
        <FadeIn>
          <h2
            className="hero-heading-white text-center font-black leading-none"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Experience & Education
          </h2>
        </FadeIn>

        <div className="relative mt-14">
          <div
            className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-primary/30 md:block"
            aria-hidden="true"
          />
          <div className="space-y-8">
            {rows.map((row, rowIndex) => (
              <FadeIn key={rowIndex} delay={rowIndex * 0.1}>
                <div className="relative grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-16">
                  <span
                    className="absolute left-1/2 top-8 hidden h-3 w-3 -translate-x-1/2 rounded-full border-2 border-primary bg-background md:block"
                    aria-hidden="true"
                  />
                  <EntryCard item={row[0]} />
                  <EntryCard item={row[1]} />
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
