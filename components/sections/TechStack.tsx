import { techStack } from "@/data/portfolio";
import { TechIcon } from "@/components/ui/TechIcon";
import { FadeIn } from "@/components/ui/FadeIn";

export function TechStack() {
  return (
    <section id="skills" className="py-20 sm:py-28">
      <div className="section-container">
        <FadeIn y={40}>
          <h2
            className="hero-heading-white text-center font-black leading-none"
            style={{ fontSize: "clamp(3rem, 8vw, 6rem)" }}
          >
            Tech Stack
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {techStack.map((group, index) => (
            <FadeIn key={group.category} delay={index * 0.1}>
              <div className="h-full rounded-2xl border border-border bg-surface p-6">
                <h3 className="mb-4 text-xs font-medium uppercase tracking-widest text-muted">
                  {group.category}
                </h3>
                <div className="grid grid-cols-2 gap-x-4 gap-y-5">
                  {group.items.map((item) => (
                    <div key={item.name} className="group flex flex-col items-center gap-2 text-center">
                      <TechIcon
                        name={item.icon}
                        className="h-7 w-7 transition-transform duration-200 group-hover:scale-110"
                      />
                      <span className="text-xs text-muted transition-colors duration-200 group-hover:text-foreground">
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
