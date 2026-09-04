/**
 * PlanetaryNebulaVisual.tsx
 * 3D Procedural glowing ionized multi-shell gas envelope and central white dwarf.
 * Visualizes envelope ejection, [O III] / H-alpha fluorescence, and gradual dispersion into ISM.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { PlanetaryNebulaProperties, WhiteDwarfProperties } from './StarDeathTypes';

interface PlanetaryNebulaVisualProps {
  nebula: PlanetaryNebulaProperties;
  whiteDwarf?: WhiteDwarfProperties;
  visualRadius: number;
}

export function PlanetaryNebulaVisual({
  nebula,
  whiteDwarf,
  visualRadius,
}: PlanetaryNebulaVisualProps) {
  const outerShellRef = useRef<THREE.Mesh>(null);
  const innerShellRef = useRef<THREE.Mesh>(null);

  const radius = Math.max(3.0, visualRadius);
  const opacity = Math.min(0.65, Math.max(0.05, nebula.visibilityFraction * 0.7));

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (outerShellRef.current) {
      outerShellRef.current.rotation.y = t * 0.015;
      outerShellRef.current.rotation.z = Math.sin(t * 0.05) * 0.1;
    }
    if (innerShellRef.current) {
      innerShellRef.current.rotation.y = -t * 0.02;
    }
  });

  return (
    <group name="PlanetaryNebula">
      {/* ── 1. Outer Ionized Envelope Shell ([O III] Emerald / Cyan) ── */}
      <mesh ref={outerShellRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial
          color="#00ffcc"
          transparent
          opacity={opacity * 0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 2. Inner Hot Bipolar Ionized Ring (H-alpha Crimson / Magenta) ── */}
      <mesh ref={innerShellRef} scale={[radius * 0.65, radius * 0.45, radius * 0.65]}>
        <torusGeometry args={[1, 0.4, 16, 48]} />
        <meshBasicMaterial
          color="#ff3388"
          transparent
          opacity={opacity * 0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 3. Central Photoionizing Point Light ── */}
      <pointLight
        color={whiteDwarf && whiteDwarf.effectiveTemperatureK > 25000 ? '#d4f0ff' : '#00ffcc'}
        intensity={Math.max(0.5, opacity * 3.0)}
        distance={Math.max(200, radius * 8)}
        decay={1.5}
      />
    </group>
  );
}
