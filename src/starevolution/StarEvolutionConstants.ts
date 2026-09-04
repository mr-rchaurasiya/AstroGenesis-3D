/**
 * StarEvolutionConstants.ts
 * Physical and astronomical constants specific to stellar evolution tracks,
 * post-main-sequence stages, nuclear burning thresholds, and stellar wind mass loss.
 */

import {
  GRAVITATIONAL_CONSTANT_G,
  SPEED_OF_LIGHT_C,
  STEFAN_BOLTZMANN_SIGMA,
  BOLTZMANN_CONSTANT_K,
  ATOMIC_MASS_UNIT_KG,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  SOLAR_TEMPERATURE_K,
  SOLAR_AGE_YEARS,
  YEAR_IN_SECONDS,
  PARSEC_IN_METERS,
  ASTRONOMICAL_UNIT_M,
} from '../stellar/StellarConstants';

// ── Nuclear Core Ignition Thresholds (Kelvin) ────────────────────────────────

/** Core temperature threshold for triple-alpha helium fusion (3 ⁴He -> ¹²C) in Kelvin */
export const HELIUM_IGNITION_CORE_TEMPERATURE_K = 1.0e8; // 100 million Kelvin

/** Core temperature threshold for carbon burning (¹²C + ¹²C) in Kelvin */
export const CARBON_IGNITION_CORE_TEMPERATURE_K = 6.0e8; // 600 million Kelvin

/** Core temperature threshold for oxygen/silicon burning in massive stars in Kelvin */
export const ADVANCED_BURNING_CORE_TEMPERATURE_K = 1.5e9; // 1.5 billion Kelvin

// ── Stellar Mass Boundaries (Solar Masses) ───────────────────────────────────

/** Upper mass limit for fully convective red dwarfs that do not develop a giant branch (M < 0.35 M_☉) */
export const FULLY_CONVECTIVE_MASS_LIMIT_SOLAR = 0.35;

/** Threshold for helium flash in degenerate core (low mass stars: 0.5 to ~2.0 M_☉) */
export const HELIUM_FLASH_MASS_LIMIT_SOLAR = 2.0;

/** Lower mass threshold for core-collapse massive stars (supergiants, Phase 10 progenitors) */
export const MASSIVE_STAR_MASS_LIMIT_SOLAR = 8.0;

/** Hypermassive star boundary for extreme Eddington radiation-driven mass loss */
export const HYPERMASSIVE_STAR_MASS_LIMIT_SOLAR = 25.0;

// ── Evolutionary Stage Duration Ratios (Relative to t_MS) ─────────────────────

/** Subgiant stage duration relative to Main Sequence lifetime */
export const SUBGIANT_DURATION_FRACTION = 0.08; // ~8% of t_MS

/** Red Giant Branch (RGB) duration relative to Main Sequence lifetime */
export const RED_GIANT_DURATION_FRACTION = 0.10; // ~10% of t_MS

/** Core Helium Burning (Horizontal Branch / Red Clump) duration relative to t_MS */
export const HELIUM_BURNING_DURATION_FRACTION = 0.10; // ~10% of t_MS

/** Asymptotic Giant Branch (AGB) / Post-Helium stage duration relative to t_MS */
export const AGB_DURATION_FRACTION = 0.02; // ~2% of t_MS

// ── Mass Loss Wind Scaling Constants ──────────────────────────────────────────

/** Reimers' empirical mass loss formula coefficient in M_☉ / year */
export const REIMERS_MASS_LOSS_COEFFICIENT = 4.0e-13;

/** Wind efficiency parameter η (typically 0.2 to 0.6 for RGB/AGB stars) */
export const DEFAULT_REIMERS_ETA = 0.45;

/** Massive star de Jager wind scaling factor */
export const MASSIVE_STAR_WIND_SCALE = 1.2e-14;

export {
  GRAVITATIONAL_CONSTANT_G,
  SPEED_OF_LIGHT_C,
  STEFAN_BOLTZMANN_SIGMA,
  BOLTZMANN_CONSTANT_K,
  ATOMIC_MASS_UNIT_KG,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  SOLAR_TEMPERATURE_K,
  SOLAR_AGE_YEARS,
  YEAR_IN_SECONDS,
  PARSEC_IN_METERS,
  ASTRONOMICAL_UNIT_M,
};
