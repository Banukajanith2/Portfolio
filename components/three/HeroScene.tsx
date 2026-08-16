"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import type { Capability } from "@/lib/capability";
import { useIsDark } from "@/lib/useIsDark";
import { CircuitBoard } from "@/components/three/CircuitBoard";
import { ParticleField } from "@/components/three/ParticleField";
import { WireCore } from "@/components/three/WireCore";

/**
 * The hero's WebGL layer.
 *
 * Everything expensive is gated: the scene only mounts on hardware that asked
 * for it (see lib/capability.ts), it stops rendering entirely when scrolled out
 * of view or when the tab is hidden, and it steps its own resolution down if it
 * cannot hold frame rate. If the GL context is lost or never arrives, the CSS
 * aurora underneath is already a complete background, so the page degrades to
 * exactly what it looked like before this existed.
 */

/**
 * Which visual layers are live.
 *
 * All three are kept in the repo so the hero can be switched back without
 * rewriting anything - flip a flag and rebuild. `wireCore` is off rather than
 * deleted: the icosahedron and the circuit board both want the centre of the
 * frame, and running them together reads as two backgrounds fighting. The
 * particle field stays on because it sits behind everything as depth and does
 * not compete.
 */
const HERO_LAYERS: Record<"circuit" | "particles" | "wireCore", boolean> = {
  circuit: true,
  particles: true,
  wireCore: false,
};

/**
 * Routed traces on the circuit board, before the layer adds its static
 * substrate lattice on top of that.
 *
 * Higher than the 30-60 a hero background would normally warrant, and
 * deliberately so: below roughly 90 the board stops reading as circuitry and
 * starts reading as a few stray lines. The cost is flat - the whole board is
 * two draw calls and the buffers are uploaded once - and traces are hairlines,
 * so the extra fragment work is negligible. Frame time measured on this
 * machine barely moves between 52 and 120.
 */
const TRACE_BUDGET = { high: 96, low: 60 } as const;

interface HeroSceneProps {
  capability: Capability;
}

export function HeroScene({ capability }: HeroSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0, y: 0 });
  const target = useRef({ x: 0, y: 0 });
  const isDark = useIsDark();

  // Drives R3F's frameloop. "never" halts rendering completely - no rAF, no GPU
  // work - which is what makes this safe to leave mounted while the visitor
  // reads the rest of the page.
  const [active, setActive] = useState(true);
  const [failed, setFailed] = useState(false);

  // Pause when the hero leaves the viewport or the tab goes to the background.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let onScreen = true;
    const sync = () => setActive(onScreen && !document.hidden);

    const observer = new IntersectionObserver(
      ([entry]) => {
        onScreen = entry.isIntersecting;
        sync();
      },
      { threshold: 0 }
    );
    observer.observe(el);

    document.addEventListener("visibilitychange", sync);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  // Pointer parallax. Tracked on the window rather than the canvas so the
  // canvas itself can stay pointer-events:none and never swallow a click.
  useEffect(() => {
    if (capability.tier === "off") return;
    // Touch devices have no hover, and reading touchmove here would fight the
    // page scroll for no visual gain.
    if (window.matchMedia("(pointer: coarse)").matches) return;

    function onMove(event: MouseEvent) {
      target.current.x = (event.clientX / window.innerWidth) * 2 - 1;
      target.current.y = -((event.clientY / window.innerHeight) * 2 - 1);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [capability.tier]);

  if (failed) return null;

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true">
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, capability.maxDpr]}
        camera={{ position: [0, 0, 9], fov: 42 }}
        gl={{
          antialias: capability.antialias,
          powerPreference: capability.powerPreference,
          // The page background shows through; skipping the alpha-blended
          // clear of an opaque buffer we would only cover anyway.
          alpha: true,
          // Nothing here reads back pixels, so let the driver discard the
          // buffer after compositing.
          preserveDrawingBuffer: false,
          failIfMajorPerformanceCaveat: true,
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (event) => {
            // Prevent default so the browser will attempt a restore, but drop
            // the scene rather than showing a frozen last frame.
            event.preventDefault();
            setFailed(true);
          });
        }}
        // A GL context can fail to initialise on blocklisted drivers even after
        // the probe succeeded; fall back rather than crashing the page.
        onError={() => setFailed(true)}
        style={{ pointerEvents: "none" }}
      >
        <PointerDamping pointer={pointer} target={target} />
        <AdaptiveQuality maxDpr={capability.maxDpr} />

        {HERO_LAYERS.circuit && (
          <CircuitBoard
            pointer={pointer}
            count={capability.tier === "high" ? TRACE_BUDGET.high : TRACE_BUDGET.low}
            isDark={isDark}
          />
        )}
        {HERO_LAYERS.particles && (
          <ParticleField count={capability.particles} pointer={pointer} isDark={isDark} />
        )}
        {HERO_LAYERS.wireCore && (
          <WireCore
            pointer={pointer}
            detail={capability.tier === "high" ? 2 : 1}
            isDark={isDark}
          />
        )}
      </Canvas>
    </div>
  );
}

/**
 * Eases the raw pointer toward its target once per frame.
 *
 * Doing the damping in one place, in a ref, means the scene's meshes read an
 * already-smoothed value and no component re-renders on mouse movement.
 */
function PointerDamping({
  pointer,
  target,
}: {
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  target: React.MutableRefObject<{ x: number; y: number }>;
}) {
  useFrame((_, delta) => {
    // Frame-rate independent easing: the same visual speed at 30fps and 144fps.
    const t = 1 - Math.pow(0.001, Math.min(delta, 0.05));
    pointer.current.x += (target.current.x - pointer.current.x) * t;
    pointer.current.y += (target.current.y - pointer.current.y) * t;
  });
  return null;
}

/**
 * Runtime safety net for the static tiering.
 *
 * `deviceMemory` and `hardwareConcurrency` cannot see a throttled phone, a
 * shared GPU or a browser already under load, so this watches the actual frame
 * time and drops resolution when the scene cannot keep up. Resolution is the
 * right lever: it is the single biggest cost here (the shaders are fragment
 * bound) and scaling it is invisible on a blurred background.
 */
function AdaptiveQuality({ maxDpr }: { maxDpr: number }) {
  const setDpr = useThree((state) => state.setDpr);
  const frames = useRef(0);
  const elapsed = useRef(0);
  const level = useRef(maxDpr);

  useFrame((_, delta) => {
    // Ignore absurd deltas from tab switches; they would trigger a false
    // downgrade on the first frame back.
    if (delta > 0.25) return;

    frames.current += 1;
    elapsed.current += delta;

    // Sample across a full second so a couple of slow frames during entrance
    // animations do not permanently degrade quality.
    if (elapsed.current < 1) return;

    const fps = frames.current / elapsed.current;
    frames.current = 0;
    elapsed.current = 0;

    if (fps < 45 && level.current > 0.75) {
      level.current = Math.max(0.75, level.current - 0.25);
      setDpr(level.current);
    } else if (fps > 58 && level.current < maxDpr) {
      // Recover slowly, so a device that dips once is not stuck at low
      // resolution for the whole visit.
      level.current = Math.min(maxDpr, level.current + 0.25);
      setDpr(level.current);
    }
  });

  return null;
}
