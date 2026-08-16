/**
 * Procedural circuit-line layout for the hero's WebGL layer.
 *
 * Pure data: this file knows nothing about three.js or React. It walks a grid
 * and returns polylines plus the per-trace timing that drives their animation,
 * and CircuitBoard turns that into buffers. Keeping it separate is what makes
 * the tuning constants below readable as a set of dials rather than as noise
 * inside a geometry builder.
 *
 * Every path turns at 90 degrees only, which is the whole reason this reads as
 * circuit routing rather than as a scribble. Diagonals are never emitted.
 *
 * Shape is the thing this file gets right or wrong. The reference is long,
 * clean lines with at most one or two bends - a straight run, an L, sometimes
 * a Z. An earlier pass routed wandering multi-turn paths and it read as a wire
 * mess rather than as circuitry: the eye needs to be able to follow a line from
 * one end to the other. Keep MAX_TURNS low.
 *
 * The board is two tiers:
 *
 *   substrate - dim lines that never light up. They establish the lattice, so
 *               the layer still reads as circuitry in a still frame and between
 *               animations.
 *   routing   - the same shapes, but they draw in, hold with a junction dot at
 *               the leading end, then erase.
 */

/** A single line plus everything its shader needs to animate it. */
export interface Trace {
  /** Grid-snapped polyline in world units, on the XY plane. */
  points: { x: number; y: number }[];
  /** Depth layer. Further lines are dimmer and thinner, for parallax. */
  z: number;
  /**
   * Brightness of the animated reveal. Zero marks a substrate line, which is
   * drawn at its resting weight and never lights up.
   */
  litBrightness: number;
  /** Brightness of the always-on line, before the layer's resting alpha. */
  restBrightness: number;
  /** Half-width in world units. */
  halfWidth: number;
  /** Seconds: draw-in, hold-and-glow, erase, then dark before respawning. */
  draw: number;
  hold: number;
  erase: number;
  idle: number;
  /** Where in its own cycle this trace starts, so nothing is in sync. */
  offset: number;
  /** Arc length of each point along the path, and the total. */
  distances: number[];
  length: number;
  /** Indices into `points` that should carry a junction dot. */
  nodes: number[];
}

export interface LayoutOptions {
  /** How many animated lines to route. The main density dial. */
  count: number;
  /** How many dim, never-animating lines to lay under them. */
  substrate: number;
  /** World-space size of the board. */
  width: number;
  height: number;
  /** Distance between grid lines, in world units. Lower = finer snapping. */
  step: number;
  /** How many depth planes the lines are spread across. */
  layers: number;
  /** Seeded so a given viewport bucket is stable across re-renders. */
  random: () => number;
}

/* ── Tuning dials ──────────────────────────────────────────────────────────
   These are the knobs worth touching first. Line count, substrate count, grid
   step and layer count come in as options because they are viewport- and
   capability-driven; everything here is a fixed feel decision. */

/** Bends per line. 0 = a straight run, 1 = an L, 2 = a Z. Keep this low. */
const MIN_TURNS = 0;
const MAX_TURNS = 2;
/** Weighting: how often a line gets exactly one bend rather than zero or two. */
const SINGLE_BEND_BIAS = 0.55;
/** Grid cells per straight run. Long, so lines read as lines, not as dashes. */
const MIN_RUN = 3;
const MAX_RUN = 18;
/**
 * Vertical runs are capped shorter than horizontal ones. The hero is a wide
 * box, so a full-height vertical cuts the composition in a way a full-width
 * horizontal does not, and the reference footage is horizontally weighted too.
 */
const VERTICAL_RUN_SCALE = 0.55;
/**
 * How many grid lanes either side of a run are reserved along with it.
 *
 * Blocking only the exact lane is not enough: two long parallel runs one cell
 * apart sit ~30px apart on screen and read as a single doubled line rather than
 * as two traces. Raising this thins the board out quickly, because every run
 * claims (2n+1) lanes worth of grid.
 */
const LANE_SEPARATION = 1;
/** Fraction of a run that may already be claimed before it is rejected. */
const OVERLAP_TOLERANCE = 0.34;
/** Seconds. Matches the brief: a calm 1-2.5s reveal, never a snap. */
const DRAW_MIN = 1.1;
const DRAW_MAX = 2.5;
/** Long enough for the endpoint pulse to fire and settle before erasing. */
const HOLD_MIN = 1.4;
const HOLD_MAX = 3.6;
const ERASE_MIN = 1.0;
const ERASE_MAX = 2.3;
const IDLE_MIN = 0.5;
const IDLE_MAX = 3.0;
/** Chance a line's leading end grows a junction dot. Bends rarely get one. */
const END_NODE_CHANCE = 0.75;
const BEND_NODE_CHANCE = 0.18;
/**
 * Half-width of a line's quad, in world units - this is the *glow* radius, not
 * the visible line weight. The shader paints a crisp 1-2px core inside it and
 * lets the rest fall off as halo, which is how the lines end up sharp and
 * glowing at the same time. Making this small produces a uniformly soft,
 * doubled-looking smear with no core in it.
 */
const HALF_WIDTH = 0.055;
/** Substrate lines are hairlines behind the routing. */
const SUBSTRATE_HALF_WIDTH = 0.04;
const SUBSTRATE_REST = 0.45;
/** World-space gap between depth planes. See the note where it is used. */
const LAYER_GAP = 0.5;

/**
 * Small deterministic PRNG (mulberry32). `Math.random` would reshuffle the
 * whole board on every React re-render that misses the memo, which looks like
 * a flicker bug; a seed makes a given layout reproducible.
 */
export function seededRandom(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a += 0x6d2b79f5;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Key for one unit-length edge of the grid, used for the overlap test.
 * `axis` plus the coordinate that stays fixed plus the lower of the two moving
 * coordinates identifies an edge uniquely, whichever direction it was walked.
 */
function edgeKey(axis: 0 | 1, fixed: number, lo: number): string {
  return `${axis}:${fixed}:${lo}`;
}

/** Arc length at each vertex, and the total. */
function measure(points: { x: number; y: number }[]): {
  distances: number[];
  length: number;
} {
  const distances = [0];
  for (let i = 1; i < points.length; i++) {
    const dx = points[i].x - points[i - 1].x;
    const dy = points[i].y - points[i - 1].y;
    distances.push(distances[i - 1] + Math.hypot(dx, dy));
  }
  return { distances, length: distances[distances.length - 1] };
}

export function buildCircuitLayout(options: LayoutOptions): Trace[] {
  const { count, substrate, width, height, step, layers, random } = options;

  const cols = Math.max(8, Math.round(width / step));
  const rows = Math.max(8, Math.round(height / step));
  const originX = -width / 2;
  const originY = -height / 2;

  const pick = (min: number, max: number) => min + random() * (max - min);
  const pickInt = (min: number, max: number) => min + Math.floor(random() * (max - min + 1));

  // Edge occupancy, so lines do not stack on top of each other. Substrate and
  // routing share the set: an exact overlap reads as one brighter line rather
  // than as two, which wastes the budget.
  const used = new Set<string>();

  /**
   * Start points for `total` paths, one per cell of a coarse grid laid over the
   * board, in shuffled order.
   *
   * Stratifying rather than picking uniformly at random is what keeps the board
   * evenly covered. Uniform random points clump - that is just how they behave -
   * and the gaps between clumps are large enough to read as a hole in the
   * layer. With a fixed seed it is also the *same* hole on every load, sitting
   * wherever it happens to sit in the composition, which is not something a
   * different seed fixes so much as moves.
   *
   * The shuffle matters too: paths claim grid space in the order they are
   * routed, so walking the strata as a raster scan would systematically favour
   * one corner of the board when space is contested.
   */
  function makeStrata(total: number): { cx: number; cy: number }[] {
    const bucketsX = Math.max(1, Math.round(Math.sqrt((total * cols) / rows)));
    const bucketsY = Math.max(1, Math.ceil(total / bucketsX));

    const cells: { cx: number; cy: number }[] = [];
    for (let j = 0; j < bucketsY; j++) {
      for (let i = 0; i < bucketsX; i++) {
        cells.push({
          cx: Math.min(cols - 1, Math.floor(((i + random()) / bucketsX) * cols)),
          cy: Math.min(rows - 1, Math.floor(((j + random()) / bucketsY) * rows)),
        });
      }
    }

    for (let i = cells.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [cells[i], cells[j]] = [cells[j], cells[i]];
    }
    return cells;
  }

  /**
   * Walks one path from `start`: a straight run, or a run plus one or two
   * 90-degree bends. Returns null if it could not place even its first run.
   */
  function routePath(start: { cx: number; cy: number }): { x: number; y: number }[] | null {
    let cx = start.cx;
    let cy = start.cy;
    let axis: 0 | 1 = random() < 0.5 ? 0 : 1;

    const cells = [{ cx, cy }];
    const claimed: string[] = [];

    // Bias toward the single-bend "L", which is the shape the reference is
    // mostly made of.
    const turns =
      random() < SINGLE_BEND_BIAS ? 1 : pickInt(MIN_TURNS, MAX_TURNS);

    for (let s = 0; s <= turns; s++) {
      let placed = false;

      for (let attempt = 0; attempt < 3 && !placed; attempt++) {
        const dir = attempt === 0 ? (random() < 0.5 ? -1 : 1) : attempt === 1 ? 1 : -1;
        const axisMax = axis === 1 ? Math.round(MAX_RUN * VERTICAL_RUN_SCALE) : MAX_RUN;
        // Runs after the first bend are shorter, so an L has a long leg and a
        // short one rather than reading as a big square corner.
        const run =
          s === 0 ? pickInt(MIN_RUN, axisMax) : pickInt(MIN_RUN, Math.round(axisMax * 0.5));
        const nx = axis === 0 ? cx + dir * run : cx;
        const ny = axis === 1 ? cy + dir * run : cy;

        if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) continue;

        // Walk the unit edges this run would occupy. A little overlap is fine
        // and real; reject only if much of the run is already taken.
        const wanted: string[] = [];
        let collisions = 0;
        for (let k = 0; k < run; k++) {
          const from = axis === 0 ? cx + dir * k : cy + dir * k;
          const fixed = axis === 0 ? cy : cx;
          const lo = Math.min(from, from + dir);

          // Test only this run's own lane...
          if (used.has(edgeKey(axis, fixed, lo))) collisions++;
          // ...but reserve a band around it, so nothing else runs parallel
          // close enough to look like a second stroke of the same line.
          for (let d = -LANE_SEPARATION; d <= LANE_SEPARATION; d++) {
            wanted.push(edgeKey(axis, fixed + d, lo));
          }
        }
        if (collisions > run * OVERLAP_TOLERANCE) continue;

        wanted.forEach((k) => claimed.push(k));
        cx = nx;
        cy = ny;
        cells.push({ cx, cy });
        placed = true;
      }

      if (!placed) break;
      axis = axis === 0 ? 1 : 0;
    }

    if (cells.length < 2) return null;
    claimed.forEach((k) => used.add(k));

    return cells.map((c) => ({ x: originX + c.cx * step, y: originY + c.cy * step }));
  }

  // Timing is generated even for substrate lines, which never use it: the
  // shader's phase branch divides by these durations, and a zero would put a
  // NaN in an untaken branch on drivers that evaluate both sides.
  const timing = () => ({
    draw: pick(DRAW_MIN, DRAW_MAX),
    hold: pick(HOLD_MIN, HOLD_MAX),
    erase: pick(ERASE_MIN, ERASE_MAX),
    idle: pick(IDLE_MIN, IDLE_MAX),
  });

  const traces: Trace[] = [];

  // Substrate first, so the dim lattice claims the emptiest space and the
  // animated routing threads through what is left. Each tier gets its own
  // strata, so both cover the whole board rather than sharing one budget.
  const substrateStarts = makeStrata(substrate);
  for (let i = 0; i < substrate; i++) {
    const points = routePath(substrateStarts[i % substrateStarts.length]);
    if (!points) continue;
    const { distances, length } = measure(points);
    if (length <= 0) continue;

    traces.push({
      points,
      // Behind every routed layer. The separation is deliberately small: at
      // wider spacing, perspective offsets a rear line from a front one on the
      // same grid row far enough to read as one doubled line.
      z: -layers * LAYER_GAP,
      litBrightness: 0,
      restBrightness: SUBSTRATE_REST * pick(0.6, 1),
      halfWidth: SUBSTRATE_HALF_WIDTH,
      ...timing(),
      offset: 0,
      distances,
      length,
      nodes: [],
    });
  }

  const routedStarts = makeStrata(count);
  for (let t = 0; t < count; t++) {
    const points = routePath(routedStarts[t % routedStarts.length]);
    if (!points) continue;
    const { distances, length } = measure(points);
    if (length <= 0) continue;

    const layer = Math.floor(random() * layers);
    // Rear lines sit further back, thinner and dimmer - the depth cue is
    // carried by weight and opacity, not by a second colour.
    const depthFade = 1 - layer / Math.max(1, layers);

    const nodes: number[] = [];
    for (let i = 1; i < points.length; i++) {
      const isEnd = i === points.length - 1;
      const chance = isEnd ? END_NODE_CHANCE : BEND_NODE_CHANCE;
      if (random() < chance) nodes.push(i);
    }

    const time = timing();
    traces.push({
      points,
      z: -layer * LAYER_GAP,
      litBrightness: 0.5 + depthFade * 0.5,
      restBrightness: 0.55 + depthFade * 0.35,
      halfWidth: HALF_WIDTH * (0.72 + depthFade * 0.28),
      ...time,
      // Random start position inside the full cycle, so at t=0 the board
      // already has lines drawing, holding and erasing all at once.
      offset: random() * (time.draw + time.hold + time.erase + time.idle),
      distances,
      length,
      nodes,
    });
  }

  return traces;
}
