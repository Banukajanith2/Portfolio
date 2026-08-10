import { ArrowUpRight } from "lucide-react";
import { otherProjects } from "@/data/portfolio";
import { Icon } from "@/components/ui/Icon";
import { FadeIn } from "@/components/ui/FadeIn";

export function OtherProjects() {
  return (
    <section className="py-20 sm:py-28">
      <div className="section-container">
        <FadeIn>
          <h2 className="text-3xl font-bold text-foreground">Other Projects</h2>
          <p className="mt-2 text-muted">More projects I&apos;ve worked on</p>
        </FadeIn>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {otherProjects.map((project, index) => (
            <FadeIn key={project.title} delay={index * 0.06}>
              <div className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/40">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary-400">
                  <Icon name={project.icon} className="h-5 w-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold text-foreground">{project.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">{project.description}</p>
                <a
                  href={project.sourceCodeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-secondary-400 hover:text-secondary-300"
                >
                  View Code
                  <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
