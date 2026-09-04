/**
 * RemnantPhysics.ts
 * Pure, shared compact-object astrophysical calculations:
 * Schwarzschild radius, neutron star compactness, escape velocity,
 * electron-degeneracy mass-radius relation, Mestel cooling, and pulsar spin-down.
 */

import {
  GRAVITATIONAL_CONSTANT_G,
  SPEED_OF_LIGHT_C,
  SCHWARZSCHILD_RADIUS_METERS_PER_SOLAR_MASS,
  CHANDRASEKHAR_MASS_LIMIT_SOLAR,
  CANONICAL_WHITE_DWARF_RADIUS_SOLAR,
} from './StarDeathConstants';
import {
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_SURFACE_GRAVITY_MS2,
} from '../stellar/StellarConstants';

const SOLAR_RADIUS_KM = SOLAR_RADIUS_M / 1000.0;

/**
 * Calculates the Schwarzschild event horizon radius r_s = 2GM / c².
 *
 * @param massSolar - Gravitational mass in Solar masses M_☉
 * @returns Object with radius in meters, kilometers, and Solar radii
 */
export function calculateSchwarzschildRadius(massSolar: number): {
  meters: number;
  km: number;
  solar: number;
} {
  const M = Math.max(0.01, isFinite(massSolar) ? massSolar : 1.0);
  const meters = M * SCHWARZSCHILD_RADIUS_METERS_PER_SOLAR_MASS;
  const km = meters / 1000.0;
  const solar = meters / SOLAR_RADIUS_M;

  return { meters, km, solar };
}

/**
 * Calculates dimensionless gravitational compactness parameter: Ξ = GM / (R c²).
 * Physical bound for stable neutron stars: 0 < Ξ < 0.5 (where 0.5 is Schwarzschild black hole).
 *
 * @param massSolar - Compact remnant mass in M_☉
 * @param radiusKm - Remnant radius in kilometers (km)
 * @returns Compactness parameter
 */
export function calculateNeutronStarCompactness(massSolar: number, radiusKm: number): number {
  const M = Math.max(0.01, isFinite(massSolar) ? massSolar : 1.4);
  const R = Math.max(1.0, isFinite(radiusKm) ? radiusKm : 12.0) * 1000.0; // meters

  const compactness = (GRAVITATIONAL_CONSTANT_G * M * SOLAR_MASS_KG) / (R * SPEED_OF_LIGHT_C * SPEED_OF_LIGHT_C);
  return Math.min(0.499, Math.max(1.0e-5, compactness));
}

/**
 * Calculates relativistic surface escape velocity v_esc = sqrt(2GM / R).
 *
 * @param massSolar - Remnant mass in M_☉
 * @param radiusKm - Radius in kilometers (km)
 * @returns Object with escape velocity in km/s and as a fraction of c
 */
export function calculateCompactEscapeVelocity(massSolar: number, radiusKm: number): {
  kmS: number;
  fractionC: number;
} {
  const M = Math.max(0.01, isFinite(massSolar) ? massSolar : 1.4);
  const R = Math.max(1.0, isFinite(radiusKm) ? radiusKm : 12.0) * 1000.0; // meters

  const rawMs = Math.sqrt((2.0 * GRAVITATIONAL_CONSTANT_G * M * SOLAR_MASS_KG) / R);
  const ms = Math.min(SPEED_OF_LIGHT_C * 0.999, rawMs);
  const kmS = ms / 1000.0;
  const fractionC = ms / SPEED_OF_LIGHT_C;

  return { kmS, fractionC };
}

/**
 * Calculates non-relativistic to relativistic electron-degeneracy white dwarf radius.
 * Standard Chandrasekhar mass-radius formula:
 * R_WD(M) ≈ R_0 * (M / M_Ch)^(-1/3) * sqrt(1 - (M / M_Ch)^(4/3))
 * As M -> M_Ch (~1.44 M_☉), R -> 0.
 *
 * @param massSolar - White dwarf mass in M_☉
 * @returns Radius in Solar radii and kilometers
 */
export function calculateWhiteDwarfRadius(massSolar: number): {
  solar: number;
  km: number;
} {
  const M = Math.max(0.1, Math.min(CHANDRASEKHAR_MASS_LIMIT_SOLAR - 0.005, isFinite(massSolar) ? massSolar : 0.6));
  const mRatio = M / CHANDRASEKHAR_MASS_LIMIT_SOLAR;

  // Degeneracy mass-radius relation
  const term1 = Math.pow(mRatio, -1.0 / 3.0);
  const term2 = Math.sqrt(Math.max(1.0e-4, 1.0 - Math.pow(mRatio, 4.0 / 3.0)));
  const radiusSolar = Math.max(1.0e-4, CANONICAL_WHITE_DWARF_RADIUS_SOLAR * term1 * term2 * 0.85);
  const km = radiusSolar * SOLAR_RADIUS_KM;

  return { solar: radiusSolar, km };
}

/**
 * Calculates white dwarf thermal cooling and luminosity decay over time.
 * Uses classical Mestel cooling law:
 * L(t) ∝ M * (t / yr)^(-7/2),  T_eff(t) ∝ (t / yr)^(-7/8)
 *
 * @param massSolar - White dwarf mass in M_☉
 * @param coolingAgeYears - Elapsed cooling time in Earth years
 * @returns Object with surface temperature in Kelvin and luminosity in L_☉
 */
export function calculateWhiteDwarfCooling(
  massSolar: number,
  coolingAgeYears: number,
): {
  temperatureK: number;
  luminositySolar: number;
} {
  const M = Math.max(0.1, isFinite(massSolar) ? massSolar : 0.6);
  const t = Math.max(10.0, isFinite(coolingAgeYears) ? coolingAgeYears : 0);

  // Initial young white dwarf: T ~ 120,000 K, L ~ 100 - 1000 L_☉
  // After 10^7 yr: T ~ 20,000 K, L ~ 10^-2 L_☉
  // After 10^9 yr: T ~ 7,000 K, L ~ 10^-4 L_☉
  // After 10^10 yr: T ~ 3,500 K, L ~ 10^-5 L_☉
  const tempK = Math.max(
    3000.0,
    120000.0 * Math.pow(1.0 + t / 5000.0, -0.22) * Math.pow(M / 0.6, 0.1),
  );

  // Luminosity via cooling equation
  const lumSolar = Math.max(
    1.0e-6,
    500.0 * Math.pow(1.0 + t / 3000.0, -1.15) * (M / 0.6),
  );

  return {
    temperatureK: tempK,
    luminositySolar: lumSolar,
  };
}

/**
 * Calculates pulsar magnetic dipole spin-down rate and rotational energetics.
 * Formula: dP/dt = (8π² B² R⁶) / (3 I c³ P)
 *
 * @param spinPeriodS - Rotational period in seconds (s)
 * @param magneticFieldGauss - Surface dipole magnetic field in Gauss (G)
 * @returns Object with spin-down rate dP/dt and characteristic spin-down age
 */
export function calculatePulsarSpinDown(
  spinPeriodS: number,
  magneticFieldGauss: number,
): {
  pDot: number;
  characteristicAgeYears: number;
} {
  const P = Math.max(0.001, isFinite(spinPeriodS) ? spinPeriodS : 0.033);
  const B = Math.max(1.0e8, isFinite(magneticFieldGauss) ? magneticFieldGauss : 1.0e12);

  // Empirical magnetic dipole braking
  // For canonical Crab pulsar (P = 0.033s, B = 3.8e12 G): P_dot ~ 4.2e-13 s/s
  const pDot = Math.max(1.0e-20, (1.0e-15 * Math.pow(B / 1.0e12, 2)) / P);
  const charAgeSeconds = P / (2.0 * pDot);
  const characteristicAgeYears = charAgeSeconds / (365.25 * 86400.0);

  return { pDot, characteristicAgeYears };
}

/**
 * Calculates logarithmic surface gravity log10(g in cm/s²).
 *
 * @param massSolar - Remnant mass in M_☉
 * @param radiusSolar - Remnant radius in R_☉
 * @returns log10(g in cm/s²)
 */
export function calculateLogG(massSolar: number, radiusSolar: number): number {
  const M = Math.max(0.01, isFinite(massSolar) ? massSolar : 1.0);
  const R = Math.max(1.0e-6, isFinite(radiusSolar) ? radiusSolar : 1.0);

  const gMs2 = (SOLAR_SURFACE_GRAVITY_MS2 * M) / (R * R);
  const gCmS2 = gMs2 * 100.0;
  return Math.log10(Math.max(1.0e-10, gCmS2));
}
