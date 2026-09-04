/**
 * WhiteDwarfVisual.tsx
 * 3D Ultra-compact degenerate White Dwarf photosphere, intense coronal glow,
 * and optional surrounding Planetary Nebula overlay.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { StellarDeathProperties } from './StarDeathTypes';
import { deriveStarDeathVisualProperties } from './StarDeathVisuals';
import { PlanetaryNebulaVisual } from './PlanetaryNebulaVisual';

interface WhiteDwarfVisualProps {
  deathState: StellarDeathProperties;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function WhiteDwarfVisual({
  deathState,
  isSelected = false,
  onSelect,
}: WhiteDwarfVisualProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const coronaRef = useRef<THREE.Mesh>(null);

  const visual = useMemo(() => deriveStarDeathVisualProperties(deathState), [deathState]);
  const radius = visual.visualRadiusExploration;

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (coreRef.current) {
      coreRef.current.rotation.y = t * 0.05;
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
      {/* ── 1. Compact Photospheric Core ── */}
      <mesh ref={coreRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color={visual.coreHexColor} />
      </mesh>

      {/* ── 2. High-Temperature Intense Coronal Halo (Camera Facing) ── */}
      <mesh ref={coronaRef} scale={[radius * 3.2, radius * 3.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={visual.glowColor}
          transparent
          opacity={0.45 * visual.brightness}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 3. Central White Dwarf Point Light ── */}
      <pointLight
        color={visual.coreHexColor}
        intensity={Math.max(0.4, visual.brightness * 2.5)}
        distance={150}
        decay={1.6}
      />

      {/* ── 4. Planetary Nebula Envelope (if present) ── */}
      {deathState.planetaryNebula && deathState.planetaryNebula.visibilityFraction > 0.01 && (
        <PlanetaryNebulaVisual
          nebula={deathState.planetaryNebula}
          whiteDwarf={deathState.whiteDwarf}
          visualRadius={visual.envelopeVisualRadius}
        />
      )}

      {/* ── 5. Selection Highlight Ring ── */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 1.65, 48]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
