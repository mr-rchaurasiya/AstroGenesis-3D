/**
 * AsteroidBelt.tsx
 * GPU-efficient particle system for the Main Asteroid Belt between Mars and Jupiter.
 * Single draw call with deterministic PRNG distribution.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ASTEROID_BELT_CONFIG } from './SolarSystemConfig';
import { mapOrbitalDistance } from './KeplerianOrbit';
import { createSeededRNG } from '../utils/mathUtils';
import type { ScaleMode } from './SolarSystemTypes';

interface AsteroidBeltProps {
  scaleMode?: ScaleMode;
  visible?: boolean;
}

export function AsteroidBelt({
  scaleMode = 'exploration',
  visible = true,
}: AsteroidBeltProps) {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const rng = createSeededRNG(34871);
    const count = ASTEROID_BELT_CONFIG.count;

    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const minRScene = mapOrbitalDistance(ASTEROID_BELT_CONFIG.innerRadiusAU, scaleMode);
    const maxRScene = mapOrbitalDistance(ASTEROID_BELT_CONFIG.outerRadiusAU, scaleMode);
    const rSpan = maxRScene - minRScene;

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      // Radial distribution with Kirkwood gap hints
      const r = minRScene + Math.pow(rng(), 0.9) * rSpan;
      const theta = rng() * Math.PI * 2;
      const inc = (rng() - 0.5) * (ASTEROID_BELT_CONFIG.meanInclinationDeg * Math.PI / 180.0);

      const x = r * Math.cos(theta);
      const z = r * Math.sin(theta);
      const y = r * Math.sin(inc) * (rng() - 0.5) * 0.45;

      positions[i3] = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      // Carbonaceous / Silicate rocky tones
      const tone = 0.45 + rng() * 0.35;
      colors[i3] = tone * 0.95;
      colors[i3 + 1] = tone * 0.90;
      colors[i3 + 2] = tone * 0.85;

      sizes[i] = 1.0 + rng() * 1.8;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.22,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, [scaleMode]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((_state, delta) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += delta * 0.008;
    }
  });

  if (!visible) return null;

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
    />
  );
}
