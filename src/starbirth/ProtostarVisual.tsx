/**
 * ProtostarVisual.tsx
 * Photosphere, coronal halo, and emission light source for a developing protostar.
 * Integrates accretion disk and bipolar jets visually.
 */

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ProtostarProperties } from './StarBirthTypes';
import { deriveProtostarVisualProperties } from './StarBirthVisuals';
import { AccretionDiskVisual } from './AccretionDiskVisual';
import { ProtostellarJetsVisual } from './ProtostellarJetsVisual';

interface ProtostarVisualProps {
  protostar: ProtostarProperties;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function ProtostarVisual({
  protostar,
  isSelected = false,
  onSelect,
}: ProtostarVisualProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const visual = useMemo(() => deriveProtostarVisualProperties(protostar), [protostar]);

  const radius = visual.visualRadiusExploration;

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.05;
    }
  });

  return (
    <group position={protostar.position} onClick={(e) => { e.stopPropagation(); onSelect?.(); }}>
      {/* ── 1. Central Photospheric Core ── */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[radius, 32, 32]} />
        <meshBasicMaterial color={visual.hexColor} />
      </mesh>

      {/* ── 2. Coronal Atmospheric Glow ── */}
      <mesh scale={[radius * 2.2, radius * 2.2, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color={visual.coronaColor}
          transparent
          opacity={0.4 * visual.brightness}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 3. Accretion Shock & Protostellar Point Light Illumination ── */}
      <pointLight
        color={visual.hexColor}
        intensity={Math.max(0.5, visual.brightness * 3.0)}
        distance={200}
        decay={1.5}
      />

      {/* ── 4. Circumstellar Accretion Disk ── */}
      <AccretionDiskVisual
        disk={protostar.disk}
        innerColor={visual.diskInnerColor}
        outerColor={visual.diskOuterColor}
      />

      {/* ── 5. Bipolar Protostellar Jets ── */}
      <ProtostellarJetsVisual
        jets={protostar.jets}
        jetColor={visual.jetColor}
      />

      {/* ── 6. Selection Highlight Ring ── */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.5, radius * 1.65, 48]} />
          <meshBasicMaterial color="#64ffda" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
