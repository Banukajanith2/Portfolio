"use client";

import Image from "next/image";
import { ArrowUpRight, MapPin } from "lucide-react";
import {
  aboutContent,
  countStats,
  currentFocus,
  siteConfig,
} from "@/data/portfolio";
import { CountUp } from "@/components/ui/CountUp";
import { DownloadCvButton } from "@/components/ui/DownloadCvButton";
import { Reveal, RevealGroup, RevealItem } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { asset } from "@/lib/utils";

/**
 * A bento grid rather than the usual photo-left / text-right split.
 *
 * The asymmetric tile sizes let the portrait, the prose, the numbers and the
 * "what I'm doing now" block all sit at their natural weight instead of being
 * forced into two equal columns - and it gives the section a silhouette you can
 * recognise from a scroll-past.
 */
export function About() {
  return (
    <section id="about" className="relative py-24 sm:py-32">
      <div className="section-container">
        <SectionHeading index="01" label="Profile" title={aboutContent.heading} />

        <RevealGroup
          className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:grid-rows-[repeat(3,minmax(0,auto))]"
          stagger={0.08}
        >
          {/* Portrait - tall tile anchoring the left edge. */}
          <RevealItem className="sm:col-span-1 lg:row-span-2">
            <SpotlightCard className="group h-full min-h-[320px]" contentClassName="h-full">
              <div className="relative h-full min-h-[320px] w-full">
                {/* object-top because the source is a standing full-body
                    cut-out: when the tile is shorter than the image's 0.78
                    ratio, cropping at the feet is invisible where cropping the
                    head would not be. */}
                <Image
                  src={asset("/images/about-portrait.webp")}
                  alt={`${siteConfig.firstName} ${siteConfig.lastName}`}
                  fill
                  unoptimized
                  sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
                  className="object-cover object-top grayscale transition-all duration-700 ease-smooth group-hover:scale-[1.04] group-hover:grayscale-0"
                />
                {/* Fades from the card's own surface rather than from black.
                    The portrait is a transparent cut-out, so a black gradient
                    would paint a hard dark bar across the light theme instead
                    of blending the figure into the tile. */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-surface via-surface/85 to-transparent p-4 pt-16">
                  <p className="mono-label">{aboutContent.badge}</p>
                </div>
              </div>
            </SpotlightCard>
          </RevealItem>

          {/* Prose - the widest tile, carrying the actual narrative. */}
          <RevealItem className="sm:col-span-1 lg:col-span-2 lg:row-span-2">
            <SpotlightCard
              className="h-full"
              contentClassName="flex h-full flex-col p-6 sm:p-8"
            >
              <p className="mono-label">Who I am</p>
              <div className="mt-5 space-y-4">
                {aboutContent.paragraphs.map((paragraph, index) => (
                  <p key={index} className="text-sm leading-relaxed text-muted sm:text-[15px]">
                    {paragraph}
                  </p>
                ))}
              </div>
              <div className="mt-auto pt-8">
                <DownloadCvButton href={siteConfig.resumeUrl} />
              </div>
            </SpotlightCard>
          </RevealItem>

          {/* Location. */}
          <RevealItem>
            <SpotlightCard
              className="h-full"
              contentClassName="flex h-full flex-col justify-between p-6"
            >
              <div className="flex items-center justify-between">
                <p className="mono-label">Based in</p>
                <MapPin className="h-4 w-4 text-accent-fg" aria-hidden="true" />
              </div>
              <div className="mt-6">
                <p className="display text-3xl text-foreground">{siteConfig.location}</p>
                <p className="mt-2 font-mono text-[11px] text-muted">GMT+5:30 · Remote friendly</p>
              </div>
            </SpotlightCard>
          </RevealItem>

          {/* Now - the tile that dates the site and proves it's maintained. */}
          <RevealItem>
            <SpotlightCard className="h-full" contentClassName="h-full p-6">
              <p className="mono-label">Right now</p>
              <ul className="mt-5 space-y-4">
                {currentFocus.map((item) => (
                  <li key={item.label}>
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-accent-fg">
                      {item.label}
                    </p>
                    <p className="mt-1 text-sm leading-snug text-foreground">{item.value}</p>
                  </li>
                ))}
              </ul>
            </SpotlightCard>
          </RevealItem>

          {/* Numbers - one wide row so the figures read as a set. */}
          <RevealItem className="sm:col-span-2 lg:col-span-4">
            <SpotlightCard contentClassName="grid grid-cols-1 divide-y divide-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              {countStats.map((stat) => (
                <div key={stat.label} className="p-6 sm:p-8">
                  <p className="display text-[clamp(2.5rem,6vw,4rem)] text-accent-fg">
                    <CountUp value={stat.value} suffix={stat.suffix} />
                  </p>
                  <p className="mt-2 text-sm font-medium text-foreground">{stat.label}</p>
                  <p className="mt-1 font-mono text-[11px] text-muted">{stat.caption}</p>
                </div>
              ))}
            </SpotlightCard>
          </RevealItem>
        </RevealGroup>

        <Reveal delay={0.1}>
          <a
            href="#contact"
            className="group mt-4 flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface px-6 py-5 transition-colors duration-500 hover:border-accent sm:px-8"
          >
            <span className="text-sm text-muted sm:text-base">
              Want the longer version?{" "}
              <span className="text-foreground">Let&apos;s talk.</span>
            </span>
            <ArrowUpRight className="h-5 w-5 shrink-0 text-accent-fg transition-transform duration-500 ease-smooth group-hover:translate-x-1 group-hover:-translate-y-1" />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
