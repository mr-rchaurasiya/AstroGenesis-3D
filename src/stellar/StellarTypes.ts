/**
 * StellarTypes.ts
 * Comprehensive TypeScript data models and interfaces for the Stellar Physics Engine.
 */

// ── Stellar Evolutionary States (Phases 7–10 roadmap compatible) ──────────────

export type StellarEvolutionaryState =
  | 'PROTOSTAR'
  | 'PRE_MAIN_SEQUENCE'
  | 'MAIN_SEQUENCE'
  | 'SUBGIANT'
  | 'RED_GIANT'
  | 'HELIUM_BURNING'
  | 'AGB'           // Asymptotic Giant Branch
  | 'POST_AGB'
  | 'WHITE_DWARF'
  | 'NEUTRON_STAR'
  | 'BLACK_HOLE';

// ── Morgan-Keenan Spectral Classification ───────────────────────────────────

export type SpectralTypeLetter =
  | 'O'
  | 'B'
  | 'A'
  | 'F'
  | 'G'
  | 'K'
  | 'M'
  | 'L'
  | 'T'
  | 'Y';

export type LuminosityClass =
  | '0'    // Hypergiant (or Ia+)
  | 'Ia+'  // Hypergiant
  | 'Ia'   // Luminous Supergiant
  | 'Ib'   // Less luminous Supergiant
  | 'II'   // Bright Giant
  | 'III'  // Regular Giant
  | 'IV'   // Subgiant
  | 'V'    // Main Sequence (Dwarf)
  | 'VI'   // Subdwarf
  | 'VII'; // White Dwarf

export type SpectralClass = `${SpectralTypeLetter}${number}`; // e.g., 'G2', 'O5', 'M4'

// ── Nuclear Fusion Processes ──────────────────────────────────────────────────

export type FusionProcessType =
  | 'PP_CHAIN'
  | 'CNO_CYCLE'
  | 'TRIPLE_ALPHA'
  | 'CARBON_BURNING'
  | 'ADVANCED_BURNING'
  | 'NONE'
  | 'DEGENERATE';

// ── Stellar Composition ───────────────────────────────────────────────────────

export interface StellarComposition {
  /** Hydrogen mass fraction X (0–1) */
  hydrogenFraction: number;
  /** Helium mass fraction Y (0–1) */
  heliumFraction: number;
  /** Metals mass fraction Z (0–1) */
  metalFraction: number;
  /** Iron-to-hydrogen abundance relative to Sun [Fe/H] (logarithmic) */
  metallicityFeH?: number;
  /** Mean molecular weight μ (fully ionized plasma) */
  meanMolecularWeight: number;
}

// ── Stellar Core Conditions Model ─────────────────────────────────────────────

export interface StellarCoreProperties {
  /** Estimated core temperature in Kelvin */
  coreTemperatureK: number;
  /** Estimated core density in kg m⁻³ */
  coreDensityKgM3: number;
  /** Estimated core pressure in Pascals (N/m²) */
  corePressurePa: number;
  /** Estimated fractional radius of the nuclear energy generation core */
  coreRadiusFraction: number;
  /** Estimated fractional mass of the nuclear energy generation core */
  coreMassFraction: number;
  /** Relative energy generation rate proxy from PP-chain */
  ppChainRateRelative: number;
  /** Relative energy generation rate proxy from CNO-cycle */
  cnoCycleRateRelative: number;
  /** Primary dominant nuclear fusion mechanism */
  dominantFusionProcess: FusionProcessType;
  /** Hydrostatic equilibrium proxy: inward gravitational pressure (arbitrary normalized scale) */
  gravitationalPressureProxy: number;
  /** Hydrostatic equilibrium proxy: outward thermal/radiation pressure (arbitrary normalized scale) */
  thermalPressureProxy: number;
  /** Hydrostatic equilibrium ratio (1.0 = stable equilibrium) */
  equilibriumRatio: number;
}

// ── Complete Stellar Properties ───────────────────────────────────────────────

export interface StellarProperties {
  /** Unique stellar identifier */
  id: string;
  /** Human-readable star name */
  name: string;

  // ── Fundamental Physical Dimensions ──
  /** Mass in Solar Masses (M_☉) */
  massSolar: number;
  /** Mass in SI kilograms (kg) */
  massKg: number;
  /** Radius in Solar Radii (R_☉) */
  radiusSolar: number;
  /** Radius in SI meters (m) */
  radiusM: number;
  /** Bolometric Luminosity in Solar Luminosities (L_☉) */
  luminositySolar: number;
  /** Bolometric Luminosity in SI Watts (W) */
  luminosityWatts: number;
  /** Effective surface temperature in Kelvin (K) */
  effectiveTemperatureK: number;

  // ── Gravitational & Mechanical Properties ──
  /** Surface gravity in SI m s⁻² (GM/R²) */
  surfaceGravityMs2: number;
  /** Surface gravity relative to Sun (g/g_☉) */
  surfaceGravitySolar: number;
  /** Logarithmic surface gravity in cgs units: log10(g in cm/s²) */
  surfaceGravityLogG: number;
  /** Mean stellar density in SI kg m⁻³ */
  meanDensityKgM3: number;
  /** Mean stellar density relative to Sun (ρ/ρ_☉) */
  meanDensitySolar: number;
  /** Surface escape velocity in SI m s⁻¹ */
  escapeVelocityMs: number;
  /** Surface escape velocity in km s⁻¹ */
  escapeVelocityKms: number;
  /** Gravitational binding energy proxy in Joules */
  gravitationalBindingEnergyJoules: number;

  // ── Radiation & Magnitude Properties ──
  /** Absolute bolometric magnitude M_bol */
  bolometricMagnitude: number;
  /** Absolute visual magnitude M_V */
  absoluteMagnitude: number;
  /** Apparent visual magnitude m_V (if distance is provided) */
  apparentMagnitude?: number;
  /** Distance in parsecs (pc) */
  distanceParsecs?: number;
  /** Theoretical Eddington luminosity in SI Watts */
  eddingtonLuminosityWatts: number;
  /** Theoretical Eddington luminosity in Solar Luminosities (L_☉) */
  eddingtonLuminositySolar: number;
  /** Eddington luminosity ratio (L / L_Edd) */
  eddingtonRatio: number;

  // ── Spectral & Evolutionary Classification ──
  /** Evolutionary state of the star */
  evolutionaryState: StellarEvolutionaryState;
  /** Morgan-Keenan spectral type letter (O, B, A, F, G, K, M, L, T, Y) */
  spectralTypeLetter: SpectralTypeLetter;
  /** Decimal spectral subtype (0.0 to 9.9) */
  spectralSubtype: number;
  /** Combined spectral classification string (e.g. 'G2') */
  spectralClass: SpectralClass;
  /** Morgan-Keenan luminosity class (I through VII) */
  luminosityClass: LuminosityClass;
  /** Full standard spectral designation (e.g. 'G2V', 'M2Iab') */
  fullSpectralDesignation: string;

  // ── Time & Lifespan Properties ──
  /** Current stellar age in years */
  ageYears: number;
  /** Total estimated Main Sequence lifetime in years */
  mainSequenceLifetimeYears: number;
  /** Estimated remaining Main Sequence lifetime in years */
  remainingLifetimeYears: number;
  /** Fractional age completed relative to Main Sequence lifetime (0.0 to 1.0+) */
  fractionalAge: number;

  // ── Composition & Core Physics ──
  /** Stellar elemental composition */
  composition: StellarComposition;
  /** Core thermodynamic and nuclear fusion state */
  core: StellarCoreProperties;

  // ── Energy & Mass Conversion Rates ──
  /** Total core fusion power generation in SI Watts */
  fusionPowerWatts: number;
  /** Core fusion power relative to Sun (P_fusion / L_☉) */
  fusionPowerSolar: number;
  /** Rate of hydrogen core mass converted into energy in kg s⁻¹ (L / (η * c²)) */
  hydrogenBurningRateKgS: number;
  /** Net rest mass converted directly into radiation per second in kg s⁻¹ (L / c²) */
  massLossRadiationRateKgS: number;

  // ── Rotation & Magnetic Activity (Phase 7 placeholders for Phase 8–10) ──
  /** Stellar rotation period in Earth days */
  rotationPeriodDays?: number;
  /** Equatorial rotational velocity in km s⁻¹ */
  rotationVelocityKms?: number;
  /** Magnetic activity index (0–1 normalized) */
  magneticActivityIndex?: number;
  /** Activity cycle period in years */
  activityCycleYears?: number;
  /** Average flare frequency per hour */
  flareRatePerHour?: number;
}

// ── Visual Physics Binding (Decoupled from Three.js rendering) ───────────────

export interface StellarVisualProperties {
  /** Physically normalized linear RGB color channels [r, g, b] in range [0, 1] */
  rgbColor: [number, number, number];
  /** CSS Hex color string for photosphere surface */
  hexColor: string;
  /** CSS Hex color string for outer coronal glow */
  coronaColor: string;
  /** Normalized visual surface brightness (0.0 to 1.0) */
  brightness: number;
  /** Recommended post-processing bloom intensity factor */
  bloomIntensity: number;
  /** Visual radius for exploration scale rendering */
  visualRadiusExploration: number;
  /** Visual radius for scientific/proportional scale rendering */
  visualRadiusScientific: number;
  /** Descriptive educational summary of spectral appearance */
  spectralDescription: string;
}

// ── Hertzsprung-Russell Data Point ───────────────────────────────────────────

export interface HRDataPoint {
  /** Effective surface temperature in Kelvin (X-axis, typically reversed) */
  effectiveTemperatureK: number;
  /** Luminosity in Solar Units (Y-axis, logarithmic) */
  luminositySolar: number;
  /** Absolute visual magnitude M_V (alternative Y-axis) */
  absoluteMagnitude: number;
  /** Spectral type designation (e.g. 'G2') */
  spectralClass: SpectralClass;
  /** Luminosity class (e.g. 'V', 'III') */
  luminosityClass: LuminosityClass;
  /** Evolutionary state enum */
  evolutionaryState: StellarEvolutionaryState;
  /** Surface photosphere color in CSS hex format */
  colorHex: string;
  /** Star identifier */
  id: string;
  /** Star name */
  name: string;
}

// ── Model Input Specification ────────────────────────────────────────────────

export interface StellarModelInput {
  /** Star identifier (auto-generated if omitted) */
  id?: string;
  /** Star name */
  name?: string;
  /** Mass in Solar masses M_☉ (Required) */
  massSolar: number;
  /** Explicit radius in Solar radii R_☉ (Optional: derived from mass if omitted) */
  radiusSolar?: number;
  /** Explicit luminosity in Solar luminosities L_☉ (Optional: derived from mass/radius if omitted) */
  luminositySolar?: number;
  /** Explicit effective surface temperature in Kelvin (Optional: derived via Stefan-Boltzmann if omitted) */
  effectiveTemperatureK?: number;
  /** Current age in years (Optional: default = 0.5 * MS lifetime) */
  ageYears?: number;
  /** Metallicity [Fe/H] relative to solar (Optional: default = 0.0) */
  metallicityFeH?: number;
  /** Explicit metal fraction Z (Optional: overrides [Fe/H] if specified) */
  metalFraction?: number;
  /** Explicit hydrogen fraction X (Optional) */
  hydrogenFraction?: number;
  /** Explicit evolutionary state (Optional: default = MAIN_SEQUENCE) */
  evolutionaryState?: StellarEvolutionaryState;
  /** Explicit Morgan-Keenan luminosity class (Optional: default = 'V' for MS) */
  luminosityClass?: LuminosityClass;
  /** Distance from observer in parsecs (Optional: for apparent magnitude calculation) */
  distanceParsecs?: number;
  /** Stellar rotation period in days (Optional) */
  rotationPeriodDays?: number;
}
