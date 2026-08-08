import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const outDir = join(process.cwd(), "public", "images");
mkdirSync(outDir, { recursive: true });

const palettes = {
  violet: ["#7c3aed", "#4c1d95"],
  cyan: ["#06b6d4", "#0e7490"],
  mix: ["#7c3aed", "#06b6d4"],
};

function personSvg({ width, height, from, to, id }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#0a0a0f"/>
  <rect width="${width}" height="${height}" fill="url(#g-${id})" opacity="0.35"/>
  <circle cx="${width / 2}" cy="${height * 0.38}" r="${width * 0.22}" fill="url(#g-${id})" opacity="0.9"/>
  <path d="M ${width * 0.15} ${height * 0.95} Q ${width * 0.5} ${height * 0.6} ${width * 0.85} ${height * 0.95} Z" fill="url(#g-${id})" opacity="0.9"/>
</svg>`;
}

function thumbSvg({ width, height, from, to, id, label }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="g-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="#12121a"/>
  <rect width="${width}" height="${height}" fill="url(#g-${id})" opacity="0.22"/>
  <g opacity="0.5">
    <circle cx="${width * 0.2}" cy="${height * 0.3}" r="${height * 0.5}" fill="url(#g-${id})"/>
    <circle cx="${width * 0.85}" cy="${height * 0.8}" r="${height * 0.4}" fill="url(#g-${id})"/>
  </g>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.round(height * 0.09)}" fill="#e5e7eb" text-anchor="middle" dominant-baseline="middle" opacity="0.85">${label}</text>
</svg>`;
}

function avatarSvg({ size, from, to, id, initials }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="g-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${from}"/>
      <stop offset="100%" stop-color="${to}"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${size}" fill="url(#g-${id})"/>
  <text x="50%" y="52%" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.36)}" fill="#f5f3ff" text-anchor="middle" dominant-baseline="middle" font-weight="700">${initials}</text>
</svg>`;
}

const files = [
  ["hero-photo.svg", personSvg({ width: 500, height: 600, from: palettes.mix[0], to: palettes.mix[1], id: "hero" })],
  ["about-photo.svg", personSvg({ width: 500, height: 600, from: palettes.violet[0], to: palettes.violet[1], id: "about" })],
  ["project-ezmovies.svg", thumbSvg({ width: 600, height: 360, from: "#7c3aed", to: "#06b6d4", id: "p1", label: "EZ Movies App" })],
  ["project-ai-sentiment.svg", thumbSvg({ width: 600, height: 360, from: "#06b6d4", to: "#7c3aed", id: "p2", label: "AI Sentiment Analysis" })],
  ["project-ml-prediction.svg", thumbSvg({ width: 600, height: 360, from: "#7c3aed", to: "#22c55e", id: "p3", label: "ML Prediction Algorithm" })],
  ["project-todo.svg", thumbSvg({ width: 600, height: 360, from: "#06b6d4", to: "#a855f7", id: "p4", label: "TO-DO List App" })],
  ["avatar-1.svg", avatarSvg({ size: 96, from: "#7c3aed", to: "#4c1d95", id: "a1", initials: "CP" })],
  ["avatar-2.svg", avatarSvg({ size: 96, from: "#06b6d4", to: "#0e7490", id: "a2", initials: "NF" })],
  ["avatar-3.svg", avatarSvg({ size: 96, from: "#a855f7", to: "#7c3aed", id: "a3", initials: "TM" })],
];

for (const [name, content] of files) {
  writeFileSync(join(outDir, name), content, "utf8");
  console.log("wrote", name);
}
