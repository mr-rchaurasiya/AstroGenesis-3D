/**
 * StellarDeathSystem.tsx
 * Interactive 3D Composite System for Phase 10 Stellar Death & Compact Remnants.
 * Routes between WhiteDwarfVisual, NeutronStarVisual, and BlackHoleVisual.
 * Seamlessly integrates with useAppStore, CameraController, and NavigationManager.
 */

import { useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import type { StellarDeathConfig, StellarDeathProperties } from './StarDeathTypes';
import { initializeStellarDeath, advanceStellarDeath } from './StellarDeath';
import { WhiteDwarfVisual } from './WhiteDwarfVisual';
import { NeutronStarVisual } from './NeutronStarVisual';
import { BlackHoleVisual } from './BlackHoleVisual';
import { useAppStore } from '../store/useAppStore';

interface StellarDeathSystemProps {
  configs?: StellarDeathConfig[];
  autoPlay?: boolean;
}

const DEFAULT_CONFIGS: StellarDeathConfig[] = [
  { id: 'remnant-sun-wd', name: 'Sol White Dwarf Remnant', initialMassSolar: 1.0, initialDeathAgeYears: 1000, position: [0, 0, 0] },
  { id: 'remnant-sirius-wd', name: 'Sirius B Analog', initialMassSolar: 2.0, initialDeathAgeYears: 5000, position: [20, 0, -15] },
  { id: 'remnant-crab-ns', name: 'Crab Pulsar Remnant', initialMassSolar: 10.0, initialDeathAgeYears: 1000, position: [-25, 0, 20] },
  { id: 'remnant-cyg-bh', name: 'Cygnus X-1 Black Hole', initialMassSolar: 30.0, initialDeathAgeYears: 50000, position: [10, 0, 30] },
];

export function StellarDeathSystem({
  configs = DEFAULT_CONFIGS,
  autoPlay = true,
}: StellarDeathSystemProps) {
  const [remnants, setRemnants] = useState<StellarDeathProperties[]>(() =>
    configs.map((c) => initializeStellarDeath(c))
  );

  const selectedObject = useAppStore((s) => s.selectedObject);
  const setSelectedObject = useAppStore((s) => s.setSelectedObject);
  const timeScale = useAppStore((s) => s.timeScale);
  const isPaused = useAppStore((s) => s.isPaused);

  // Time accumulation in death simulation years (1 real second = 10,000 years at timeScale = 1)
  const simYearsRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Physics advancement step
  useFrame((_, delta) => {
    if (isPaused || !autoPlay) return;

    // Time scaling: base 1.0e4 years per real second scaled by timeScale
    const yearsDelta = delta * 1.0e4 * Math.max(0.1, timeScale);
    simYearsRef.current += yearsDelta;

    // Advance physics when at least 500 simulation years accumulate
    if (simYearsRef.current - lastUpdateRef.current >= 500.0) {
      lastUpdateRef.current = simYearsRef.current;
      setRemnants((prevRemnants) =>
        prevRemnants.map((r) => advanceStellarDeath(r, r.deathAgeYears + yearsDelta))
      );
    }
  });

  const handleSelectRemnant = useCallback((remnant: StellarDeathProperties) => {
    setSelectedObject({
      id: remnant.id,
      name: remnant.name,
      type: 'star',
      position: remnant.position,
      data: {
        remnantType: remnant.remnantType,
        stage: remnant.stage,
        deathAgeYears: remnant.deathAgeYears,
        progenitorInitialMassSolar: remnant.progenitorInitialMassSolar,
        currentMassSolar: remnant.currentMassSolar,
        luminositySolar: remnant.luminositySolar,
        radiusSolar: remnant.radiusSolar,
        effectiveTemperatureK: remnant.effectiveTemperatureK,
        spectralClass: remnant.fullSpectralDesignation,
        schwarzschildRadiusKm: remnant.blackHole?.schwarzschildRadiusKm,
        pulsarPeriodMs: remnant.neutronStar ? remnant.neutronStar.spinPeriodSeconds * 1000 : undefined,
        nebulaRadiusAU: remnant.planetaryNebula?.nebulaRadiusAU,
      },
    });
  }, [setSelectedObject]);

  return (
    <group name="StellarDeathSystem">
      {remnants.map((remnant) => {
        const isSelected = selectedObject?.id === remnant.id;

        switch (remnant.remnantType) {
          case 'WHITE_DWARF':
            return (
              <WhiteDwarfVisual
                key={remnant.id}
                deathState={remnant}
                isSelected={isSelected}
                onSelect={() => handleSelectRemnant(remnant)}
              />
            );

          case 'NEUTRON_STAR':
            return (
              <NeutronStarVisual
                key={remnant.id}
                deathState={remnant}
                isSelected={isSelected}
                onSelect={() => handleSelectRemnant(remnant)}
              />
            );

          case 'BLACK_HOLE':
            return (
              <BlackHoleVisual
                key={remnant.id}
                deathState={remnant}
                isSelected={isSelected}
                onSelect={() => handleSelectRemnant(remnant)}
              />
            );

          default:
            return null;
        }
      })}
    </group>
  );
}
