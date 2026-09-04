/**
 * MilkyWayTypes.ts
 * Type models for the specialized Milky Way Galaxy visualization (Phase 4).
 * Supports barred-spiral structure, major named spiral arms, thin/thick disks,
 * galactic bulge, central bar, stellar halo, globular clusters, interstellar dust,
 * and the Solar Neighborhood anchor point.
 */

export type MilkyWayRegionId =
  | 'galactic-center'
  | 'central-bar'
  | 'inner-disk'
  | 'perseus-arm'
  | 'sagittarius-arm'
  | 'scutum-centaurus-arm'
  | 'norma-arm'
  | 'orion-spur'
  | 'solar-neighborhood'
  | 'stellar-halo'
  | 'globular-clusters';

export interface MilkyWayRegionInfo {
  id: MilkyWayRegionId;
  name: string;
  description: string;
  galactocentricRadiusKpc: number;
  apparentPosition: [number, number, number];
  stellarPopulationType: 'young' | 'intermediate' | 'old' | 'mixed';
  starFormationActivity: 'active' | 'moderate' | 'quiescent';
}

export type MilkyWayLOD = 'distant' | 'galactic' | 'regional' | 'solar-anchor';

// ── Major Spiral Arm Definition ──────────────────────────────────────────────

export interface SpiralArmDefinition {
  name: string;
  startTheta: number;       // Starting azimuth in radians
  endTheta: number;         // Ending azimuth in radians
  pitchAngleDeg: number;    // Pitch angle in degrees (usually 10° - 14°)
  r0Kpc: number;            // Starting inner radius in kpc
  widthKpc: number;         // Radial thickness of star formation lane
  particleFraction: number; // Share of total arm stars
  colorBias: number;        // -1 (older/red) to +1 (young/blue)
  dustDensity: number;      // Dust lane opacity multiplier
  isSpur?: boolean;         // Local spur/bridge (e.g., Orion Spur)
}

// ── Globular Cluster Data Model ──────────────────────────────────────────────

export interface GlobularClusterData {
  id: string;
  name: string;
  position: [number, number, number];
  radiusLy: number;
  starCountEstimate: number;
  ageGyr: number;
  metallicityFeH: number;
  galactocentricDistanceKpc: number;
}

// ── Solar Neighborhood Anchor ────────────────────────────────────────────────

export interface SolarNeighborhoodAnchor {
  id: string;
  name: string;
  galactocentricRadiusKpc: number; // ~8.0 kpc (~26,000 ly)
  galacticAzimuthRad: number;      // Azimuthal angle relative to Galactic Center
  verticalOffsetLy: number;        // ~50-70 ly above galactic midplane
  orbitalVelocityKms: number;      // ~220-240 km/s
  galacticPeriodMyr: number;       // ~230 million years (Galactic Year)
  region: 'orion-spur';
  scenePosition: [number, number, number];
  localStarCountEstimate: number;
}

// ── Milky Way Physical & Visual Parameters ───────────────────────────────────

export interface MilkyWayParameters {
  seed: number;
  morphology: 'barred-spiral';
  subtype: 'SBb' | 'SBbc';

  // Physical Estimates
  massSolar: number;                 // ~1.15e12 M☉ (including dark matter halo)
  baryonicMassSolar: number;         // ~6.0e10 M☉ (stars + gas)
  diskDiameterKpc: number;           // ~30.0 kpc (~100,000 ly)
  starCountEstimate: number;         // ~100 - 400 billion stars
  luminositySolar: number;           // ~2.8e10 L☉

  // Geometric Components (in kpc / visual units)
  sceneRadius: number;               // Visual scene radius (e.g. 100.0)
  bulgeRadiusKpc: number;            // ~1.5 - 2.0 kpc
  barLengthKpc: number;              // ~4.5 - 5.0 kpc (semimajor axis)
  barWidthKpc: number;               // ~1.0 - 1.5 kpc (semiminor axis)
  barAngleRad: number;               // Orientation angle relative to Sun-Center axis (~28°-30°)

  thinDiskScaleHeightPc: number;     // ~300 pc
  thickDiskScaleHeightPc: number;    // ~1000 pc
  haloRadiusKpc: number;             // ~35 - 50 kpc

  // Particle Counts (GPU Budgets)
  totalStarParticles: number;        // e.g. 15,000 to 60,000
  dustParticles: number;             // e.g. 3,000 to 15,000
  globularClusterCount: number;      // e.g. 120 to 180

  // Dynamics & Shaders
  rotationSpeed: number;             // Orbital speed factor
  coreLuminosity: number;            // Central core brightness
}

// ── Complete Milky Way Data Model ────────────────────────────────────────────

export interface MilkyWayModel {
  id: string;
  catalogName: string;
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  parameters: MilkyWayParameters;
  solarAnchor: SolarNeighborhoodAnchor;
  globularClusters: GlobularClusterData[];
  majorArms: SpiralArmDefinition[];
}

// ── GPU Geometry Output ──────────────────────────────────────────────────────

export interface MilkyWayGeometryData {
  // Stars
  positions: Float32Array;
  colors: Float32Array;
  sizes: Float32Array;
  opacities: Float32Array;
  types: Float32Array; // 0=Bulge, 1=Bar, 2=ThinDisk, 3=ThickDisk, 4=SpiralArm, 5=Halo, 6=GlobularCluster
  orbitalDistances: Float32Array;
  angles: Float32Array;

  // Dust
  dustPositions: Float32Array;
  dustColors: Float32Array;
  dustSizes: Float32Array;
  dustOpacities: Float32Array;

  // Core
  coreColor: [number, number, number];
  coreRadius: number;
  coreIntensity: number;
}
