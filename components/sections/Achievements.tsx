import { achievements } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import { RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

/**
 * Three tiles of supporting evidence — awards, languages, activities.
 *
 * Kept intentionally quiet: this is the section that props up the work above it,
 * so it uses the same spotlight surface as the about bento rather than
 * introducing another card style.
 */
export function Achievements() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading index="06" label="Credentials" title="Recognition & involvement" />

        <RevealGroup className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3" stagger={0.09}>
          {achievements.map((group) => (
            <RevealItem key={group.title}>
              <SpotlightCard
                className="h-full"
                contentClassName="flex h-full flex-col p-6 sm:p-7"
              >
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/12 text-accent-fg">
                    <Icon name={group.icon} className="h-4 w-4" />
                  </span>
                  <span className="mono-label">
                    {String(group.items.length).padStart(2, "0")}
                  </span>
                </div>

                <h3 className="mt-6 text-lg font-semibold tracking-tight text-foreground">
                  {group.title}
                </h3>

                <ul className="mt-5 flex flex-col gap-4 border-t border-border pt-5">
                  {group.items.map((item) => (
                    <li key={item.primary}>
                      <p className="text-sm font-medium leading-snug text-foreground">
                        {item.primary}
                      </p>
                      {item.secondary && (
                        <p className="mt-1 font-mono text-[11px] text-muted">{item.secondary}</p>
                      )}
                    </li>
                  ))}
                </ul>
              </SpotlightCard>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
