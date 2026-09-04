/**
 * MainSequenceStar.tsx
 * 3D Photosphere, coronal halo, and radiant light source for Main Sequence stellar objects.
 * Driven strictly by Phase 9 physical state & Phase 7 visual properties.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StellarEvolutionProperties } from './StarEvolutionTypes';
import { deriveStarEvolutionVisualProperties } from './StarEvolutionVisuals';

interface MainSequenceStarProps {
  star: StellarEvolutionProperties;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function MainSequenceStar({
  star,
  isSelected = false,
  onSelect,
}: MainSequenceStarProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const visual = useMemo(() => deriveStarEvolutionVisualProperties(star), [star]);
  const radius = visual.visualRadiusExploration;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (meshRef.current) {
      meshRef.current.rotation.y = t * 0.04;
    }
    if (coronaRef.current) {
      coronaRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <group
      position={star.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* ── 1. Central Photospheric Sphere ── */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color={visual.hexColor} />
      </mesh>

      {/* ── 2. Dynamic Coronal Atmospheric Glow (Camera Facing) ── */}
      <mesh ref={coronaRef} scale={[radius * 2.8, radius * 2.8, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={visual.coronaColor}
          transparent
          opacity={0.35 * visual.brightness}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 3. Radiant Point Light Illumination ── */}
      <pointLight
        color={visual.hexColor}
        intensity={Math.max(0.4, visual.brightness * 2.5)}
        distance={Math.max(150, radius * 30)}
        decay={1.6}
      />

      {/* ── 4. Selection Highlight Ring ── */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.35, radius * 1.48, 48]} />
          <meshBasicMaterial color="#38ef7d" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
