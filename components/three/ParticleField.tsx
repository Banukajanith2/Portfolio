"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The hero's particle field.
 *
 * Drawn as a single THREE.Points with a custom shader, which is the cheapest
 * form a particle system can take: one draw call, one buffer uploaded once, and
 * every per-frame position update computed on the GPU from a single `uTime`
 * uniform. Nothing here touches the vertex data from JavaScript after mount -
 * a JS-side loop over a few thousand particles is what makes naive versions of
 * this stutter on phones.
 *
 * Particles are seeded on a sphere shell rather than in a cube so the field
 * reads as a body of depth around the wireframe core instead of a fog bank.
 */

interface ParticleFieldProps {
  count: number;
  /** Damped pointer position, -1..1 on both axes. */
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  isDark: boolean;
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uSize;
  uniform vec2 uPointer;

  attribute float aScale;
  attribute float aSpeed;
  attribute vec3 aAxis;

  varying float vFade;

  // Rotate a point around an arbitrary axis (Rodrigues' formula). Each particle
  // carries its own axis and speed, so the field swirls rather than turning as
  // one rigid body.
  vec3 rotateAround(vec3 p, vec3 axis, float angle) {
    return p * cos(angle)
      + cross(axis, p) * sin(angle)
      + axis * dot(axis, p) * (1.0 - cos(angle));
  }

  void main() {
    vec3 pos = rotateAround(position, normalize(aAxis), uTime * aSpeed * 0.08);

    // A slow breathing displacement so the shell never looks frozen.
    float wobble = sin(uTime * 0.4 + pos.x * 0.6 + pos.y * 0.4) * 0.12;
    pos += normalize(pos) * wobble;

    // Parallax: the field leans toward the cursor, with far particles moving
    // more than near ones for depth.
    pos.x += uPointer.x * 0.55;
    pos.y += uPointer.y * 0.55;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // gl_PointSize with attenuation is far cheaper than instanced quads for
    // pure points, and keeps the whole field in one draw call. The attenuation
    // constant is kept low deliberately: a larger value blows near particles up
    // into bokeh discs that read as lens blur rather than as a field of points,
    // and those compete with the text sitting on top.
    gl_PointSize = clamp(uSize * aScale * (7.0 / -mvPosition.z), 0.5, 3.5);
    gl_Position = projectionMatrix * mvPosition;

    // Fade with distance so the field dissolves into the background instead of
    // ending at a hard edge.
    vFade = smoothstep(16.0, 4.0, -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vFade;

  void main() {
    // Round the square point sprite into a soft disc. Discarding outside the
    // radius avoids blending cost on fragments that would be invisible anyway.
    vec2 d = gl_PointCoord - vec2(0.5);
    float dist = dot(d, d);
    if (dist > 0.25) discard;

    float alpha = smoothstep(0.25, 0.0, dist) * vFade * uOpacity;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

export function ParticleField({ count, pointer, isDark }: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  /*
   * Additive blending only builds toward white, so on the light theme it makes
   * the field vanish into the paper background. Light mode therefore switches
   * to normal blending with the darkened olive the design system already uses
   * for accent text, for exactly the same reason: lime is a fill colour, not a
   * mark you can read on white.
   */
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uColor.value.set(isDark ? "#d6ff3f" : "#546900");
    material.uniforms.uOpacity.value = isDark ? 0.5 : 0.42;
    material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    // Blending is compiled into the material state, so three needs telling.
    material.needsUpdate = true;
  }, [isDark]);

  // Built once. Regenerating this on a re-render would re-upload every buffer
  // to the GPU, which is the expensive part.
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const speeds = new Float32Array(count);
    const axes = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      // Even distribution over a sphere shell. Sampling the angles uniformly
      // would bunch particles at the poles; acos(1-2u) corrects for that.
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(1 - 2 * Math.random());
      const radius = 3.2 + Math.random() * 3.4;

      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);

      scales[i] = 0.4 + Math.random() * 1.6;
      speeds[i] = 0.3 + Math.random() * 1.4;

      const ax = Math.random() * 2 - 1;
      const ay = Math.random() * 2 - 1;
      const az = Math.random() * 2 - 1;
      const len = Math.hypot(ax, ay, az) || 1;
      axes[i * 3] = ax / len;
      axes[i * 3 + 1] = ay / len;
      axes[i * 3 + 2] = az / len;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    g.setAttribute("aSpeed", new THREE.BufferAttribute(speeds, 1));
    g.setAttribute("aAxis", new THREE.BufferAttribute(axes, 3));
    return g;
  }, [count]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uSize: { value: 2.4 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      // The lime accent. Hard-coded rather than read from CSS because this is
      // the one element that stays lime in both themes.
      uColor: { value: new THREE.Color("#d6ff3f") },
      uOpacity: { value: 0.5 },
    }),
    []
  );

  useFrame((_, delta) => {
    const material = materialRef.current;
    if (!material) return;

    // Clamp delta: after a background tab resumes, delta can be seconds long
    // and would snap the animation forward visibly.
    material.uniforms.uTime.value += Math.min(delta, 0.05);
    material.uniforms.uPointer.value.set(pointer.current.x, pointer.current.y);
  });

  return (
    <points ref={pointsRef} geometry={geometry} frustumCulled={false}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        // Additive so overlapping particles build up into a glow, which gets
        // the bloom look without the cost of a postprocessing pass.
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
