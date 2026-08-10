"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * The slowly turning wireframe solid at the centre of the hero field.
 *
 * An icosahedron rather than a sphere: the flat facets give the silhouette
 * recognisable structure at low detail, so it stays legible at detail level 1
 * (80 triangles) where a subdivided sphere would just read as noise. Vertices
 * are displaced in the shader, so the geometry itself is uploaded once and
 * never rebuilt.
 */

interface WireCoreProps {
  /** Damped pointer position, -1..1 on both axes. */
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  /** Lower on weak hardware: 1 = 80 triangles, 2 = 320. */
  detail: number;
  isDark: boolean;
}

const vertexShader = /* glsl */ `
  uniform float uTime;

  varying float vDepth;

  void main() {
    // Ripple along the surface. Cheap sine displacement rather than real noise:
    // at wireframe density the difference is invisible and this costs nothing.
    float ripple = sin(position.x * 1.6 + uTime * 0.7)
      * cos(position.y * 1.4 + uTime * 0.5)
      * 0.16;

    vec3 pos = position + normal * ripple;
    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // Hand depth to the fragment stage so back-facing edges can fade out,
    // which reads as volume without needing depth sorting.
    vDepth = smoothstep(11.0, 5.0, -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;
  uniform float uOpacity;

  varying float vDepth;

  void main() {
    gl_FragColor = vec4(uColor, vDepth * uOpacity);
  }
`;

export function WireCore({ pointer, detail, isDark }: WireCoreProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // See ParticleField: additive blending disappears against a light background,
  // so light mode draws the wire normally in the darker accent instead.
  useEffect(() => {
    const material = materialRef.current;
    if (!material) return;

    material.uniforms.uColor.value.set(isDark ? "#d6ff3f" : "#546900");
    material.uniforms.uOpacity.value = isDark ? 0.22 : 0.3;
    material.blending = isDark ? THREE.AdditiveBlending : THREE.NormalBlending;
    material.needsUpdate = true;
  }, [isDark]);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(2.1, detail), [detail]);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uColor: { value: new THREE.Color("#d6ff3f") },
      uOpacity: { value: 0.22 },
    }),
    []
  );

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const material = materialRef.current;
    if (!mesh || !material) return;

    const dt = Math.min(delta, 0.05);
    material.uniforms.uTime.value += dt;

    mesh.rotation.y += dt * 0.12;
    mesh.rotation.x += dt * 0.05;

    // Ease toward the pointer instead of tracking it directly, so the core
    // feels weighted rather than glued to the cursor.
    mesh.rotation.y += (pointer.current.x * 0.35 - mesh.rotation.z) * 0.01;
    mesh.position.x += (pointer.current.x * 0.4 - mesh.position.x) * 0.04;
    mesh.position.y += (pointer.current.y * 0.4 - mesh.position.y) * 0.04;
  });

  return (
    <mesh ref={meshRef} geometry={geometry}>
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        wireframe
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
}
