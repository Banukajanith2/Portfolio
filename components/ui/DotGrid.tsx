import { cn } from "@/lib/utils";

interface DotGridProps {
  className?: string;
}

export function DotGrid({ className }: DotGridProps) {
  return (
    <div
      className={cn("pointer-events-none opacity-60", className)}
      style={{
        backgroundImage: "radial-gradient(circle, rgba(124, 58, 237, 0.55) 1.5px, transparent 1.5px)",
        backgroundSize: "18px 18px",
      }}
      aria-hidden="true"
    />
  );
}
