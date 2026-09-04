/**
 * milkyWayPresets.ts
 * Curated Milky Way configurations, globular cluster catalogs, and solar position anchor.
 */

import type {
  MilkyWayModel,
  GlobularClusterData,
  SolarNeighborhoodAnchor,
} from './MilkyWayTypes';
import {
  getDefaultMilkyWayParameters,
  MILKY_WAY_SPIRAL_ARMS,
} from './MilkyWayConfig';
import { createSeededRNG, randomInSphere } from '../utils/mathUtils';

// ── Prominent Real-Inspired Globular Clusters ────────────────────────────────

export const PROMINENT_GLOBULAR_CLUSTERS: Omit<GlobularClusterData, 'position'>[] = [
  {
    id: 'GC-NGC5139',
    name: 'Omega Centauri (NGC 5139)',
    radiusLy: 150,
    starCountEstimate: 10000000,
    ageGyr: 11.5,
    metallicityFeH: -1.6,
    galactocentricDistanceKpc: 6.4,
  },
  {
    id: 'GC-NGC104',
    name: '47 Tucanae (NGC 104)',
    radiusLy: 120,
    starCountEstimate: 2000000,
    ageGyr: 13.0,
    metallicityFeH: -0.7,
    galactocentricDistanceKpc: 7.4,
  },
  {
    id: 'GC-M13',
    name: 'Great Globular Cluster in Hercules (M13)',
    radiusLy: 84,
    starCountEstimate: 300000,
    ageGyr: 11.7,
    metallicityFeH: -1.5,
    galactocentricDistanceKpc: 8.8,
  },
  {
    id: 'GC-M22',
    name: 'Sagittarius Cluster (M22)',
    radiusLy: 99,
    starCountEstimate: 500000,
    ageGyr: 12.6,
    metallicityFeH: -1.7,
    galactocentricDistanceKpc: 4.9,
  },
  {
    id: 'GC-M15',
    name: 'Pegasus Cluster (M15 - Core Collapse)',
    radiusLy: 88,
    starCountEstimate: 450000,
    ageGyr: 12.5,
    metallicityFeH: -2.3,
    galactocentricDistanceKpc: 10.4,
  },
  {
    id: 'GC-M4',
    name: 'M4 (NGC 6121 - Nearest Major Cluster)',
    radiusLy: 75,
    starCountEstimate: 100000,
    ageGyr: 12.2,
    metallicityFeH: -1.2,
    galactocentricDistanceKpc: 5.9,
  },
  {
    id: 'GC-M5',
    name: 'Rose Cluster (M5)',
    radiusLy: 82,
    starCountEstimate: 500000,
    ageGyr: 12.0,
    metallicityFeH: -1.3,
    galactocentricDistanceKpc: 6.2,
  },
];

// ── Generate Complete Globular Cluster Population ────────────────────────────

export function generateGlobularClusterPopulation(
  count: number,
  sceneRadius: number,
  seed = 77123
): GlobularClusterData[] {
  const rng = createSeededRNG(seed);
  const clusters: GlobularClusterData[] = [];

  // 1. Add prominent named clusters
  PROMINENT_GLOBULAR_CLUSTERS.forEach((c, idx) => {
    // Physical distance mapped to visual scene scale (R_gal = 15 kpc maps to sceneRadius)
    const visualDist = (c.galactocentricDistanceKpc / 15.0) * sceneRadius * 0.85;
    const phi = (idx / PROMINENT_GLOBULAR_CLUSTERS.length) * Math.PI * 2 + (rng() - 0.5) * 0.5;
    const theta = Math.asin((rng() - 0.5) * 1.6); // Spherical halo distribution

    const x = visualDist * Math.cos(theta) * Math.cos(phi);
    const y = visualDist * Math.sin(theta) * 0.7; // Slightly flattened halo
    const z = visualDist * Math.cos(theta) * Math.sin(phi);

    clusters.push({
      ...c,
      position: [x, y, z],
    });
  });

  // 2. Generate remaining representative clusters (concentrated towards center)
  const remaining = Math.max(0, count - clusters.length);
  for (let i = 0; i < remaining; i++) {
    // Density falls off as r^-3.5 (typical Milky Way globular cluster spatial distribution)
    const u = Math.max(0.01, rng());
    const rFrac = Math.pow(u, 1.0 / 2.5); // Strong central concentration
    const dist = (0.08 + rFrac * 0.92) * sceneRadius * 0.95;

    const pt = randomInSphere(1.0, rng);
    const norm = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z) || 1;

    clusters.push({
      id: `GC-SYNTH-${(i + 1).toString().padStart(3, '0')}`,
      name: `Globular Cluster MW-${(i + 101).toString()}`,
      position: [
        (pt.x / norm) * dist,
        (pt.y / norm) * dist * 0.65, // Slight vertical flattening
        (pt.z / norm) * dist,
      ],
      radiusLy: Math.round(50 + rng() * 100),
      starCountEstimate: Math.round((5 + rng() * 95) * 10000),
      ageGyr: +(11.0 + rng() * 2.5).toFixed(1),
      metallicityFeH: +(-2.4 + rng() * 1.8).toFixed(2),
      galactocentricDistanceKpc: +((dist / sceneRadius) * 15.0).toFixed(1),
    });
  }

  return clusters;
}

// ── Generate Solar Neighborhood Anchor ───────────────────────────────────────

export function createSolarNeighborhoodAnchor(
  sceneRadius: number
): SolarNeighborhoodAnchor {
  const rKpc = 8.0;          // Standard IAU convention (~8.0 kpc)
  const azimuthRad = 2.96;   // Situated on Orion Spur between Sagittarius & Perseus arms
  const verticalLy = 55.0;   // ~55 ly above galactic midplane

  // Map to visual scene units
  const visualR = (rKpc / 15.0) * sceneRadius;
  const x = visualR * Math.cos(azimuthRad);
  const z = visualR * Math.sin(azimuthRad);
  const y = (verticalLy / 50000.0) * sceneRadius; // Subtle scale height elevation

  return {
    id: 'SOLAR-ANCHOR-001',
    name: 'Solar Neighborhood Anchor (Sun / Sol)',
    galactocentricRadiusKpc: rKpc,
    galacticAzimuthRad: azimuthRad,
    verticalOffsetLy: verticalLy,
    orbitalVelocityKms: 230,
    galacticPeriodMyr: 230,
    region: 'orion-spur',
    scenePosition: [x, y, z],
    localStarCountEstimate: 50000,
  };
}

// ── Default Milky Way Model Instance ─────────────────────────────────────────

export function createDefaultMilkyWayModel(seed = 54321): MilkyWayModel {
  const params = getDefaultMilkyWayParameters(seed);
  const solarAnchor = createSolarNeighborhoodAnchor(params.sceneRadius);
  const globularClusters = generateGlobularClusterPopulation(
    params.globularClusterCount,
    params.sceneRadius,
    seed + 999
  );

  return {
    id: 'MILKY-WAY-CORE',
    catalogName: 'Milky Way Galaxy (Via Lactea)',
    position: [0, 0, 0],
    rotation: [0.15, 0.45, 0.05],
    scale: 1.0,
    parameters: params,
    solarAnchor,
    globularClusters,
    majorArms: MILKY_WAY_SPIRAL_ARMS,
  };
}
