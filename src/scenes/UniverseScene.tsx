import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { StarfieldSystem } from '../systems/StarfieldSystem';
import { UniverseEnvironment } from '../environment/UniverseEnvironment';
import { GalaxySystem } from '../galaxy/GalaxySystem';
import { MilkyWaySystem } from '../milkyway/MilkyWaySystem';
import { SolarSystemSystem } from '../solarsystem/SolarSystemSystem';
import { createDefaultMilkyWayModel } from '../milkyway/milkyWayPresets';
import { useAppStore } from '../store/useAppStore';

export function UniverseScene() {
  const groupRef = useRef<THREE.Group>(null);
  const isMilkyWayMode = useAppStore((s) => s.isMilkyWayMode);
  const isSolarSystemMode = useAppStore((s) => s.isSolarSystemMode);
  const setSelectedMilkyWayRegion = useAppStore((s) => s.setSelectedMilkyWayRegion);

  // Initialize Milky Way model once
  const milkyWayModel = useMemo(() => {
    return createDefaultMilkyWayModel(54321);
  }, []);

  // Very slow ambient rotation for deep cosmological parallax
  useFrame((_state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.0001;
    }
  });

  return (
    <group ref={groupRef}>
      {/* ── 1. Multi-Layer GPU Starfield (Nearby, Mid, Distant, Deep Horizon) ── */}
      <StarfieldSystem seed={12345} />

      {/* ── 2. Universe Environment Layers (Dust, Nebulae, Distant Background Galaxies, Cosmic Web) ── */}
      <UniverseEnvironment />

      {/* ── 3. Interactive Procedural Galaxy System & Population (Phase 3) ── */}
      {!isMilkyWayMode && !isSolarSystemMode && <GalaxySystem />}

      {/* ── 4. Specialized Milky Way System (Phase 4) ── */}
      {isMilkyWayMode && !isSolarSystemMode && (
        <MilkyWaySystem
          model={milkyWayModel}
          onSelectSolarAnchor={() => setSelectedMilkyWayRegion('solar-neighborhood')}
          onSelectRegion={(r) => setSelectedMilkyWayRegion(r)}
        />
      )}

      {/* ── 5. Detailed Scientific Solar System Simulation (Phase 5) ── */}
      {isSolarSystemMode && <SolarSystemSystem />}
    </group>
  );
}
