import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { siteConfig } from "@/data/portfolio";
import { Aurora, CursorGlow, Grain, ScrollProgress } from "@/components/ui/Ambience";
import { CommandPalette } from "@/components/ui/CommandPalette";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  // Name only. The browser tab truncates anything longer, and the role is
  // already the first thing the page itself says.
  title: siteConfig.firstName,
  description: siteConfig.tagline,
  openGraph: {
    title: siteConfig.firstName,
    description: siteConfig.tagline,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable} ${GeistMono.variable}`}>
      <body className="bg-background font-sans text-foreground antialiased">
        {/*
          Runs before the page paints so a visitor who chose light mode never
          sees a flash of the dark theme that <html> ships with. Kept inline
          and dependency-free for that reason.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');document.documentElement.classList.toggle('dark',t!=='light')}catch(e){}`,
          }}
        />

        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:rounded-full focus:bg-accent focus:px-5 focus:py-2.5 focus:font-mono focus:text-xs focus:text-accent-contrast"
        >
          Skip to content
        </a>

        {/* Ambient layers, back to front. All decorative and pointer-transparent. */}
        <Aurora />
        <CursorGlow />

        {children}

        <ScrollProgress />
        <CommandPalette />
        <Grain />
      </body>
    </html>
  );
}
