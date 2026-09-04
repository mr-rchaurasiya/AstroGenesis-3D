/**
 * MassLossModel.ts
 * Stellar wind mass-loss kinetics based on Reimers' empirical formula for giants
 * and radiation-driven wind scaling for massive supergiants.
 */

import {
  REIMERS_MASS_LOSS_COEFFICIENT,
  DEFAULT_REIMERS_ETA,
  MASSIVE_STAR_WIND_SCALE,
} from './StarEvolutionConstants';

/**
 * Calculates instantaneous stellar wind mass-loss rate in Solar masses per year (M_☉ / yr).
 *
 * For Giants / AGB: Reimers' Formula:
 * dM/dt = η * 4.0e-13 * (L * R / M) [M_☉ / yr]
 *
 * For Massive Supergiants: de Jager radiation wind scaling:
 * dM/dt ∝ L^1.5
 *
 * @param massSolar - Current stellar mass in M_☉
 * @param radiusSolar - Current radius in R_☉
 * @param luminositySolar - Current bolometric luminosity in L_☉
 * @param stage - Current evolutionary stage
 * @param eta - Reimers efficiency parameter (default: 0.45)
 * @returns Mass-loss rate in M_☉ / year
 */
export function calculateMassLossRate(
  massSolar: number,
  radiusSolar: number,
  luminositySolar: number,
  stage: string,
  eta: number = DEFAULT_REIMERS_ETA,
): number {
  const M = Math.max(0.08, isFinite(massSolar) ? massSolar : 1.0);
  const R = Math.max(0.01, isFinite(radiusSolar) ? radiusSolar : 1.0);
  const L = Math.max(1e-10, isFinite(luminositySolar) ? luminositySolar : 1.0);

  // Normal Main Sequence wind is very gentle (Sun loses ~2e-14 M_☉/yr)
  if (stage === 'ZERO_AGE_MAIN_SEQUENCE' || stage === 'MAIN_SEQUENCE' || stage === 'HYDROGEN_DEPLETION') {
    return (2.0e-14 * (L * R)) / M;
  }

  // Massive Supergiants experience intense radiative stellar winds (~1e-6 to 1e-4 M_☉/yr)
  if (M >= 8.0 || stage === 'SUPERGIANT') {
    const massiveRate = MASSIVE_STAR_WIND_SCALE * Math.pow(L, 1.4);
    return Math.min(1.0e-4, massiveRate);
  }

  // Red Giant & AGB thermal pulsing winds (Reimers' law, enhanced on AGB)
  const agbMultiplier = stage === 'ASYMPTOTIC_GIANT_BRANCH' || stage === 'POST_HELIUM' ? 4.0 : 1.0;
  const reimersRate = (eta * REIMERS_MASS_LOSS_COEFFICIENT * (L * R)) / M * agbMultiplier;

  return Math.min(1.0e-4, reimersRate);
}

/**
 * Calculates integrated stellar mass loss and remaining current mass.
 *
 * @param initialMassSolar - Initial ZAMS mass in M_☉
 * @param stage - Current evolutionary stage
 * @param stageProgress - Progress fraction (0.0 to 1.0) within current stage
 * @param coreMassSolar - Inward core mass that cannot be lost via surface wind
 * @returns Object with current mass, ejected mass, and mass loss rate
 */
export function calculateStellarMassBudget(
  initialMassSolar: number,
  stage: string,
  stageProgress: number,
  coreMassSolar: number,
  radiusSolar: number,
  luminositySolar: number,
): {
  currentMassSolar: number;
  ejectedMassSolar: number;
  massLossRateSolarPerYear: number;
} {
  const M0 = Math.max(0.08, initialMassSolar);
  const tau = Math.max(0, Math.min(1.0, stageProgress));

  let fractionalCumulativeLoss = 0.0;

  switch (stage) {
    case 'ZERO_AGE_MAIN_SEQUENCE':
    case 'MAIN_SEQUENCE':
      // Main sequence cumulative mass loss is very small (~0.01% - 1% for solar, up to ~5% for massive)
      fractionalCumulativeLoss = (M0 >= 8.0 ? 0.08 : 0.005) * tau;
      break;

    case 'HYDROGEN_DEPLETION':
    case 'SUBGIANT':
      fractionalCumulativeLoss = (M0 >= 8.0 ? 0.12 : 0.01) + (M0 >= 8.0 ? 0.06 : 0.01) * tau;
      break;

    case 'RED_GIANT':
      // RGB mass loss: ~10% to 25% of envelope
      fractionalCumulativeLoss = 0.02 + 0.18 * Math.pow(tau, 1.5);
      break;

    case 'HELIUM_IGNITION':
    case 'HELIUM_BURNING':
      fractionalCumulativeLoss = 0.20 + 0.08 * tau;
      break;

    case 'ASYMPTOTIC_GIANT_BRANCH':
    case 'POST_HELIUM':
      // AGB superwind sheds the majority of the remaining hydrogen envelope (up to ~40-60% of original mass)
      fractionalCumulativeLoss = 0.28 + (M0 >= 8.0 ? 0.45 : 0.32) * Math.pow(tau, 1.2);
      break;

    case 'SUPERGIANT':
      // Massive supergiant winds can shed 30% to 60% of star mass over lifetime
      fractionalCumulativeLoss = 0.15 + 0.40 * Math.pow(tau, 1.1);
      break;

    default:
      fractionalCumulativeLoss = 0.0;
      break;
  }

  // Ejected mass strictly bounded
  const maxPossibleLoss = Math.max(0, M0 - coreMassSolar * 0.95);
  const ejectedMassSolar = Math.min(maxPossibleLoss, M0 * fractionalCumulativeLoss);
  const currentMassSolar = Math.max(coreMassSolar * 0.95, M0 - ejectedMassSolar);

  const massLossRateSolarPerYear = calculateMassLossRate(currentMassSolar, radiusSolar, luminositySolar, stage);

  return {
    currentMassSolar,
    ejectedMassSolar,
    massLossRateSolarPerYear,
  };
}

/**
 * Calculates cumulative mass loss throughout star's age.
 */
export function calculateCumulativeMassLoss(
  initialMassSolar: number,
  currentAgeYears: number,
  msLifetimeYears: number,
  stage: string,
  coreMassSolar: number,
  radiusSolar: number,
  luminositySolar: number,
): {
  currentMassSolar: number;
  ejectedMassSolar: number;
  massLossRateSolarPerYear: number;
} {
  const tau = msLifetimeYears > 0 ? Math.min(1.0, currentAgeYears / msLifetimeYears) : 0;
  return calculateStellarMassBudget(
    initialMassSolar,
    stage,
    tau,
    coreMassSolar,
    radiusSolar,
    luminositySolar,
  );
}
