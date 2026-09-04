/**
 * StarBirthTypes.ts
 * Strongly typed data models and interfaces for the Star Birth / Star Formation Engine.
 */

import type { StellarProperties, StellarVisualProperties } from '../stellar/StellarTypes';

// ── State Enums ──────────────────────────────────────────────────────────────

export type CloudState =
  | 'STABLE'
  | 'PERTURBED'
  | 'COMPRESSING'
  | 'COLLAPSING'
  | 'FRAGMENTING'
  | 'STAR_FORMING'
  | 'DISPERSED';

export type ProtostarState =
  | 'COLLAPSING_CORE'
  | 'PROTOSTAR'
  | 'ACCRETION'
  | 'T_TAURI'
  | 'PRE_MAIN_SEQUENCE'
  | 'HYDROGEN_IGNITION'
  | 'ZERO_AGE_MAIN_SEQUENCE'
  | 'SUBSTELLAR_OBJECT'
  | 'BROWN_DWARF';

// ── Molecular Cloud Model ────────────────────────────────────────────────────

export interface MolecularCloudProperties {
  /** Unique cloud identifier */
  id: string;
  /** Human readable cloud name */
  name: string;
  /** Cloud gas mass in Solar masses M_☉ */
  massSolar: number;
  /** Cloud gas mass in SI kilograms (kg) */
  massKg: number;
  /** Cloud outer radius in parsecs (pc) */
  radiusPc: number;
  /** Cloud outer radius in SI meters (m) */
  radiusM: number;
  /** Mean isothermal gas temperature in Kelvin (K) */
  temperatureK: number;
  /** Average mass density in SI kg m⁻³ */
  meanDensityKgM3: number;
  /** Average molecular number density in particles cm⁻³ */
  numberDensityCm3: number;
  /** Metallicity [Fe/H] */
  metallicityFeH: number;
  /** Turbulent velocity dispersion in km s⁻¹ */
  velocityDispersionKmS: number;
  /** Normalized turbulence support parameter (0.0 = quiescent, 1.0 = highly turbulent) */
  turbulenceParameter: number;
  /** Normalized angular rotation rate (0.0 to 1.0) */
  rotationParameter: number;
  /** Gravitational binding energy in Joules */
  gravitationalBindingEnergyJoules: number;
  /** Gravitational free-fall time in Earth years */
  freeFallTimeYears: number;
  /** Isothermal Jeans length in parsecs (pc) */
  jeansLengthPc: number;
  /** Isothermal Jeans mass in Solar masses (M_☉) */
  jeansMassSolar: number;
  /** Virial stability parameter α_vir = 5 σ_v² R / (G M) (< 1.0 = gravitationally bound & collapsing) */
  virialParameter: number;
  /** Current evolutionary state of the molecular cloud */
  state: CloudState;
  /** Normalized collapse progression factor (0.0 to 1.0) */
  collapseProgress: number;
  /** Remaining uncollapsed gas mass in M_☉ */
  gasRemainingSolar: number;
  /** Total stellar mass successfully condensed in M_☉ */
  stellarMassFormedSolar: number;
  /** Total mass ejected via energetic bipolar outflows in M_☉ */
  outflowMassSolar: number;
  /** 3D spatial center position [x, y, z] in scene units */
  position: [number, number, number];
}

// ── Circumstellar Accretion Disk Model ───────────────────────────────────────

export interface CircumstellarDiskProperties {
  /** Disk gas & dust mass in Solar masses M_☉ */
  massSolar: number;
  /** Inner radius of disk in Astronomical Units (AU) */
  innerRadiusAU: number;
  /** Outer radius of disk in Astronomical Units (AU) */
  outerRadiusAU: number;
  /** Current mass accretion rate through disk onto central star in M_☉ / year */
  accretionRateSolarPerYear: number;
  /** Temperature at inner disk boundary in Kelvin */
  temperatureInnerK: number;
  /** Temperature at outer disk boundary in Kelvin */
  temperatureOuterK: number;
  /** Orbital inclination angle of disk plane in degrees */
  inclinationDeg: number;
  /** Normalized disk photoevaporative dissipation progress (0.0 = thick disk, 1.0 = fully cleared) */
  dissipationProgress: number;
}

// ── Bipolar Protostellar Jets & Outflows ──────────────────────────────────────

export interface ProtostellarJetProperties {
  /** Collimated outflow velocity along magnetic poles in km s⁻¹ */
  jetVelocityKmS: number;
  /** Mass ejection rate through bipolar jets in M_☉ / year */
  massLossRateSolarPerYear: number;
  /** Jet opening / collimation half-angle in degrees */
  openingAngleDeg: number;
  /** Extent / length of visible Herbig-Haro jet lobe in AU */
  lengthAU: number;
  /** Normalized jet emission activity level (0.0 = dormant, 1.0 = maximum outflow) */
  activity: number;
  /** Jet 3D orientation axis unit vector [x, y, z] */
  axis: [number, number, number];
}

// ── Protostellar Core & Protostar Model ───────────────────────────────────────

export interface ProtostarProperties {
  /** Unique protostar identifier */
  id: string;
  /** Human readable protostar name */
  name: string;
  /** Parent molecular cloud ID */
  parentId: string;
  /** Current accumulated protostellar mass in M_☉ */
  massSolar: number;
  /** Current mass in SI kilograms (kg) */
  massKg: number;
  /** Photospheric radius in Solar radii (R_☉) */
  radiusSolar: number;
  /** Radius in SI meters (m) */
  radiusM: number;
  /** Total bolometric luminosity in Solar luminosities (L_☉) */
  luminositySolar: number;
  /** Total bolometric luminosity in SI Watts */
  luminosityWatts: number;
  /** Luminosity generated by gravitational infall / accretion shock in L_☉ */
  accretionLuminositySolar: number;
  /** Internal thermal / Kelvin-Helmholtz contraction luminosity in L_☉ */
  internalLuminositySolar: number;
  /** Effective surface photospheric temperature in Kelvin (K) */
  effectiveTemperatureK: number;
  /** Central core temperature in Kelvin (K) */
  coreTemperatureK: number;
  /** Central core mass density in kg m⁻³ */
  coreDensityKgM3: number;
  /** Current instantaneous mass accretion rate in M_☉ / year */
  accretionRateSolarPerYear: number;
  /** Current protostellar age in Earth years */
  ageYears: number;
  /** Kelvin-Helmholtz gravitational contraction timescale in Earth years */
  kelvinHelmholtzTimeYears: number;
  /** Total stellar spin angular momentum in J·s */
  angularMomentumJ: number;
  /** Current equatorial angular rotation velocity in rad s⁻¹ */
  angularVelocityRadS: number;
  /** Critical centrifugal breakup angular velocity in rad s⁻¹ */
  breakupVelocityRadS: number;
  /** Current protostar evolutionary state */
  state: ProtostarState;
  /** Overall formation progress percentage (0.0 to 1.0) */
  formationProgress: number;
  /** Associated circumstellar accretion disk */
  disk: CircumstellarDiskProperties;
  /** Associated bipolar Herbig-Haro jets */
  jets: ProtostellarJetProperties;
  /** Target Zero-Age Main Sequence properties once hydrogen ignition is reached */
  finalStellarProperties?: StellarProperties;
  /** Optional binary companion protostar ID */
  companionId?: string;
  /** Binary orbital separation in AU if applicable */
  binarySeparationAU?: number;
  /** 3D spatial position [x, y, z] in scene units */
  position: [number, number, number];
}

// ── Complete Star Formation System ───────────────────────────────────────────

export interface StarFormationSystemProperties {
  /** Unique formation complex ID */
  id: string;
  /** Complex name (e.g., 'Orion Molecular Cloud Complex') */
  name: string;
  /** Host molecular cloud */
  cloud: MolecularCloudProperties;
  /** Population of condensed protostars */
  protostars: ProtostarProperties[];
  /** Currently focused / selected protostar ID */
  activeProtostarId: string | null;
  /** Elapsed simulation time in Earth years */
  simulationAgeYears: number;
  /** Total initial gas mass at t=0 in M_☉ */
  totalInitialGasSolar: number;
  /** Net stellar mass created in M_☉ */
  totalStellarMassSolar: number;
  /** Net mass ejected into interstellar medium in M_☉ */
  totalOutflowMassSolar: number;
  /** Realized star formation efficiency SFE = M_stars / M_initial */
  starFormationEfficiency: number;
  /** Whether at least one star has reached Zero-Age Main Sequence ignition */
  isIgnited: boolean;
}

// ── Visual Rendering Data Binding ────────────────────────────────────────────

export interface StarBirthVisualProperties {
  /** Photosphere color in CSS hex string */
  hexColor: string;
  /** Coronal halo glow color in CSS hex string */
  coronaColor: string;
  /** Visual radius for exploration scale */
  visualRadiusExploration: number;
  /** Visual radius for scientific scale */
  visualRadiusScientific: number;
  /** Visual brightness factor (0.0 to 1.0) */
  brightness: number;
  /** Bloom post-processing intensity */
  bloomIntensity: number;
  /** Disk inner color hex */
  diskInnerColor: string;
  /** Disk outer dust color hex */
  diskOuterColor: string;
  /** Jet plasma emission color hex */
  jetColor: string;
  /** Underlying stellar visual properties */
  stellarVisual: StellarVisualProperties;
}

// ── Configuration Inputs ─────────────────────────────────────────────────────

export interface StarBirthConfig {
  /** Cloud initial mass in M_☉ (default: 100 M_☉) */
  cloudMassSolar?: number;
  /** Cloud initial radius in pc (default: 2.0 pc) */
  cloudRadiusPc?: number;
  /** Cloud initial temperature in K (default: 15 K) */
  cloudTemperatureK?: number;
  /** Metallicity [Fe/H] (default: 0.0) */
  metallicityFeH?: number;
  /** Turbulence parameter (0.0 to 1.0, default: 0.25) */
  turbulenceParameter?: number;
  /** Targeted final stellar mass in M_☉ (default: 1.0 M_☉ for Sun-like formation) */
  targetStarMassSolar?: number;
  /** Seed for deterministic pseudo-random generation */
  seed?: number;
}
