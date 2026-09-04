/**
 * HeliumBurning.ts
 * Core Helium Burning phase (Horizontal Branch / Red Clump / Blue Loop).
 * Models triple-alpha helium fusion, core expansion, envelope contraction, and carbon-oxygen accumulation.
 */

import {
  massToMainSequenceLuminosity,
  massToMainSequenceRadius,
  stefanBoltzmannTemperature,
} from '../stellar/StellarPhysics';
import {
  calculateHeliumBurningCoreComposition,
  calculateCoreThermodynamics,
} from './CoreEvolution';
import type { StellarEvolutionStage } from './StarEvolutionTypes';

export interface HeliumBurningState {
  luminositySolar: number;
  radiusSolar: number;
  effectiveTemperatureK: number;
  coreTemperatureK: number;
  coreDensityKgM3: number;
  coreHydrogenFraction: number;
  coreHeliumFraction: number;
  coreCarbonOxygenFraction: number;
  coreMassSolar: number;
  stage: StellarEvolutionStage;
}

/**
 * Calculates physical properties during the Core Helium Burning phase.
 *
 * @param initialMassSolar - Initial star mass in M_☉
 * @param heBurningProgress - Normalized progress of core helium burning (0.0 = ignition, 1.0 = exhaustion)
 * @returns HeliumBurningState
 */
export function calculateHeliumBurningState(
  initialMassSolar: number,
  heBurningProgress: number,
): HeliumBurningState {
  const M = Math.max(0.08, isFinite(initialMassSolar) ? initialMassSolar : 1.0);
  const tau = Math.max(0, Math.min(1.0, isFinite(heBurningProgress) ? heBurningProgress : 0));

  const zamsLuminosity = massToMainSequenceLuminosity(M);
  const zamsRadius = massToMainSequenceRadius(M);

  const isMassive = M >= 8.0;
  const stage: StellarEvolutionStage = tau < 0.05 ? 'HELIUM_IGNITION' : 'HELIUM_BURNING';

  let luminositySolar: number;
  let radiusSolar: number;

  if (isMassive) {
    // Massive star Blue/Yellow supergiant loop
    luminositySolar = zamsLuminosity * 2.2;
    // Radius contracts slightly from red supergiant maximum during core helium burning
    radiusSolar = zamsRadius * (15.0 + 10.0 * Math.sin(tau * Math.PI));
  } else {
    // Low/intermediate mass Horizontal Branch / Red Clump:
    // Typical stable helium burning luminosity: ~40–100 L_☉ for 1 M_☉ star
    luminositySolar = Math.max(45.0, 50.0 * Math.pow(M, 0.7));
    // Envelope contracts substantially from RGB tip (from ~150 R_☉ down to ~10-15 R_☉)
    radiusSolar = Math.max(8.0, 12.0 * Math.pow(M, 0.35) * (1.0 + 0.2 * Math.sin(tau * Math.PI)));
  }

  // Effective temperature increases as star moves leftward onto Horizontal Branch / Red Clump (~4500–5500 K)
  const effectiveTemperatureK = stefanBoltzmannTemperature(luminositySolar, radiusSolar);

  // Core composition (He -> C/O)
  const { coreHydrogenFraction, coreHeliumFraction, coreCarbonOxygenFraction } =
    calculateHeliumBurningCoreComposition(tau);

  const coreMassSolar = isMassive ? M * 0.40 : Math.min(M * 0.65, 0.45 + 0.10 * tau);

  const { coreTemperatureK, coreDensityKgM3 } = calculateCoreThermodynamics(
    M,
    zamsRadius,
    stage,
    tau,
  );

  return {
    luminositySolar,
    radiusSolar,
    effectiveTemperatureK,
    coreTemperatureK,
    coreDensityKgM3,
    coreHydrogenFraction,
    coreHeliumFraction,
    coreCarbonOxygenFraction,
    coreMassSolar,
    stage,
  };
}
