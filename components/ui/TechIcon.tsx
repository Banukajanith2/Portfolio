import type { IconType } from "react-icons";
import {
  SiHtml5,
  SiCss,
  SiJavascript,
  SiTypescript,
  SiReact,
  SiNextdotjs,
  SiTailwindcss,
  SiNodedotjs,
  SiExpress,
  SiPython,
  SiMongodb,
  SiFirebase,
  SiMysql,
  SiGit,
  SiGithub,
  SiFigma,
  SiScikitlearn,
  SiPandas,
  SiNumpy,
  SiOpenjdk,
  SiJupyter,
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";
// Simple Icons dropped the Adobe and Power BI marks over trademark concerns,
// so these fall back to lucide shapes tinted with the familiar brand colours.
import { BarChart3, Image as ImageIcon, LayoutTemplate, LineChart, PenTool } from "lucide-react";

export type TechIconKey =
  | "html5"
  | "css3"
  | "javascript"
  | "typescript"
  | "react"
  | "nextjs"
  | "tailwind"
  | "nodejs"
  | "express"
  | "python"
  | "mongodb"
  | "firebase"
  | "mysql"
  | "git"
  | "github"
  | "figma"
  | "vscode"
  | "scikitlearn"
  | "pandas"
  | "numpy"
  | "matplotlib"
  | "java"
  | "jupyter"
  | "powerbi"
  | "photoshop"
  | "illustrator"
  | "indesign";

const techIconRegistry: Record<TechIconKey, { icon: IconType; color: string }> = {
  html5: { icon: SiHtml5, color: "#e34f26" },
  css3: { icon: SiCss, color: "#1572b6" },
  javascript: { icon: SiJavascript, color: "#f7df1e" },
  typescript: { icon: SiTypescript, color: "#3178c6" },
  react: { icon: SiReact, color: "#61dafb" },
  nextjs: { icon: SiNextdotjs, color: "var(--foreground)" },
  tailwind: { icon: SiTailwindcss, color: "#06b6d4" },
  nodejs: { icon: SiNodedotjs, color: "#5fa04e" },
  express: { icon: SiExpress, color: "var(--foreground)" },
  python: { icon: SiPython, color: "#3776ab" },
  mongodb: { icon: SiMongodb, color: "#47a248" },
  firebase: { icon: SiFirebase, color: "#ffca28" },
  mysql: { icon: SiMysql, color: "#4479a1" },
  git: { icon: SiGit, color: "#f05032" },
  github: { icon: SiGithub, color: "var(--foreground)" },
  figma: { icon: SiFigma, color: "#f24e1e" },
  vscode: { icon: VscVscode, color: "#007acc" },
  scikitlearn: { icon: SiScikitlearn, color: "#f7931e" },
  pandas: { icon: SiPandas, color: "#150458" },
  numpy: { icon: SiNumpy, color: "#4dabcf" },
  matplotlib: { icon: LineChart, color: "#11557c" },
  java: { icon: SiOpenjdk, color: "#f89820" },
  jupyter: { icon: SiJupyter, color: "#f37626" },
  powerbi: { icon: BarChart3, color: "#f2c811" },
  photoshop: { icon: ImageIcon, color: "#31a8ff" },
  illustrator: { icon: PenTool, color: "#ff9a00" },
  indesign: { icon: LayoutTemplate, color: "#ff3366" },
};

interface TechIconProps {
  name: TechIconKey;
  className?: string;
}

export function TechIcon({ name, className }: TechIconProps) {
  const entry = techIconRegistry[name];
  const Icon = entry.icon;
  return <Icon className={className} style={{ color: entry.color }} aria-hidden="true" />;
}
