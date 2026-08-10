"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { contactInfo, siteConfig } from "@/data/portfolio";
import { ContactForm } from "@/components/ui/ContactForm";
import { Icon } from "@/components/ui/Icon";
import { KineticText } from "@/components/ui/KineticText";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The closing call to action.
 *
 * Deliberately the loudest type on the page after the hero — everything above
 * it exists to get someone here, so the heading is allowed to fill the width
 * rather than sit in a column.
 */
export function Contact() {
  return (
    <section id="contact" className="relative py-24 sm:py-32">
      <div className="section-container">
        <div className="flex items-center gap-4">
          <span className="mono-label text-accent-fg">07</span>
          <span className="mono-label">Contact</span>
          <span aria-hidden="true" className="h-px flex-1 bg-border" />
        </div>

        <KineticText
          as="h2"
          text="Let's build something"
          className="mt-8 display block text-[clamp(2.5rem,10vw,8rem)] text-foreground"
        />

        <div className="mt-14 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <Reveal className="lg:col-span-7">
            <p className="max-w-md text-balance text-base leading-relaxed text-muted">
              Have a role, a project or a question? The form goes straight to my inbox — or reach
              me directly through any of the channels listed.
            </p>
            <ContactForm mailto={siteConfig.email} />
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-5">
            <div className="flex flex-col gap-2">
              {contactInfo.map((item) => (
                <ContactRow key={item.label} item={item} />
              ))}
            </div>

            <CopyEmail email={siteConfig.email} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function ContactRow({ item }: { item: (typeof contactInfo)[number] }) {
  const isExternal = item.href.startsWith("http");

  return (
    <a
      href={item.href}
      target={isExternal ? "_blank" : undefined}
      rel={isExternal ? "noopener noreferrer" : undefined}
      className="group flex items-center gap-4 rounded-xl border border-border bg-surface px-5 py-4 transition-all duration-500 ease-smooth hover:border-accent hover:bg-surface-hover"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/12 text-accent-fg transition-colors duration-500 group-hover:bg-accent group-hover:text-accent-contrast">
        <Icon name={item.icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="mono-label block">{item.label}</span>
        <span className="mt-1.5 block truncate text-sm text-foreground">{item.value}</span>
      </span>
    </a>
  );
}

/** Copying an address is the fastest path for anyone already in their mail
    client, and it is the interaction people notice is missing when it isn't there. */
function CopyEmail({ email }: { email: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard?.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-2 flex w-full items-center justify-between gap-4 rounded-xl border border-dashed border-border px-5 py-4 text-left transition-colors duration-500 hover:border-accent"
    >
      <span className="min-w-0 truncate font-mono text-xs text-muted">{email}</span>
      <span className="flex shrink-0 items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-accent-fg">
        {copied ? (
          <>
            Copied <Check className="h-3.5 w-3.5" aria-hidden="true" />
          </>
        ) : (
          <>
            Copy <Copy className="h-3.5 w-3.5" aria-hidden="true" />
          </>
        )}
      </span>
    </button>
  );
}
