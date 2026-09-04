/**
 * MolecularCloudVisual.tsx
 * Procedural visual rendering for Giant Molecular Clouds and dense collapsing envelopes.
 * Uses GPU particle clouds and additive dust gas scattering.
 */

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MolecularCloudProperties } from './StarBirthTypes';
import { createSeededRNG } from '../utils/mathUtils';

interface MolecularCloudVisualProps {
  cloud: MolecularCloudProperties;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function MolecularCloudVisual({
  cloud,
  isSelected = false,
  onSelect,
}: MolecularCloudVisualProps) {
  const pointsRef = useRef<THREE.Points>(null);

  // Procedural gas & dust particle distribution
  const { positions, colors, sizes } = useMemo(() => {
    const count = 1800;
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);
    const sz = new Float32Array(count);
    const rng = createSeededRNG(1337);

    const baseRadius = Math.max(8.0, cloud.radiusPc * 12.0);

    for (let i = 0; i < count; i++) {
      // Clustered power-law density distribution
      const r = baseRadius * Math.pow(rng(), 1.6);
      const theta = rng() * Math.PI * 2;
      const phi = Math.acos(2 * rng() - 1);

      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.7; // Slightly flattened disk-like GMC
      pos[i * 3 + 2] = r * Math.cos(phi);

      // Color variation: cool dark reddish-brown molecular dust with subtle ionized cyan accents
      const isIonized = rng() < 0.15;
      if (isIonized) {
        col[i * 3] = 0.2;
        col[i * 3 + 1] = 0.6;
        col[i * 3 + 2] = 0.8;
      } else {
        col[i * 3] = 0.35 + rng() * 0.25;
        col[i * 3 + 1] = 0.12 + rng() * 0.10;
        col[i * 3 + 2] = 0.18 + rng() * 0.15;
      }

      sz[i] = 2.0 + rng() * 3.5;
    }

    return { positions: pos, colors: col, sizes: sz };
  }, [cloud.radiusPc]);

  useFrame((state) => {
    if (pointsRef.current) {
      // Gentle turbulent rotation
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.01;
      // Contraction visual modulation
      const contractionScale = 1.0 - cloud.collapseProgress * 0.6;
      pointsRef.current.scale.set(contractionScale, contractionScale, contractionScale);
    }
  });

  return (
    <group position={cloud.position} onClick={(e) => { e.stopPropagation(); onSelect?.(); }}>
      <points ref={pointsRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute
            attach="attributes-color"
            args={[colors, 3]}
          />
          <bufferAttribute
            attach="attributes-size"
            args={[sizes, 1]}
          />
        </bufferGeometry>
        <pointsMaterial
          size={3.0}
          vertexColors
          transparent
          opacity={Math.max(0.15, 0.45 * (1.0 - cloud.collapseProgress * 0.7))}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>

      {/* Central Dense Core Glow */}
      <mesh scale={[cloud.radiusPc * 3.0, cloud.radiusPc * 3.0, cloud.radiusPc * 3.0]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#bf4080"
          transparent
          opacity={0.08 + cloud.collapseProgress * 0.15}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Selection Ring */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[cloud.radiusPc * 14.0, cloud.radiusPc * 14.5, 64]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
