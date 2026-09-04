/**
 * GalacticNeighborhood.tsx
 * 3D structural visual cues and orbital reference markers for Milky Way regions.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { MILKY_WAY_REGIONS } from './MilkyWayConfig';
import type { MilkyWayRegionId } from './MilkyWayTypes';

interface GalacticNeighborhoodProps {
  sceneRadius: number;
  visible?: boolean;
  selectedRegionId?: MilkyWayRegionId | null;
  onSelectRegion?: (id: MilkyWayRegionId) => void;
}

export function GalacticNeighborhood({
  sceneRadius,
  visible = true,
  selectedRegionId,
  onSelectRegion,
}: GalacticNeighborhoodProps) {
  const guideRef = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (guideRef.current) {
      guideRef.current.rotation.y += delta * 0.005;
    }
  });

  if (!visible) return null;

  // Solar orbit reference radius (~8.0 kpc mapped to visual radius)
  const solarOrbitRadius = (8.0 / 15.0) * sceneRadius;

  return (
    <group ref={guideRef}>
      {/* ── Solar Circle (R_0 ~ 8.0 kpc Galactic Orbit) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[solarOrbitRadius - 0.15, solarOrbitRadius + 0.15, 64]} />
        <meshBasicMaterial
          color="#ffb74d"
          transparent
          opacity={0.22}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Outer Disk Boundary Ring (R ~ 15 kpc) ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[sceneRadius - 0.2, sceneRadius + 0.2, 64]} />
        <meshBasicMaterial
          color="#4fc3f7"
          transparent
          opacity={0.12}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── Region Markers ── */}
      {MILKY_WAY_REGIONS.map((region) => {
        const isSelected = selectedRegionId === region.id;
        const [px, py, pz] = region.apparentPosition;

        return (
          <group key={region.id} position={[px, py, pz]}>
            <mesh
              onClick={(e) => {
                e.stopPropagation();
                onSelectRegion?.(region.id);
              }}
            >
              <sphereGeometry args={[isSelected ? 1.0 : 0.65, 12, 12]} />
              <meshBasicMaterial
                color={isSelected ? '#64ffda' : '#80deea'}
                transparent
                opacity={isSelected ? 0.95 : 0.45}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}
