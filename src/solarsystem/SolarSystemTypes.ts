/**
 * SolarSystemTypes.ts
 * Astronomical type definitions for the Solar System simulation (Phase 5).
 * Supports the Sun, 8 planets, major moons, dwarf planets, asteroid belt,
 * Kuiper belt, comets, Keplerian orbits, and multi-scale visualization modes.
 */

export type CelestialBodyType =
  | 'star'
  | 'planet'
  | 'dwarf-planet'
  | 'moon'
  | 'asteroid'
  | 'comet';

export type PlanetClass =
  | 'terrestrial'
  | 'gas-giant'
  | 'ice-giant';

export type ScaleMode = 'exploration' | 'scientific';

// ── Keplerian Orbital Elements ───────────────────────────────────────────────

export interface OrbitalElements {
  semiMajorAxisAU: number;        // Semi-major axis in AU (or km for moons)
  eccentricity: number;           // Orbital eccentricity [0, 1)
  inclinationDeg: number;         // Orbital inclination relative to ecliptic (deg)
  longitudeOfAscendingNodeDeg?: number; // Ω (deg)
  argumentOfPeriapsisDeg?: number;      // ω (deg)
  meanAnomalyAtEpochDeg?: number;       // M0 (deg)
  orbitalPeriodDays: number;      // Sidereal orbital period in Earth days
  orbitalVelocityKms?: number;    // Mean orbital velocity in km/s
}

// ── Atmospheric Properties ───────────────────────────────────────────────────

export interface AtmosphereProperties {
  hasAtmosphere: boolean;
  scaleHeightKm: number;          // Atmospheric scale height
  surfacePressureBar: number;     // Surface atmospheric pressure in bar
  scatteringColor: [number, number, number]; // Rayleigh RGB tint
  opacity: number;                // Visual opacity factor
  composition: string;            // Key chemical components
  hasClouds?: boolean;
  cloudSpeedFactor?: number;
}

// ── Planetary Ring System ────────────────────────────────────────────────────

export interface RingSystemProperties {
  innerRadiusKm: number;
  outerRadiusKm: number;
  color: [number, number, number];
  opacity: number;
  textureType: 'saturn' | 'uranus' | 'neptune';
  hasGaps?: boolean;
}

// ── Celestial Body Model ─────────────────────────────────────────────────────

export interface CelestialBody {
  id: string;
  name: string;
  type: CelestialBodyType;
  planetClass?: PlanetClass;
  parentId?: string;              // Parent body ID (e.g., 'sun' for planets, 'earth' for Moon)

  // Physical Metrics
  radiusKm: number;               // Physical mean volumetric radius in km
  massKg: number;                 // Physical mass in kg
  surfaceGravityMs2: number;      // Surface gravity in m/s²
  densityGcm3?: number;           // Mean density in g/cm³
  surfaceTemperatureK: number;    // Mean surface temperature in Kelvin
  geometricAlbedo?: number;       // Visual reflectivity

  // Rotational Kinematics
  rotationPeriodHours: number;    // Sidereal rotation period in hours (negative = retrograde)
  axialTiltDeg: number;           // Obliquity to orbit in degrees
  isTidallyLocked?: boolean;      // Synchronous rotation (e.g. Moon, Galilean moons)

  // Orbital Kinematics
  orbit: OrbitalElements;

  // Visual & Material Config
  visualRadiusExploration: number; // Scaled radius in scene units for exploration mode
  visualRadiusScientific: number;  // Scaled radius in scene units for scientific mode
  colorProfile: string;           // Base surface color hex or key
  surfaceShaderId: string;        // Shader preset ('mercury' | 'venus' | 'earth' | 'mars' | 'jupiter' | 'saturn' | 'uranus' | 'neptune' | 'moon' | 'io' | 'europa' | 'titan' | 'rocky')

  atmosphere?: AtmosphereProperties;
  rings?: RingSystemProperties;
  majorMoons?: CelestialBody[];

  description: string;
  discoveryYear?: number;
}

// ── Solar System Small Body Populations ──────────────────────────────────────

export interface AsteroidBeltConfig {
  innerRadiusAU: number;          // ~2.1 AU
  outerRadiusAU: number;          // ~3.3 AU
  count: number;                  // GPU particle count
  meanInclinationDeg: number;     // ~10°
  thicknessAU: number;            // Vertical spread
}

export interface KuiperBeltConfig {
  innerRadiusAU: number;          // ~30 AU (past Neptune)
  outerRadiusAU: number;          // ~50 AU
  count: number;                  // GPU particle count
  meanInclinationDeg: number;     // ~15°
  thicknessAU: number;
}

export interface CometTrajectory {
  id: string;
  name: string;
  semiMajorAxisAU: number;
  eccentricity: number;
  inclinationDeg: number;
  periodYears: number;
  perihelionAU: number;
  aphelionAU: number;
  nucleusRadiusKm: number;
  tailColor: [number, number, number];
}
