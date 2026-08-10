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
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        surface: {
          DEFAULT: "var(--surface)",
          hover: "var(--surface-hover)",
        },
        border: {
          DEFAULT: "var(--border)",
          hover: "var(--border-hover)",
        },
        muted: "var(--muted)",
        primary: {
          DEFAULT: "#7c3aed",
          50: "#f5f3ff",
          100: "#ede9fe",
          200: "#ddd6fe",
          300: "#c4b5fd",
          400: "#a78bfa",
          500: "#8b5cf6",
          600: "#7c3aed",
          700: "#6d28d9",
          800: "#5b21b6",
          900: "#4c1d95",
        },
        secondary: {
          DEFAULT: "#06b6d4",
          50: "#ecfeff",
          100: "#cffafe",
          200: "#a5f3fc",
          300: "#67e8f9",
          400: "#22d3ee",
          500: "#06b6d4",
          600: "#0891b2",
          700: "#0e7490",
          800: "#155e75",
          900: "#164e63",
        },
        navy: {
          DEFAULT: "#0a0a0f",
          50: "#f4f4f6",
          100: "#e2e2e8",
          200: "#c5c5d1",
          300: "#9d9db0",
          400: "#6f6f8a",
          500: "#4b4b64",
          600: "#33333f",
          700: "#232330",
          800: "#16161f",
          900: "#0e0e14",
          950: "#0a0a0f",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(circle, var(--tw-gradient-stops))",
        "hero-glow":
          "radial-gradient(circle at 70% 30%, rgba(124, 58, 237, 0.25), transparent 60%)",
      },
      boxShadow: {
        glow: "0 0 40px rgba(124, 58, 237, 0.25)",
        "glow-cyan": "0 0 40px rgba(6, 182, 212, 0.2)",
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        blink: "blink 1s step-end infinite",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
