/**
 * AccretionDiskVisual.tsx
 * Protoplanetary circumstellar accretion disk visual rendering.
 * Features differential Keplerian rotation, inner hot boundary glow, and dust gradients.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CircumstellarDiskProperties } from './StarBirthTypes';

interface AccretionDiskVisualProps {
  disk: CircumstellarDiskProperties;
  innerColor?: string;
  outerColor?: string;
}

export function AccretionDiskVisual({
  disk,
  innerColor = '#ffbb33',
  outerColor = '#3a1f18',
}: AccretionDiskVisualProps) {
  const diskMeshRef = useRef<THREE.Mesh>(null);

  const isVisible = disk.dissipationProgress < 0.99 && disk.massSolar > 0.001;
  const innerRadius = Math.max(0.8, disk.innerRadiusAU * 4.0);
  const outerRadius = Math.max(innerRadius + 1.0, Math.min(25.0, disk.outerRadiusAU * 0.18));
  const opacity = Math.max(0.1, (1.0 - disk.dissipationProgress) * 0.85);

  useFrame((state) => {
    if (diskMeshRef.current && isVisible) {
      diskMeshRef.current.rotation.z = state.clock.getElapsedTime() * 0.15;
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <group rotation={[disk.inclinationDeg * (Math.PI / 180), 0, 0]}>
      {/* ── 1. Main Protoplanetary Dust Disk ── */}
      <mesh ref={diskMeshRef}>
        <ringGeometry args={[innerRadius, outerRadius, 64]} />
        <meshStandardMaterial
          color={outerColor}
          emissive={innerColor}
          emissiveIntensity={0.6 * (1.0 - disk.dissipationProgress)}
          transparent
          opacity={opacity}
          side={THREE.DoubleSide}
          roughness={0.7}
        />
      </mesh>

      {/* ── 2. Hot Inner Ionized Boundary Glow ── */}
      <mesh>
        <ringGeometry args={[innerRadius * 0.9, innerRadius * 1.3, 48]} />
        <meshBasicMaterial
          color={innerColor}
          transparent
          opacity={opacity * 0.9}
          blending={THREE.AdditiveBlending}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
