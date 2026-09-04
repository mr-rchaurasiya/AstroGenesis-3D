/**
 * GalaxyTypes.ts
 * Core type definitions for the procedural Galaxy System (Phase 3).
 * Supports spiral, barred-spiral, elliptical, irregular, and dwarf galaxy morphologies.
 */

export type GalaxyMorphology =
  | 'spiral'
  | 'barred-spiral'
  | 'elliptical'
  | 'irregular'
  | 'dwarf-spheroidal'
  | 'dwarf-irregular';

export type GalaxySubtype =
  | 'Sa' | 'Sb' | 'Sc' | 'Sd'    // Unbarred spirals (tight to open)
  | 'SBa' | 'SBb' | 'SBc'       // Barred spirals
  | 'E0' | 'E3' | 'E5' | 'E7'   // Ellipticals (spherical to flattened)
  | 'Irr-I' | 'Irr-II'          // Irregulars
  | 'dSph' | 'dIrr';            // Dwarf galaxies

export type GalaxyLOD = 'far' | 'medium' | 'detailed';

// ── Galaxy Structural Parameters ─────────────────────────────────────────────

export interface GalaxyParameters {
  seed: number;
  morphology: GalaxyMorphology;
  subtype: GalaxySubtype;

  // Scale & Mass (astronomical units)
  massSolar: number;          // Estimated solar masses (M☉) e.g., 1e9 to 1.5e12
  radiusKpc: number;          // Estimated physical radius in kiloparsecs e.g., 1 to 50
  luminositySolar: number;    // Estimated solar luminosities (L☉)
  starCountEstimate: number;  // Estimated total real stars (e.g., 1e9 to 1e12)

  // Visual Scene Properties
  sceneRadius: number;        // Radius in visual scene units (e.g., 20 to 120)
  starParticleCount: number;  // Representative GPU particle count (e.g., 2000 to 25000)
  dustParticleCount: number;  // GPU dust particle count (e.g., 400 to 4000)

  // Morphology Dimensions
  bulgeRatio: number;         // Ratio of bulge radius to galaxy radius (0.05 to 0.45)
  diskThicknessRatio: number; // Ratio of vertical scale height to radius (0.02 to 0.35)
  coreBrightness: number;     // Central core luminosity factor (0.5 to 3.0)

  // Spiral Specific
  armCount: number;           // Number of spiral arms (2 to 5)
  armTightness: number;       // Spiral pitch parameter k in r = r0 * e^(k*theta) (0.3 to 1.2)
  armWidth: number;           // Width/spread of arm star formation zones (0.15 to 0.6)
  armAsymmetry: number;       // Variance between opposing arm pitch/intensity (0.0 to 0.3)
  barLengthRatio: number;     // Length of central bar relative to radius (0.0 to 0.4)
  barWidthRatio: number;      // Thickness of central bar (0.02 to 0.15)

  // Elliptical Specific
  ellipticity: number;        // Flattening factor (E0 = 0.0, E7 = 0.7)
  sersicIndex: number;        // Sersic profile exponent (1.0 to 6.0)

  // Irregular Specific
  clumpiness: number;         // Spatial clumping frequency (0.2 to 0.9)
  asymmetryFactor: number;    // Distortion from center of mass (0.1 to 0.8)

  // Kinematics & Orientation
  rotationSpeed: number;      // Differential orbital rotation speed factor
  inclination: number;        // Viewing inclination in radians (0 to pi/2)
  positionAngle: number;      // Major axis position angle in radians (0 to 2*pi)
  pitchAngle: number;         // Orbital plane pitch in radians

  // Stellar Population Colors
  temperatureBias: number;    // Bias towards hot young blue or older yellow/red (-1 to +1)
  dustAbsorption: number;     // Optical depth of interstellar dust lanes (0.0 to 1.0)
}

// ── Complete Galaxy Instance Data ────────────────────────────────────────────

export interface GalaxyData {
  id: string;                 // Stable unique identifier (e.g., "GAL-00101")
  catalogName: string;        // Catalog designation (e.g., "NGC 224-Synthetic", "Centaurus-D1")
  seed: number;
  morphology: GalaxyMorphology;
  subtype: GalaxySubtype;

  // 3D Scene Placement
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;

  // Cluster Metadata
  clusterId?: string;
  clusterName?: string;
  isClusterCenter?: boolean;

  // Generated Physical & Visual Parameters
  parameters: GalaxyParameters;
}

// ── Galaxy Cluster Data ──────────────────────────────────────────────────────

export interface GalaxyClusterData {
  id: string;
  name: string;
  seed: number;
  position: [number, number, number];
  radius: number;
  galaxyIds: string[];
  galaxyCount: number;
  clusterType: 'supercluster-node' | 'rich-cluster' | 'compact-group' | 'loose-group';
}

// ── GPU Star Batch Data ──────────────────────────────────────────────────────

export interface GalaxyGeometryData {
  // Stars
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  opacities: Float32Array;
  types: Float32Array; // 0=Bulge/Core, 1=Disk, 2=Arm, 3=Halo/Clump
  orbitalDistances: Float32Array;
  angles: Float32Array;

  // Dust
  dustPositions?: Float32Array;
  dustColors?: Float32Array;
  dustSizes?: Float32Array;
  dustOpacities?: Float32Array;

  // Core Glow
  coreColor: [number, number, number];
  coreRadius: number;
  coreIntensity: number;
}
