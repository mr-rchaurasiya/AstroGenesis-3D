/**
 * StarFormation.ts
 * Master coordinator for the Star Birth Engine:
 * Manages molecular cloud collapse, protostar evolution, gas conservation tracking,
 * Initial Mass Function (IMF) sampling, and Pre-Main-Sequence state calculation.
 */

import type {
  StarFormationSystemProperties,
  StarBirthConfig,
  ProtostarProperties,
} from './StarBirthTypes';
import { createMolecularCloud } from './MolecularCloud';
import { evolveCloudCollapse, fragmentCloudIntoSeeds } from './CloudCollapse';
import { evolveProtostar } from './Protostar';
import type { StellarProperties } from '../stellar/StellarTypes';

/**
 * Initializes a new StarFormationSystem complex from configuration inputs.
 */
export function initializeStarFormationSystem(config: StarBirthConfig = {}): StarFormationSystemProperties {
  const cloud = createMolecularCloud(config);
  const seeds = fragmentCloudIntoSeeds(cloud, config.targetStarMassSolar, config.seed ?? 42);

  const protostars: ProtostarProperties[] = seeds.map((s, idx) => {
    return evolveProtostar({
      id: `proto_${cloud.id}_${idx}`,
      name: idx === 0 ? 'Primary Protostellar Core' : `Companion Core ${idx + 1}`,
      parentId: cloud.id,
      targetFinalMassSolar: s.targetFinalMassSolar,
      ageYears: 0,
      metallicityFeH: cloud.metallicityFeH,
      position: s.positionOffset,
    });
  });

  return {
    id: `formation_sys_${Date.now().toString(36)}`,
    name: 'Protostellar Formation Complex',
    cloud,
    protostars,
    activeProtostarId: protostars[0]?.id ?? null,
    simulationAgeYears: 0,
    totalInitialGasSolar: cloud.massSolar,
    totalStellarMassSolar: 0,
    totalOutflowMassSolar: 0,
    starFormationEfficiency: 0,
    isIgnited: false,
  };
}

/**
 * Advances the star formation system forward by simulation time in Earth years.
 * Maintains strict physical mass conservation:
 * M_initial = M_gas_remaining + M_stars + M_outflow
 *
 * @param system - Current StarFormationSystem state
 * @param simulationAgeYears - Target elapsed simulation age in Earth years
 * @returns Updated StarFormationSystemProperties
 */
export function evolveStarFormationSystem(
  system: StarFormationSystemProperties,
  simulationAgeYears: number,
): StarFormationSystemProperties {
  const currentAge = Math.max(0, simulationAgeYears);

  // 1. Evolve parent molecular cloud collapse
  const updatedCloud = evolveCloudCollapse(system.cloud, currentAge);

  // 2. Evolve individual protostellar cores
  let totalStellarMass = 0;
  let totalOutflowMass = 0;
  let anyIgnited = false;

  const updatedProtostars = system.protostars.map((p, idx) => {
    // Companion seeds may have slight formation delays
    const seedDelay = idx === 0 ? 0 : idx * 5.0e4;
    const effectiveAge = Math.max(0, currentAge - seedDelay);

    const updatedP = evolveProtostar({
      id: p.id,
      name: p.name,
      parentId: system.cloud.id,
      targetFinalMassSolar: idx === 0 ? (system.cloud.massSolar * 0.20) / system.protostars.length : p.massSolar * 1.5,
      ageYears: effectiveAge,
      metallicityFeH: system.cloud.metallicityFeH,
      position: p.position,
    });

    totalStellarMass += updatedP.massSolar;
    // Outflow mass accumulated from jets: ~10% of accreted mass
    totalOutflowMass += updatedP.massSolar * 0.12;

    if (updatedP.state === 'HYDROGEN_IGNITION' || updatedP.state === 'ZERO_AGE_MAIN_SEQUENCE') {
      anyIgnited = true;
    }

    return updatedP;
  });

  // 3. Update gas conservation in cloud
  const gasRemaining = Math.max(0, system.totalInitialGasSolar - totalStellarMass - totalOutflowMass);
  const updatedCloudWithGas = {
    ...updatedCloud,
    gasRemainingSolar: gasRemaining,
    stellarMassFormedSolar: totalStellarMass,
    outflowMassSolar: totalOutflowMass,
  };

  const sfe = system.totalInitialGasSolar > 0
    ? totalStellarMass / system.totalInitialGasSolar
    : 0;

  return {
    ...system,
    cloud: updatedCloudWithGas,
    protostars: updatedProtostars,
    simulationAgeYears: currentAge,
    totalStellarMassSolar: totalStellarMass,
    totalOutflowMassSolar: totalOutflowMass,
    starFormationEfficiency: sfe,
    isIgnited: anyIgnited,
  };
}

/**
 * High-level Pre-Main-Sequence track calculator API.
 * Evaluates the full physical state of a forming star at any arbitrary age.
 *
 * @param targetFinalMassSolar - Final mass of star in M_☉
 * @param ageYears - Age in Earth years
 * @param metallicityFeH - Metallicity index (default: 0.0)
 * @returns ProtostarProperties
 */
export function calculatePreMainSequenceState(
  targetFinalMassSolar: number,
  ageYears: number,
  metallicityFeH: number = 0.0,
): ProtostarProperties {
  return evolveProtostar({
    id: `pms_${targetFinalMassSolar.toFixed(2)}M`,
    name: `Pre-Main-Sequence Object (${targetFinalMassSolar.toFixed(2)} M_☉)`,
    parentId: 'standalone_pms',
    targetFinalMassSolar,
    ageYears,
    metallicityFeH,
  });
}

/**
 * Samples a stellar mass from a Kroupa (2001) Initial Mass Function (IMF).
 *
 * Probability Distribution:
 * - ξ(m) ∝ m^(-0.3) for 0.01 <= m < 0.08 (Substellar)
 * - ξ(m) ∝ m^(-1.3) for 0.08 <= m < 0.50 (Low mass)
 * - ξ(m) ∝ m^(-2.3) for m >= 0.50        (Solar & Massive)
 *
 * @param rng - Pseudo-random number generator function
 * @returns Stellar mass in Solar masses M_☉
 */
export function sampleKroupaIMF(rng: () => number = Math.random): number {
  const r = rng();

  if (r < 0.15) {
    // 0.01 to 0.08 M_☉
    return 0.01 + Math.pow(r / 0.15, 1.0 / 0.7) * (0.08 - 0.01);
  } else if (r < 0.75) {
    // 0.08 to 0.50 M_☉
    const u = (r - 0.15) / (0.75 - 0.15);
    return 0.08 + Math.pow(u, 1.0 / 0.3) * (0.50 - 0.08);
  } else {
    // 0.50 to 50.0 M_☉ (Salpeter-like high-mass power law)
    const u = (r - 0.75) / (1.0 - 0.75);
    return 0.50 * Math.pow(1.0 - u * 0.99, -1.0 / 1.3);
  }
}

/**
 * Extracts Phase 7 compatible StellarProperties from an ignited protostar.
 */
export function extractZAMSStar(protostar: ProtostarProperties): StellarProperties | null {
  return protostar.finalStellarProperties ?? null;
}
