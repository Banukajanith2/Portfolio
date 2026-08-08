import { ChevronRight, Mail } from "lucide-react";
import { contactInfo } from "@/data/portfolio";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FadeIn } from "@/components/ui/FadeIn";

export function Contact() {
  return (
    <section id="contact" className="py-20 sm:py-28">
      <div className="section-container grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <FadeIn>
          <h2
            className="hero-heading-white font-black leading-none"
            style={{ fontSize: "clamp(2.5rem, 7vw, 5rem)" }}
          >
            Let&apos;s work together
          </h2>
          <p className="mt-4 max-w-md text-balance text-muted">
            Have a project in mind or want to say hello? Feel free to reach out!
          </p>
          <Button
            href="mailto:banukajanith2002@gmail.com"
            variant="primary"
            className="mt-8 hover:shadow-[0_0_24px_rgba(124,58,237,0.5)]"
          >
            Send Me a Message
            <Mail className="h-4 w-4" aria-hidden="true" />
          </Button>
        </FadeIn>

        <FadeIn delay={0.1}>
          <div className="flex flex-col gap-3">
            {contactInfo.map((item) => (
              <a
                key={item.label}
                href={item.href}
                target={item.href.startsWith("http") ? "_blank" : undefined}
                rel={item.href.startsWith("http") ? "noopener noreferrer" : undefined}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-5 py-4 transition-colors duration-200 hover:bg-white/10"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary-400">
                  <Icon name={item.icon} className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-xs text-muted">{item.label}</span>
                  <span className="block truncate text-sm font-medium text-foreground">{item.value}</span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted" aria-hidden="true" />
              </a>
            ))}
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
