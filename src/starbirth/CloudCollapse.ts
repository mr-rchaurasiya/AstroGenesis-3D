/**
 * CloudCollapse.ts
 * Gravitational collapse kinematics, isothermal-to-adiabatic transitions,
 * density evolution, and deterministic hierarchical fragmentation into protostellar seeds.
 */

import {
  ADIABATIC_INDEX_GAMMA,
  DEFAULT_CLOUD_TEMPERATURE_K,
} from './StarBirthConstants';
import type { MolecularCloudProperties, CloudState } from './StarBirthTypes';
import { calculateCloudDensity, calculateJeansInstability } from './MolecularCloud';
import { createSeededRNG } from '../utils/mathUtils';

// Critical number density where gas becomes optically thick to dust radiation and transitions from isothermal to adiabatic
const ADIABATIC_TRANSITION_NUMBER_DENSITY_CM3 = 1.0e10;

/**
 * Evolves molecular cloud properties forward in time during gravitational collapse.
 *
 * @param cloud - Current molecular cloud state
 * @param elapsedTimeYears - Time elapsed since start of collapse in Earth years
 * @returns Updated MolecularCloudProperties
 */
export function evolveCloudCollapse(
  cloud: MolecularCloudProperties,
  elapsedTimeYears: number,
): MolecularCloudProperties {
  const t = Math.max(0, elapsedTimeYears);
  const tFF = Math.max(1000, cloud.freeFallTimeYears);

  // Collapse progress normalized: τ = min(1.0, t / t_FF)
  const tau = Math.min(1.0, t / tFF);
  const smoothProgress = Math.sin((tau * Math.PI) / 2.0); // Smooth contraction easing

  // Cloud radius contracts from initial radiusPc down to dense core clump radius (~0.05 pc)
  const minRadiusPc = Math.max(0.02, cloud.radiusPc * 0.05);
  const currentRadiusPc = cloud.radiusPc * (1.0 - smoothProgress * 0.95) + minRadiusPc * smoothProgress;

  // Mass density scaling: ρ ∝ M / R³
  const { kgm3: currentDensityKgM3, numberDensityCm3: currentNumberDensityCm3 } = calculateCloudDensity(
    cloud.gasRemainingSolar,
    currentRadiusPc,
  );

  // Temperature evolution: isothermal (T ≈ 10-15K) at low density, then adiabatic heating when optically thick
  let currentTempK = cloud.temperatureK;
  if (currentNumberDensityCm3 > ADIABATIC_TRANSITION_NUMBER_DENSITY_CM3) {
    const densityRatio = currentNumberDensityCm3 / ADIABATIC_TRANSITION_NUMBER_DENSITY_CM3;
    currentTempK = DEFAULT_CLOUD_TEMPERATURE_K * Math.pow(densityRatio, ADIABATIC_INDEX_GAMMA - 1.0);
  }

  // Recalculate Jeans conditions at current density & temperature
  const { jeansLengthPc, jeansMassSolar } = calculateJeansInstability(currentTempK, currentDensityKgM3);

  // Determine state transitions
  let nextState: CloudState = cloud.state;
  if (tau >= 1.0 || cloud.stellarMassFormedSolar > 0) {
    nextState = cloud.gasRemainingSolar < cloud.massSolar * 0.1 ? 'DISPERSED' : 'STAR_FORMING';
  } else if (tau > 0.6) {
    nextState = 'FRAGMENTING';
  } else if (tau > 0.1) {
    nextState = 'COLLAPSING';
  }

  return {
    ...cloud,
    radiusPc: currentRadiusPc,
    temperatureK: currentTempK,
    meanDensityKgM3: currentDensityKgM3,
    numberDensityCm3: currentNumberDensityCm3,
    jeansLengthPc,
    jeansMassSolar,
    collapseProgress: tau,
    state: nextState,
  };
}

export interface ProtostellarSeed {
  seedIndex: number;
  initialMassSolar: number;
  targetFinalMassSolar: number;
  positionOffset: [number, number, number];
  relativeDelayYears: number;
}

/**
 * Deterministically fragments a collapsing cloud into protostellar seeds based on Jeans mass,
 * cloud mass, and a deterministic seed.
 *
 * @param cloud - Molecular cloud
 * @param targetStarMassSolar - Optional primary target star mass in M_☉
 * @param seed - Seed integer for deterministic generation
 * @returns Array of ProtostellarSeed configurations
 */
export function fragmentCloudIntoSeeds(
  cloud: MolecularCloudProperties,
  targetStarMassSolar?: number,
  seed: number = 42,
): ProtostellarSeed[] {
  const rng = createSeededRNG(seed);
  const primaryMass = Math.max(0.08, targetStarMassSolar ?? 1.0);

  // Estimate number of fragments (typically 1 to 5 for small cloud simulations)
  const availableStarMass = cloud.massSolar * 0.20; // 20% SFE
  const rawFragmentCount = Math.max(1, Math.min(5, Math.floor(availableStarMass / primaryMass)));

  const seeds: ProtostellarSeed[] = [];

  // Primary seed (the central star being explored)
  seeds.push({
    seedIndex: 0,
    initialMassSolar: 0.01,
    targetFinalMassSolar: primaryMass,
    positionOffset: [0, 0, 0],
    relativeDelayYears: 0,
  });

  // Secondary companion seeds if fragment count > 1
  for (let i = 1; i < rawFragmentCount; i++) {
    const companionMassRatio = 0.2 + rng() * 0.6; // Secondary is 20% to 80% of primary
    const companionTargetMass = Math.max(0.08, primaryMass * companionMassRatio);
    const radiusOffset = (0.2 + rng() * 0.6) * cloud.radiusPc * 15.0; // Scale to scene units
    const theta = rng() * Math.PI * 2;
    const phi = (rng() - 0.5) * Math.PI * 0.4;

    seeds.push({
      seedIndex: i,
      initialMassSolar: 0.01,
      targetFinalMassSolar: companionTargetMass,
      positionOffset: [
        radiusOffset * Math.cos(theta) * Math.cos(phi),
        radiusOffset * Math.sin(phi),
        radiusOffset * Math.sin(theta) * Math.cos(phi),
      ],
      relativeDelayYears: rng() * (cloud.freeFallTimeYears * 0.3),
    });
  }

  return seeds;
}
