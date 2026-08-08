"use client";

import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  color: string;
}

interface ParticleBackgroundProps {
  className?: string;
  density?: number;
  colors?: string[];
  linkColor?: string;
}

export function ParticleBackground({
  className,
  density = 14000,
  colors = ["#7c3aed", "#06b6d4"],
  linkColor = "124, 58, 237",
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const parent = canvas?.parentElement;
    if (!canvas || !parent) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let animationId = 0;
    let running = false;

    function resize() {
      const rect = parent!.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      canvas!.style.width = `${width}px`;
      canvas!.style.height = `${height}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function initParticles() {
      const count = Math.max(20, Math.min(90, Math.floor((width * height) / density)));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.4 + 0.8,
        color: colors[Math.floor(Math.random() * colors.length)],
      }));
    }

    function drawFrame() {
      ctx!.clearRect(0, 0, width, height);

      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x <= 0 || p.x >= width) p.vx *= -1;
        if (p.y <= 0 || p.y >= height) p.vy *= -1;
      }

      const maxDist = Math.max(90, Math.min(width, height) * 0.16);
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const a = particles[i];
          const b = particles[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            ctx!.strokeStyle = `rgba(${linkColor}, ${(1 - dist / maxDist) * 0.18})`;
            ctx!.lineWidth = 1;
            ctx!.beginPath();
            ctx!.moveTo(a.x, a.y);
            ctx!.lineTo(b.x, b.y);
            ctx!.stroke();
          }
        }
      }

      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = p.color;
        ctx!.globalAlpha = 0.7;
        ctx!.fill();
        ctx!.globalAlpha = 1;
      }
    }

    function step() {
      if (!running) return;
      drawFrame();
      animationId = requestAnimationFrame(step);
    }

    function start() {
      if (running) return;
      running = true;
      if (prefersReducedMotion) {
        drawFrame();
        running = false;
      } else {
        step();
      }
    }

    function stop() {
      running = false;
      cancelAnimationFrame(animationId);
    }

    resize();
    initParticles();
    start();

    const handleResize = () => {
      resize();
      initParticles();
      if (prefersReducedMotion) drawFrame();
    };
    window.addEventListener("resize", handleResize);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) start();
        else stop();
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    return () => {
      stop();
      window.removeEventListener("resize", handleResize);
      observer.disconnect();
    };
  }, [density, colors, linkColor]);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
