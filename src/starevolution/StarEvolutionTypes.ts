/**
 * StarEvolutionTypes.ts
 * Strongly typed data models and interfaces for the Stellar Evolution Engine.
 */

import type {
  SpectralClass,
  LuminosityClass,
  StellarComposition,
  StellarVisualProperties,
  SpectralTypeLetter,
} from '../stellar/StellarTypes';

// ── Evolutionary Stages (Phase 9 Scope: stops before Phase 10 Remnants) ────────

export type StellarEvolutionStage =
  | 'ZERO_AGE_MAIN_SEQUENCE'
  | 'MAIN_SEQUENCE'
  | 'HYDROGEN_DEPLETION'
  | 'SUBGIANT'
  | 'RED_GIANT'
  | 'HELIUM_IGNITION'
  | 'HELIUM_BURNING'
  | 'ASYMPTOTIC_GIANT_BRANCH'
  | 'SUPERGIANT'
  | 'POST_HELIUM';

// ── Complete Stellar Evolution State Model ────────────────────────────────────

export interface StellarEvolutionProperties {
  /** Unique stellar identifier */
  id: string;
  /** Human-readable star name */
  name: string;

  // ── Mass Properties & Mass Loss ──
  /** Initial ZAMS mass in Solar masses M_☉ */
  initialMassSolar: number;
  /** Current stellar mass after cumulative wind mass loss in M_☉ */
  currentMassSolar: number;
  /** Current mass in SI kilograms (kg) */
  massKg: number;
  /** Core mass (inward dense burning/inert core) in M_☉ */
  coreMassSolar: number;
  /** Outer convective/radiative envelope mass in M_☉ */
  envelopeMassSolar: number;
  /** Cumulative mass ejected through stellar winds in M_☉ */
  ejectedMassSolar: number;
  /** Instantaneous stellar wind mass loss rate in M_☉ / year */
  massLossRateSolarPerYear: number;

  // ── Time & Evolution Progress ──
  /** Current stellar age in Earth years */
  ageYears: number;
  /** Total Main Sequence lifetime in Earth years */
  mainSequenceLifetimeYears: number;
  /** Remaining Main Sequence lifetime in Earth years */
  remainingMainSequenceLifetimeYears: number;
  /** Normalized Main Sequence progress fraction (0.0 = ZAMS, 1.0 = H-exhaustion) */
  evolutionFraction: number;
  /** Total stellar lifespan until post-helium handoff in Earth years */
  totalLifespanYears: number;
  /** Current evolutionary stage */
  stage: StellarEvolutionStage;

  // ── Photospheric Radiative Properties ──
  /** Current bolometric luminosity in Solar luminosities L_☉ */
  luminositySolar: number;
  /** Bolometric luminosity in SI Watts */
  luminosityWatts: number;
  /** Current stellar radius in Solar radii R_☉ */
  radiusSolar: number;
  /** Stellar radius in SI meters (m) */
  radiusM: number;
  /** Effective surface photospheric temperature in Kelvin (K) */
  effectiveTemperatureK: number;
  /** Surface gravity in SI m s⁻² (GM/R²) */
  surfaceGravityMs2: number;
  /** Surface gravity relative to Sun (g/g_☉) */
  surfaceGravitySolar: number;
  /** Logarithmic surface gravity in cgs units: log10(g in cm/s²) */
  surfaceGravityLogG: number;

  // ── Core Thermodynamics & Composition ──
  /** Central core temperature in Kelvin (K) */
  coreTemperatureK: number;
  /** Central core mass density in kg m⁻³ */
  coreDensityKgM3: number;
  /** Overall envelope chemical composition */
  composition: StellarComposition;
  /** Fractional hydrogen abundance in central fusion core (X_core, 0.0 to X_0) */
  coreHydrogenFraction: number;
  /** Fractional helium abundance in central fusion core (Y_core, Y_0 to 1.0) */
  coreHeliumFraction: number;
  /** Fractional carbon + oxygen abundance in core (accumulates during He burning) */
  coreCarbonOxygenFraction: number;

  // ── Classification & Magnitudes ──
  /** Morgan-Keenan spectral type letter (O, B, A, F, G, K, M, L, T, Y) */
  spectralTypeLetter: SpectralTypeLetter;
  /** Decimal spectral subtype (0 to 9) */
  spectralSubtype: number;
  /** Combined spectral classification string (e.g. 'G2', 'M2') */
  spectralClass: SpectralClass;
  /** Morgan-Keenan luminosity class (V, IV, III, II, Ib, Ia, 0) */
  luminosityClass: LuminosityClass;
  /** Full standard spectral designation (e.g. 'G2V', 'M2III', 'B8Ia') */
  fullSpectralDesignation: string;
  /** Absolute bolometric magnitude M_bol */
  bolometricMagnitude: number;
  /** Absolute visual magnitude M_V */
  absoluteMagnitude: number;

  // ── Flags for Branch Routing ──
  /** Whether the star is currently in its main sequence phase */
  isMainSequence: boolean;
  /** Whether the star has exhausted core hydrogen and entered post-MS */
  isPostMainSequence: boolean;
  /** Whether the star is actively burning helium in its core */
  isHeliumBurning: boolean;
  /** Whether the star is massive (M >= 8.0 M_☉) */
  isMassiveStar: boolean;
  /** Whether the star is low-mass (M < 0.35 M_☉) */
  isLowMassStar: boolean;

  // ── 3D Spatial Position ──
  /** Position [x, y, z] in scene units */
  position: [number, number, number];
}

// ── Hertzsprung-Russell Diagram Evolution Track ──────────────────────────────

export interface EvolutionTrackPoint {
  /** Star age in Earth years at this point */
  ageYears: number;
  /** Bolometric luminosity in Solar luminosities L_☉ */
  luminositySolar: number;
  /** Effective surface temperature in Kelvin (K) */
  effectiveTemperatureK: number;
  /** Stellar radius in Solar radii R_☉ */
  radiusSolar: number;
  /** Absolute visual magnitude M_V */
  absoluteMagnitude: number;
  /** Evolutionary stage at this point */
  stage: StellarEvolutionStage;
  /** Morgan-Keenan spectral classification at this point */
  spectralClass: SpectralClass;
  /** Luminosity class at this point */
  luminosityClass: LuminosityClass;
  /** Surface photosphere color in CSS hex format */
  colorHex: string;
}

export interface EvolutionTrack {
  /** Initial star mass in M_☉ */
  initialMassSolar: number;
  /** Metallicity [Fe/H] */
  metallicityFeH: number;
  /** Chronologically ordered array of track points from ZAMS to Post-Helium */
  points: EvolutionTrackPoint[];
}

// ── Visual Rendering Data Binding ────────────────────────────────────────────

export interface StarEvolutionVisualProperties {
  /** Base photosphere hex color string */
  hexColor: string;
  /** Coronal halo glow color string */
  coronaColor: string;
  /** Visual radius for exploration scale rendering */
  visualRadiusExploration: number;
  /** Visual radius for scientific/proportional scale rendering */
  visualRadiusScientific: number;
  /** Normalized visual surface brightness (0.0 to 1.0) */
  brightness: number;
  /** Recommended post-processing bloom intensity factor */
  bloomIntensity: number;
  /** Convective atmospheric pulsation amplitude (0.0 for MS, up to 0.4 for RGB/AGB/Supergiants) */
  pulsationAmplitude: number;
  /** Surface granulation scale factor */
  granulationScale: number;
  /** Underlying Phase 7 stellar visual properties */
  stellarVisual: StellarVisualProperties;
}

// ── Configuration Inputs ─────────────────────────────────────────────────────

export interface StellarEvolutionConfig {
  /** Initial ZAMS mass in Solar masses M_☉ (Required) */
  initialMassSolar: number;
  /** Star identifier */
  id?: string;
  /** Star name */
  name?: string;
  /** Metallicity [Fe/H] (default: 0.0) */
  metallicityFeH?: number;
  /** Initial age in years (default: 0.0 for ZAMS) */
  initialAgeYears?: number;
  /** 3D spatial position [x, y, z] */
  position?: [number, number, number];
}
