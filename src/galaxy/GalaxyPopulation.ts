/**
 * GalaxyPopulation.ts
 * Generates and manages the entire visible population of galaxies in the universe environment.
 * Combines curated presets, galaxy clusters, and distributed field galaxies.
 */

import type {
  GalaxyData,
  GalaxyClusterData,
  GalaxyMorphology,
} from './GalaxyTypes';
import { GALAXY_PRESETS } from './galaxyPresets';
import { generateGalaxyCluster } from './GalaxyCluster';
import { getDefaultGalaxyParameters } from './GalaxyConfig';
import { createSeededRNG, randomOnSphere } from '../utils/mathUtils';

export interface GalaxyPopulationResult {
  galaxies: GalaxyData[];
  clusters: GalaxyClusterData[];
}

export function generateGalaxyPopulation(
  seed: number = 789123,
  densityMultiplier: number = 1.0,
): GalaxyPopulationResult {
  const rng = createSeededRNG(seed);
  const galaxies: GalaxyData[] = [];
  const clusters: GalaxyClusterData[] = [];

  // 1. Add Curated Primary Presets (GAL-001 to GAL-008)
  GALAXY_PRESETS.forEach((preset) => {
    galaxies.push(preset);
  });

  // 2. Generate 3 Major Galaxy Clusters (Aligned with Cosmic Web Node coordinates)
  let nextIdIndex = GALAXY_PRESETS.length + 1;

  // Cluster A: Centaurus-Hydra Supercluster Node
  const clusterA = generateGalaxyCluster(
    {
      seed: seed + 101,
      center: [1400, 350, -1200],
      radius: 480,
      name: 'Centaurus-Hydra Supercluster',
      clusterType: 'rich-cluster',
      memberCount: Math.round(10 * densityMultiplier),
      idPrefix: 'A',
    },
    nextIdIndex,
  );
  clusters.push(clusterA.cluster);
  clusterA.galaxies.forEach((g) => galaxies.push(g));
  nextIdIndex += clusterA.galaxies.length;

  // Cluster B: Perseus-Pisces Filamental Group
  const clusterB = generateGalaxyCluster(
    {
      seed: seed + 202,
      center: [-1600, -420, 1100],
      radius: 420,
      name: 'Perseus-Pisces Group',
      clusterType: 'compact-group',
      memberCount: Math.round(8 * densityMultiplier),
      idPrefix: 'B',
    },
    nextIdIndex,
  );
  clusters.push(clusterB.cluster);
  clusterB.galaxies.forEach((g) => galaxies.push(g));
  nextIdIndex += clusterB.galaxies.length;

  // Cluster C: Deep Coma-like Cluster
  const clusterC = generateGalaxyCluster(
    {
      seed: seed + 303,
      center: [-450, 750, -1800],
      radius: 520,
      name: 'Coma-type Dense Cluster',
      clusterType: 'supercluster-node',
      memberCount: Math.round(12 * densityMultiplier),
      idPrefix: 'C',
    },
    nextIdIndex,
  );
  clusters.push(clusterC.cluster);
  clusterC.galaxies.forEach((g) => galaxies.push(g));
  nextIdIndex += clusterC.galaxies.length;

  // 3. Isolated Field Galaxies in Mid-to-Far Cosmic Horizon (900–3200 scene units)
  const fieldGalaxyCount = Math.round(8 * densityMultiplier);
  const morphologies: GalaxyMorphology[] = [
    'spiral', 'barred-spiral', 'elliptical', 'irregular', 'dwarf-spheroidal', 'dwarf-irregular',
  ];

  for (let i = 0; i < fieldGalaxyCount; i++) {
    const fieldId = `GAL-${String(nextIdIndex++).padStart(3, '0')}`;
    const r = 900 + (3000 - 900) * Math.pow(rng(), 0.7);
    const pos = randomOnSphere(r, rng);

    const morph = morphologies[Math.floor(rng() * morphologies.length)];
    const fieldSeed = seed + 500 + i * 89;
    const params = getDefaultGalaxyParameters(morph, fieldSeed);

    const scale = 0.6 + rng() * 0.5;
    params.sceneRadius *= scale;

    galaxies.push({
      id: fieldId,
      catalogName: `Field-${morph.toUpperCase()} (${fieldId})`,
      seed: fieldSeed,
      morphology: morph,
      subtype: params.subtype,
      position: [pos.x, pos.y, pos.z],
      rotation: [rng() * Math.PI, rng() * Math.PI * 2, rng() * 0.4],
      scale,
      parameters: params,
    });
  }

  return { galaxies, clusters };
}
