/**
 * MilkyWayConfig.ts
 * Physical reference parameters, quality budgets, and arm profiles for the Milky Way.
 */

import type { MilkyWayParameters, SpiralArmDefinition, MilkyWayRegionInfo } from './MilkyWayTypes';

// ── Quality Settings for Milky Way Particles ─────────────────────────────────

export interface MilkyWayQualityConfig {
  starCount: number;
  dustCount: number;
  globularClusterCount: number;
  enableDust: boolean;
  enableHalo: boolean;
  enableGlobulars: boolean;
}

export const MILKY_WAY_QUALITY_SETTINGS: Record<'low' | 'medium' | 'high' | 'ultra', MilkyWayQualityConfig> = {
  low: {
    starCount: 12000,
    dustCount: 2500,
    globularClusterCount: 60,
    enableDust: true,
    enableHalo: true,
    enableGlobulars: true,
  },
  medium: {
    starCount: 24000,
    dustCount: 5000,
    globularClusterCount: 100,
    enableDust: true,
    enableHalo: true,
    enableGlobulars: true,
  },
  high: {
    starCount: 45000,
    dustCount: 9000,
    globularClusterCount: 150,
    enableDust: true,
    enableHalo: true,
    enableGlobulars: true,
  },
  ultra: {
    starCount: 70000,
    dustCount: 15000,
    globularClusterCount: 180,
    enableDust: true,
    enableHalo: true,
    enableGlobulars: true,
  },
};

// ── Major Spiral Arms of the Milky Way ───────────────────────────────────────

export const MILKY_WAY_SPIRAL_ARMS: SpiralArmDefinition[] = [
  // 1. Perseus Arm (Major arm originating at end of bar, wraps outwards)
  {
    name: 'Perseus Arm',
    startTheta: 0.0,
    endTheta: 4.8,
    pitchAngleDeg: 12.0,
    r0Kpc: 3.2,
    widthKpc: 0.65,
    particleFraction: 0.28,
    colorBias: 0.35,      // Young blue/white starbursts
    dustDensity: 0.85,
  },
  // 2. Scutum-Centaurus Arm (Major starburst arm originating from other bar tip)
  {
    name: 'Scutum-Centaurus Arm',
    startTheta: Math.PI,
    endTheta: Math.PI + 4.8,
    pitchAngleDeg: 12.2,
    r0Kpc: 3.2,
    widthKpc: 0.68,
    particleFraction: 0.28,
    colorBias: 0.30,      // Prominent giant molecular clouds
    dustDensity: 0.90,
  },
  // 3. Sagittarius-Carina Arm (Inner spiral arm interior to Solar orbit)
  {
    name: 'Sagittarius-Carina Arm',
    startTheta: 0.85,
    endTheta: 5.2,
    pitchAngleDeg: 11.5,
    r0Kpc: 3.8,
    widthKpc: 0.55,
    particleFraction: 0.18,
    colorBias: 0.20,
    dustDensity: 0.75,
  },
  // 4. Norma-Outer Arm (Deep inner bar transition expanding into distant outer disk)
  {
    name: 'Norma-Outer Arm',
    startTheta: Math.PI + 0.85,
    endTheta: Math.PI + 5.2,
    pitchAngleDeg: 11.8,
    r0Kpc: 3.5,
    widthKpc: 0.58,
    particleFraction: 0.16,
    colorBias: 0.15,
    dustDensity: 0.70,
  },
  // 5. Orion Spur / Local Arm (Connecting bridge structure housing the Solar Neighborhood)
  {
    name: 'Orion Spur (Local Arm)',
    startTheta: 2.1,
    endTheta: 3.2,
    pitchAngleDeg: 9.5,
    r0Kpc: 7.4,
    widthKpc: 0.40,
    particleFraction: 0.10,
    colorBias: 0.25,      // Local star-forming complexes (Orion, Pleiades)
    dustDensity: 0.80,
    isSpur: true,
  },
];

// ── Default Milky Way Model Parameters ───────────────────────────────────────

export function getDefaultMilkyWayParameters(seed = 54321): MilkyWayParameters {
  return {
    seed,
    morphology: 'barred-spiral',
    subtype: 'SBbc',

    // Physical Estimates
    massSolar: 1.15e12,
    baryonicMassSolar: 6.0e10,
    diskDiameterKpc: 30.0,
    starCountEstimate: 2.5e11,
    luminositySolar: 2.8e10,

    // Dimensions
    sceneRadius: 85.0,
    bulgeRadiusKpc: 1.8,
    barLengthKpc: 4.8,
    barWidthKpc: 1.3,
    barAngleRad: (29 * Math.PI) / 180, // ~29° relative to Sun-center axis

    thinDiskScaleHeightPc: 300,
    thickDiskScaleHeightPc: 1000,
    haloRadiusKpc: 38.0,

    // Default Quality Particle Budgets (High)
    totalStarParticles: 45000,
    dustParticles: 9000,
    globularClusterCount: 150,

    // Rotation & Core
    rotationSpeed: 0.045,
    coreLuminosity: 2.4,
  };
}

// ── Milky Way Regions Data ───────────────────────────────────────────────────

export const MILKY_WAY_REGIONS: MilkyWayRegionInfo[] = [
  {
    id: 'galactic-center',
    name: 'Galactic Center (Sagittarius A*)',
    description: 'The superdense gravitational anchor of the Milky Way, housing the 4.15 million M☉ supermassive black hole Sgr A* and extreme stellar densities.',
    galactocentricRadiusKpc: 0.0,
    apparentPosition: [0, 0, 0],
    stellarPopulationType: 'old',
    starFormationActivity: 'active',
  },
  {
    id: 'central-bar',
    name: 'Galactic Central Bar',
    description: 'A triaxial stellar bar structure (~4.8 kpc semimajor axis) oriented ~29° from the Sun-center axis, funneling interstellar gas inward.',
    galactocentricRadiusKpc: 2.4,
    apparentPosition: [5, 0, 3],
    stellarPopulationType: 'old',
    starFormationActivity: 'moderate',
  },
  {
    id: 'inner-disk',
    name: 'Molecular Ring & Inner Disk',
    description: 'High-density star formation region between 3-5 kpc harboring the greatest concentration of cold molecular gas and massive stellar nurseries.',
    galactocentricRadiusKpc: 4.0,
    apparentPosition: [10, 0, -5],
    stellarPopulationType: 'young',
    starFormationActivity: 'active',
  },
  {
    id: 'perseus-arm',
    name: 'Perseus Spiral Arm',
    description: 'One of the two primary spiral arms, rich in young O/B associations and prominent H II emission complexes.',
    galactocentricRadiusKpc: 10.5,
    apparentPosition: [-25, 0, -18],
    stellarPopulationType: 'young',
    starFormationActivity: 'active',
  },
  {
    id: 'scutum-centaurus-arm',
    name: 'Scutum-Centaurus Spiral Arm',
    description: 'Major spiral arm emerging from the near end of the galactic bar, featuring massive red supergiant clusters and intense star formation.',
    galactocentricRadiusKpc: 6.0,
    apparentPosition: [18, 0, 14],
    stellarPopulationType: 'young',
    starFormationActivity: 'active',
  },
  {
    id: 'sagittarius-arm',
    name: 'Sagittarius-Carina Arm',
    description: 'Prominent spiral arm interior to the Solar orbit, populated by major nebulae including Carina, Lagoon, and Eagle nebulae.',
    galactocentricRadiusKpc: 6.5,
    apparentPosition: [14, 0, -12],
    stellarPopulationType: 'young',
    starFormationActivity: 'active',
  },
  {
    id: 'orion-spur',
    name: 'Orion-Cygnus Spur (Local Arm)',
    description: 'A structural stellar bridge between the Sagittarius and Perseus arms containing the Orion Nebula complex and our Solar System.',
    galactocentricRadiusKpc: 8.0,
    apparentPosition: [-22.5, 0.4, 4.2],
    stellarPopulationType: 'mixed',
    starFormationActivity: 'moderate',
  },
  {
    id: 'solar-neighborhood',
    name: 'Solar Neighborhood Anchor',
    description: 'The approximate galactocentric position (~8.0 kpc / ~26,000 ly) of our Sun within the Orion Spur, completing a galactic orbit every ~230 Myr.',
    galactocentricRadiusKpc: 8.0,
    apparentPosition: [-22.6, 0.45, 4.3],
    stellarPopulationType: 'mixed',
    starFormationActivity: 'moderate',
  },
  {
    id: 'stellar-halo',
    name: 'Extended Stellar Halo',
    description: 'A faint, diffuse spheroidal envelope of ancient Population II stars and globular clusters extending past 35 kpc.',
    galactocentricRadiusKpc: 25.0,
    apparentPosition: [0, 30, 0],
    stellarPopulationType: 'old',
    starFormationActivity: 'quiescent',
  },
  {
    id: 'globular-clusters',
    name: 'Globular Cluster Population',
    description: 'A system of ~150 gravitationally bound ancient spherical star clusters orbiting the Galactic bulge and halo.',
    galactocentricRadiusKpc: 12.0,
    apparentPosition: [8, 15, -8],
    stellarPopulationType: 'old',
    starFormationActivity: 'quiescent',
  },
];
