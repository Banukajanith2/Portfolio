import Image from "next/image";
import { Star } from "lucide-react";
import { testimonials } from "@/data/portfolio";
import { FadeIn } from "@/components/ui/FadeIn";

export function Testimonials() {
  return (
    <section className="py-20 sm:py-28">
      <div className="section-container">
        <FadeIn>
          <h2 className="hero-heading text-center font-black leading-none" style={{ fontSize: "clamp(2.5rem, 6vw, 4.5rem)" }}>
            Testimonials
          </h2>
        </FadeIn>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={testimonial.name} delay={index * 0.08}>
              <figure className="flex h-full flex-col rounded-2xl border border-border bg-surface p-6 transition-colors duration-200 hover:border-secondary/40">
                <span className="font-serif text-5xl leading-none text-primary-400" aria-hidden="true">
                  &ldquo;
                </span>
                <blockquote className="mt-2 flex-1 text-sm leading-relaxed text-muted">{testimonial.quote}</blockquote>

                <div className="mt-4 flex gap-0.5">
                  {Array.from({ length: testimonial.rating }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-3.5 w-3.5 fill-primary-400 text-primary-400" />
                  ))}
                </div>

                <figcaption className="mt-4 flex items-center gap-3">
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      unoptimized
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs text-muted">{testimonial.role}</p>
                  </div>
                </figcaption>
              </figure>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
