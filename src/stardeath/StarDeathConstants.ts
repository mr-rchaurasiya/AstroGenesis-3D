/**
 * StarDeathConstants.ts
 * Fundamental astrophysical constants, critical mass boundaries,
 * and physical thresholds for stellar death, supernovae, and compact remnants.
 */

// ── 1. Critical Mass Limits (Solar Masses M_☉) ────────────────────────────────

/** Chandrasekhar mass limit for non-rotating electron-degenerate carbon-oxygen cores */
export const CHANDRASEKHAR_MASS_LIMIT_SOLAR = 1.44;

/** Tolman-Oppenheimer-Volkoff (TOV) theoretical maximum mass limit for neutron stars */
export const TOV_MASS_LIMIT_SOLAR = 2.17;

/** Upper bound for extreme equation-of-state neutron stars before guaranteed black hole collapse */
export const MAXIMUM_NEUTRON_STAR_MASS_SOLAR = 3.0;

/** Threshold core mass below which low/intermediate mass stars shed envelopes into planetary nebulae */
export const MAXIMUM_WHITE_DWARF_CORE_MASS_SOLAR = 1.38;

/** Approximate initial stellar mass boundary separating white dwarf from core-collapse pathways (~8 M_☉) */
export const NOMINAL_CORE_COLLAPSE_INITIAL_MASS_SOLAR = 8.0;

/** Approximate initial stellar mass boundary separating neutron star from direct black hole collapse (~25 M_☉) */
export const DIRECT_BLACK_HOLE_INITIAL_MASS_SOLAR = 25.0;

// ── 2. Compact Object Scales ──────────────────────────────────────────────────

/** Canonical neutron star radius in kilometers (~11.5 km) */
export const CANONICAL_NEUTRON_STAR_RADIUS_KM = 11.5;

/** Canonical neutron star radius in Solar radii R_☉ (~1.65e-5 R_☉) */
export const CANONICAL_NEUTRON_STAR_RADIUS_SOLAR = 1.652e-5;

/** Canonical Carbon-Oxygen White Dwarf reference radius in Solar radii R_☉ (~0.01 R_☉ ≈ Earth size) */
export const CANONICAL_WHITE_DWARF_RADIUS_SOLAR = 0.012;

/** Gravitational constant G in SI units (m³ kg⁻¹ s⁻²) */
export const GRAVITATIONAL_CONSTANT_G = 6.67430e-11;

/** Speed of light c in SI units (m s⁻¹) */
export const SPEED_OF_LIGHT_C = 299792458;

/** Schwarzschild radius scaling factor in meters per solar mass: 2 G M_☉ / c² ≈ 2953.25 m */
export const SCHWARZSCHILD_RADIUS_METERS_PER_SOLAR_MASS = 2953.25;

// ── 3. Supernova & Planetary Nebula Energetics ─────────────────────────────────

/** Standard canonical core-collapse supernova kinetic explosion energy (1 foe = 10⁴⁴ Joules = 10⁵¹ ergs) */
export const CANONICAL_SUPERNOVA_ENERGY_JOULES = 1.0e44;

/** Peak core-collapse supernova bolometric luminosity in Solar units (~10⁹ L_☉) */
export const CANONICAL_SUPERNOVA_PEAK_LUMINOSITY_SOLAR = 1.0e9;

/** Mean supernova ejecta expansion velocity in km/s (~10,000 km/s) */
export const CANONICAL_SUPERNOVA_EJECTA_VELOCITY_KM_S = 10000;

/** Mean planetary nebula expansion velocity in km/s (~25 km/s) */
export const CANONICAL_PLANETARY_NEBULA_EXPANSION_KM_S = 25;

/** Typical planetary nebula visibility duration in Earth years (~50,000 years) */
export const PLANETARY_NEBULA_LIFETIME_YEARS = 50000;

/** Mean radioactive nickel-56 decay half-life in days (⁶⁶Ni -> ⁵⁶Co) */
export const NICKEL_56_HALF_LIFE_DAYS = 6.075;

/** Mean radioactive cobalt-56 decay half-life in days (⁵⁶Co -> ⁵⁶Fe) */
export const COBALT_56_HALF_LIFE_DAYS = 77.233;

// ── 4. White Dwarf Cooling & Pulsar Parameters ─────────────────────────────────

/** Initial birth surface temperature of newly exposed young white dwarf core in Kelvin (~120,000 K) */
export const INITIAL_WHITE_DWARF_TEMPERATURE_K = 120000;

/** Canonical magnetic dipole surface field strength for young pulsars in Gauss (~10¹² G) */
export const CANONICAL_PULSAR_MAGNETIC_FIELD_GAUSS = 1.0e12;

/** Canonical young pulsar initial rotational spin period in seconds (~0.033 s = 33 ms, Crab pulsar analog) */
export const CANONICAL_YOUNG_PULSAR_PERIOD_S = 0.033;
