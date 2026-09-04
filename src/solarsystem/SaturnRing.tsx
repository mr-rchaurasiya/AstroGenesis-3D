/**
 * SaturnRing.tsx
 * 3D Planetary ring disc component for Saturn and Uranus.
 */

import { useMemo, useEffect } from 'react';
import * as THREE from 'three';
import type { RingSystemProperties } from './SolarSystemTypes';
import { RingVertexShader, RingFragmentShader } from '../shaders/RingShader';

interface SaturnRingProps {
  rings: RingSystemProperties;
  planetRadius: number;
}

export function SaturnRing({ rings, planetRadius }: SaturnRingProps) {
  const ringMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: RingVertexShader,
      fragmentShader: RingFragmentShader,
      uniforms: {
        uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
        uRingColor: { value: new THREE.Color(...rings.color) },
        uOpacity: { value: rings.opacity },
        uRingType: { value: rings.textureType === 'saturn' ? 0 : 1 },
      },
      transparent: true,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
  }, [rings]);

  useEffect(() => {
    return () => {
      ringMaterial.dispose();
    };
  }, [ringMaterial]);

  // Scaled ring radius relative to planet body
  const outerRadius = planetRadius * 2.35;

  return (
    <mesh
      material={ringMaterial}
      rotation={[-Math.PI / 2, 0, 0]}
    >
      <planeGeometry args={[outerRadius * 2, outerRadius * 2, 32, 32]} />
    </mesh>
  );
}
