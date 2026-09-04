/**
 * SupernovaVisual.tsx
 * 3D Procedural expanding shockwave shell, intense flash bloom, and turbulent remnant filaments.
 * Driven strictly by SupernovaProperties light curve and ejecta physics.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SupernovaProperties } from './StarDeathTypes';

interface SupernovaVisualProps {
  supernova: SupernovaProperties;
  visualRadius: number;
}

export function SupernovaVisual({
  supernova,
  visualRadius,
}: SupernovaVisualProps) {
  const shockRef = useRef<THREE.Mesh>(null);
  const filamentRef = useRef<THREE.Mesh>(null);

  const radius = Math.max(4.0, visualRadius);
  const intensity = Math.min(1.0, Math.max(0.05, supernova.lightCurveFraction * 1.5));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (shockRef.current) {
      shockRef.current.rotation.y = t * 0.03;
      shockRef.current.rotation.x = t * 0.02;
    }
    if (filamentRef.current) {
      filamentRef.current.rotation.y = -t * 0.025;
      filamentRef.current.rotation.z = Math.sin(t * 0.1) * 0.2;
    }
  });

  return (
    <group name="Supernova">
      {/* ── 1. Expanding High-Velocity Forward Shock Shell ── */}
      <mesh ref={shockRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#ff3366"
          transparent
          opacity={Math.min(0.8, intensity * 0.75)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 2. Turbulent Radioactive Core Filaments (Cobalt/Nickel decay) ── */}
      <mesh ref={filamentRef} scale={[radius * 0.7, radius * 0.7, radius * 0.7]}>
        <octahedronGeometry args={[1, 3]} />
        <meshBasicMaterial
          color="#ffcc00"
          transparent
          opacity={Math.min(0.85, intensity * 0.9)}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          wireframe
        />
      </mesh>

      {/* ── 3. High-Intensity Supernova Radiant Point Light ── */}
      <pointLight
        color="#ffeedd"
        intensity={Math.max(1.0, intensity * 8.0)}
        distance={Math.max(300, radius * 12)}
        decay={1.2}
      />
    </group>
  );
}
