import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "outline" | "ghost";

/**
 * Lime is the page's only accent, so a solid lime fill is the strongest signal
 * available - it is reserved for the single most important action in any view.
 * Everything else is a hairline outline or bare text.
 */
const variantClasses: Record<Variant, string> = {
  primary: "bg-accent text-accent-contrast hover:shadow-glow",
  outline: "border border-border-hover text-foreground hover:border-accent hover:text-accent-fg",
  ghost: "text-muted hover:text-foreground",
};

const baseClasses = cn(
  "group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full",
  "px-7 py-3 font-mono text-[11px] font-medium uppercase tracking-[0.16em]",
  "transition-all duration-500 ease-smooth",
  "disabled:pointer-events-none disabled:opacity-40"
);

interface CommonProps {
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type ButtonAsAnchor = CommonProps & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export function Button({ variant = "primary", className, children, ...props }: ButtonProps) {
  const classes = cn(baseClasses, variantClasses[variant], className);

  // A light sweeps across the button on hover. Kept on a child rather than a
  // ::before so it composites on its own layer and never repaints the label.
  const sweep = (
    <span
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -translate-x-full skew-x-12",
        "bg-gradient-to-r from-transparent via-white/25 to-transparent",
        "transition-transform duration-[900ms] ease-smooth group-hover/btn:translate-x-full"
      )}
    />
  );

  const content = (
    <>
      {sweep}
      <span className="relative flex items-center gap-2">{children}</span>
    </>
  );

  if ("href" in props && props.href) {
    const { href, ...anchorProps } = props as ButtonAsAnchor;
    return (
      <a href={href} className={classes} {...anchorProps}>
        {content}
      </a>
    );
  }

  const buttonProps = props as ButtonHTMLAttributes<HTMLButtonElement>;
  return (
    <button className={classes} {...buttonProps}>
      {content}
    </button>
  );
}
