/**
 * OrbitLine.tsx
 * Smooth elliptical Keplerian orbit trajectory line component.
 */

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { OrbitalElements, ScaleMode } from './SolarSystemTypes';
import { generateOrbitPath } from './KeplerianOrbit';

interface OrbitLineProps {
  orbit: OrbitalElements;
  scaleMode?: ScaleMode;
  color?: string;
  opacity?: number;
  visible?: boolean;
}

export function OrbitLine({
  orbit,
  scaleMode = 'exploration',
  color = '#4fc3f7',
  opacity = 0.25,
  visible = true,
}: OrbitLineProps) {
  const { geometry, material } = useMemo(() => {
    const positions = generateOrbitPath(orbit, scaleMode, 128);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const mat = new THREE.LineBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, [orbit, scaleMode, color, opacity]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  if (!visible || orbit.semiMajorAxisAU <= 0) return null;

  return <primitive object={new THREE.Line(geometry, material)} />;
}
