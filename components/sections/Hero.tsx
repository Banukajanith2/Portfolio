"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Mail } from "lucide-react";
import { heroCodeSnippet, heroSocials, siteConfig } from "@/data/portfolio";
import { Button } from "@/components/ui/Button";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { DotGrid } from "@/components/ui/DotGrid";
import { FadeIn } from "@/components/ui/FadeIn";
import { Magnet } from "@/components/ui/Magnet";
import { ParticleBackground } from "@/components/ui/ParticleBackground";
import { TypingCode } from "@/components/ui/TypingCode";
import { asset } from "@/lib/utils";

export function Hero() {
  return (
    <section
      id="home"
      className="relative flex min-h-screen flex-col justify-center overflow-hidden pt-28 pb-24 sm:pt-32 sm:pb-28"
    >
      <ParticleBackground className="pointer-events-none absolute inset-0" />
      <div className="absolute inset-0 bg-hero-glow" aria-hidden="true" />
      <DotGrid className="absolute right-6 top-24 hidden h-40 w-40 lg:block" />

      <div className="section-container relative grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-8">
        <div className="sm:mt-20 mt-0">
          <FadeIn delay={0.15}>
            <h1 className="text-5xl font-extrabold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              <span className="text-foreground">{siteConfig.firstName}</span>
              <br />
              <span className="hero-heading">{siteConfig.lastName}</span>
            </h1>
          </FadeIn>

          <FadeIn delay={0.25}>
            <p className="mt-4 text-lg font-medium text-primary-400 sm:text-xl">{siteConfig.role}</p>
          </FadeIn>

          <FadeIn delay={0.3}>
            <p className="mt-4 max-w-xl text-balance text-base font-light text-muted sm:text-lg">
              {siteConfig.tagline}
            </p>
          </FadeIn>

          <FadeIn delay={0.4}>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button href="#projects" variant="primary">
                View Projects
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
              <Button href="#contact" variant="outline">
                Contact Me
                <Mail className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </FadeIn>

          <FadeIn delay={0.5}>
            <div className="mt-8 flex items-center gap-5">
              {heroSocials.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.label}
                  className="text-muted transition-colors duration-200 hover:text-foreground"
                >
                  <SocialIcon name={social.icon} className="h-5 w-5" />
                </a>
              ))}
            </div>
          </FadeIn>
        </div>

        <FadeIn delay={0.6} className="relative mx-auto w-full max-w-md lg:max-w-lg">
          <Magnet padding={120} strength={3}>
            <div
              className="relative aspect-[5/5] w-full overflow-hidden rounded-3xl border border-border"
              style={{ boxShadow: "0 0 80px 20px rgba(124, 58, 237, 0.3)" }}
            >
              <Image
                src={asset("/images/hero-photo.svg")}
                alt={`Portrait of ${siteConfig.firstName} ${siteConfig.lastName}`}
                fill
                priority
                unoptimized
                sizes="(min-width: 1024px) 480px, 90vw"
                className="object-cover"
              />
            </div>
          </Magnet>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.25, 0.1, 0.25, 1], delay: 0.75 }}
            className="absolute -bottom-20 inset-x-0 mx-auto w-[92%] overflow-hidden rounded-xl border border-white/10 bg-[#0d0d14]/95 shadow-2xl backdrop-blur sm:-bottom-10 sm:inset-x-auto sm:left-auto sm:right-[-8%] sm:mx-0 sm:w-[85%]"
          >
            <div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500/80" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500/80" />
              <span className="ml-2 text-xs text-muted">about.me</span>
            </div>
            <TypingCode lines={heroCodeSnippet} className="px-4 py-3.5 font-mono text-[11px] leading-relaxed sm:text-xs" />
          </motion.div>
        </FadeIn>
      </div>
    </section>
  );
}
