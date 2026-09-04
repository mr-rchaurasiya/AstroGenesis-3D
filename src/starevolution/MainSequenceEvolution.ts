/**
 * MainSequenceEvolution.ts
 * Deterministic Main Sequence stellar evolution model:
 * Luminosity brightening, radius expansion, effective temperature shifts,
 * metallicity opacity modulation, and core hydrogen depletion progression.
 */

import {
  massToMainSequenceLuminosity,
  massToMainSequenceRadius,
  stefanBoltzmannTemperature,
} from '../stellar/StellarPhysics';
import { calculateMainSequenceLifetime } from '../stellar/StellarLifetime';
import { calculateMainSequenceCoreComposition, calculateCoreThermodynamics } from './CoreEvolution';
import type { StellarEvolutionStage } from './StarEvolutionTypes';

export interface MainSequenceState {
  luminositySolar: number;
  radiusSolar: number;
  effectiveTemperatureK: number;
  coreTemperatureK: number;
  coreDensityKgM3: number;
  coreHydrogenFraction: number;
  coreHeliumFraction: number;
  evolutionFraction: number;
  mainSequenceLifetimeYears: number;
  stage: StellarEvolutionStage;
}

/**
 * Calculates the complete physical state of a star during its Main Sequence evolution.
 *
 * @param initialMassSolar - Initial ZAMS star mass in M_☉
 * @param ageYears - Current star age in Earth years
 * @param metallicityFeH - Metallicity [Fe/H] (default: 0.0)
 * @param initialX - Initial hydrogen mass fraction (default: ~0.7381)
 * @param initialY - Initial helium mass fraction (default: ~0.2485)
 * @returns MainSequenceState
 */
export function calculateMainSequenceState(
  initialMassSolar: number,
  ageYears: number,
  metallicityFeH: number = 0.0,
  initialX: number = 0.7381,
  initialY: number = 0.2485,
): MainSequenceState {
  const M = Math.max(0.08, isFinite(initialMassSolar) ? initialMassSolar : 1.0);
  const age = Math.max(0, isFinite(ageYears) ? ageYears : 0);
  const feH = isFinite(metallicityFeH) ? metallicityFeH : 0.0;

  // 1. Base ZAMS properties from Phase 7 physics with metallicity opacity scaling
  // Low metallicity -> lower atmospheric opacity -> slightly smaller radius & higher effective temperature
  const zamsBaseLum = massToMainSequenceLuminosity(M);
  const zamsBaseRad = massToMainSequenceRadius(M);

  const zamsLuminosity = zamsBaseLum * Math.pow(10, -0.06 * feH);
  const zamsRadius = zamsBaseRad * Math.pow(10, 0.04 * feH);
  const msLifetimeYears = calculateMainSequenceLifetime(M, zamsLuminosity);

  // 2. Normalized Main Sequence progress fraction (0.0 = ZAMS, 1.0 = H-exhaustion)
  const evolutionFraction = Math.min(1.0, age / msLifetimeYears);

  // 3. Luminosity Evolution during Main Sequence
  // Standard solar model / stellar physics: star brightens gradually by 30-80% as mean molecular weight increases
  const lumBoostCoeff = M >= 2.0 ? 0.65 : 0.40;
  const luminositySolar = Math.max(
    1e-10,
    zamsLuminosity * (1.0 + lumBoostCoeff * evolutionFraction + 0.20 * Math.pow(evolutionFraction, 2)),
  );

  // 4. Radius Evolution during Main Sequence
  // Envelope expands gradually by 25-50% on MS
  const radiusBoostCoeff = M >= 2.0 ? 0.45 : 0.30;
  const radiusSolar = Math.max(
    1e-5,
    zamsRadius * (1.0 + radiusBoostCoeff * evolutionFraction + 0.25 * Math.pow(evolutionFraction, 3)),
  );

  // 5. Effective Surface Photospheric Temperature (Stefan-Boltzmann Law)
  const effectiveTemperatureK = stefanBoltzmannTemperature(luminositySolar, radiusSolar);

  // 6. Core Composition & Thermodynamics
  const { coreHydrogenFraction, coreHeliumFraction } = calculateMainSequenceCoreComposition(
    initialX,
    initialY,
    evolutionFraction,
  );

  const stage: StellarEvolutionStage =
    evolutionFraction >= 0.95
      ? 'HYDROGEN_DEPLETION'
      : evolutionFraction < 0.05
      ? 'ZERO_AGE_MAIN_SEQUENCE'
      : 'MAIN_SEQUENCE';

  const { coreTemperatureK, coreDensityKgM3 } = calculateCoreThermodynamics(
    M,
    zamsRadius,
    stage,
    evolutionFraction,
  );

  return {
    luminositySolar,
    radiusSolar,
    effectiveTemperatureK,
    coreTemperatureK,
    coreDensityKgM3,
    coreHydrogenFraction,
    coreHeliumFraction,
    evolutionFraction,
    mainSequenceLifetimeYears: msLifetimeYears,
    stage,
  };
}
