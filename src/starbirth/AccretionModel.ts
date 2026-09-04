/**
 * AccretionModel.ts
 * Protostellar mass accretion kinetics, Shu isothermal collapse infall rates,
 * accretion shock luminosity, and total radiative power.
 */

import {
  GRAVITATIONAL_CONSTANT_G,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  YEAR_IN_SECONDS,
  CHARACTERISTIC_ACCRETION_TIMESCALE_YEARS,
} from './StarBirthConstants';

/**
 * Computes instantaneous protostellar mass accretion rate in Solar masses per year.
 *
 * Uses Shu isothermal self-similar collapse rate scaling:
 * dM/dt(t) = dM/dt_0 * exp(-t / τ_acc)
 *
 * @param targetFinalMassSolar - Final target stellar mass in M_☉
 * @param ageYears - Current protostellar age in Earth years
 * @param characteristicTimescaleYears - Accretion decay timescale in years
 * @returns Instantaneous accretion rate in M_☉ / year
 */
export function calculateAccretionRate(
  targetFinalMassSolar: number,
  ageYears: number,
  characteristicTimescaleYears: number = CHARACTERISTIC_ACCRETION_TIMESCALE_YEARS,
): number {
  const M_target = Math.max(0.01, isFinite(targetFinalMassSolar) ? targetFinalMassSolar : 1.0);
  const t = Math.max(0, isFinite(ageYears) ? ageYears : 0);
  const tau = Math.max(1000, characteristicTimescaleYears);

  // Peak accretion rate scaled so integrated mass yields M_target:
  // ∫[0 to ∞] Mdot_0 * exp(-t/tau) dt = Mdot_0 * tau = M_target  =>  Mdot_0 = M_target / tau
  const peakRateSolarPerYear = M_target / tau;

  // Accretion rate with exponential decay
  return peakRateSolarPerYear * Math.exp(-t / tau);
}

/**
 * Calculates gravitational accretion shock luminosity generated as infalling gas impacts the stellar surface.
 *
 * Formula: L_acc = (G * M * dM/dt) / R
 *
 * @param massSolar - Current protostar mass in M_☉
 * @param radiusSolar - Current protostar radius in R_☉
 * @param accretionRateSolarPerYear - Accretion rate in M_☉ / year
 * @returns Object with accretion luminosity in SI Watts and Solar luminosities L_☉
 */
export function calculateAccretionLuminosity(
  massSolar: number,
  radiusSolar: number,
  accretionRateSolarPerYear: number,
): {
  watts: number;
  solar: number;
} {
  const mKg = Math.max(0.001, massSolar) * SOLAR_MASS_KG;
  const rM = Math.max(0.001, radiusSolar) * SOLAR_RADIUS_M;

  // Convert accretion rate from M_☉/yr to kg/s
  const dMdtKgS = (Math.max(0, accretionRateSolarPerYear) * SOLAR_MASS_KG) / YEAR_IN_SECONDS;

  const watts = (GRAVITATIONAL_CONSTANT_G * mKg * dMdtKgS) / rM;
  const solar = watts / SOLAR_LUMINOSITY_W;

  return { watts, solar };
}
