/**
 * StarDeathTypes.ts
 * Strongly typed data models, interfaces, and state definitions for Phase 10 Star Death & Remnants.
 */

import type { StellarEvolutionProperties } from '../starevolution/StarEvolutionTypes';
import type { StellarComposition, LuminosityClass } from '../stellar/StellarTypes';

// ── Evolutionary Death Stages ─────────────────────────────────────────────────

export type StellarDeathStage =
  | 'POST_HELIUM'
  | 'AGB'
  | 'ENVELOPE_EJECTION'
  | 'PLANETARY_NEBULA'
  | 'WHITE_DWARF_FORMATION'
  | 'WHITE_DWARF'
  | 'CORE_COLLAPSE'
  | 'SUPERNOVA'
  | 'NEUTRON_STAR_FORMATION'
  | 'NEUTRON_STAR'
  | 'BLACK_HOLE_FORMATION'
  | 'BLACK_HOLE';

export type RemnantType = 'WHITE_DWARF' | 'NEUTRON_STAR' | 'BLACK_HOLE';

// ── Specialized Sub-Models ────────────────────────────────────────────────────

export interface PlanetaryNebulaProperties {
  /** Gaseous nebula shell mass in Solar masses M_☉ */
  nebulaMassSolar: number;
  /** Current outer shell expansion radius in Astronomical Units (AU) */
  nebulaRadiusAU: number;
  /** Current outer shell expansion radius in parsecs (pc) */
  nebulaRadiusPc: number;
  /** Average expansion velocity in km/s */
  expansionVelocityKmS: number;
  /** Average gas number density in particles per cm³ */
  numberDensityCm3: number;
  /** Average electron temperature in Kelvin (K) */
  gasTemperatureK: number;
  /** Ionization fraction (0.0 to 1.0) */
  ionizationFraction: number;
  /** Total emitted fluorescence luminosity in Solar luminosities L_☉ */
  nebulaLuminositySolar: number;
  /** Age of expanding nebula in Earth years */
  nebulaAgeYears: number;
  /** Normalized visibility factor (fades to 0 as nebula disperses into ISM) */
  visibilityFraction: number;
}

export interface SupernovaProperties {
  /** Total isotropic kinetic explosion energy in Joules (SI) */
  explosionEnergyJoules: number;
  /** Total kinetic explosion energy in foes (1 foe = 10⁴⁴ J) */
  explosionEnergyFoe: number;
  /** Ejected envelope mass in Solar masses M_☉ */
  ejectaMassSolar: number;
  /** Shock front expansion velocity in km/s */
  ejectaVelocityKmS: number;
  /** Current shockwave radius in Astronomical Units (AU) */
  ejectaRadiusAU: number;
  /** Current shockwave radius in parsecs (pc) */
  ejectaRadiusPc: number;
  /** Peak bolometric luminosity at light curve maximum in L_☉ */
  peakLuminositySolar: number;
  /** Current instantaneous transient luminosity in L_☉ */
  currentLuminositySolar: number;
  /** Time elapsed since initial core collapse shock breakout in Earth days */
  timeSinceExplosionDays: number;
  /** Time elapsed since initial core collapse shock breakout in Earth years */
  timeSinceExplosionYears: number;
  /** Normalized transient luminosity fraction relative to peak */
  lightCurveFraction: number;
}

export interface WhiteDwarfProperties {
  /** Remnant degenerate core mass in Solar masses M_☉ */
  massSolar: number;
  /** Degenerate radius in Solar radii R_☉ */
  radiusSolar: number;
  /** Degenerate radius in SI kilometers (km) */
  radiusKm: number;
  /** Effective photospheric surface temperature in Kelvin (K) */
  effectiveTemperatureK: number;
  /** Current thermal cooling luminosity in Solar luminosities L_☉ */
  luminositySolar: number;
  /** Mean core mass density in kg m⁻³ (~10⁹ kg/m³) */
  meanDensityKgM3: number;
  /** Logarithmic surface gravity log10(g in cm/s²) (~8.0) */
  surfaceGravityLogG: number;
  /** Degenerate core composition (e.g. Carbon-Oxygen) */
  compositionType: 'CARBON_OXYGEN' | 'OXYGEN_NEON_MAGNESIUM' | 'HELIUM';
  /** Time spent cooling since envelope ejection in Earth years */
  coolingAgeYears: number;
}

export interface NeutronStarProperties {
  /** Remnant neutron star mass in Solar masses M_☉ */
  massSolar: number;
  /** Physical radius in kilometers (km) (~10–14 km) */
  radiusKm: number;
  /** Physical radius in Solar radii R_☉ */
  radiusSolar: number;
  /** Central nuclear density in kg m⁻³ (~10¹⁷ - 10¹⁸ kg/m³) */
  meanDensityKgM3: number;
  /** Dimensionless gravitational compactness parameter: GM / (R c²) */
  compactness: number;
  /** Surface escape velocity in km/s (relativistic: ~100,000 - 200,000 km/s) */
  escapeVelocityKmS: number;
  /** Surface escape velocity as fraction of speed of light (v_esc / c < 1.0) */
  escapeVelocityFractionC: number;
  /** Logarithmic surface gravity log10(g in cm/s²) (~14.0) */
  surfaceGravityLogG: number;
  /** Surface effective temperature in Kelvin (K) */
  effectiveTemperatureK: number;
  /** Thermal + rotational luminosity in Solar luminosities L_☉ */
  luminositySolar: number;
  /** Rotational spin period in seconds (s) */
  spinPeriodSeconds: number;
  /** Angular spin frequency in radians per second (rad/s) */
  spinFrequencyRadS: number;
  /** Surface dipole magnetic field strength in Gauss (G) */
  magneticFieldGauss: number;
  /** Instantaneous magnetic dipole spin-down rate dP/dt */
  spinDownRate: number;
  /** Whether the neutron star is actively observable as a pulsating radio/gamma-ray pulsar */
  isPulsar: boolean;
  /** Cooling age in Earth years */
  coolingAgeYears: number;
}

export interface BlackHoleProperties {
  /** Gravitational mass in Solar masses M_☉ */
  massSolar: number;
  /** Mass in SI kilograms (kg) */
  massKg: number;
  /** Schwarzschild event horizon radius in kilometers (km): r_s = 2GM / c² */
  schwarzschildRadiusKm: number;
  /** Schwarzschild event horizon radius in Solar radii R_☉ */
  schwarzschildRadiusSolar: number;
  /** Photon sphere radius in kilometers (km): 1.5 r_s */
  photonSphereRadiusKm: number;
  /** Innermost Stable Circular Orbit (ISCO) radius in kilometers (km): 3.0 r_s */
  iscoRadiusKm: number;
  /** Whether an active surrounding accretion disk is present */
  hasAccretionDisk: boolean;
  /** Gas mass accretion rate in Solar masses per year M_☉ / yr */
  accretionRateSolarPerYear: number;
  /** Accretion disk radiative luminosity in Solar luminosities L_☉ */
  accretionLuminositySolar: number;
  /** Peak inner accretion disk temperature in Kelvin (K) */
  innerDiskTemperatureK: number;
  /** Intrinsic event horizon temperature (Hawking radiation) in Kelvin (K) */
  hawkingTemperatureK: number;
  /** Age of black hole since collapse in Earth years */
  ageYears: number;
}

// ── Complete Stellar Death State Model ────────────────────────────────────────

export interface StellarDeathProperties {
  /** Unique stellar remnant identifier */
  id: string;
  /** Human-readable remnant name */
  name: string;
  /** Initial ZAMS progenitor mass in M_☉ */
  progenitorInitialMassSolar: number;
  /** Current remnant / system mass in M_☉ */
  currentMassSolar: number;
  /** Cumulative mass ejected into ISM (via winds, planetary nebula, or supernova) in M_☉ */
  ejectedMassSolar: number;
  /** Progenitor envelope chemical composition */
  composition: StellarComposition;

  // ── Time & Evolution ──
  /** Total elapsed time in stellar death phase in Earth years */
  deathAgeYears: number;
  /** Current death stage in state machine */
  stage: StellarDeathStage;
  /** Final determined remnant type */
  remnantType: RemnantType;

  // ── Photospheric / Emission Properties ──
  /** Total bolometric luminosity in Solar luminosities L_☉ */
  luminositySolar: number;
  /** Effective emission radius in Solar radii R_☉ */
  radiusSolar: number;
  /** Effective surface temperature in Kelvin (K) */
  effectiveTemperatureK: number;
  /** Absolute visual magnitude M_V */
  absoluteMagnitude: number;
  /** Morgan-Keenan or compact remnant spectral designation */
  spectralClass: string;
  /** Luminosity class */
  luminosityClass: LuminosityClass;
  /** Full spectral designation */
  fullSpectralDesignation: string;

  // ── Specialized Subsystem States (Present where applicable) ──
  planetaryNebula?: PlanetaryNebulaProperties;
  supernova?: SupernovaProperties;
  whiteDwarf?: WhiteDwarfProperties;
  neutronStar?: NeutronStarProperties;
  blackHole?: BlackHoleProperties;

  // ── 3D Scene Position ──
  position: [number, number, number];
}

// ── Track Data for Death Pathways ─────────────────────────────────────────────

export interface DeathTrackPoint {
  /** Age in Earth years from start of death phase */
  ageYears: number;
  /** Evolutionary stage */
  stage: StellarDeathStage;
  /** Stellar / remnant mass in M_☉ */
  massSolar: number;
  /** Core / remnant mass in M_☉ */
  coreMassSolar: number;
  /** Bolometric luminosity in L_☉ */
  luminositySolar: number;
  /** Effective radius in R_☉ */
  radiusSolar: number;
  /** Surface temperature in Kelvin (K) */
  effectiveTemperatureK: number;
  /** Remnant type */
  remnantType: RemnantType;
}

export interface DeathTrack {
  progenitorMassSolar: number;
  remnantType: RemnantType;
  points: DeathTrackPoint[];
}

// ── Visual Rendering Data Binding ────────────────────────────────────────────

export interface StarDeathVisualProperties {
  /** Remnant core photosphere hex color */
  coreHexColor: string;
  /** Surrounding gas / corona glow hex color */
  glowColor: string;
  /** Visual radius for exploration viewport rendering */
  visualRadiusExploration: number;
  /** Visual radius for scientific/proportional scale */
  visualRadiusScientific: number;
  /** Visual radius of expanding outer shell (PN / SN) in exploration units */
  envelopeVisualRadius: number;
  /** Visual surface brightness (0.0 to 1.0) */
  brightness: number;
  /** Recommended bloom intensity factor */
  bloomIntensity: number;
  /** Relativistic gravitational lensing intensity (0.0 to 1.0 for BH / NS) */
  lensingStrength: number;
  /** Pulsar beam emission angle in radians */
  pulsarBeamAngleRad: number;
  /** Accretion disk inner color */
  diskColor: string;
}

// ── Configuration Inputs ─────────────────────────────────────────────────────

export interface StellarDeathConfig {
  /** Phase 9 Evolved Star State (Required for seamless handoff) */
  progenitorStar?: StellarEvolutionProperties;
  /** Progenitor initial mass in M_☉ if initializing standalone */
  initialMassSolar?: number;
  /** Custom identifier */
  id?: string;
  /** Custom name */
  name?: string;
  /** Metallicity [Fe/H] */
  metallicityFeH?: number;
  /** Initial age in death phase (default: 0.0) */
  initialDeathAgeYears?: number;
  /** 3D spatial position [x, y, z] */
  position?: [number, number, number];
}
