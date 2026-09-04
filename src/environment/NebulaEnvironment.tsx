/**
 * NebulaEnvironment.tsx
 * Procedural volumetric nebular complexes for the Universe environment.
 *
 * Implements 4 astrophysical classes:
 * 1. Emission Nebulae (H-alpha crimson & O-III ionization zones)
 * 2. Reflection Nebulae (Blue Rayleigh scattering from hot stellar winds)
 * 3. Dark Molecular Clouds (Dense absorbing dust pillars & Barnard voids)
 * 4. Star-Forming Complexes (Active ionization cores & protostellar envelopes)
 *
 * Performance:
 * - Rendered in a single multi-nebula Points draw call with custom GLSL fBM noise
 * - Clean disposal on unmount or quality switch
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, type EnvironmentQuality } from '../store/useAppStore';
import { NebulaVertexShader, NebulaFragmentShader } from '../shaders/NebulaShader';
import { NEBULA_PALETTES } from '../utils/colorUtils';
import { createSeededRNG, randomInSphere, fbm3D } from '../utils/mathUtils';

interface NebulaComplexDef {
  center: [number, number, number];
  radius: number;
  type: 0 | 1 | 2 | 3; // 0=Emission, 1=Reflection, 2=Dark, 3=StarForming
  particleCountFactor: number;
}

const NEBULA_COMPLEXES: NebulaComplexDef[] = [
  // 1. Great Emission Complex (Crimson / Cyan O-III ionization front) - Mid-depth sector
  { center: [550, 180, -950], radius: 420, type: 0, particleCountFactor: 1.2 },

  // 2. Cerulean Reflection Nebula (Scattering veil) - Upper cosmic quadrant
  { center: [-700, 320, -600], radius: 360, type: 1, particleCountFactor: 0.9 },

  // 3. Dense Dark Molecular Ridge (Barnard-type obscuration) - Galactic plane band
  { center: [-350, -180, 800], radius: 300, type: 2, particleCountFactor: 0.8 },

  // 4. Vibrant Star-Forming Complex (Orion/Carina type energetic glow) - Deep sector
  { center: [800, -260, 650], radius: 480, type: 3, particleCountFactor: 1.3 },

  // 5. Secondary Diffuse Emission Veil - Far deep field
  { center: [-1100, 150, 1200], radius: 520, type: 0, particleCountFactor: 1.0 },

  // 6. Distant Blue Reflection Veil - Deep southern horizon
  { center: [300, -450, -1400], radius: 400, type: 1, particleCountFactor: 0.85 },
];

const QUALITY_NEBULA_BASE: Record<EnvironmentQuality, number> = {
  low: 1500,
  medium: 3000,
  high: 5200,
  ultra: 8000,
};

export function NebulaEnvironment({ seed = 999 }: { seed?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const quality = useAppStore((s) => s.environmentQuality);
  const isVisible = useAppStore((s) => s.showNebulae);

  const { geometry, material } = useMemo(() => {
    const baseCount = QUALITY_NEBULA_BASE[quality] ?? QUALITY_NEBULA_BASE.high;
    const rng = createSeededRNG(seed);

    // Calculate total particle count across all complexes
    let totalParticles = 0;
    const complexCounts = NEBULA_COMPLEXES.map((c) => {
      const count = Math.round(baseCount * (c.particleCountFactor / NEBULA_COMPLEXES.length));
      totalParticles += count;
      return count;
    });

    const positions = new Float32Array(totalParticles * 3);
    const primaryColors = new Float32Array(totalParticles * 3);
    const secondaryColors = new Float32Array(totalParticles * 3);
    const sizes = new Float32Array(totalParticles);
    const densities = new Float32Array(totalParticles);
    const types = new Float32Array(totalParticles);
    const seeds = new Float32Array(totalParticles);

    let idx = 0;

    NEBULA_COMPLEXES.forEach((complex, cIdx) => {
      const count = complexCounts[cIdx];
      const [cx, cy, cz] = complex.center;

      let palette = NEBULA_PALETTES.EMISSION;
      if (complex.type === 1) palette = NEBULA_PALETTES.REFLECTION;
      if (complex.type === 2) palette = NEBULA_PALETTES.DARK_CLOUD;
      if (complex.type === 3) palette = NEBULA_PALETTES.STAR_FORMING;

      for (let i = 0; i < count; i++) {
        // Volumetric distribution: concentrated towards core with elongated filaments
        const relPos = randomInSphere(complex.radius, rng);

        // Procedural turbulence displacement using 3D fBM noise
        const nX = fbm3D((cx + relPos.x) * 0.005, (cy + relPos.y) * 0.005, (cz + relPos.z) * 0.005, 3);
        const nY = fbm3D((cx + relPos.x + 50) * 0.005, (cy + relPos.y + 50) * 0.005, (cz + relPos.z + 50) * 0.005, 3);
        const nZ = fbm3D((cx + relPos.x + 100) * 0.005, (cy + relPos.y + 100) * 0.005, (cz + relPos.z + 100) * 0.005, 3);

        const turbulenceStrength = complex.radius * 0.45;
        const posX = cx + relPos.x + (nX - 0.5) * turbulenceStrength;
        const posY = cy + relPos.y + (nY - 0.5) * turbulenceStrength;
        const posZ = cz + relPos.z + (nZ - 0.5) * turbulenceStrength;

        positions[idx * 3]     = posX;
        positions[idx * 3 + 1] = posY;
        positions[idx * 3 + 2] = posZ;

        // Palette mapping with subtle randomized hue shift
        const pCol = palette.primary;
        const sCol = palette.secondary;
        primaryColors[idx * 3]     = pCol.r + (rng() - 0.5) * 0.05;
        primaryColors[idx * 3 + 1] = pCol.g + (rng() - 0.5) * 0.05;
        primaryColors[idx * 3 + 2] = pCol.b + (rng() - 0.5) * 0.05;

        secondaryColors[idx * 3]     = sCol.r + (rng() - 0.5) * 0.05;
        secondaryColors[idx * 3 + 1] = sCol.g + (rng() - 0.5) * 0.05;
        secondaryColors[idx * 3 + 2] = sCol.b + (rng() - 0.5) * 0.05;

        // Particle size scaled to create seamless soft cloud volumes
        sizes[idx] = 140 + rng() * 200;

        // Density falloff from nebula center
        const distFromCenter = Math.sqrt(relPos.x * relPos.x + relPos.y * relPos.y + relPos.z * relPos.z);
        const normDist = distFromCenter / complex.radius;
        const radialFalloff = Math.exp(-normDist * normDist * 3.5);

        // Density modified by fBM noise pockets
        densities[idx] = (0.04 + rng() * 0.08) * radialFalloff * (0.6 + nX * 0.8);
        types[idx] = complex.type;
        seeds[idx] = rng();

        idx++;
      }
    });

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',        new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColorPrimary',   new THREE.BufferAttribute(primaryColors, 3));
    geo.setAttribute('aColorSecondary', new THREE.BufferAttribute(secondaryColors, 3));
    geo.setAttribute('aSize',           new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aDensity',        new THREE.BufferAttribute(densities, 1));
    geo.setAttribute('aNebulaType',     new THREE.BufferAttribute(types, 1));
    geo.setAttribute('aSeed',           new THREE.BufferAttribute(seeds, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: NebulaVertexShader,
      fragmentShader: NebulaFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uOpacityFactor: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
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
