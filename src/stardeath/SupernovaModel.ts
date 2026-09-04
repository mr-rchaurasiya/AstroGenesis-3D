/**
 * SupernovaModel.ts
 * Core-collapse supernova transient energetics, radioactive decay light curve (⁵⁶Ni -> ⁵⁶Co -> ⁵⁶Fe),
 * and high-velocity ejecta shockwave expansion.
 */

import {
  CANONICAL_SUPERNOVA_ENERGY_JOULES,
  CANONICAL_SUPERNOVA_PEAK_LUMINOSITY_SOLAR,
} from './StarDeathConstants';
import { SOLAR_MASS_KG } from '../stellar/StellarConstants';
import type { SupernovaProperties } from './StarDeathTypes';

const KM_PER_AU = 1.495978707e8;
const AU_PER_PC = 206265;
const SECONDS_PER_DAY = 86400;
const DAYS_PER_YEAR = 365.25;

/**
 * Calculates time-dependent supernova physical state, light curve, and ejecta expansion.
 *
 * @param ejectaMassSolar - Ejected stellar envelope mass in M_☉
 * @param timeSinceExplosionDays - Time elapsed since core bounce shock breakout in Earth days
 * @param explosionEnergyFoe - Kinetic explosion energy in foes (1 foe = 10⁴⁴ J, default: 1.0)
 * @returns SupernovaProperties
 */
export function calculateSupernovaState(
  ejectaMassSolar: number,
  timeSinceExplosionDays: number,
  explosionEnergyFoe: number = 1.0,
): SupernovaProperties {
  const M_ej = Math.max(0.1, isFinite(ejectaMassSolar) ? ejectaMassSolar : 5.0);
  const tDays = Math.max(0, isFinite(timeSinceExplosionDays) ? timeSinceExplosionDays : 0);
  const E_foe = Math.max(0.1, isFinite(explosionEnergyFoe) ? explosionEnergyFoe : 1.0);
  const E_joules = E_foe * CANONICAL_SUPERNOVA_ENERGY_JOULES;

  // 1. Ejecta expansion velocity from kinetic energy: v_ej = sqrt(2 E / M_ej)
  const massKg = M_ej * SOLAR_MASS_KG;
  const rawVelocityMs = Math.sqrt((2.0 * E_joules) / massKg);
  const ejectaVelocityKmS = Math.min(30000.0, Math.max(2000.0, rawVelocityMs / 1000.0));

  // 2. Shock radius: R_ejecta = R_0 + v * t
  // Initial star radius ~ 5 AU -> expanding at ~10,000 km/s (approx 5.7 AU per day)
  const radiusKm = 5.0 * KM_PER_AU + ejectaVelocityKmS * tDays * SECONDS_PER_DAY;
  const ejectaRadiusAU = radiusKm / KM_PER_AU;
  const ejectaRadiusPc = ejectaRadiusAU / AU_PER_PC;

  // 3. Radioactive decay light curve (Arnett model approximation)
  // Peak occurs around day ~18.
  const tRiseDays = 18.0;
  const peakLuminositySolar = CANONICAL_SUPERNOVA_PEAK_LUMINOSITY_SOLAR * Math.pow(E_foe, 0.5) * Math.pow(M_ej / 5.0, 0.25);

  let lightCurveFraction = 0.0;
  if (tDays <= tRiseDays) {
    // Rise to peak: quadratic increase
    const riseProgress = Math.max(0.01, tDays / tRiseDays);
    lightCurveFraction = Math.pow(riseProgress, 2.0);
  } else {
    // Post-peak exponential decay driven by ⁵⁶Ni (τ ~ 8.8d) and ⁵⁶Co (τ ~ 111.3d)
    const postDays = tDays - tRiseDays;
    const nickelDecay = 0.55 * Math.exp(-postDays / 8.8);
    const cobaltDecay = 0.45 * Math.exp(-postDays / 111.3);
    lightCurveFraction = Math.max(1.0e-6, nickelDecay + cobaltDecay);
  }

  const currentLuminositySolar = Math.max(0.01, peakLuminositySolar * lightCurveFraction);
  const timeSinceExplosionYears = tDays / DAYS_PER_YEAR;

  return {
    explosionEnergyJoules: E_joules,
    explosionEnergyFoe: E_foe,
    ejectaMassSolar: M_ej,
    ejectaVelocityKmS,
    ejectaRadiusAU,
    ejectaRadiusPc,
    peakLuminositySolar,
    currentLuminositySolar,
    timeSinceExplosionDays: tDays,
    timeSinceExplosionYears,
    lightCurveFraction,
  };
}
