"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { applyRgbToken } from "@/lib/cssColor";
import { buildCircuitLayout, seededRandom, type Trace } from "@/components/three/circuitLayout";

/**
 * The hero's circuit layer: a tilted plane of orthogonal traces that draw
 * themselves in, hold with a pulsing junction dot, then erase.
 *
 * Two draw calls for the whole board. The traces are one merged mesh of quads
 * and the junction dots are one THREE.Points, following the same discipline as
 * ParticleField: every buffer is uploaded once at mount and never touched from
 * JavaScript again. The entire draw/hold/erase state machine lives in the
 * vertex shader, driven by a single `uTime` uniform and per-trace timing baked
 * into attributes - so "dozens of traces at different stages" costs exactly the
 * same per frame as one.
 *
 * There is no bloom pass here on purpose. This project has no postprocessing
 * chain (see ParticleField and WireCore), and its glow comes from additive
 * blending plus a soft falloff in the fragment shader. Adding an
 * @react-three/postprocessing pass for a background layer would mean a new
 * dependency and a full-screen render target; the shader gets close enough.
 */

interface CircuitBoardProps {
  /** Damped pointer position, -1..1 on both axes. */
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  /** Trace budget. Roughly 30-60 on desktop; the layer tiers down below. */
  count: number;
  isDark: boolean;
}

/* ── Feel dials ────────────────────────────────────────────────────────────
   Layout dials (turn counts, run lengths, phase durations) live in
   circuitLayout.ts; these are the render-side ones. */

/** Multiplies the whole animation. 1 = the durations in circuitLayout.ts. */
const TIME_SCALE = 1;
/** How far a lit trace bleeds past its head/tail, in world units. Soft edges. */
const EDGE_SOFTNESS = 0.09;
/** Length of the hot leading tip behind the drawing head, in world units. */
const TIP_LENGTH = 0.55;
/**
 * Always-on alpha for lines that are not currently lit. Low on purpose: at the
 * levels the first pass used, every line was permanently visible and the
 * animation read as a static lattice with a faint shimmer over it.
 */
const RESTING_ALPHA_DARK = 0.18;
const RESTING_ALPHA_LIGHT = 0.24;
/** Overall layer opacity. The single dial for "too bright / too faint". */
const OPACITY_DARK = 1;
const OPACITY_LIGHT = 0.85;
/**
 * Fraction of the quad's half-width that is the sharp core. Small = a crisp
 * hairline sitting inside a wide soft glow. Raise it and the lines fatten and
 * go soft; this is the sharpness dial.
 */
const CORE_WIDTH = 0.17;
/** Brightness falloff per world unit behind the head. Higher = shorter comet. */
const HEAD_FALLOFF = 0.55;
/** Floor the falloff decays to, so the tail of a line never fully vanishes. */
const TAIL_FLOOR = 0.16;
/**
 * Board tilt, radians. Nearly flat: the reference footage is a front-on plane,
 * and a real perspective tilt turned the layer into a receding floor. This is
 * just enough to keep it from looking like wallpaper.
 */
const TILT_X = -0.06;
const TILT_Y = 0.07;
/** How much the board leans toward the cursor. */
const PARALLAX = 0.5;
/** Grid pitch in world units. Smaller = finer snapping of line endpoints. */
const GRID_STEP_WIDE = 0.3;
const GRID_STEP_COMPACT = 0.4;
/** Depth planes the routed lines are spread over. */
const DEPTH_LAYERS = 3;
/** Dim static lines per animated line. Under ~0.4 the board looks empty. */
const SUBSTRATE_RATIO = 0.6;
/** Junction dot size in pixels-ish, before per-dot scale and DPR. */
const DOT_SCALE = 9;
/**
 * How far the board is pushed behind the camera plane, and how much bigger the
 * visible area is at that depth. Camera sits at z=9, so a board at -2.5 sees
 * (9 + 2.5) / 9 of the frame.
 */
const BOARD_DEPTH = 2.5;
const DEPTH_WIDEN = (9 + BOARD_DEPTH) / 9;

/**
 * Shared GLSL. Both the trace shader and the dot shader need to resolve the
 * same per-trace state machine, and they must resolve it *identically* or the
 * dots pop at the wrong moment, so the code lives in one string.
 *
 * Phases: drawing (head advances) -> holding (fully lit, tip glow decays) ->
 * erasing (tail advances) -> idle (head parked behind zero, nothing lit).
 */
const phaseChunk = /* glsl */ `
  // Seconds the endpoint dot takes to fall from its arrival flash to a steady
  // glow. This is the "this path is complete" pulse.
  const float PULSE = 0.85;

  float easeInOut(float t) {
    return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) * 0.5;
  }

  // timing = (offset, draw, hold, erase);
  // span   = (cycle, length, lit brightness, resting brightness).
  void resolvePhase(
    float time, vec4 timing, vec4 span,
    out float head, out float tail, out float tip
  ) {
    float t = mod(time + timing.x, span.x);
    float len = span.y;
    float draw = timing.y;
    float hold = timing.z;
    float erase = timing.w;

    if (t < draw) {
      head = easeInOut(t / draw) * len;
      tail = 0.0;
      tip = 1.0;
    } else if (t < draw + hold) {
      head = len;
      tail = 0.0;
      tip = max(0.0, 1.0 - (t - draw) / PULSE);
    } else if (t < draw + hold + erase) {
      head = len;
      tail = easeInOut((t - draw - hold) / erase) * len;
      tip = 0.0;
    } else {
      // Parked behind the start of the path, so every "is this lit" test in
      // both shaders fails without needing a separate flag.
      head = -1.0;
      tail = 0.0;
      tip = 0.0;
    }
  }
`;

const traceVertexShader = /* glsl */ `
  uniform float uTime;
  uniform vec2 uExtent;

  attribute float aDist;
  attribute float aSide;
  attribute vec4 aTiming;
  attribute vec4 aSpan;

  varying float vDist;
  varying float vSide;
  varying float vHead;
  varying float vTail;
  varying float vTip;
  varying float vBright;
  varying float vRest;
  varying float vFade;

  ${phaseChunk}

  void main() {
    resolvePhase(uTime, aTiming, aSpan, vHead, vTail, vTip);

    vDist = aDist;
    vSide = aSide;
    vBright = aSpan.z;
    vRest = aSpan.w;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    /*
     * Dissolve the board's own edges so the plane never shows a rectangular
     * boundary. The thresholds are deliberately past 1.0: position.xy/uExtent
     * maps the board to [-1,1], the visible frame reaches about 0.96 of that at
     * its corners, and a fade starting any earlier eats the left and right of
     * the hero. Vignetting is the CSS mask's job, not this one's.
     */
    float radial = length(position.xy / uExtent);
    vFade = (1.0 - smoothstep(1.0, 1.42, radial)) * smoothstep(30.0, 8.0, -mvPosition.z);

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const traceFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;
  uniform float uResting;
  uniform float uSoftness;
  uniform float uTipLength;
  uniform float uCoreWidth;
  uniform float uFalloff;
  uniform float uTailFloor;

  varying float vDist;
  varying float vSide;
  varying float vHead;
  varying float vTail;
  varying float vTip;
  varying float vBright;
  varying float vRest;
  varying float vFade;

  void main() {
    // Reveal window: lit between the erasing tail and the drawing head, with
    // both edges feathered so neither end is a hard chop.
    // Not named "active" - that is a reserved word in GLSL ES and the shader
    // fails to compile with a syntax error pointing at the next line.
    float lead = smoothstep(vHead, vHead - uSoftness, vDist);
    float trail = smoothstep(vTail, vTail + uSoftness, vDist);
    float reveal = lead * trail;

    /*
     * Across the width of the quad. The quad is much wider than the line looks:
     * "core" is a hard-edged sliver in the middle of it, and "halo" is the soft
     * falloff filling the rest. Painting one soft gradient across the whole
     * width instead gives a line with no crisp centre, which reads as blurred
     * and - where two of them overlap - doubled.
     */
    float d = abs(vSide);
    float core = 1.0 - smoothstep(0.0, uCoreWidth, d);
    float halo = pow(max(0.0, 1.0 - d), 3.0);

    /*
     * Along the length: brightest at the leading head, falling away toward the
     * tail. This is the single biggest reason the reference reads as *moving*
     * rather than as a static lattice - a uniformly bright line that grows is
     * far less legible as motion than one with a hot end travelling along it.
     */
    float behind = max(0.0, vHead - vDist);
    float fall = mix(uTailFloor, 1.0, exp(-behind * uFalloff));

    // The tip runs hotter still for the moment it is being drawn.
    float tipMask = smoothstep(vHead - uTipLength, vHead, vDist) * vTip;

    float lit = reveal * (core + halo * 0.45) * fall * vBright;
    lit += reveal * tipMask * core * 0.7 * vBright;

    // Substrate and un-lit routing: same core, much less halo, no falloff.
    float rest = uResting * vRest * (core * 0.9 + halo * 0.18);

    float alpha = (rest + lit) * uOpacity * vFade;
    if (alpha < 0.003) discard;

    gl_FragColor = vec4(uColor, min(alpha, 1.0));
  }
`;

const dotVertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uScale;
  uniform vec2 uExtent;

  attribute float aDist;
  attribute float aSize;
  attribute float aSeed;
  attribute vec4 aTiming;
  attribute vec4 aSpan;

  varying float vAlpha;

  ${phaseChunk}

  void main() {
    float head, tail, tip;
    resolvePhase(uTime, aTiming, aSpan, head, tail, tip);

    // A dot is on once the head has swept past it and until the tail does.
    float on = step(aDist, head) * step(tail, aDist);

    // Arrival flash: strongest right as the head crosses this node, and during
    // the hold phase the endpoint (which the head is sitting on) keeps it long
    // enough to read as a pulse before settling.
    float pop = tip * exp(-max(0.0, head - aDist) * 2.2);
    // Slow individual breathing so settled dots are not dead pixels.
    float breathe = 0.5 + 0.5 * sin(uTime * 1.6 + aSeed * 6.283);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    float radial = length(position.xy / uExtent);
    float fade = (1.0 - smoothstep(0.5, 1.0, radial)) * smoothstep(24.0, 6.0, -mvPosition.z);

    vAlpha = on * (0.35 + 0.35 * breathe + pop * 0.9) * fade;

    // Attenuated point sprites, same technique as ParticleField: one draw call
    // for every dot on the board, no per-dot object to update.
    float size = aSize * (0.8 + 0.25 * breathe + pop * 1.6);
    gl_PointSize = clamp(size * uScale * (7.0 / -mvPosition.z), 0.0, 16.0);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const dotFragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vAlpha;

  void main() {
    vec2 d = gl_PointCoord - vec2(0.5);
    float r = length(d);
    if (r > 0.5) discard;

    // Two tiers: a tight bright disc, and a wider softer halo around it.
    // Named "disc", not "dot" - that would shadow the GLSL builtin.
    float disc = smoothstep(0.17, 0.02, r);
    float halo = smoothstep(0.5, 0.05, r) * 0.32;

    float alpha = (disc + halo) * vAlpha * uOpacity;
    if (alpha < 0.003) discard;

    gl_FragColor = vec4(uColor, min(alpha, 1.0));
  }
`;

export function CircuitBoard({ pointer, count, isDark }: CircuitBoardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const traceMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const dotMaterialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport, size } = useThree();

  // Below the mobile breakpoint the board is routed coarser and shorter, so a
  // phone is not drawing desktop density into a third of the pixels.
  const compact = size.width < 768;

  /*
   * Board extent tracks what is actually on screen, with only enough overscan
   * to survive the tilt and the pointer parallax. The first pass generated a
   * board roughly four times the visible area and the result read as a few
   * stray lines: the trace budget was spread over mostly off-screen routing.
   * Size the board to the frame and the same budget becomes a dense PCB.
   *
   * `viewport` measures the frame at z=0 and the board sits further back, so
   * DEPTH_WIDEN converts to the visible extent at the board's own depth. The
   * vertical overscan is the larger of the two because the X tilt pushes the
   * far edge up and out of frame.
   *
   * Bucketed to 2 world units because R3F re-renders on every resize frame,
   * and regenerating the layout each time would both stutter and visibly
   * reshuffle the routing mid-drag.
   */
  const bucket = (n: number) => Math.ceil(n / 2) * 2;
  const boardWidth = Math.max(12, bucket(viewport.width * DEPTH_WIDEN * 1.3));
  const boardHeight = Math.max(10, bucket(viewport.height * DEPTH_WIDEN * 1.75));

  const traces = useMemo(() => {
    // Only a mild cut on phones. The board is sized to the viewport, so a
    // narrow screen already gets a smaller board; halving the count on top of
    // that left the layer with a handful of lines and no sense of a circuit.
    const routed = compact ? Math.round(count * 0.85) : count;
    return buildCircuitLayout({
      count: routed,
      substrate: Math.round(routed * SUBSTRATE_RATIO),
      width: boardWidth,
      height: boardHeight,
      step: compact ? GRID_STEP_COMPACT : GRID_STEP_WIDE,
      layers: DEPTH_LAYERS,
      random: seededRandom(0x5eed),
    });
  }, [count, compact, boardWidth, boardHeight]);

  const { traceGeometry, dotGeometry } = useMemo(
    () => buildGeometry(traces),
    [traces]
  );

  // Release the previous buffers when the layout is rebuilt. Without this a
  // few resizes across the breakpoint leak a board's worth of GPU memory.
  useEffect(
    () => () => {
      traceGeometry.dispose();
      dotGeometry.dispose();
    },
    [traceGeometry, dotGeometry]
  );

  const traceUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#d6ff3f") },
      uOpacity: { value: OPACITY_DARK },
      uResting: { value: RESTING_ALPHA_DARK },
      uSoftness: { value: EDGE_SOFTNESS },
      uTipLength: { value: TIP_LENGTH },
      uCoreWidth: { value: CORE_WIDTH },
      uFalloff: { value: HEAD_FALLOFF },
      uTailFloor: { value: TAIL_FLOOR },
      uExtent: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  const dotUniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#d6ff3f") },
      uOpacity: { value: OPACITY_DARK },
      uScale: { value: 1 },
      uExtent: { value: new THREE.Vector2(1, 1) },
    }),
    []
  );

  // Extent feeds the radial edge fade, so it has to follow the bucketed board
  // rather than being baked into the geometry.
  useEffect(() => {
    traceUniforms.uExtent.value.set(boardWidth / 2, boardHeight / 2);
    dotUniforms.uExtent.value.set(boardWidth / 2, boardHeight / 2);
  }, [boardWidth, boardHeight, traceUniforms, dotUniforms]);

  /*
   * Theme. Same problem the other two layers solve, same solution: additive
   * blending only ever builds toward white, so on the paper background the
   * board would simply vanish. Light mode draws normally in the darkened olive.
   *
   * The colours are read from globals.css rather than hard-coded, so `--accent`
   * is the single source of truth - `--accent` is the lime fill for dark, and
   * `--accent-fg` is the same token's readable-on-paper form, which is exactly
   * the distinction this needs.
   */
  useEffect(() => {
    const trace = traceMaterialRef.current;
    const dot = dotMaterialRef.current;
    if (!trace || !dot) return;

    const token = isDark ? "--accent" : "--accent-fg";
    const fallback = isDark ? ([214, 255, 63] as const) : ([84, 105, 0] as const);

    for (const material of [trace, dot]) {
      applyRgbToken(material.uniforms.uColor.value as THREE.Color, token, fallback);
      material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
      // Blending is baked into the compiled material state.
      material.needsUpdate = true;
    }

    trace.uniforms.uOpacity.value = isDark ? OPACITY_DARK : OPACITY_LIGHT;
    trace.uniforms.uResting.value = isDark ? RESTING_ALPHA_DARK : RESTING_ALPHA_LIGHT;
    dot.uniforms.uOpacity.value = isDark ? OPACITY_DARK : OPACITY_LIGHT;
  }, [isDark]);

  useFrame((state, delta) => {
    const group = groupRef.current;
    const trace = traceMaterialRef.current;
    const dot = dotMaterialRef.current;
    if (!group || !trace || !dot) return;

    // Clamp: after a background tab resumes, delta can be seconds long and
    // would jump every trace forward through several phases at once.
    const dt = Math.min(delta, 0.05) * TIME_SCALE;
    trace.uniforms.uTime.value += dt;
    dot.uniforms.uTime.value += dt;
    // Point sprites are sized in device pixels, so without this the dots shrink
    // on a retina display and swell on a downgraded DPR.
    dot.uniforms.uScale.value = DOT_SCALE * state.viewport.dpr;

    // Eased parallax on top of the fixed tilt, so the board feels weighted
    // rather than glued to the cursor.
    const targetX = TILT_X + pointer.current.y * 0.05;
    const targetY = TILT_Y + pointer.current.x * 0.07;
    group.rotation.x += (targetX - group.rotation.x) * 0.04;
    group.rotation.y += (targetY - group.rotation.y) * 0.04;
    group.position.x += (pointer.current.x * PARALLAX - group.position.x) * 0.04;
    group.position.y += (pointer.current.y * PARALLAX * 0.5 - group.position.y) * 0.04;
  });

  return (
    <group ref={groupRef} position={[0, 0, -2.5]} rotation={[TILT_X, TILT_Y, 0]}>
      <mesh geometry={traceGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={traceMaterialRef}
          uniforms={traceUniforms}
          vertexShader={traceVertexShader}
          fragmentShader={traceFragmentShader}
          transparent
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      <points geometry={dotGeometry} frustumCulled={false}>
        <shaderMaterial
          ref={dotMaterialRef}
          uniforms={dotUniforms}
          vertexShader={dotVertexShader}
          fragmentShader={dotFragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/**
 * Flattens the routed traces into two geometries.
 *
 * Traces become quads rather than THREE.Line segments because line width is
 * capped at 1px on every platform that matters, and a 1px hairline cannot carry
 * a glow. Each segment is a camera-agnostic ribbon extruded in world space, so
 * distant traces thin out with perspective, which is the depth cue the tilt
 * needs. drei's <Line> would give the same result via Line2, but it is not a
 * dependency of this project and pulling it in for one layer is not worth the
 * bundle.
 *
 * Every quad carries its own arc distance and its trace's timing, which is what
 * lets one draw call animate every trace independently.
 */
function buildGeometry(traces: Trace[]): {
  traceGeometry: THREE.BufferGeometry;
  dotGeometry: THREE.BufferGeometry;
} {
  const positions: number[] = [];
  const dists: number[] = [];
  const sides: number[] = [];
  const timings: number[] = [];
  const spans: number[] = [];
  const indices: number[] = [];

  const dotPositions: number[] = [];
  const dotDists: number[] = [];
  const dotSizes: number[] = [];
  const dotSeeds: number[] = [];
  const dotTimings: number[] = [];
  const dotSpans: number[] = [];

  for (const trace of traces) {
    const cycle = trace.draw + trace.hold + trace.erase + trace.idle;
    const timing = [trace.offset, trace.draw, trace.hold, trace.erase];
    const span = [cycle, trace.length, trace.litBrightness, trace.restBrightness];
    const half = trace.halfWidth;

    for (let i = 0; i < trace.points.length - 1; i++) {
      const a = trace.points[i];
      const b = trace.points[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      const ux = dx / len;
      const uy = dy / len;
      // Perpendicular in the board plane; the paths are axis-aligned, so this
      // is always a clean (0, ±1) or (±1, 0).
      const px = -uy * half;
      const py = ux * half;

      /*
       * Extend both ends so consecutive segments overlap into a filled square
       * at each 90-degree turn instead of leaving a notch. The extension is the
       * *core* width, not the quad's half-width: the quad is mostly glow, and
       * extending by all of it would push a visible stub of line past every
       * endpoint.
       */
      const cap = half * CORE_WIDTH;
      const ax = a.x - ux * cap;
      const ay = a.y - uy * cap;
      const bx = b.x + ux * cap;
      const by = b.y + uy * cap;

      const dA = trace.distances[i] - cap;
      const dB = trace.distances[i + 1] + cap;
      const base = positions.length / 3;

      // Four corners: start-left, start-right, end-left, end-right.
      positions.push(ax + px, ay + py, trace.z);
      positions.push(ax - px, ay - py, trace.z);
      positions.push(bx + px, by + py, trace.z);
      positions.push(bx - px, by - py, trace.z);

      dists.push(dA, dA, dB, dB);
      sides.push(1, -1, 1, -1);

      for (let v = 0; v < 4; v++) {
        timings.push(timing[0], timing[1], timing[2], timing[3]);
        spans.push(span[0], span[1], span[2], span[3]);
      }

      indices.push(base, base + 1, base + 2, base + 2, base + 1, base + 3);
    }

    for (const nodeIndex of trace.nodes) {
      const p = trace.points[nodeIndex];
      const isEnd = nodeIndex === trace.points.length - 1;

      dotPositions.push(p.x, p.y, trace.z);
      dotDists.push(trace.distances[nodeIndex]);
      // Endpoints read as the "path complete" marker, so they run larger.
      dotSizes.push((isEnd ? 1.6 : 0.9) * trace.litBrightness);
      // Derived from the trace rather than Math.random, so the whole board
      // stays reproducible for a given seed.
      dotSeeds.push((trace.offset * 7.31 + nodeIndex * 2.17) % 1);
      dotTimings.push(timing[0], timing[1], timing[2], timing[3]);
      dotSpans.push(span[0], span[1], span[2], span[3]);
    }
  }

  const traceGeometry = new THREE.BufferGeometry();
  traceGeometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  traceGeometry.setAttribute("aDist", new THREE.Float32BufferAttribute(dists, 1));
  traceGeometry.setAttribute("aSide", new THREE.Float32BufferAttribute(sides, 1));
  traceGeometry.setAttribute("aTiming", new THREE.Float32BufferAttribute(timings, 4));
  traceGeometry.setAttribute("aSpan", new THREE.Float32BufferAttribute(spans, 4));
  traceGeometry.setIndex(indices);

  const dotGeometry = new THREE.BufferGeometry();
  dotGeometry.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions, 3));
  dotGeometry.setAttribute("aDist", new THREE.Float32BufferAttribute(dotDists, 1));
  dotGeometry.setAttribute("aSize", new THREE.Float32BufferAttribute(dotSizes, 1));
  dotGeometry.setAttribute("aSeed", new THREE.Float32BufferAttribute(dotSeeds, 1));
  dotGeometry.setAttribute("aTiming", new THREE.Float32BufferAttribute(dotTimings, 4));
  dotGeometry.setAttribute("aSpan", new THREE.Float32BufferAttribute(dotSpans, 4));

  return { traceGeometry, dotGeometry };
}
