"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { availability, heroMeta, heroRoles, heroSocials, siteConfig } from "@/data/portfolio";
import { KineticChars } from "@/components/ui/KineticText";
import { Magnetic } from "@/components/ui/Magnetic";
import { SocialIcon } from "@/components/ui/SocialIcon";
import { Terminal } from "@/components/ui/Terminal";
import { HeroCanvas } from "@/components/three/HeroCanvas";
import { asset } from "@/lib/utils";

/**
 * The hero is asymmetric on purpose: an oversized name block on the left and a
 * narrow instrument column on the right. A centred hero with a portrait is the
 * single most common portfolio layout there is, so the whole composition is
 * built to avoid reading that way.
 */
export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const reduced = useReducedMotion();

  // Parallax the hero out as the page scrolls past it, so the section below
  // appears to slide over the top rather than simply following it.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const contentY = useTransform(scrollYProgress, [0, 1], [0, 140]);
  const contentOpacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  return (
    <section
      ref={ref}
      id="home"
      className="relative flex min-h-[100svh] items-center overflow-hidden pb-24 pt-32 sm:pt-36"
    >
      {/*
        Sits behind the content. The radial mask is the important part: it fades
        the field out well before the section edges so it reads as depth behind
        the page rather than as a panel with a boundary, and it keeps the
        brightest part of the field off the text and the terminal card.
      */}
      {/*
        On mobile the hero collapses to one column, which puts the field
        directly behind the paragraph - so there it is pushed low and right and
        dimmed to roughly half strength, where it sits under the buttons and
        meta strip instead of the prose. Desktop has the empty middle column to
        give it, so it moves back to centre and full strength.
      */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 opacity-30 [mask-image:radial-gradient(ellipse_80%_40%_at_72%_74%,#000_5%,transparent_70%)] sm:opacity-60 sm:[mask-image:radial-gradient(ellipse_60%_55%_at_52%_45%,#000_10%,transparent_72%)]"
      >
        <HeroCanvas />
      </div>

      <motion.div
        style={reduced ? undefined : { y: contentY, opacity: contentOpacity }}
        className="section-container relative z-10"
      >
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-10">
          {/* ── Left: identity ─────────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-7">
            <AvailabilityPill />

            {/* Looser than the display default: at this size the outlined
                second line's ascenders run straight into the first line's
                descenders and the two words visibly collide. */}
            <h1 className="mt-8 display text-[clamp(3rem,11vw,8.5rem)] leading-[0.98]">
              <span className="block text-foreground">
                <KineticChars text={siteConfig.firstName.split(" ")[0]} delay={0.35} />
              </span>
              <span className="block text-outline-strong">
                <KineticChars text={siteConfig.lastName} delay={0.5} />
              </span>
            </h1>

            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 20 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.9 }}
              className="mt-8 max-w-xl"
            >
              <p className="flex flex-wrap items-baseline gap-x-2 text-lg text-muted sm:text-xl">
                <span>Engineering</span>
                <RoleRotator />
              </p>

              <p className="mt-5 text-balance text-base leading-relaxed text-muted">
                {siteConfig.tagline}
              </p>
            </motion.div>

            <motion.div
              initial={reduced ? undefined : { opacity: 0, y: 20 }}
              animate={reduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 1.05 }}
              className="mt-10 flex flex-wrap items-center gap-3"
            >
              <Magnetic>
                <a
                  href="#projects"
                  className="group inline-flex items-center gap-2.5 rounded-full bg-accent px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-accent-contrast transition-shadow duration-500 hover:shadow-glow"
                >
                  Selected Work
                  <ArrowUpRight className="h-4 w-4 transition-transform duration-500 ease-smooth group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </a>
              </Magnetic>

              <Magnetic>
                <a
                  href="#contact"
                  className="inline-flex items-center gap-2.5 rounded-full border border-border-hover px-7 py-3.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground transition-colors duration-500 hover:border-accent hover:text-accent-fg"
                >
                  Get in touch
                </a>
              </Magnetic>
            </motion.div>

            {/* Mono metadata strip - the device that frames the page as a spec
                sheet rather than a brochure. */}
            <motion.dl
              initial={reduced ? undefined : { opacity: 0 }}
              animate={reduced ? undefined : { opacity: 1 }}
              transition={{ duration: 1, delay: 1.25 }}
              className="mt-12 grid max-w-2xl grid-cols-2 gap-x-8 gap-y-5 border-t border-border pt-6 sm:grid-cols-3"
            >
              {heroMeta.map((item) => (
                <div key={item.key}>
                  <dt className="mono-label">{item.key}</dt>
                  <dd className="mt-2 text-sm text-foreground">{item.value}</dd>
                </div>
              ))}
            </motion.dl>
          </div>

          {/* ── Right: instrument column ───────────────────────────────── */}
          <motion.div
            initial={reduced ? undefined : { opacity: 0, y: 40 }}
            animate={reduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: 0.75 }}
            className="flex flex-col gap-5 lg:col-span-5"
          >
            <div className="flex items-stretch gap-5">
              {/* The source is a 1:1 cut-out with a transparent background, so
                  it drops straight into the square tile with nothing cropped,
                  and bg-surface shows through behind the subject. */}
              <div className="relative aspect-square w-32 shrink-0 overflow-hidden rounded-xl border border-border bg-surface sm:w-40">
                <Image
                  src={asset("/images/hero-portrait.webp")}
                  alt={`Portrait of ${siteConfig.firstName} ${siteConfig.lastName}`}
                  fill
                  priority
                  unoptimized
                  sizes="160px"
                  className="object-cover object-top"
                />
              </div>

              <div className="flex min-w-0 flex-1 flex-col justify-between rounded-xl border border-border bg-surface p-4">
                <p className="mono-label">Currently</p>
                <p className="mt-2 text-sm leading-snug text-foreground">
                  Digital Designer at{" "}
                  <span className="text-accent-fg">SISKA Limited</span>
                </p>
                <div className="mt-4 flex items-center gap-3">
                  {heroSocials.slice(0, 4).map((social) => (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className="text-muted transition-colors duration-300 hover:text-accent-fg"
                    >
                      <SocialIcon name={social.icon} className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>

            <Terminal />
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/** Live status pill. The ring animation is the only motion in the top-left, so
    it draws the eye to the one fact a recruiter is scanning for. */
function AvailabilityPill() {
  const reduced = useReducedMotion();

  return (
    <motion.a
      href="#contact"
      initial={reduced ? undefined : { opacity: 0, y: 12 }}
      animate={reduced ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      className="group inline-flex items-center gap-2.5 rounded-full border border-border bg-surface/60 py-1.5 pl-2.5 pr-4 backdrop-blur-sm transition-colors duration-300 hover:border-accent"
    >
      <span className="relative flex h-1.5 w-1.5">
        {availability.open && (
          <span className="absolute inset-0 rounded-full bg-accent animate-pulse-ring" />
        )}
        <span className="relative h-1.5 w-1.5 rounded-full bg-accent" />
      </span>
      <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted transition-colors group-hover:text-foreground">
        {availability.label}
      </span>
    </motion.a>
  );
}

/**
 * Cycles the discipline in the role line. Each word is masked so it rolls over
 * rather than cross-fading; the container is inline-grid so its width tracks
 * the widest word and the line never reflows mid-swap.
 */
function RoleRotator() {
  const reduced = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % heroRoles.length), 2600);
    return () => clearInterval(id);
  }, [reduced]);

  if (reduced) {
    return <span className="font-medium text-foreground">{heroRoles.join(", ")}</span>;
  }

  return (
    <span className="relative inline-grid overflow-hidden pb-[0.18em] -mb-[0.18em] align-bottom">
      {/* Invisible sizer: reserves the width of the longest option up front. */}
      <span aria-hidden="true" className="col-start-1 row-start-1 invisible font-medium">
        {heroRoles.reduce((a, b) => (a.length >= b.length ? a : b))}
      </span>

      {/* No `mode="wait"`: waiting for the exit to finish before mounting the
          next word leaves the slot empty for half a second every cycle. Letting
          them overlap in the same grid cell is also what produces the roll. */}
      <AnimatePresence>
        <motion.span
          key={heroRoles[index]}
          initial={{ y: "100%", opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: "-100%", opacity: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="col-start-1 row-start-1 whitespace-nowrap font-medium text-accent-fg"
        >
          {heroRoles[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

