/**
 * GalaxySelector.tsx
 * 3D visual selection ring and targeting indicators for selected and hovered galaxies.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GalaxyData } from './GalaxyTypes';

interface GalaxySelectorProps {
  selectedGalaxy: GalaxyData | null;
}

export function GalaxySelector({ selectedGalaxy }: GalaxySelectorProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame(({ clock }) => {
    if (ringRef.current && outerRingRef.current) {
      const t = clock.elapsedTime;
      ringRef.current.rotation.z = t * 0.4;
      outerRingRef.current.rotation.z = -t * 0.25;

      const pulse = 1.0 + 0.05 * Math.sin(t * 3.0);
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
  });

  if (!selectedGalaxy) return null;

  const radius = selectedGalaxy.parameters.sceneRadius * selectedGalaxy.scale * 1.15;

  return (
    <group
      position={selectedGalaxy.position}
      rotation={selectedGalaxy.rotation}
    >
      {/* Primary Selection Ring */}
      <mesh ref={ringRef}>
        <ringGeometry args={[radius * 0.98, radius * 1.02, 64]} />
        <meshBasicMaterial
          color="#38bdf8"
          transparent
          opacity={0.65}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Secondary Outer Brackets */}
      <mesh ref={outerRingRef}>
        <ringGeometry args={[radius * 1.08, radius * 1.10, 32]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.3}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}
