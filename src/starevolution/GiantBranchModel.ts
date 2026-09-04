/**
 * GiantBranchModel.ts
 * Red Giant Branch (RGB), Asymptotic Giant Branch (AGB), and massive star Supergiant models.
 * Calculates convective Hayashi track envelope expansion, luminosity surge, and surface cooling.
 */

import {
  massToMainSequenceLuminosity,
  massToMainSequenceRadius,
  stefanBoltzmannTemperature,
} from '../stellar/StellarPhysics';
import { calculateCoreThermodynamics } from './CoreEvolution';
import type { StellarEvolutionStage } from './StarEvolutionTypes';

export interface GiantBranchState {
  luminositySolar: number;
  radiusSolar: number;
  effectiveTemperatureK: number;
  coreTemperatureK: number;
  coreDensityKgM3: number;
  coreMassSolar: number;
  stage: StellarEvolutionStage;
}

/**
 * Calculates stellar physical properties during the Red Giant or Supergiant phase.
 *
 * @param initialMassSolar - Initial star mass in M_☉
 * @param rgbProgress - Normalized progress along the giant branch (0.0 = base of RGB, 1.0 = tip of RGB)
 * @param isAGB - Whether the star is on the Asymptotic Giant Branch (post-helium)
 * @returns GiantBranchState
 */
export function calculateGiantState(
  initialMassSolar: number,
  rgbProgress: number,
  isAGB: boolean = false,
): GiantBranchState {
  const M = Math.max(0.08, isFinite(initialMassSolar) ? initialMassSolar : 1.0);
  const tau = Math.max(0, Math.min(1.0, isFinite(rgbProgress) ? rgbProgress : 0));

  const zamsLuminosity = massToMainSequenceLuminosity(M);
  const zamsRadius = massToMainSequenceRadius(M);

  const isMassive = M >= 8.0;
  const stage: StellarEvolutionStage = isMassive
    ? 'SUPERGIANT'
    : isAGB
    ? 'ASYMPTOTIC_GIANT_BRANCH'
    : 'RED_GIANT';

  let luminositySolar: number;
  let radiusSolar: number;

  if (isMassive) {
    // Massive Supergiant: extreme luminosity & massive envelope
    const maxLumMultiplier = 2.5 + 0.5 * (M / 10.0);
    luminositySolar = zamsLuminosity * (1.8 + (maxLumMultiplier - 1.8) * Math.pow(tau, 0.8));

    // Supergiant radius: expands up to 500-1000 R_☉
    const maxRadius = Math.min(1200.0, 50.0 * Math.pow(M, 1.1));
    radiusSolar = zamsRadius * 5.0 + (maxRadius - zamsRadius * 5.0) * Math.pow(tau, 1.3);
  } else {
    // Low / Intermediate mass Red Giant (RGB or AGB)
    // Peak RGB tip luminosity: ~1000–3000 L_☉ for Sun-like stars; AGB reaches up to ~5000–10000 L_☉
    const peakLum = isAGB ? Math.max(2000.0, 4000.0 * Math.pow(M, 0.8)) : Math.max(500.0, 2200.0 * Math.pow(M, 0.6));
    const baseLum = zamsLuminosity * 2.5;
    luminositySolar = baseLum + (peakLum - baseLum) * Math.pow(tau, 2.0);

    // Peak radius: expands to 100-250 R_☉ (swallowing Mercury/Venus/Earth for Sun)
    const peakRadius = isAGB ? Math.max(80.0, 220.0 * Math.pow(M, 0.5)) : Math.max(40.0, 160.0 * Math.pow(M, 0.4));
    const baseRadius = zamsRadius * 3.5;
    radiusSolar = baseRadius + (peakRadius - baseRadius) * Math.pow(tau, 1.8);
  }

  // Effective surface temperature: cools to Hayashi convective limit (~3000–3800 K)
  let effectiveTemperatureK = stefanBoltzmannTemperature(luminositySolar, radiusSolar);
  // Physical Hayashi convective boundary floor (~3100 K for Population I stars)
  effectiveTemperatureK = Math.max(3100.0, effectiveTemperatureK);

  // Core mass: expands to ~0.45 M_☉ for degenerate helium flash in 1 M_☉ star
  const coreMassSolar = isMassive ? M * 0.35 : Math.min(M * 0.7, 0.15 * M + 0.35 * tau);

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
    coreMassSolar,
    stage,
  };
}

/**
 * Convenience helper for Red Giant Branch calculations.
 */
export function calculateRedGiantState(
  initialMassSolar: number,
  rgbProgress: number = 0.5,
): GiantBranchState {
  return calculateGiantState(initialMassSolar, rgbProgress, false);
}

/**
 * Convenience helper for Massive Star Supergiant calculations.
 */
export function calculateSupergiantState(
  initialMassSolar: number,
  sgProgress: number = 0.5,
): GiantBranchState {
  return calculateGiantState(initialMassSolar, sgProgress, false);
}

/**
 * Convenience helper for Asymptotic Giant Branch calculations.
 */
export function calculateAGBState(
  initialMassSolar: number,
  agbProgress: number = 0.5,
): GiantBranchState {
  return calculateGiantState(initialMassSolar, agbProgress, true);
}
