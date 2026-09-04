/**
 * BlackHoleVisual.tsx
 * 3D General Relativistic Black Hole with non-luminous event horizon,
 * gravitational lensing photon ring halo, and Keplerian accretion disk.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StellarDeathProperties } from './StarDeathTypes';
import { deriveStarDeathVisualProperties } from './StarDeathVisuals';
import { SupernovaVisual } from './SupernovaVisual';

interface BlackHoleVisualProps {
  deathState: StellarDeathProperties;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function BlackHoleVisual({
  deathState,
  isSelected = false,
  onSelect,
}: BlackHoleVisualProps) {
  const diskRef = useRef<THREE.Mesh>(null);
  const lensingRingRef = useRef<THREE.Mesh>(null);

  const visual = useMemo(() => deriveStarDeathVisualProperties(deathState), [deathState]);
  const horizonRadius = visual.visualRadiusExploration;
  const hasAccretion = deathState.blackHole?.hasAccretionDisk ?? false;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (diskRef.current && hasAccretion) {
      diskRef.current.rotation.z = t * 0.12;
    }
    if (lensingRingRef.current) {
      lensingRingRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  return (
    <group
      position={deathState.position}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
    >
      {/* ── 1. Pure Non-Luminous Event Horizon Sphere ── */}
      <mesh>
        <sphereGeometry args={[horizonRadius, 32, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* ── 2. Gravitational Lensing Photon Ring Halo (Camera Facing) ── */}
      <mesh ref={lensingRingRef} scale={[horizonRadius * 2.8, horizonRadius * 2.8, 1]}>
        <ringGeometry args={[0.7, 1.0, 48]} />
        <meshBasicMaterial
          color={visual.glowColor}
          transparent
          opacity={0.5}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 3. Keplerian Accretion Disk (if matter is present) ── */}
      {hasAccretion && (
        <mesh ref={diskRef} rotation={[-Math.PI / 3, 0, 0]}>
          <ringGeometry args={[horizonRadius * 2.5, horizonRadius * 6.5, 48]} />
          <meshBasicMaterial
            color={visual.diskColor}
            transparent
            opacity={0.7}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* ── 4. Accretion Disk Illumination Point Light ── */}
      {hasAccretion && (
        <pointLight
          color={visual.diskColor}
          intensity={Math.max(0.5, visual.brightness * 3.0)}
          distance={250}
          decay={1.5}
        />
      )}

      {/* ── 5. Supernova Remnant Shell (if active) ── */}
      {deathState.supernova && deathState.supernova.lightCurveFraction > 0.001 && (
        <SupernovaVisual
          supernova={deathState.supernova}
          visualRadius={visual.envelopeVisualRadius}
        />
      )}

      {/* ── 6. Selection Highlight Ring ── */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[horizonRadius * 1.8, horizonRadius * 2.0, 48]} />
          <meshBasicMaterial color="#ff9900" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
