/**
 * constants.ts
 * Physical and astronomical constants used throughout the simulation.
 * Values are in SI units unless otherwise noted.
 *
 * NOTE: Visual scale factors are separate from physical constants.
 * The simulation uses visually-adjusted scales for rendering.
 */

// ── Fundamental Constants ────────────────────────────────────────────────────

export const SPEED_OF_LIGHT = 2.998e8;          // m/s
export const GRAVITATIONAL_CONSTANT = 6.674e-11; // m³ kg⁻¹ s⁻²
export const PLANCK_CONSTANT = 6.626e-34;        // J·s
export const STEFAN_BOLTZMANN = 5.67e-8;         // W m⁻² K⁻⁴
export const WIEN_CONSTANT = 2.898e-3;           // m·K

// ── Solar Reference Values ───────────────────────────────────────────────────

export const SOLAR_MASS_KG = 1.989e30;           // kg
export const SOLAR_RADIUS_M = 6.957e8;           // m
export const SOLAR_LUMINOSITY_W = 3.828e26;      // W
export const SOLAR_TEMPERATURE_K = 5778;         // K (effective surface)
export const SOLAR_AGE_YEARS = 4.6e9;            // years

// ── Astronomical Units ───────────────────────────────────────────────────────

export const AU_METERS = 1.496e11;               // meters per AU
export const LIGHT_YEAR_METERS = 9.461e15;       // meters per light-year
export const PARSEC_METERS = 3.086e16;           // meters per parsec

// ── Stellar Mass Thresholds (in solar masses) ────────────────────────────────

/** Stars below this mass become red dwarfs and skip the giant branch */
export const LOW_MASS_THRESHOLD = 0.8;

/** Stars above this mass undergo core-collapse supernova */
export const HIGH_MASS_THRESHOLD = 8.0;

/** Chandrasekhar limit: max mass for stable white dwarf (solar masses) */
export const CHANDRASEKHAR_LIMIT = 1.4;

/** Tolman-Oppenheimer-Volkoff limit: max mass for neutron star (solar masses) */
export const TOV_LIMIT = 2.5;  // Approximate; exact value uncertain

// ── Temperature Ranges for Stellar Classification ────────────────────────────

export const SPECTRAL_CLASS_TEMPS: Record<string, [number, number]> = {
  O: [30000, 100000],   // Blue
  B: [10000, 30000],    // Blue-white
  A: [7500, 10000],     // White
  F: [6000, 7500],      // Yellow-white
  G: [5200, 6000],      // Yellow (Sun-like)
  K: [3700, 5200],      // Orange
  M: [2400, 3700],      // Red
};

// ── Visual Scale Factors ─────────────────────────────────────────────────────
// These are NOT physical — they are chosen to make the scene visually readable.

/** Scene units per AU (for solar system scale) */
export const SCENE_AU = 10;

/** Scene units per light-year (for galactic scale) */
export const SCENE_LIGHT_YEAR = 1;

/** Sun visual radius in scene units */
export const SUN_VISUAL_RADIUS = 1.5;

/** Earth visual radius multiplier relative to Sun */
export const EARTH_SUN_RADIUS_RATIO = 0.009;  // Real: 0.00916

// ── Simulation Time ──────────────────────────────────────────────────────────

/** Base simulation tick in milliseconds */
export const SIM_TICK_MS = 16.67;

/** Default time scale (1 = real-time; higher = faster simulation) */
export const DEFAULT_TIME_SCALE = 1;

/** Minimum and maximum allowed time scales */
export const MIN_TIME_SCALE = 0;
export const MAX_TIME_SCALE = 1e9;  // Extreme acceleration for stellar evolution

// ── Starfield ────────────────────────────────────────────────────────────────

export const STARFIELD_COUNT = 50000;
export const STARFIELD_RADIUS = 2000;

// ── Camera Distances (scene units) ───────────────────────────────────────────

export const CAMERA_UNIVERSE_DISTANCE = 800;
export const CAMERA_GALAXY_DISTANCE = 200;
export const CAMERA_SOLAR_SYSTEM_DISTANCE = 80;
export const CAMERA_STAR_DISTANCE = 5;
export const CAMERA_PLANET_DISTANCE = 0.5;
