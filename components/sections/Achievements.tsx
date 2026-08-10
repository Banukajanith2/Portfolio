import { achievements } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import { FadeIn } from "@/components/ui/FadeIn";

export function Achievements() {
  return (
    <section className="py-20 sm:py-28">
      <div className="section-container">
        <FadeIn>
          <h2
            className="hero-heading text-center font-black leading-none"
            style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}
          >
            Awards & Activities
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {achievements.map((group, index) => (
            <FadeIn key={group.title} delay={index * 0.08}>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-secondary/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary-400">
                  <Icon name={group.icon} className="h-4 w-4" />
                </span>

                <h3 className="mt-4 text-lg font-semibold text-foreground">{group.title}</h3>

                <ul className="mt-4 space-y-3">
                  {group.items.map((item) => (
                    <li key={item.primary} className="flex gap-2 text-sm leading-relaxed">
                      <span
                        className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary-400"
                        aria-hidden="true"
                      />
                      <span className="min-w-0">
                        <span className="block font-medium text-foreground">{item.primary}</span>
                        {item.secondary && (
                          <span className="block text-xs text-muted">{item.secondary}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
