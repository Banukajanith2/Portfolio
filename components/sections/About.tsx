import Image from "next/image";
import { Download } from "lucide-react";
import { aboutContent, aboutStats, siteConfig } from "@/data/portfolio";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { FadeIn } from "@/components/ui/FadeIn";
import { AnimatedText } from "@/components/ui/AnimatedText";

export function About() {
  return (
    <section id="about" className="flex min-h-screen items-center px-5 py-20 md:px-10">
      <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-14 lg:grid-cols-2 lg:gap-16">
        <FadeIn x={-30} y={0}>
          <div className="relative mx-auto w-full max-w-md">
            <div className="relative aspect-[5/6] w-full overflow-hidden rounded-2xl border border-white/10">
              <Image
                src="/images/about-photo.svg"
                alt={`${siteConfig.firstName} ${siteConfig.lastName} working at a desk`}
                fill
                unoptimized
                sizes="(min-width: 1024px) 420px, 90vw"
                className="object-cover"
              />
            </div>

            <div className="absolute -bottom-4 left-4 rounded-xl bg-primary px-4 py-3 font-semibold text-white shadow-glow sm:left-6">
              {aboutContent.badge}
            </div>
          </div>
        </FadeIn>

        <div>
          <FadeIn>
            <p className="text-sm font-medium uppercase tracking-widest text-primary-400">About Me</p>
            <h2 className="mt-2 text-4xl font-black leading-tight text-foreground md:text-5xl">
              {aboutContent.heading}
            </h2>
          </FadeIn>

          <div className="mt-5 space-y-4 text-sm text-muted sm:text-base">
            {aboutContent.paragraphs.map((paragraph, index) => (
              <AnimatedText key={index} text={paragraph} className="font-light leading-relaxed" />
            ))}
          </div>

          <div className="mt-8 grid grid-cols-3 gap-3 sm:gap-4">
            {aboutStats.map((stat, index) => (
              <FadeIn key={stat.label} delay={index * 0.1}>
                <div className="group rounded-xl border border-white/10 bg-white/5 p-4 text-center transition-colors hover:border-primary/50">
                  <span className="mx-auto flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary-400">
                    <Icon name={stat.icon} className="h-4 w-4" />
                  </span>
                  <span className="mt-2 block text-lg font-bold text-primary-400 sm:text-xl">{stat.value}</span>
                  <span className="block text-[11px] leading-tight text-muted sm:text-xs">{stat.label}</span>
                </div>
              </FadeIn>
            ))}
          </div>

          <FadeIn delay={0.4}>
            <Button href={siteConfig.resumeUrl} download variant="primary" className="mt-8">
              Download CV
              <Download className="h-4 w-4" aria-hidden="true" />
            </Button>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
