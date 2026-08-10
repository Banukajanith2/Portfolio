"use client";

import { useState, type FormEvent } from "react";
import { Loader2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

type Status = "idle" | "sending" | "success" | "error";

// Public by design: Web3Forms identifies the form with this and filters spam
// server-side. Injected at build time from the WEB3FORMS_KEY Actions secret.
const accessKey = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;

const fieldClasses =
  "w-full rounded-xl border border-border bg-surface px-4 py-3.5 text-sm text-foreground outline-none transition-colors duration-300 placeholder:text-muted focus:border-accent focus:bg-surface-hover";

export function ContactForm({ mailto }: { mailto: string | null }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  // Without a key the form could only ever fail, so fall back to the mail link
  // rather than showing inputs that silently drop the visitor's message.
  if (!accessKey) {
    return (
      <Button href={mailto ? `mailto:${mailto}` : "#contact"} variant="primary" className="mt-8">
        Send Me a Message
        <Mail className="h-4 w-4" aria-hidden="true" />
      </Button>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus("sending");
    setError("");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: accessKey,
          subject: "New message from your portfolio",
          ...Object.fromEntries(new FormData(form)),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
        setError(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setStatus("error");
      setError("Could not reach the server. Please check your connection.");
    }
  }

  const sending = status === "sending";

  return (
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-4">
      {/* Bots fill hidden fields; Web3Forms discards any submission that does. */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="flex flex-col gap-4 sm:flex-row">
        <label className="flex-1">
          <span className="mb-2 block text-xs text-muted">Name</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder="Your name"
            disabled={sending}
            className={fieldClasses}
          />
        </label>

        <label className="flex-1">
          <span className="mb-2 block text-xs text-muted">Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder="you@example.com"
            disabled={sending}
            className={fieldClasses}
          />
        </label>
      </div>

      <label>
        <span className="mb-2 block text-xs text-muted">Message</span>
        <textarea
          name="message"
          required
          rows={5}
          placeholder="Tell me about your project..."
          disabled={sending}
          className={cn(fieldClasses, "resize-y")}
        />
      </label>

      <div className="flex flex-wrap items-center gap-4">
        <Button type="submit" variant="primary" disabled={sending}>
          {sending ? "Sending..." : "Send Message"}
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Send className="h-4 w-4" aria-hidden="true" />
          )}
        </Button>

        <p
          role="status"
          aria-live="polite"
          className={cn(
            "text-sm",
            status === "success" && "text-accent-fg",
            status === "error" && "text-red-400"
          )}
        >
          {status === "success" && "Thanks! Your message is on its way."}
          {status === "error" && error}
        </p>
      </div>
    </form>
  );
}
