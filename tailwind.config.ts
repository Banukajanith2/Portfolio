import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // <alpha-value> lets opacity utilities (bg-background/80, text-foreground/75)
        // actually compile; with a bare var(--x) Tailwind emits nothing for them.
        background: "rgb(var(--background) / <alpha-value>)",
        foreground: "rgb(var(--foreground) / <alpha-value>)",
        card: "rgb(var(--card) / <alpha-value>)",
        muted: "rgb(var(--muted) / <alpha-value>)",
        surface: {
          DEFAULT: "rgb(var(--surface) / <alpha-value>)",
          hover: "rgb(var(--surface-hover) / <alpha-value>)",
        },
        border: {
          DEFAULT: "rgb(var(--border) / <alpha-value>)",
          hover: "rgb(var(--border-hover) / <alpha-value>)",
        },
        accent: {
          // The lime itself - use for fills, strokes and glows.
          DEFAULT: "rgb(var(--accent) / <alpha-value>)",
          // Text drawn *on top of* an accent fill.
          contrast: "rgb(var(--accent-contrast) / <alpha-value>)",
          // Accent-coloured text; darkens in light mode so it stays legible.
          fg: "rgb(var(--accent-fg) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        glow: "0 0 40px -8px rgb(var(--accent) / 0.45)",
        "glow-lg": "0 0 90px -20px rgb(var(--accent) / 0.55)",
        lift: "0 24px 60px -24px rgb(0 0 0 / 0.5)",
      },
      transitionTimingFunction: {
        // The house easing: fast out of the gate, long settle. Matches the
        // spring feel of the Framer Motion transitions without the cost.
        smooth: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      animation: {
        blink: "blink 1.05s step-end infinite",
        marquee: "marquee var(--marquee-duration, 40s) linear infinite",
        "pulse-ring": "pulse-ring 2.4s ease-out infinite",
        drift: "drift 22s ease-in-out infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        // The track holds two identical copies of the content, so translating
        // exactly -50% lands copy two where copy one started - seamless loop.
        marquee: {
          from: { transform: "translate3d(0, 0, 0)" },
          to: { transform: "translate3d(-50%, 0, 0)" },
        },
        "pulse-ring": {
          "0%": { transform: "scale(1)", opacity: "0.55" },
          "80%, 100%": { transform: "scale(2.4)", opacity: "0" },
        },
        drift: {
          "0%, 100%": { transform: "translate3d(0, 0, 0) scale(1)" },
          "33%": { transform: "translate3d(4%, -6%, 0) scale(1.08)" },
          "66%": { transform: "translate3d(-5%, 4%, 0) scale(0.95)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
