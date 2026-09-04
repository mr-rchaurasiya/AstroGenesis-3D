/**
 * GalaxyCluster.ts
 * Procedural generation of galaxy clusters and compact groups.
 * Organizes galaxies into gravitationally bound structures aligned with cosmic web nodes.
 */

import type {
  GalaxyClusterData,
  GalaxyData,
  GalaxyMorphology,
} from './GalaxyTypes';
import { getDefaultGalaxyParameters } from './GalaxyConfig';
import { createSeededRNG, randomInSphere } from '../utils/mathUtils';

export interface ClusterGenerationConfig {
  seed: number;
  center: [number, number, number];
  radius: number;
  name: string;
  clusterType: 'supercluster-node' | 'rich-cluster' | 'compact-group' | 'loose-group';
  memberCount: number;
  idPrefix: string;
}

export function generateGalaxyCluster(
  config: ClusterGenerationConfig,
  startIndex: number,
): { cluster: GalaxyClusterData; galaxies: GalaxyData[] } {
  const rng = createSeededRNG(config.seed);
  const galaxies: GalaxyData[] = [];
  const galaxyIds: string[] = [];

  const [cx, cy, cz] = config.center;

  // 1. Central Dominant Galaxy (Bright BCG Elliptical or Giant Grand Spiral)
  const isGiantElliptical = rng() > 0.4;
  const centralMorphology: GalaxyMorphology = isGiantElliptical ? 'elliptical' : 'spiral';
  const centralId = `GAL-${String(startIndex).padStart(3, '0')}`;
  galaxyIds.push(centralId);

  const centralParams = getDefaultGalaxyParameters(centralMorphology, config.seed + 100);
  if (isGiantElliptical) {
    centralParams.massSolar = 2.5e12;
    centralParams.radiusKpc = 55.0;
    centralParams.starCountEstimate = 1.2e12;
    centralParams.sceneRadius = 90.0;
    centralParams.coreBrightness = 2.4;
  } else {
    centralParams.massSolar = 1.4e12;
    centralParams.radiusKpc = 38.0;
    centralParams.starCountEstimate = 6.0e11;
    centralParams.sceneRadius = 82.0;
  }

  galaxies.push({
    id: centralId,
    catalogName: `${config.name} Core (${centralId})`,
    seed: config.seed + 100,
    morphology: centralMorphology,
    subtype: isGiantElliptical ? 'E0' : 'Sb',
    position: [cx, cy, cz],
    rotation: [rng() * 0.8, rng() * Math.PI * 2, rng() * 0.5],
    scale: 1.1,
    clusterId: config.name,
    clusterName: config.name,
    isClusterCenter: true,
    parameters: centralParams,
  });

  // 2. Satellite & Surrounding Member Galaxies
  for (let i = 1; i < config.memberCount; i++) {
    const memberId = `GAL-${String(startIndex + i).padStart(3, '0')}`;
    galaxyIds.push(memberId);

    // Position clustered around center with King / NFW profile falloff
    const relPos = randomInSphere(config.radius, rng);
    const posX = cx + relPos.x;
    const posY = cy + relPos.y * 0.6; // Slight planar flattening
    const posZ = cz + relPos.z;

    // Morphology distribution in clusters: mostly ellipticals and dwarf spheroids in core, spirals in outskirts
    const distFromCenter = relPos.length();
    const isCoreSector = distFromCenter < config.radius * 0.45;

    let morph: GalaxyMorphology = 'spiral';
    const typeRoll = rng();

    if (isCoreSector) {
      if (typeRoll < 0.45) morph = 'elliptical';
      else if (typeRoll < 0.70) morph = 'dwarf-spheroidal';
      else if (typeRoll < 0.90) morph = 'barred-spiral';
      else morph = 'irregular';
    } else {
      if (typeRoll < 0.40) morph = 'spiral';
      else if (typeRoll < 0.65) morph = 'barred-spiral';
      else if (typeRoll < 0.85) morph = 'irregular';
      else morph = 'dwarf-irregular';
    }

    const memberSeed = config.seed + (i * 73) + 7;
    const memberParams = getDefaultGalaxyParameters(morph, memberSeed);

    // Randomize orientation & scale
    const scaleFactor = 0.5 + rng() * 0.6;
    memberParams.sceneRadius *= scaleFactor;
    memberParams.inclination = rng() * Math.PI * 0.48;
    memberParams.positionAngle = rng() * Math.PI * 2.0;

    galaxies.push({
      id: memberId,
      catalogName: `${config.name}-${i} (${memberId})`,
      seed: memberSeed,
      morphology: morph,
      subtype: memberParams.subtype,
      position: [posX, posY, posZ],
      rotation: [memberParams.inclination, memberParams.positionAngle, rng() * 0.3],
      scale: scaleFactor,
      clusterId: config.name,
      clusterName: config.name,
      isClusterCenter: false,
      parameters: memberParams,
    });
  }

  const cluster: GalaxyClusterData = {
    id: `CLUSTER-${config.idPrefix}`,
    name: config.name,
    seed: config.seed,
    position: config.center,
    radius: config.radius,
    galaxyIds,
    galaxyCount: galaxies.length,
    clusterType: config.clusterType,
  };

  return { cluster, galaxies };
}
