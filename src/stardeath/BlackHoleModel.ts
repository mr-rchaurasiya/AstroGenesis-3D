/**
 * BlackHoleModel.ts
 * General relativistic Schwarzschild Black Hole remnant model:
 * Event horizon scale, photon sphere, innermost stable circular orbit (ISCO),
 * and optional surrounding accretion disk radiative energetics.
 */

import { calculateSchwarzschildRadius } from './RemnantPhysics';
import { SOLAR_MASS_KG, SPEED_OF_LIGHT_C } from '../stellar/StellarConstants';
import type { BlackHoleProperties } from './StarDeathTypes';

/**
 * Calculates the relativistic physical state of a Stellar-Mass Black Hole remnant.
 *
 * @param massSolar - Gravitational mass in Solar masses M_☉ (~3.0 - 50.0 M_☉)
 * @param ageYears - Time elapsed since collapse in Earth years
 * @param hasAccretionDisk - Whether surrounding gas matter is actively accreting (default: false)
 * @param accretionRateSolarPerYear - Accretion rate in M_☉ / yr (default: 1e-9)
 * @returns BlackHoleProperties
 */
export function calculateBlackHoleState(
  massSolar: number = 5.0,
  ageYears: number = 1000,
  hasAccretionDisk: boolean = false,
  accretionRateSolarPerYear: number = 1.0e-9,
): BlackHoleProperties {
  const M = Math.max(2.17, isFinite(massSolar) ? massSolar : 5.0);
  const age = Math.max(0, isFinite(ageYears) ? ageYears : 0);
  const massKg = M * SOLAR_MASS_KG;

  // 1. Schwarzschild radius: r_s = 2GM / c² (~2.95 km per M_☉)
  const { km: schwarzschildRadiusKm, solar: schwarzschildRadiusSolar } = calculateSchwarzschildRadius(M);

  // 2. Relativistic photon sphere (r_ph = 1.5 r_s) and ISCO (r_isco = 3.0 r_s)
  const photonSphereRadiusKm = 1.5 * schwarzschildRadiusKm;
  const iscoRadiusKm = 3.0 * schwarzschildRadiusKm;

  // 3. Hawking radiation temperature: T_H = ħ c³ / (8π G M k_B) ≈ 6.17e-8 * (M_☉ / M) K (effectively 0 K)
  const hawkingTemperatureK = 6.17e-8 * (1.0 / M);

  // 4. Accretion Disk Physics (Shakura-Sunyaev standard thin disk model)
  let accretionLuminositySolar = 0.0;
  let innerDiskTemperatureK = 0.0;
  const mDot = Math.max(0, isFinite(accretionRateSolarPerYear) ? accretionRateSolarPerYear : 0);

  if (hasAccretionDisk && mDot > 0) {
    // Radiative efficiency for non-rotating Schwarzschild black hole: η ≈ 0.057 (~6% - 10%)
    const efficiency = 0.08;
    const SECONDS_PER_YEAR = 365.25 * 86400;
    const mDotKgS = (mDot * SOLAR_MASS_KG) / SECONDS_PER_YEAR;

    const accretionWatts = efficiency * mDotKgS * SPEED_OF_LIGHT_C * SPEED_OF_LIGHT_C;
    accretionLuminositySolar = accretionWatts / 3.828e26;

    // Peak inner disk temperature near ISCO (X-ray emitter ~ 10⁶ - 10⁷ K)
    innerDiskTemperatureK = Math.min(
      5.0e7,
      1.2e7 * Math.pow(mDot / 1.0e-8, 0.25) * Math.pow(5.0 / M, 0.25),
    );
  }

  return {
    massSolar: M,
    massKg,
    schwarzschildRadiusKm,
    schwarzschildRadiusSolar,
    photonSphereRadiusKm,
    iscoRadiusKm,
    hasAccretionDisk,
    accretionRateSolarPerYear: mDot,
    accretionLuminositySolar,
    innerDiskTemperatureK,
    hawkingTemperatureK,
    ageYears: age,
  };
}
