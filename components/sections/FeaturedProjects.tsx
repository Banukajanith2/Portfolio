"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ExternalLink } from "lucide-react";
import { SiGithub } from "react-icons/si";
import { featuredProjects, type FeaturedProject } from "@/data/portfolio";
import { TechIcon } from "@/components/ui/TechIcon";
import { FadeIn } from "@/components/ui/FadeIn";

const TOTAL = featuredProjects.length;

function ProjectCard({ project, index }: { project: FeaturedProject; index: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "start start"],
  });

  const targetScale = 1 - (TOTAL - 1 - index) * 0.04;
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale]);

  return (
    <div ref={containerRef} className="sticky h-[85vh]" style={{ top: `${100 + index * 30}px` }}>
      <motion.div
        style={{ scale }}
        className="h-full origin-top overflow-hidden rounded-[32px] border border-border bg-card p-6 shadow-2xl md:p-8"
      >
        <div className="flex h-full flex-col gap-8 lg:flex-row lg:gap-10">
          <div className="flex flex-col lg:w-[35%]">
            <span
              className="hero-heading font-black leading-none"
              style={{ fontSize: "clamp(4rem, 8vw, 7rem)" }}
            >
              {project.number}
            </span>

            {project.featured && (
              <span className="mt-2 w-fit rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold text-primary-400">
                Featured
              </span>
            )}

            <h3 className="mt-4 text-2xl font-bold text-foreground">{project.title}</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted">{project.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-2">
              {project.tech.map((tech) => (
                <span
                  key={tech}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs text-muted"
                >
                  <TechIcon name={tech} className="h-3.5 w-3.5" />
                  {tech}
                </span>
              ))}
            </div>

            <div className="mt-auto flex items-center gap-5 pt-6 text-sm">
              <a
                href={project.liveDemoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-secondary-400 hover:text-secondary-300"
              >
                Live Demo
                <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
              <a
                href={project.sourceCodeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 font-medium text-muted hover:text-foreground"
              >
                Source Code
                <SiGithub className="h-3.5 w-3.5" aria-hidden="true" />
              </a>
            </div>
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-[40%_60%] gap-3 lg:w-[65%]">
            <div className="flex flex-col gap-3">
              <div className="relative overflow-hidden rounded-2xl" style={{ height: "clamp(130px, 14vw, 200px)" }}>
                <Image src={project.images[0]} alt="" fill unoptimized sizes="30vw" className="object-cover" />
              </div>
              <div className="relative overflow-hidden rounded-2xl" style={{ height: "clamp(160px, 18vw, 280px)" }}>
                <Image src={project.images[1]} alt="" fill unoptimized sizes="30vw" className="object-cover" />
              </div>
            </div>
            <div className="relative overflow-hidden rounded-2xl">
              <Image
                src={project.images[2]}
                alt={`${project.title} preview`}
                fill
                unoptimized
                sizes="45vw"
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function FeaturedProjects() {
  return (
    <section id="projects" className="py-20 sm:py-28">
      <div className="section-container">
        <FadeIn className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="hero-heading font-black leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Featured Projects
          </h2>
          <a
            href="#projects"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-secondary-400 hover:text-secondary-300"
          >
            View All Projects
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </a>
        </FadeIn>

        <div className="mt-12 space-y-10">
          {featuredProjects.map((project, index) => (
            <ProjectCard key={project.title} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
