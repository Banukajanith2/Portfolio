"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { marqueeRow1, marqueeRow2 } from "@/data/portfolio";

interface MarqueeRowProps {
  images: string[];
  offsetPx: number;
}

function MarqueeRow({ images, offsetPx }: MarqueeRowProps) {
  const tripled = [...images, ...images, ...images];

  return (
    <div className="overflow-hidden">
      <div
        className="flex gap-3"
        style={{ transform: `translate3d(calc(-33.3333% + ${offsetPx}px), 0, 0)` }}
      >
        {tripled.map((src, index) => (
          <div
            key={index}
            className="relative h-[172px] w-[268px] shrink-0 overflow-hidden rounded-2xl sm:h-[220px] sm:w-[340px] lg:h-[270px] lg:w-[420px]"
          >
            <Image
              src={src}
              alt=""
              fill
              unoptimized
              loading="lazy"
              sizes="420px"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    function handleScroll() {
      const section = sectionRef.current;
      if (!section) return;
      const sectionTop = section.offsetTop;
      setOffset((window.scrollY - sectionTop + window.innerHeight) * 0.3);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section ref={sectionRef} className="overflow-hidden pb-10 pt-24 md:pt-32">
      <p className="mb-8 text-center font-mono text-xs uppercase tracking-widest text-muted">
        {"// selected work"}
      </p>

      <div className="flex flex-col gap-3">
        <MarqueeRow images={marqueeRow1} offsetPx={offset - 200} />
        <MarqueeRow images={marqueeRow2} offsetPx={-(offset - 200)} />
      </div>
    </section>
  );
}
