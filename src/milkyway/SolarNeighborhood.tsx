/**
 * SolarNeighborhood.tsx
 * Visual anchor representing the Sun's approximate location (~8 kpc / ~26,000 ly from Galactic Center)
 * within the Orion Spur of the Milky Way.
 * Acts as the structural entry point for Phase 5 (Solar System).
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { SolarNeighborhoodAnchor } from './MilkyWayTypes';

interface SolarNeighborhoodProps {
  anchor: SolarNeighborhoodAnchor;
  visible?: boolean;
  isFocused?: boolean;
  onSelect?: () => void;
}

export function SolarNeighborhood({
  anchor,
  visible = true,
  isFocused = false,
  onSelect,
}: SolarNeighborhoodProps) {
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.PointLight>(null);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.75;
      const pulse = 1.0 + Math.sin(time * 3.5) * 0.15;
      ringRef.current.scale.set(pulse, pulse, pulse);
    }
    if (pulseRef.current) {
      pulseRef.current.intensity = 1.5 + Math.sin(time * 4.0) * 0.5;
    }
  });

  if (!visible) return null;

  const [x, y, z] = anchor.scenePosition;

  return (
    <group position={[x, y, z]}>
      {/* ── Central Solar Beacon ── */}
      <mesh
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <sphereGeometry args={[0.45, 16, 16]} />
        <meshBasicMaterial color={isFocused ? '#ffd700' : '#ffea75'} />
      </mesh>

      {/* ── Solar Glow Light ── */}
      <pointLight
        ref={pulseRef}
        color="#ffea75"
        intensity={2.0}
        distance={12.0}
        decay={2}
      />

      {/* ── Animated Target Reticle Ring ── */}
      <mesh ref={ringRef} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.2, 1.4, 32]} />
        <meshBasicMaterial
          color={isFocused ? '#64ffda' : '#ffb74d'}
          transparent
          opacity={isFocused ? 0.9 : 0.65}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Vertical Coordinate Guide Line ── */}
      <line>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[new Float32Array([0, -y, 0, 0, y > 0 ? y * 1.5 : 2.0, 0]), 3]}
          />
        </bufferGeometry>
        <lineBasicMaterial color="#ffb74d" transparent opacity={0.35} />
      </line>
    </group>
  );
}
