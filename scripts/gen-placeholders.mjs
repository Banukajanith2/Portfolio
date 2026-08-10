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

/**
 * Semantic search - a 2D projection of the embedding space.
 *
 * The corpus sits as faint points in loose clusters, one lime point is the
 * query, and the nearest neighbours it retrieves are drawn bright and tethered
 * back to it. That is literally what the search does: place the query in the
 * same space and take whatever is closest.
 */
function embeddingSpace() {
  const random = rng(101);
  const left = 56;
  const right = W - 56;
  const top = 56;
  const bottom = H - 56;

  // Cluster centroids stand in for the topic groups the corpus falls into.
  const clusters = [
    { x: 300, y: 250, spread: 130 },
    { x: 640, y: 190, spread: 105 },
    { x: 470, y: 460, spread: 120 },
    { x: 740, y: 430, spread: 95 },
  ];

  const points = [];
  for (let i = 0; i < 190; i++) {
    const c = clusters[i % clusters.length];
    // Two averaged samples approximate a normal, so points bunch toward the
    // centroid instead of filling a flat square.
    const gx = (random() + random() - 1) * c.spread;
    const gy = (random() + random() - 1) * c.spread;
    const x = Math.min(right, Math.max(left, c.x + gx));
    const y = Math.min(bottom, Math.max(top, c.y + gy));
    points.push({ x, y });
  }

  // The query lands inside the densest cluster, which is where a real query
  // about that topic would land.
  const query = { x: 300, y: 250 };

  const nearest = points
    .map((p, i) => ({ i, d: Math.hypot(p.x - query.x, p.y - query.y) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, 6)
    .map((entry) => entry.i);
  const isNearest = new Set(nearest);

  let out = "";

  // Retrieval radius.
  const radius = Math.max(...nearest.map((i) => Math.hypot(points[i].x - query.x, points[i].y - query.y)));
  out += `  <circle cx="${query.x}" cy="${query.y}" r="${(radius + 22).toFixed(
    1
  )}" fill="none" stroke="${LIME}" stroke-opacity="0.35" stroke-width="1.5" stroke-dasharray="6 7"/>\n`;

  // Tethers first, so the points draw on top of them.
  for (const i of nearest) {
    out += `  <line x1="${query.x}" y1="${query.y}" x2="${points[i].x.toFixed(1)}" y2="${points[
      i
    ].y.toFixed(1)}" stroke="${LIME}" stroke-opacity="0.4" stroke-width="1"/>\n`;
  }

  points.forEach((p, i) => {
    const hit = isNearest.has(i);
    const r = hit ? 6 : 2.5 + random() * 2;
    out += `  <circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${r.toFixed(1)}" fill="${
      hit ? LIME : BONE
    }" fill-opacity="${hit ? 0.9 : 0.16}"/>\n`;
  });

  // The query itself: a ringed dot so it reads as the origin of the search.
  out += `  <circle cx="${query.x}" cy="${query.y}" r="13" fill="${LIME}" fill-opacity="0.18"/>\n`;
  out += `  <circle cx="${query.x}" cy="${query.y}" r="6.5" fill="${LIME}"/>\n`;

  return out;
}

const files = [
  ["project-ezmovies.svg", frame("p1", catalogue())],
  ["project-ai-sentiment.svg", frame("p2", sentiment())],
  // Wine quality moved to the archive list, which renders icons rather than
  // covers. The scatter is kept generated so the project can be promoted back
  // without rebuilding its artwork.
  ["project-ml-prediction.svg", frame("p3", scatter())],
  ["project-semantic-search.svg", frame("p4", embeddingSpace())],
];

for (const [name, content] of files) {
  writeFileSync(join(outDir, name), content, "utf8");
  console.log("wrote", name);
}
