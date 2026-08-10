/**
 * Generates the project cover artwork.
 *
 * These are deliberately abstract technical plots rather than mock screenshots:
 * a fake UI screenshot claims the project looks like something it doesn't, and
 * a reviewer who clicks through will notice. Each cover instead visualises what
 * the project *does* - a catalogue grid, a sentiment distribution, a decision
 * scatter - in the site's ink-and-lime palette.
 *
 * Run with: node scripts/gen-placeholders.mjs
 */
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const outDir = join(process.cwd(), "public", "images");
mkdirSync(outDir, { recursive: true });

const INK = "#0C0D11";
const LIME = "#D6FF3F";
const BONE = "#F2F2F0";

const W = 900;
const H = 640;

/** Deterministic PRNG so re-running the script produces identical files. */
function rng(seed) {
  let state = seed;
  return () => {
    state = (state * 1664525 + 1013904223) % 4294967296;
    return state / 4294967296;
  };
}

function frame(id, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="glow-${id}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${LIME}" stop-opacity="0.20"/>
      <stop offset="100%" stop-color="${LIME}" stop-opacity="0"/>
    </linearGradient>
    <pattern id="grid-${id}" width="45" height="45" patternUnits="userSpaceOnUse">
      <path d="M 45 0 L 0 0 0 45" fill="none" stroke="${BONE}" stroke-opacity="0.055" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="${INK}"/>
  <rect width="${W}" height="${H}" fill="url(#grid-${id})"/>
  <rect width="${W}" height="${H}" fill="url(#glow-${id})"/>
${body}
</svg>`;
}

/*
 * No captions in the artwork. These covers are rendered with object-cover into
 * frames of varying aspect ratio, so anything near an edge gets cropped - and
 * the card already carries the category, year and spec table beside the image,
 * which made the baked-in labels redundant anyway.
 */

/** EZ Movies - an abstracted catalogue grid, a few tiles highlighted. */
function catalogue() {
  const random = rng(7);
  const cols = 7;
  const rows = 4;
  const tileW = 92;
  const tileH = 122;
  const gapX = 18;
  const gapY = 20;
  const originX = 56;
  const originY = 64;

  let out = "";
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = originX + c * (tileW + gapX);
      const y = originY + r * (tileH + gapY);
      const hot = random() > 0.82;
      out += `  <rect x="${x}" y="${y}" width="${tileW}" height="${tileH}" rx="8" fill="${
        hot ? LIME : BONE
      }" fill-opacity="${hot ? 0.9 : 0.07}"/>\n`;
      if (!hot) {
        out += `  <rect x="${x + 12}" y="${y + tileH - 26}" width="${
          tileW - 44
        }" height="6" rx="3" fill="${BONE}" fill-opacity="0.16"/>\n`;
      }
    }
  }
  return out;
}

/** Sentiment - a diverging distribution around a neutral centre line. */
function sentiment() {
  const random = rng(19);
  const bars = 34;
  const baseY = 300;
  const spacing = (W - 112) / bars;
  const maxH = 190;

  let out = `  <line x1="56" y1="${baseY}" x2="${W - 56}" y2="${baseY}" stroke="${BONE}" stroke-opacity="0.2" stroke-width="1"/>\n`;

  for (let i = 0; i < bars; i++) {
    const x = 56 + i * spacing;
    // Bell-ish envelope so the distribution reads as data, not noise.
    const envelope = Math.sin((i / bars) * Math.PI);
    const magnitude = (0.35 + random() * 0.65) * envelope;
    const positive = random() > 0.42;
    const h = Math.max(6, magnitude * maxH);
    const y = positive ? baseY - h : baseY;

    out += `  <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${(spacing - 7).toFixed(
      1
    )}" height="${h.toFixed(1)}" rx="3" fill="${positive ? LIME : BONE}" fill-opacity="${
      positive ? 0.85 : 0.14
    }"/>\n`;
  }

  return out;
}

/** Wine quality - a decision scatter with a separating boundary. */
function scatter() {
  const random = rng(43);
  const left = 56;
  const right = W - 56;
  const top = 60;
  const bottom = 420;

  let out = "";

  // Axes.
  out += `  <line x1="${left}" y1="${bottom}" x2="${right}" y2="${bottom}" stroke="${BONE}" stroke-opacity="0.2"/>\n`;
  out += `  <line x1="${left}" y1="${top}" x2="${left}" y2="${bottom}" stroke="${BONE}" stroke-opacity="0.2"/>\n`;

  // Boundary the two classes fall either side of.
  out += `  <path d="M ${left} ${bottom - 60} Q ${W / 2} ${top + 40} ${right} ${
    bottom - 250
  }" fill="none" stroke="${LIME}" stroke-opacity="0.55" stroke-width="2" stroke-dasharray="7 6"/>\n`;

  for (let i = 0; i < 130; i++) {
    const x = left + random() * (right - left);
    const y = top + random() * (bottom - top);
    // Distance from the boundary curve decides the class.
    const t = (x - left) / (right - left);
    const boundaryY = bottom - 60 - t * 190 - Math.sin(t * Math.PI) * 60;
    const above = y < boundaryY;
    const r = 3 + random() * 3.5;

    out += `  <circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="${
      above ? LIME : BONE
    }" fill-opacity="${above ? 0.8 : 0.22}"/>\n`;
  }

  return out;
}

const files = [
  ["project-ezmovies.svg", frame("p1", catalogue())],
  ["project-ai-sentiment.svg", frame("p2", sentiment())],
  ["project-ml-prediction.svg", frame("p3", scatter())],
];

for (const [name, content] of files) {
  writeFileSync(join(outDir, name), content, "utf8");
  console.log("wrote", name);
}
