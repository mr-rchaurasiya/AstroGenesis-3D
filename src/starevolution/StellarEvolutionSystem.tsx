/**
 * StellarEvolutionSystem.tsx
 * Interactive 3D Composite System for Phase 9 Stellar Evolution.
 * Evolving stars dynamically route between MainSequenceStar and EvolvedStar visual components.
 * Seamlessly integrates with useAppStore, CameraController, and NavigationManager.
 */

import { useState, useRef, useCallback } from 'react';
import { useFrame } from '@react-three/fiber';
import type { StellarEvolutionConfig, StellarEvolutionProperties } from './StarEvolutionTypes';
import { initializeStellarEvolution, advanceStellarEvolution } from './StellarEvolution';
import { MainSequenceStar } from './MainSequenceStar';
import { EvolvedStar } from './EvolvedStar';
import { useAppStore } from '../store/useAppStore';

interface StellarEvolutionSystemProps {
  configs?: StellarEvolutionConfig[];
  autoPlay?: boolean;
}

const DEFAULT_CONFIGS: StellarEvolutionConfig[] = [
  { id: 'star-evol-sun', name: 'Sol Analog (1.0 M☉)', initialMassSolar: 1.0, position: [0, 0, 0] },
  { id: 'star-evol-intermediate', name: 'Sirius Analog (2.0 M☉)', initialMassSolar: 2.0, position: [15, 0, -10] },
  { id: 'star-evol-massive', name: 'Betelgeuse Progenitor (10.0 M☉)', initialMassSolar: 10.0, position: [-25, 0, 15] },
  { id: 'star-evol-dwarf', name: 'Proxima Analog (0.2 M☉)', initialMassSolar: 0.2, position: [8, 0, 20] },
];

export function StellarEvolutionSystem({
  configs = DEFAULT_CONFIGS,
  autoPlay = true,
}: StellarEvolutionSystemProps) {
  const [stars, setStars] = useState<StellarEvolutionProperties[]>(() =>
    configs.map((c) => initializeStellarEvolution(c))
  );

  const selectedObject = useAppStore((s) => s.selectedObject);
  const setSelectedObject = useAppStore((s) => s.setSelectedObject);
  const timeScale = useAppStore((s) => s.timeScale);
  const isPaused = useAppStore((s) => s.isPaused);

  // Time accumulation in simulation years (1 second real time = 50,000,000 years at timeScale = 1)
  const simYearsRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Physics advancement step at controlled intervals
  useFrame((_, delta) => {
    if (isPaused || !autoPlay) return;

    // Time scaling: base 5.0e7 years per real second scaled by timeScale
    const yearsDelta = delta * 5.0e7 * Math.max(0.1, timeScale);
    simYearsRef.current += yearsDelta;

    // Advance physics when at least 1.0e6 years have accumulated
    if (simYearsRef.current - lastUpdateRef.current >= 1.0e6) {
      lastUpdateRef.current = simYearsRef.current;
      setStars((prevStars) =>
        prevStars.map((star) => advanceStellarEvolution(star, simYearsRef.current))
      );
    }
  });

  const handleSelectStar = useCallback((star: StellarEvolutionProperties) => {
    setSelectedObject({
      id: star.id,
      name: star.name,
      type: 'star',
      position: star.position,
      data: {
        stage: star.stage,
        ageYears: star.ageYears,
        initialMassSolar: star.initialMassSolar,
        currentMassSolar: star.currentMassSolar,
        luminositySolar: star.luminositySolar,
        radiusSolar: star.radiusSolar,
        effectiveTemperatureK: star.effectiveTemperatureK,
        coreTemperatureK: star.coreTemperatureK,
        coreDensityKgM3: star.coreDensityKgM3,
        coreHydrogenFraction: star.coreHydrogenFraction,
        coreHeliumFraction: star.coreHeliumFraction,
        spectralClass: star.fullSpectralDesignation,
        luminosityClass: star.luminosityClass,
        evolutionFraction: star.evolutionFraction,
        massLossRateSolarPerYear: star.massLossRateSolarPerYear,
      },
    });
  }, [setSelectedObject]);

  return (
    <group name="StellarEvolutionSystem">
      {stars.map((star) => {
        const isSelected = selectedObject?.id === star.id;
        const isMS = star.isMainSequence;

        return isMS ? (
          <MainSequenceStar
            key={star.id}
            star={star}
            isSelected={isSelected}
            onSelect={() => handleSelectStar(star)}
          />
        ) : (
          <EvolvedStar
            key={star.id}
            star={star}
            isSelected={isSelected}
            onSelect={() => handleSelectStar(star)}
          />
        );
      })}
    </group>
  );
}
