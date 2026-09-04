/**
 * UniverseEnvironment.tsx
 * Master coordinator component for all Phase 2 Universe Environment layers.
 *
 * Coordinates:
 * - Layered Cosmic Dust clouds (CosmicDust.tsx)
 * - Multi-type procedural Nebular complexes (NebulaEnvironment.tsx)
 * - Deep background Galaxies (DistantGalaxies.tsx)
 * - Large-scale structure filaments (CosmicWeb.tsx)
 * - Subtle ambient cosmic background glow
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CosmicDust } from './CosmicDust';
import { NebulaEnvironment } from './NebulaEnvironment';
import { DistantGalaxies } from './DistantGalaxies';
import { CosmicWeb } from './CosmicWeb';

export function UniverseEnvironment() {
  const envGroupRef = useRef<THREE.Group>(null);

  // Very slow environmental drift gives realistic cosmic time sensation
  useFrame((_state, delta) => {
    if (envGroupRef.current) {
      envGroupRef.current.rotation.y += delta * 0.00008;
    }
  });

  return (
    <group ref={envGroupRef}>
      {/* 1. Deep Cosmic Web Filaments (Large-scale structure: 3500–6500 units) */}
      <CosmicWeb seed={333} />

      {/* 2. Distant Background Galaxies (Deep horizon: 3500–7500 units) */}
      <DistantGalaxies seed={555} />

      {/* 3. Volumetric Nebular Complexes (Mid-to-far field: 400–1800 units) */}
      <NebulaEnvironment seed={999} />

      {/* 4. Interstellar Cosmic Dust Absorption Lanes (Mid field: 250–1800 units) */}
      <CosmicDust seed={777} />

      {/* 5. Deep Space Ambient Illumination */}
      <ambientLight intensity={0.02} color="#0c1626" />
      <directionalLight
        position={[400, 300, -800]}
        intensity={0.025}
        color="#cce0ff"
      />
    </group>
  );
}
