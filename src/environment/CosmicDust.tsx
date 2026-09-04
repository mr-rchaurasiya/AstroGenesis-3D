/**
 * CosmicDust.tsx
 * Procedural interstellar cosmic dust clouds and absorption lanes.
 * Generates soft, irregular concentrations of particulate matter between star groups.
 *
 * Performance:
 * - Single draw call via THREE.Points with DustVertexShader & DustFragmentShader
 * - Full memory disposal on unmount
 * - Quality-scaled particle counts
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, type EnvironmentQuality } from '../store/useAppStore';
import { DustVertexShader, DustFragmentShader } from '../shaders/DustShader';
import { createSeededRNG, fbm3D, randomInDisk } from '../utils/mathUtils';

const DUST_COUNTS: Record<EnvironmentQuality, number> = {
  low: 1200,
  medium: 2200,
  high: 3800,
  ultra: 5500,
};

export function CosmicDust({ seed = 777 }: { seed?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const quality = useAppStore((s) => s.environmentQuality);
  const isVisible = useAppStore((s) => s.showCosmicDust);

  const { geometry, material } = useMemo(() => {
    const count = DUST_COUNTS[quality] ?? DUST_COUNTS.high;
    const rng = createSeededRNG(seed);

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const opacities = new Float32Array(count);
    const seeds = new Float32Array(count);

    // Warm interstellar silicate/carbon dust and cool molecular dust tones
    const dustTones = [
      new THREE.Color(0.18, 0.12, 0.08), // Warm brown dust
      new THREE.Color(0.08, 0.10, 0.16), // Cool slate gas/dust
      new THREE.Color(0.14, 0.06, 0.10), // Reddish-amber absorption lane
      new THREE.Color(0.06, 0.08, 0.12), // Deep interstellar veil
    ];

    for (let i = 0; i < count; i++) {
      // Dust lies in irregular, turbulent flattened clouds spanning mid-to-far field
      const basePos = randomInDisk(1800, 350, 1.2, rng);

      // Modulate position with 3D procedural noise for natural clustering & lanes
      const n = fbm3D(basePos.x * 0.002, basePos.y * 0.003, basePos.z * 0.002, 3);
      const clumpOffset = (n - 0.5) * 200;

      positions[i * 3]     = basePos.x + clumpOffset;
      positions[i * 3 + 1] = basePos.y + clumpOffset * 0.5;
      positions[i * 3 + 2] = basePos.z + clumpOffset;

      // Color variation from natural interstellar mix
      const toneIdx = Math.floor(rng() * dustTones.length);
      const tone = dustTones[toneIdx];
      colors[i * 3]     = tone.r + (rng() - 0.5) * 0.03;
      colors[i * 3 + 1] = tone.g + (rng() - 0.5) * 0.03;
      colors[i * 3 + 2] = tone.b + (rng() - 0.5) * 0.03;

      // Volumetric point sizes: large soft particles that overlap to form continuous clouds
      sizes[i] = 120 + rng() * 180;

      // Extremely subtle opacity (0.02–0.06) so dust feels atmospheric rather than opaque
      opacities[i] = (0.02 + rng() * 0.04) * (0.5 + n * 0.8);
      seeds[i] = rng();
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(opacities, 1));
    geo.setAttribute('aSeed',    new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: DustVertexShader,
      fragmentShader: DustFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uDensityScale: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending, // Normal blending gives realistic absorption look
    });

    return { geometry: geo, material: mat };
  }, [seed, quality]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  if (!isVisible) return null;

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} ref={materialRef} attach="material" />
    </points>
  );
}
