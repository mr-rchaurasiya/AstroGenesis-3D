/**
 * PostMainSequence.ts
 * Subgiant branch modeling, hydrogen-shell burning transitions,
 * and early envelope expansion dynamics.
 */

import {
  massToMainSequenceLuminosity,
  massToMainSequenceRadius,
  stefanBoltzmannTemperature,
} from '../stellar/StellarPhysics';
import { calculateCoreThermodynamics } from './CoreEvolution';
import type { StellarEvolutionStage } from './StarEvolutionTypes';

export interface PostMainSequenceState {
  luminositySolar: number;
  radiusSolar: number;
  effectiveTemperatureK: number;
  coreTemperatureK: number;
  coreDensityKgM3: number;
  coreHydrogenFraction: number;
  coreHeliumFraction: number;
  coreMassSolar: number;
  stage: StellarEvolutionStage;
}

/**
 * Calculates stellar physical properties during the Subgiant phase.
 *
 * @param initialMassSolar - Initial star mass in M_☉
 * @param subgiantProgress - Normalized progress through the subgiant branch (0.0 = MS turnoff, 1.0 = base of RGB)
 * @returns PostMainSequenceState
 */
export function calculateSubgiantState(
  initialMassSolar: number,
  subgiantProgress: number,
): PostMainSequenceState {
  const M = Math.max(0.08, isFinite(initialMassSolar) ? initialMassSolar : 1.0);
  const tau = Math.max(0, Math.min(1.0, isFinite(subgiantProgress) ? subgiantProgress : 0));

  const zamsLuminosity = massToMainSequenceLuminosity(M);
  const zamsRadius = massToMainSequenceRadius(M);

  // Subgiant luminosity: increases by 1.5x to 3x depending on stellar mass
  const lumMultiplier = M >= 2.0 ? 2.8 : 1.8;
  const luminositySolar = zamsLuminosity * (1.4 + (lumMultiplier - 1.4) * tau);

  // Subgiant radius: envelope expands by 2.0x to 5.0x
  const radiusMultiplier = M >= 2.0 ? 5.5 : 3.2;
  const radiusSolar = zamsRadius * (1.5 + (radiusMultiplier - 1.5) * Math.pow(tau, 1.2));

  // Effective temperature drops as envelope expands (Stefan-Boltzmann)
  const effectiveTemperatureK = stefanBoltzmannTemperature(luminositySolar, radiusSolar);

  // Helium core mass grows via hydrogen shell burning
  const coreMassSolar = M * (0.10 + 0.05 * tau);

  const { coreTemperatureK, coreDensityKgM3 } = calculateCoreThermodynamics(
    M,
    zamsRadius,
    'SUBGIANT',
    tau,
  );

  return {
    luminositySolar,
    radiusSolar,
    effectiveTemperatureK,
    coreTemperatureK,
    coreDensityKgM3,
    coreHydrogenFraction: 0.0,
    coreHeliumFraction: 1.0,
    coreMassSolar,
    stage: 'SUBGIANT',
  };
}
