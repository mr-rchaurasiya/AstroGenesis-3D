/**
 * PlanetaryNebulaModel.ts
 * Gaseous planetary nebula envelope expansion, gas density dilution,
 * photoionization fluorescence, and central star illumination.
 */

import {
  CANONICAL_PLANETARY_NEBULA_EXPANSION_KM_S,
  PLANETARY_NEBULA_LIFETIME_YEARS,
} from './StarDeathConstants';
import type { PlanetaryNebulaProperties } from './StarDeathTypes';

const KM_PER_AU = 1.495978707e8;
const AU_PER_PC = 206265;
const SECONDS_PER_YEAR = 365.25 * 86400;

/**
 * Calculates the physical properties and expansion dynamics of a planetary nebula.
 *
 * @param envelopeMassSolar - Ejected outer envelope gas mass in M_☉
 * @param ageYears - Time elapsed since envelope detachment in Earth years
 * @param centralStarTemperatureK - Surface temperature of central white dwarf core in Kelvin (K)
 * @param expansionVelocityKmS - Expansion velocity in km/s (default: 25 km/s)
 * @returns PlanetaryNebulaProperties
 */
export function calculatePlanetaryNebulaState(
  envelopeMassSolar: number,
  ageYears: number,
  centralStarTemperatureK: number = 80000,
  expansionVelocityKmS: number = CANONICAL_PLANETARY_NEBULA_EXPANSION_KM_S,
): PlanetaryNebulaProperties {
  const M_env = Math.max(0.01, isFinite(envelopeMassSolar) ? envelopeMassSolar : 0.4);
  const age = Math.max(0, isFinite(ageYears) ? ageYears : 0);
  const vExp = Math.max(5.0, isFinite(expansionVelocityKmS) ? expansionVelocityKmS : CANONICAL_PLANETARY_NEBULA_EXPANSION_KM_S);
  const T_central = Math.max(3000.0, isFinite(centralStarTemperatureK) ? centralStarTemperatureK : 80000);

  // Initial envelope radius (~100 AU at detachment) expanding linearly: R(t) = R_0 + v * t
  const radiusKm = 100 * KM_PER_AU + vExp * age * SECONDS_PER_YEAR;
  const nebulaRadiusAU = radiusKm / KM_PER_AU;
  const nebulaRadiusPc = nebulaRadiusAU / AU_PER_PC;

  // Gas density dilution: n(t) = n_0 * (R_0 / R(t))^3
  // Typical young PN: ~10⁴ - 10⁶ cm⁻³; mature PN: ~10² - 10³ cm⁻³; dispersed: < 10 cm⁻³
  const initialDensityCm3 = 5.0e5;
  const expansionRatio = Math.max(1.0, nebulaRadiusAU / 100.0);
  const numberDensityCm3 = Math.max(0.1, initialDensityCm3 / Math.pow(expansionRatio, 2.5));

  // Gas electron temperature (photoionized by central white dwarf Lyman continuum photons)
  const gasTemperatureK = Math.min(15000, Math.max(6000, 8000 + (T_central - 50000) * 0.05));

  // Ionization fraction: high when central star is hot (T > 25,000 K) and density is adequate
  const ionizationFraction = T_central > 25000 ? Math.min(1.0, Math.max(0.2, 1.0 - age / PLANETARY_NEBULA_LIFETIME_YEARS)) : 0.1;

  // Normalized visibility factor (fades away as gas disperses into interstellar medium after ~50,000 yr)
  const visibilityFraction = Math.max(0.0, Math.min(1.0, 1.0 - Math.pow(age / PLANETARY_NEBULA_LIFETIME_YEARS, 1.5)));

  // Fluorescence luminosity (recombination lines [O III], H-alpha, [N II])
  const nebulaLuminositySolar = Math.max(0.01, 150.0 * M_env * ionizationFraction * visibilityFraction);

  return {
    nebulaMassSolar: M_env,
    nebulaRadiusAU,
    nebulaRadiusPc,
    expansionVelocityKmS: vExp,
    numberDensityCm3,
    gasTemperatureK,
    ionizationFraction,
    nebulaLuminositySolar,
    nebulaAgeYears: age,
    visibilityFraction,
  };
}
