/**
 * @file SolarSystemSystem.tsx
 * @description Master coordinator for Phase 5 Solar System simulation.
 * Renders the Sun, 8 planets, moon systems, asteroid belt, Kuiper belt, dwarf planets, and comets.
 */

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import {
  PLANETS_DATA,
  DWARF_PLANETS_DATA,
} from './SolarSystemConfig';
import type { ScaleMode } from './SolarSystemTypes';
import { Sun } from './Sun';
import { Planet } from './Planet';
import { AsteroidBelt } from './AsteroidBelt';
import { KuiperBelt } from './KuiperBelt';
import { CometSystem } from './CometSystem';
import { useAppStore } from '../store/useAppStore';

interface SolarSystemSystemProps {
  scaleMode?: ScaleMode;
}

export const SolarSystemSystem: React.FC<SolarSystemSystemProps> = ({
  scaleMode: propScaleMode,
}) => {
  const groupRef = useRef<THREE.Group>(null);

  // App store state
  const isSolarSystemMode = useAppStore((s) => s.isSolarSystemMode);
  const storeScaleMode = useAppStore((s) => s.solarScaleMode);
  const showOrbitLines = useAppStore((s) => s.showOrbitLines);
  const showAsteroidBelt = useAppStore((s) => s.showAsteroidBelt);
  const showKuiperBelt = useAppStore((s) => s.showKuiperBelt);
  const showComets = useAppStore((s) => s.showComets);
  const selectedBodyId = useAppStore((s) => s.selectedSolarBodyId);
  const selectSolarBody = useAppStore((s) => s.selectSolarBody);
  const advanceSimulationTime = useAppStore((s) => s.advanceSolarSimulationTime);

  const activeScaleMode: ScaleMode = propScaleMode || storeScaleMode || 'exploration';

  // Advance simulation clock on each frame
  useFrame((_, delta) => {
    if (isSolarSystemMode && !useAppStore.getState().isSolarSimulationPaused) {
      const timeScale = useAppStore.getState().solarTimeScale;
      advanceSimulationTime(delta * timeScale);
    }
  });

  if (!isSolarSystemMode) {
    return null;
  }

  return (
    <group ref={groupRef} name="SolarSystemCoordinator">
      {/* 1. CENTRAL SUN & PRIMARY ILLUMINATION */}
      <Sun
        scaleMode={activeScaleMode}
        onSelect={() => selectSolarBody('sun')}
        isSelected={selectedBodyId === 'sun'}
      />

      {/* 2. THE 8 PLANETARY SYSTEMS */}
      {PLANETS_DATA.map((planet) => (
        <Planet
          key={planet.id}
          planet={planet}
          scaleMode={activeScaleMode}
          onSelect={(body) => selectSolarBody(body.id)}
          selectedBodyId={selectedBodyId}
          showOrbitLine={showOrbitLines}
        />
      ))}

      {/* 3. DWARF PLANETS */}
      {DWARF_PLANETS_DATA.map((dwarf) => (
        <Planet
          key={dwarf.id}
          planet={dwarf}
          scaleMode={activeScaleMode}
          onSelect={(body) => selectSolarBody(body.id)}
          selectedBodyId={selectedBodyId}
          showOrbitLine={showOrbitLines}
        />
      ))}

      {/* 4. MAIN ASTEROID BELT (2.1 - 3.3 AU) */}
      <AsteroidBelt
        scaleMode={activeScaleMode}
        visible={showAsteroidBelt}
      />

      {/* 5. KUIPER BELT (30 - 52 AU) */}
      <KuiperBelt
        scaleMode={activeScaleMode}
        visible={showKuiperBelt}
      />

      {/* 6. COMETS (Halley, Encke, Hale-Bopp, etc.) */}
      {showComets && (
        <CometSystem
          scaleMode={activeScaleMode}
          onSelect={(id) => selectSolarBody(id)}
          selectedId={selectedBodyId}
        />
      )}
    </group>
  );
};
