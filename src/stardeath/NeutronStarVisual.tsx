/**
 * NeutronStarVisual.tsx
 * 3D Ultra-compact Neutron Star / Pulsar with rotating relativistic emission cones,
 * magnetic dipole loops, and optional Supernova remnant shell.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StellarDeathProperties } from './StarDeathTypes';
import { deriveStarDeathVisualProperties } from './StarDeathVisuals';
import { SupernovaVisual } from './SupernovaVisual';

interface NeutronStarVisualProps {
  deathState: StellarDeathProperties;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function NeutronStarVisual({
  deathState,
  isSelected = false,
  onSelect,
}: NeutronStarVisualProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const pulsarGroupRef = useRef<THREE.Group>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const visual = useMemo(() => deriveStarDeathVisualProperties(deathState), [deathState]);
  const radius = visual.visualRadiusExploration;
  const isPulsar = deathState.neutronStar?.isPulsar ?? false;
  const spinFreq = deathState.neutronStar?.spinFrequencyRadS ?? 20.0;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (pulsarGroupRef.current && isPulsar) {
      // Rotate pulsar beam around magnetic axis at actual spin frequency
      pulsarGroupRef.current.rotation.y = t * Math.min(25.0, Math.max(2.0, spinFreq * 0.1));
    }
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 2.0;
    }
    if (coronaRef.current) {
      coronaRef.current.quaternion.copy(state.camera.quaternion);
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
      {/* ── 1. Hyper-compact Nuclear Core ── */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color={visual.coreHexColor} />
      </mesh>

      {/* ── 2. Intense Synchrotron Corona (Camera Facing) ── */}
      <mesh ref={coronaRef} scale={[radius * 4.0, radius * 4.0, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={visual.glowColor}
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 3. Rotating Relativistic Pulsar Beams (if Pulsar) ── */}
      {isPulsar && (
        <group ref={pulsarGroupRef} rotation={[0.4, 0, 0.3]}>
          {/* North Relativistic Beam Cone */}
          <mesh position={[0, radius * 8, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[radius * 2.5, radius * 16, 16, 1, true]} />
            <meshBasicMaterial
              color="#99e6ff"
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* South Relativistic Beam Cone */}
          <mesh position={[0, -radius * 8, 0]}>
            <coneGeometry args={[radius * 2.5, radius * 16, 16, 1, true]} />
            <meshBasicMaterial
              color="#99e6ff"
              transparent
              opacity={0.4}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Magnetic Dipole Field Torus */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[radius * 3.5, radius * 0.15, 8, 32]} />
            <meshBasicMaterial
              color="#3399ff"
              transparent
              opacity={0.3}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
            />
          </mesh>
        </group>
      )}

      {/* ── 4. Radiation Point Light ── */}
      <pointLight
        color={visual.coreHexColor}
        intensity={Math.max(0.6, visual.brightness * 3.5)}
        distance={200}
        decay={1.5}
      />

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
          <ringGeometry args={[radius * 1.6, radius * 1.8, 48]} />
          <meshBasicMaterial color="#00ffcc" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
