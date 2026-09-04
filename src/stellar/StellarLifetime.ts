/**
 * StellarLifetime.ts
 * Main-sequence lifetime approximations, stellar aging models, and remaining lifespan estimations.
 *
 * NOTE: These formulas provide scientifically motivated educational approximations for
 * the core hydrogen-burning Main Sequence phase. Detailed post-main-sequence evolution
 * tracks (giant branches, helium flash, AGB, core collapse) belong to Phases 8–10.
 */

import {
  NOMINAL_SOLAR_MS_LIFETIME_YEARS,
  MINIMUM_STELLAR_LIFETIME_YEARS,
} from './StellarConstants';

/**
 * Calculates estimated Main Sequence hydrogen burning lifetime in Earth years.
 * Formula: t_MS ≈ t_MS,☉ * (M / M_☉) / (L / L_☉)
 * With mass-loss corrections for hypermassive stars imposing an asymptotic lower bound.
 *
 * @param massSolar - Stellar mass in Solar masses (M_☉)
 * @param luminositySolar - Bolometric luminosity in Solar luminosities (L_☉)
 * @returns Estimated Main Sequence lifetime in years
 */
export function calculateMainSequenceLifetime(massSolar: number, luminositySolar: number): number {
  const m = Math.max(0.01, isFinite(massSolar) ? massSolar : 1.0);
  const l = Math.max(1e-10, isFinite(luminositySolar) ? luminositySolar : 1.0);

  // Standard astrophysical nuclear timescale: τ_nuc ∝ M / L
  const rawLifetime = NOMINAL_SOLAR_MS_LIFETIME_YEARS * (m / l);

  // Apply empirical asymptotic lower bound for hypermassive stars (O-type stars rarely live < 3 Myr due to mass loss)
  return Math.max(MINIMUM_STELLAR_LIFETIME_YEARS, rawLifetime);
}

/**
 * Calculates remaining lifetime and fractional age progress.
 *
 * @param ageYears - Current star age in years
 * @param msLifetimeYears - Total Main Sequence lifetime in years
 * @returns Object with remaining lifetime in years and fractional age (0.0 = birth, 1.0 = end of MS)
 */
export function calculateAgingProgress(
  ageYears: number,
  msLifetimeYears: number,
): {
  remainingLifetimeYears: number;
  fractionalAge: number;
} {
  const age = Math.max(0, isFinite(ageYears) ? ageYears : 0);
  const lifetime = Math.max(MINIMUM_STELLAR_LIFETIME_YEARS, isFinite(msLifetimeYears) ? msLifetimeYears : NOMINAL_SOLAR_MS_LIFETIME_YEARS);

  const remainingLifetimeYears = Math.max(0, lifetime - age);
  const fractionalAge = age / lifetime;

  return {
    remainingLifetimeYears,
    fractionalAge,
  };
}
