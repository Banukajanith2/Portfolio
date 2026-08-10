import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { siteConfig } from "@/data/portfolio";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: siteConfig.firstName,
  description: siteConfig.tagline,
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
        {children}
      </body>
    </html>
  );
}
