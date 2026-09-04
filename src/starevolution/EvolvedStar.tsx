/**
 * EvolvedStar.tsx
 * 3D Photosphere, convective pulsating envelope, and extended atmospheric wind for evolved stars.
 * Covers Subgiant, Red Giant, Helium-burning Horizontal Branch, AGB, and Supergiants.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StellarEvolutionProperties } from './StarEvolutionTypes';
import { deriveStarEvolutionVisualProperties } from './StarEvolutionVisuals';

interface EvolvedStarProps {
  star: StellarEvolutionProperties;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function EvolvedStar({
  star,
  isSelected = false,
  onSelect,
}: EvolvedStarProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const envelopeRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const visual = useMemo(() => deriveStarEvolutionVisualProperties(star), [star]);
  const baseRadius = visual.visualRadiusExploration;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    // Atmospheric convective pulsation
    const pulsation = 1.0 + Math.sin(t * 1.8) * visual.pulsationAmplitude;

    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.02;
      coreRef.current.scale.setScalar(pulsation);
    }

    if (envelopeRef.current) {
      envelopeRef.current.rotation.y = -t * 0.015;
      envelopeRef.current.scale.setScalar(pulsation * 1.25);
    }

    if (coronaRef.current) {
      coronaRef.current.quaternion.copy(state.camera.quaternion);
      coronaRef.current.scale.set(baseRadius * 3.5 * pulsation, baseRadius * 3.5 * pulsation, 1);
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
      {/* ── 1. Main Extended Photosphere ── */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[baseRadius, 32, 32]} />
        <meshBasicMaterial color={visual.hexColor} />
      </mesh>

      {/* ── 2. Semi-transparent Extended Convective Envelope / Wind Shell ── */}
      <mesh ref={envelopeRef}>
        <sphereGeometry args={[baseRadius, 24, 24]} />
        <meshBasicMaterial
          color={visual.coronaColor}
          transparent
          opacity={0.28}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 3. Giant Coronal Billboard Glow (Camera Facing) ── */}
      <mesh ref={coronaRef} scale={[baseRadius * 3.5, baseRadius * 3.5, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={visual.coronaColor}
          transparent
          opacity={0.45 * visual.brightness}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 4. High-Luminosity Point Light ── */}
      <pointLight
        color={visual.hexColor}
        intensity={Math.max(1.0, visual.brightness * 4.0)}
        distance={Math.max(300, baseRadius * 40)}
        decay={1.4}
      />

      {/* ── 5. Selection Highlight Ring ── */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[baseRadius * 1.4, baseRadius * 1.55, 48]} />
          <meshBasicMaterial color="#ffaa00" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
