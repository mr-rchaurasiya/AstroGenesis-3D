/**
 * ProtostellarJetsVisual.tsx
 * Bipolar collimated Herbig-Haro jet plumes and energetic outflow visual rendering.
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { ProtostellarJetProperties } from './StarBirthTypes';

interface ProtostellarJetsVisualProps {
  jets: ProtostellarJetProperties;
  jetColor?: string;
}

export function ProtostellarJetsVisual({
  jets,
  jetColor = '#80d4ff',
}: ProtostellarJetsVisualProps) {
  const topJetRef = useRef<THREE.Mesh>(null);
  const bottomJetRef = useRef<THREE.Mesh>(null);

  const isVisible = jets.activity > 0.01;
  const jetLength = Math.max(2.0, Math.min(30.0, jets.lengthAU * 0.05));
  const jetRadius = Math.max(0.1, jetLength * 0.04);
  const opacity = Math.min(0.85, jets.activity * 0.9);

  useFrame((state) => {
    if (!isVisible) return;
    const time = state.clock.getElapsedTime();
    // Dynamic pulsing of jet emission
    const pulse = 1.0 + 0.15 * Math.sin(time * 8.0);
    if (topJetRef.current) {
      topJetRef.current.scale.set(pulse, 1.0, pulse);
    }
    if (bottomJetRef.current) {
      bottomJetRef.current.scale.set(pulse, 1.0, pulse);
    }
  });

  if (!isVisible) {
    return null;
  }

  return (
    <group>
      {/* ── 1. North Bipolar Jet Lobe ── */}
      <mesh
        ref={topJetRef}
        position={[0, jetLength / 2.0 + 0.5, 0]}
      >
        <cylinderGeometry args={[jetRadius * 1.8, jetRadius * 0.4, jetLength, 16]} />
        <meshBasicMaterial
          color={jetColor}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* ── 2. South Bipolar Jet Lobe ── */}
      <mesh
        ref={bottomJetRef}
        position={[0, -jetLength / 2.0 - 0.5, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <cylinderGeometry args={[jetRadius * 1.8, jetRadius * 0.4, jetLength, 16]} />
        <meshBasicMaterial
          color={jetColor}
          transparent
          opacity={opacity}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
