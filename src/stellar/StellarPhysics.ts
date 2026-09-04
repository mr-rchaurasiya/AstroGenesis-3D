/**
 * StellarPhysics.ts
 * Pure, testable astrophysical equations and formulas for stellar mechanics.
 * All functions are deterministic and safe against invalid inputs (division by zero, NaN, negatives).
 */

import {
  GRAVITATIONAL_CONSTANT_G,
  SPEED_OF_LIGHT_C,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  SOLAR_TEMPERATURE_K,
  SOLAR_SURFACE_GRAVITY_MS2,
  SOLAR_MEAN_DENSITY_KGM3,
  SOLAR_HYDROGEN_FRACTION,
  ELECTRON_SCATTERING_OPACITY_BASE,
} from './StellarConstants';

// ── 1. Mass-Luminosity Relations (Main Sequence Empirical Piecewise) ───────────

/**
 * Calculates theoretical bolometric luminosity (in Solar units L_☉) for a Main Sequence star.
 * Uses established astrophysical piecewise power laws:
 * - M < 0.43 M_☉: L = 0.23 * M^2.3 (Fully convective red dwarfs)
 * - 0.43 <= M < 2.0 M_☉: L = M^4.0 (Sun-like stars, pp-chain dominated)
 * - 2.0 <= M < 20.0 M_☉: L = 1.5 * M^3.5 (Intermediate massive stars, CNO dominated)
 * - M >= 20.0 M_☉: L = 3200 * M (Hypermassive radiation-pressure dominated stars)
 *
 * @param massSolar - Stellar mass in solar masses (M_☉)
 * @returns Bolometric luminosity in solar luminosities (L_☉)
 */
export function massToMainSequenceLuminosity(massSolar: number): number {
  const m = Math.max(0.01, isFinite(massSolar) ? massSolar : 1.0);

  if (m < 0.43) {
    return 0.23 * Math.pow(m, 2.3);
  } else if (m < 2.0) {
    return Math.pow(m, 4.0);
  } else if (m < 20.0) {
    return 1.5 * Math.pow(m, 3.5);
  } else {
    return 3200.0 * m;
  }
}

// ── 2. Mass-Radius Relations (Main Sequence Empirical Piecewise) ───────────────

/**
 * Calculates theoretical radius (in Solar units R_☉) for a Main Sequence star.
 * Uses piecewise empirical scaling laws:
 * - M < 1.0 M_☉: R = M^0.8 (Convective envelope regime)
 * - M >= 1.0 M_☉: R = M^0.57 (Radiative envelope regime)
 *
 * @param massSolar - Stellar mass in solar masses (M_☉)
 * @returns Stellar radius in solar radii (R_☉)
 */
export function massToMainSequenceRadius(massSolar: number): number {
  const m = Math.max(0.01, isFinite(massSolar) ? massSolar : 1.0);

  if (m < 1.0) {
    return Math.pow(m, 0.8);
  } else {
    return Math.pow(m, 0.57);
  }
}

// ── 3. Stefan-Boltzmann Law ───────────────────────────────────────────────────

/**
 * Derives the effective surface temperature T_eff from bolometric luminosity and radius.
 * Formula: L = 4π R² σ T_eff⁴  =>  T_eff = (L / (4π R² σ))^(1/4)
 * In Solar Units: T_eff = T_☉ * ((L/L_☉) / (R/R_☉)²)^(1/4)
 *
 * @param luminositySolar - Bolometric luminosity in L_☉
 * @param radiusSolar - Stellar radius in R_☉
 * @returns Effective temperature in Kelvin (K)
 */
export function stefanBoltzmannTemperature(luminositySolar: number, radiusSolar: number): number {
  const l = Math.max(1e-10, isFinite(luminositySolar) ? luminositySolar : 1.0);
  const r = Math.max(1e-6, isFinite(radiusSolar) ? radiusSolar : 1.0);

  const ratio = l / (r * r);
  return SOLAR_TEMPERATURE_K * Math.pow(ratio, 0.25);
}

/**
 * Derives bolometric luminosity L in Solar units from radius and effective temperature.
 * Formula: L/L_☉ = (R/R_☉)² * (T_eff / T_☉)⁴
 *
 * @param radiusSolar - Stellar radius in R_☉
 * @param temperatureK - Effective temperature in Kelvin
 * @returns Bolometric luminosity in L_☉
 */
export function stefanBoltzmannLuminosity(radiusSolar: number, temperatureK: number): number {
  const r = Math.max(1e-6, isFinite(radiusSolar) ? radiusSolar : 1.0);
  const t = Math.max(100, isFinite(temperatureK) ? temperatureK : SOLAR_TEMPERATURE_K);

  const tRatio = t / SOLAR_TEMPERATURE_K;
  return r * r * Math.pow(tRatio, 4);
}

/**
 * Derives stellar radius R in Solar units from luminosity and effective temperature.
 * Formula: R/R_☉ = sqrt(L/L_☉) / (T_eff / T_☉)²
 *
 * @param luminositySolar - Bolometric luminosity in L_☉
 * @param temperatureK - Effective temperature in Kelvin
 * @returns Stellar radius in R_☉
 */
export function stefanBoltzmannRadius(luminositySolar: number, temperatureK: number): number {
  const l = Math.max(1e-10, isFinite(luminositySolar) ? luminositySolar : 1.0);
  const t = Math.max(100, isFinite(temperatureK) ? temperatureK : SOLAR_TEMPERATURE_K);

  const tRatio = t / SOLAR_TEMPERATURE_K;
  return Math.sqrt(l) / (tRatio * tRatio);
}

// ── 4. Surface Gravity ────────────────────────────────────────────────────────

/**
 * Calculates surface gravitational acceleration g = GM / R².
 *
 * @param massKg - Mass in kg
 * @param radiusM - Radius in meters
 * @returns Object containing g in m/s², relative to Sun, and log10(g in cm/s²).
 */
export function calculateSurfaceGravity(massKg: number, radiusM: number): {
  ms2: number;
  solar: number;
  logG: number;
} {
  const m = Math.max(1e20, isFinite(massKg) ? massKg : SOLAR_MASS_KG);
  const r = Math.max(1e3, isFinite(radiusM) ? radiusM : SOLAR_RADIUS_M);

  const ms2 = (GRAVITATIONAL_CONSTANT_G * m) / (r * r);
  const solar = ms2 / SOLAR_SURFACE_GRAVITY_MS2;
  // Standard astronomical log g is in cgs units (cm/s²), where 1 m/s² = 100 cm/s²
  const logG = Math.log10(Math.max(1e-10, ms2 * 100));

  return { ms2, solar, logG };
}

// ── 5. Mean Density ───────────────────────────────────────────────────────────

/**
 * Calculates mean stellar density ρ = M / ((4/3) π R³).
 *
 * @param massKg - Mass in kg
 * @param radiusM - Radius in meters
 * @returns Density in kg/m³ and relative to Sun.
 */
export function calculateMeanDensity(massKg: number, radiusM: number): {
  kgm3: number;
  solar: number;
} {
  const m = Math.max(1e20, isFinite(massKg) ? massKg : SOLAR_MASS_KG);
  const r = Math.max(1e3, isFinite(radiusM) ? radiusM : SOLAR_RADIUS_M);

  const volume = (4 / 3) * Math.PI * Math.pow(r, 3);
  const kgm3 = m / volume;
  const solar = kgm3 / SOLAR_MEAN_DENSITY_KGM3;

  return { kgm3, solar };
}

// ── 6. Surface Escape Velocity ────────────────────────────────────────────────

/**
 * Calculates surface escape velocity v_esc = sqrt(2GM / R).
 *
 * @param massKg - Mass in kg
 * @param radiusM - Radius in meters
 * @returns Escape velocity in m/s and km/s.
 */
export function calculateEscapeVelocity(massKg: number, radiusM: number): {
  ms: number;
  kms: number;
} {
  const m = Math.max(1e20, isFinite(massKg) ? massKg : SOLAR_MASS_KG);
  const r = Math.max(1e3, isFinite(radiusM) ? radiusM : SOLAR_RADIUS_M);

  const ms = Math.sqrt((2 * GRAVITATIONAL_CONSTANT_G * m) / r);
  const kms = ms / 1000;

  return { ms, kms };
}

// ── 7. Eddington Luminosity ───────────────────────────────────────────────────

/**
 * Calculates the theoretical Eddington limit where radiation pressure balances gravity.
 * Formula: L_Edd = 4π G M c / κ
 * where opacity κ_es = 0.02 * (1 + X) m²/kg (electron scattering opacity).
 *
 * @param massKg - Mass in kg
 * @param hydrogenFraction - Hydrogen mass fraction X (default: solar ~0.7381)
 * @returns Eddington luminosity in Watts, Solar units, and ratio to star luminosity.
 */
export function calculateEddingtonLuminosity(
  massKg: number,
  hydrogenFraction: number = SOLAR_HYDROGEN_FRACTION,
): {
  watts: number;
  solar: number;
} {
  const m = Math.max(1e20, isFinite(massKg) ? massKg : SOLAR_MASS_KG);
  const x = Math.max(0, Math.min(1.0, isFinite(hydrogenFraction) ? hydrogenFraction : SOLAR_HYDROGEN_FRACTION));

  const opacity = ELECTRON_SCATTERING_OPACITY_BASE * (1.0 + x);
  const watts = (4 * Math.PI * GRAVITATIONAL_CONSTANT_G * m * SPEED_OF_LIGHT_C) / opacity;
  const solar = watts / SOLAR_LUMINOSITY_W;

  return { watts, solar };
}

// ── 8. Gravitational Binding Energy ───────────────────────────────────────────

/**
 * Approximates total gravitational binding energy for a stellar polytrope.
 * Formula: U = - (3 / (5 - n)) * (G M² / R)
 * For standard Eddington standard model / polytrope n=3: U_bind ≈ 1.5 * G M² / R
 *
 * @param massKg - Mass in kg
 * @param radiusM - Radius in meters
 * @returns Gravitational binding energy in Joules
 */
export function calculateGravitationalBindingEnergy(massKg: number, radiusM: number): number {
  const m = Math.max(1e20, isFinite(massKg) ? massKg : SOLAR_MASS_KG);
  const r = Math.max(1e3, isFinite(radiusM) ? radiusM : SOLAR_RADIUS_M);

  return 1.5 * ((GRAVITATIONAL_CONSTANT_G * m * m) / r);
}
