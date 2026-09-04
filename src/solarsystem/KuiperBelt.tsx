/**
 * @file KuiperBelt.tsx
 * @description GPU particle system representing the Kuiper Belt (30 to 52 AU) and scattered disc bodies.
 */

import React, { useMemo, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ScaleMode } from './SolarSystemTypes';
import { computeKeplerianPosition } from './KeplerianOrbit';
import { createSeededRNG } from '../utils/mathUtils';

interface KuiperBeltProps {
  scaleMode?: ScaleMode;
  visible?: boolean;
}

export const KuiperBelt: React.FC<KuiperBeltProps> = ({
  scaleMode = 'exploration',
  visible = true,
}) => {
  const pointsRef = useRef<THREE.Points>(null);

  const { geometry, material } = useMemo(() => {
    const count = 3000;
    const rng = createSeededRNG(98765);
    const posArr = new Float32Array(count * 3);
    const colArr = new Float32Array(count * 3);
    const sizeArr = new Float32Array(count);

    // Subtle icy / blueish / greyish tint
    const baseColorIcy = new THREE.Color('#94a3b8');
    const baseColorMethane = new THREE.Color('#cbd5e1');
    const baseColorReddish = new THREE.Color('#b45309');

    for (let i = 0; i < count; i++) {
      // 30 AU to 50 AU Classical belt + scattered disc up to 60 AU
      const u = rng();
      const semiMajorAxisAU = 30 + u * 25 + (rng() < 0.1 ? rng() * 20 : 0);
      const eccentricity = 0.03 + rng() * 0.18;
      const inclinationDeg = (rng() - 0.5) * 20; // 0-10 deg typical
      const periodDays = Math.pow(semiMajorAxisAU, 1.5) * 365.25;
      const phase = rng() * 360;

      const orbitElements = {
        semiMajorAxisAU,
        eccentricity,
        inclinationDeg,
        longitudeOfAscendingNodeDeg: rng() * 360,
        argumentOfPeriapsisDeg: rng() * 360,
        orbitalPeriodDays: periodDays,
        meanAnomalyAtEpochDeg: phase,
      };

      const [ix, iy, iz] = computeKeplerianPosition(orbitElements, 0, scaleMode);
      posArr[i * 3] = ix;
      posArr[i * 3 + 1] = iy;
      posArr[i * 3 + 2] = iz;

      // Color variation
      const cRand = rng();
      const c = cRand < 0.6 ? baseColorIcy : cRand < 0.85 ? baseColorMethane : baseColorReddish;
      colArr[i * 3] = c.r * (0.6 + rng() * 0.4);
      colArr[i * 3 + 1] = c.g * (0.6 + rng() * 0.4);
      colArr[i * 3 + 2] = c.b * (0.6 + rng() * 0.4);

      sizeArr[i] = 1.0 + rng() * 1.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(posArr, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colArr, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizeArr, 1));

    const mat = new THREE.PointsMaterial({
      size: scaleMode === 'exploration' ? 1.2 : 0.8,
      vertexColors: true,
      transparent: true,
      opacity: 0.65,
      sizeAttenuation: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return {
      geometry: geo,
      material: mat,
    };
  }, [scaleMode]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Subtle slow orbital revolution around the Sun
  useFrame((_, delta) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y += delta * 0.0003;
  });

  if (!visible) return null;

  return (
    <points
      ref={pointsRef}
      geometry={geometry}
      material={material}
    />
  );
};
