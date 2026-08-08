import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const outDir = join(process.cwd(), "public", "images", "marquee");
mkdirSync(outDir, { recursive: true });

const tiles = [
  { id: "m1", from: "#7c3aed", to: "#06b6d4", label: "Web App" },
  { id: "m2", from: "#06b6d4", to: "#7c3aed", label: "Dashboard" },
  { id: "m3", from: "#a855f7", to: "#22d3ee", label: "Mobile UI" },
  { id: "m4", from: "#22c55e", to: "#06b6d4", label: "Landing Page" },
  { id: "m5", from: "#f97316", to: "#7c3aed", label: "SaaS Product" },
  { id: "m6", from: "#7c3aed", to: "#ec4899", label: "AI Tool" },
  { id: "m7", from: "#06b6d4", to: "#22c55e", label: "E-commerce" },
  { id: "m8", from: "#ec4899", to: "#7c3aed", label: "Portfolio" },
];

function tileSvg({ id, from, to, label }) {
  const width = 420;
  const height = 270;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#0d0d14"/>
  <rect width="${width}" height="${height}" fill="url(#g-${id})" opacity="0.25"/>
  <g opacity="0.55">
    <circle cx="${width * 0.18}" cy="${height * 0.28}" r="${height * 0.55}" fill="url(#g-${id})"/>
    <circle cx="${width * 0.88}" cy="${height * 0.82}" r="${height * 0.42}" fill="url(#g-${id})"/>
  </g>
  <rect x="24" y="24" width="64" height="8" rx="4" fill="url(#g-${id})" opacity="0.9"/>
  <text x="24" y="${height - 28}" font-family="Arial, sans-serif" font-size="20" fill="#f5f3ff" opacity="0.9">${label}</text>
</svg>`;
}

for (const tile of tiles) {
  writeFileSync(join(outDir, `${tile.id}.svg`), tileSvg(tile), "utf8");
  console.log("wrote", `${tile.id}.svg`);
}
