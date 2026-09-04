/**
 * MilkyWayBulge.tsx
 * Specialized modular visual component for the Milky Way central bulge.
 */

import { useMemo } from 'react';
import * as THREE from 'three';
import { MilkyWayCoreVertexShader, MilkyWayCoreFragmentShader } from '../shaders/MilkyWayCoreShader';

interface MilkyWayBulgeProps {
  radius: number;
  color?: [number, number, number];
  intensity?: number;
}

export function MilkyWayBulge({
  radius,
  color = [1.0, 0.90, 0.72],
  intensity = 2.4,
}: MilkyWayBulgeProps) {
  const material = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: MilkyWayCoreVertexShader,
      fragmentShader: MilkyWayCoreFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(...color) },
        uIntensity: { value: intensity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
  }, [color, intensity]);

  return (
    <mesh material={material}>
      <sphereGeometry args={[radius, 32, 32]} />
    </mesh>
  );
}
