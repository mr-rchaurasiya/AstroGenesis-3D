/**
 * StarBirthConstants.ts
 * Central scientific constants and reference values for the Star Birth / Star Formation Engine.
 * Internal calculations are performed in SI units; astronomical display units are explicitly documented.
 */

import {
  GRAVITATIONAL_CONSTANT_G,
  SPEED_OF_LIGHT_C,
  BOLTZMANN_CONSTANT_K,
  ATOMIC_MASS_UNIT_KG,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  YEAR_IN_SECONDS,
  PARSEC_IN_METERS,
  ASTRONOMICAL_UNIT_M,
} from '../stellar/StellarConstants';

// ── Molecular Cloud Reference Constants ──────────────────────────────────────

/** Mean molecular weight for cold neutral molecular gas (H2 + He + metals) in atomic mass units */
export const MEAN_MOLECULAR_WEIGHT_MOLECULAR = 2.38;

/** Average molecular gas particle mass in kg: μ_mol * m_u */
export const MOLECULAR_GAS_PARTICLE_MASS_KG = MEAN_MOLECULAR_WEIGHT_MOLECULAR * ATOMIC_MASS_UNIT_KG;

/** Adiabatic index (ratio of specific heats) for diatomic molecular hydrogen gas at low T */
export const ADIABATIC_INDEX_GAMMA = 5.0 / 3.0; // Monatomic/low-T approximation or 7/5 for warm H2

/** Typical cold Giant Molecular Cloud (GMC) background temperature in Kelvin (10–20 K) */
export const DEFAULT_CLOUD_TEMPERATURE_K = 15.0;

/** Typical GMC background number density in particles per cm³ (~100 to 1,000 cm⁻³) */
export const DEFAULT_CLOUD_NUMBER_DENSITY_CM3 = 300.0;

/** Dense core number density threshold for gravitational collapse in cm³ (~10⁴ to 10⁶ cm⁻³) */
export const DENSE_CORE_NUMBER_DENSITY_CM3 = 1.0e5;

/** Conversion factor from particles/cm³ to kg/m³ for molecular gas (n * μ * m_u * 10⁶) */
export const NUMBER_DENSITY_TO_KGM3 = MOLECULAR_GAS_PARTICLE_MASS_KG * 1.0e6;

// ── Free-Fall & Instability Constants ────────────────────────────────────────

/** Free-fall time analytical prefactor: sqrt(3π / (32 G)) in SI units (s kg^(1/2) m^(-3/2)) */
export const FREE_FALL_CONSTANT_FACTOR = Math.sqrt((3.0 * Math.PI) / (32.0 * GRAVITATIONAL_CONSTANT_G)); // ~6.643e4

// ── Nuclear Ignition & Threshold Boundaries ───────────────────────────────────

/** Core temperature threshold for stable sustained hydrogen burning (p-p chain ignition) in Kelvin */
export const HYDROGEN_IGNITION_CORE_TEMPERATURE_K = 1.0e7; // 10 million Kelvin

/** Core temperature threshold for preliminary deuterium fusion in Kelvin (~1 million K) */
export const DEUTERIUM_BURNING_CORE_TEMPERATURE_K = 1.0e6;

/** Minimum stellar mass required for sustained hydrogen fusion (Substellar / Brown Dwarf boundary in M_☉) */
export const HYDROGEN_BURNING_MINIMUM_MASS_SOLAR = 0.075; // ~0.075 to 0.080 M_☉ (~75 to 80 Jupiter masses)

/** Minimum mass required for deuterium burning (Planet / Brown Dwarf boundary in M_☉: ~13 M_Jup) */
export const DEUTERIUM_BURNING_MINIMUM_MASS_SOLAR = 0.013; // ~13 M_Jupiter

// ── Accretion & Circumstellar Disk Physics ─────────────────────────────────────

/** Typical star formation efficiency factor (SFE = M_stars / M_cloud) */
export const DEFAULT_STAR_FORMATION_EFFICIENCY = 0.20; // 20% of cloud gas becomes stars

/** Protostellar accretion efficiency (fraction of core mass that lands on central star vs outflow) */
export const DEFAULT_ACCRETION_EFFICIENCY = 0.65;

/** Fraction of accreted mass ejected through bipolar collimated jets and magnetic winds */
export const BIPOLAR_JET_MASS_LOSS_FRACTION = 0.10; // ~10% of accretion flow

/** Characteristic accretion duration timescale in years (0.1 to 0.5 Myr for low-mass protostars) */
export const CHARACTERISTIC_ACCRETION_TIMESCALE_YEARS = 2.0e5;

/** Circumstellar disk mass fraction relative to protostar mass during Class I/II phase */
export const DEFAULT_DISK_MASS_FRACTION = 0.15; // ~15% of stellar mass

/** Maximum rotational velocity allowed before centrifugal breakup (fraction of Ω_breakup) */
export const MAX_SAFE_ROTATION_FRACTION = 0.85;

export {
  GRAVITATIONAL_CONSTANT_G,
  SPEED_OF_LIGHT_C,
  BOLTZMANN_CONSTANT_K,
  ATOMIC_MASS_UNIT_KG,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  YEAR_IN_SECONDS,
  PARSEC_IN_METERS,
  ASTRONOMICAL_UNIT_M,
};
