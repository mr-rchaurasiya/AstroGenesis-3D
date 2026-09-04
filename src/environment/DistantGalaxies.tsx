/**
 * DistantGalaxies.tsx
 * Sparse background population of distant galaxies (Elliptical, Spiral, Irregular).
 * Positioned in deep space (3,500 to 7,500 units away) to establish true cosmic depth.
 *
 * Performance:
 * - Single draw call via THREE.Points with DistantGalaxyShader
 * - Memory disposal on unmount
 */

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useAppStore, type EnvironmentQuality } from '../store/useAppStore';
import { DistantGalaxyVertexShader, DistantGalaxyFragmentShader } from '../shaders/DistantGalaxyShader';
import { createSeededRNG, randomOnSphere } from '../utils/mathUtils';

const GALAXY_COUNTS: Record<EnvironmentQuality, number> = {
  low: 120,
  medium: 220,
  high: 380,
  ultra: 550,
};

export function DistantGalaxies({ seed = 555 }: { seed?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const quality = useAppStore((s) => s.environmentQuality);
  const isVisible = useAppStore((s) => s.showDistantGalaxies);

  const { geometry, material } = useMemo(() => {
    const count = GALAXY_COUNTS[quality] ?? GALAXY_COUNTS.high;
    const rng = createSeededRNG(seed);

    const positions = new Float32Array(count * 3);
    const coreColors = new Float32Array(count * 3);
    const armColors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const morphologies = new Float32Array(count);
    const angles = new Float32Array(count);
    const tilts = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Positioned in deep cosmic horizon (3,500 to 7,500 units)
      const r = 3500 + (7500 - 3500) * Math.pow(rng(), 0.6);
      const pos = randomOnSphere(r, rng);

      positions[i * 3]     = pos.x;
      positions[i * 3 + 1] = pos.y;
      positions[i * 3 + 2] = pos.z;

      // Morphology distribution: 50% Spiral, 35% Elliptical, 15% Irregular
      const morphRand = rng();
      let morphology = 1.0; // Spiral
      let coreCol = new THREE.Color(1.0, 0.92, 0.75); // Warm yellow core
      let armCol = new THREE.Color(0.55, 0.75, 1.0);  // Blue-white star-forming arms
      let baseSize = 32.0;

      if (morphRand < 0.35) {
        morphology = 0.0; // Elliptical
        coreCol = new THREE.Color(1.0, 0.88, 0.65); // Older red/yellow stars
        armCol = new THREE.Color(0.85, 0.70, 0.50);  // Smooth fading halo
        baseSize = 28.0;
      } else if (morphRand > 0.85) {
        morphology = 2.0; // Irregular
        coreCol = new THREE.Color(0.70, 0.85, 1.0);  // Young blue population
        armCol = new THREE.Color(0.50, 0.70, 0.90);
        baseSize = 22.0;
      }

      coreColors[i * 3]     = coreCol.r;
      coreColors[i * 3 + 1] = coreCol.g;
      coreColors[i * 3 + 2] = coreCol.b;

      armColors[i * 3]     = armCol.r;
      armColors[i * 3 + 1] = armCol.g;
      armColors[i * 3 + 2] = armCol.b;

      // Apparent visual size based on random galaxy diameter & distance
      sizes[i] = (baseSize + rng() * 24.0) * (4000.0 / r);
      morphologies[i] = morphology;
      angles[i] = rng() * Math.PI * 2;
      tilts[i] = rng() * Math.PI * 0.45; // Viewing inclination angle
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',    new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColorCore',  new THREE.BufferAttribute(coreColors, 3));
    geo.setAttribute('aColorArm',   new THREE.BufferAttribute(armColors, 3));
    geo.setAttribute('aSize',       new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aMorphology', new THREE.BufferAttribute(morphologies, 1));
    geo.setAttribute('aAngle',      new THREE.BufferAttribute(angles, 1));
    geo.setAttribute('aTilt',       new THREE.BufferAttribute(tilts, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: DistantGalaxyVertexShader,
      fragmentShader: DistantGalaxyFragmentShader,
      uniforms: {
        uBrightness: { value: 0.85 },
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

  if (!isVisible) return null;

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} ref={materialRef} attach="material" />
    </points>
  );
}
