/**
 * Protostar.ts
 * Protostellar core evolution, Kelvin-Helmholtz gravitational contraction,
 * virial core thermodynamics, rotational breakup safety, and hydrogen ignition state machine.
 */

import {
  GRAVITATIONAL_CONSTANT_G,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  YEAR_IN_SECONDS,
  HYDROGEN_IGNITION_CORE_TEMPERATURE_K,
  HYDROGEN_BURNING_MINIMUM_MASS_SOLAR,
  MAX_SAFE_ROTATION_FRACTION,
  CHARACTERISTIC_ACCRETION_TIMESCALE_YEARS,
} from './StarBirthConstants';
import type { ProtostarProperties, ProtostarState } from './StarBirthTypes';
import { calculateAccretionRate, calculateAccretionLuminosity } from './AccretionModel';
import { calculateCircumstellarDisk } from './DiskModel';
import { calculateProtostellarJets } from './JetsModel';
import { calculateStellarProperties } from '../stellar/StellarModels';
import { massToMainSequenceRadius, stefanBoltzmannTemperature } from '../stellar/StellarPhysics';

/**
 * Computes Kelvin-Helmholtz thermal gravitational timescale t_KH in Earth years.
 * Formula: t_KH = (G * M²) / (R * L)
 *
 * @param massSolar - Stellar mass in M_☉
 * @param radiusSolar - Stellar radius in R_☉
 * @param luminositySolar - Total luminosity in L_☉
 * @returns Timescale in Earth years
 */
export function calculateKelvinHelmholtzTime(
  massSolar: number,
  radiusSolar: number,
  luminositySolar: number,
): number {
  const mKg = Math.max(0.01, massSolar) * SOLAR_MASS_KG;
  const rM = Math.max(0.01, radiusSolar) * SOLAR_RADIUS_M;
  const lWatts = Math.max(1e-5, luminositySolar) * SOLAR_LUMINOSITY_W;

  const seconds = (GRAVITATIONAL_CONSTANT_G * mKg * mKg) / (rM * lWatts);
  return seconds / YEAR_IN_SECONDS;
}

/**
 * Evolves a protostar model forward in time given its target mass and elapsed simulation age.
 *
 * @param params - Initial or current protostar parameters
 * @returns Fully updated ProtostarProperties
 */
export function evolveProtostar(params: {
  id: string;
  name: string;
  parentId: string;
  targetFinalMassSolar: number;
  ageYears: number;
  metallicityFeH?: number;
  position?: [number, number, number];
}): ProtostarProperties {
  const targetMass = Math.max(0.01, params.targetFinalMassSolar);
  const age = Math.max(0, params.ageYears);
  const tauAcc = CHARACTERISTIC_ACCRETION_TIMESCALE_YEARS * Math.pow(targetMass, 0.4);

  // ── 1. Mass Accumulation via Accretion ──
  // Integrated mass: M(t) = targetMass * (1 - exp(-t / tauAcc))
  const accretionProgress = 1.0 - Math.exp(-age / tauAcc);
  const currentMassSolar = Math.max(0.01, targetMass * accretionProgress);
  const massKg = currentMassSolar * SOLAR_MASS_KG;
  const accretionRate = calculateAccretionRate(targetMass, age, tauAcc);

  // ── 2. Radius Contraction (Hayashi track / Kelvin-Helmholtz) ──
  // ZAMS radius from Phase 7 physics model
  const zamsRadiusSolar = massToMainSequenceRadius(currentMassSolar);
  // Initial inflated radius is ~4 to 8 R_☉
  const initialRadiusSolar = Math.max(zamsRadiusSolar * 2.5, 5.0 * Math.pow(targetMass, 0.5));
  // Kelvin-Helmholtz contraction timescale depends on mass (capped smoothly between 1e5 yr for O stars and 1e8 yr for M dwarfs/brown dwarfs)
  const khTimescaleYears = Math.min(1.0e8, Math.max(1.0e5, 3.0e7 * Math.pow(Math.max(0.08, targetMass), -1.5)));

  // Contraction factor (asymptotes to 1.0 at ZAMS or degenerate brown dwarf radius)
  const contractionRatio = Math.min(1.0, age / khTimescaleYears);
  const radiusSolar = initialRadiusSolar * (1.0 - contractionRatio) + zamsRadiusSolar * contractionRatio;
  const radiusM = radiusSolar * SOLAR_RADIUS_M;

  // ── 3. Core Temperature & Density Evolution ──
  // Virial theorem scaling: T_c ≈ 1.57e7 K * (M / M_☉) / (R / R_☉)
  const coreTemperatureK = 1.57e7 * (currentMassSolar / radiusSolar);
  // Core density: ρ_c ∝ M / R³
  const coreDensityKgM3 = 1.62e5 * (currentMassSolar / Math.pow(radiusSolar, 3));

  // ── 4. Luminosity & Effective Surface Temperature ──
  const { solar: accretionLumSolar } = calculateAccretionLuminosity(
    currentMassSolar,
    radiusSolar,
    accretionRate,
  );
  // Internal contraction luminosity
  const internalLumSolar = Math.max(0.01, Math.pow(currentMassSolar, 3.5) * (radiusSolar / zamsRadiusSolar));
  const luminositySolar = internalLumSolar + accretionLumSolar;
  const luminosityWatts = luminositySolar * SOLAR_LUMINOSITY_W;

  const effectiveTemperatureK = stefanBoltzmannTemperature(luminositySolar, radiusSolar);

  // ── 5. Rotation & Angular Momentum Safety ──
  // Breakup angular velocity Ω_breakup = sqrt(G * M / R³)
  const breakupVelocityRadS = Math.sqrt((GRAVITATIONAL_CONSTANT_G * massKg) / Math.pow(radiusM, 3));
  // Spin velocity increases as radius contracts, clamped safely below breakup limit
  const baseAngularVel = 1.0e-5 * Math.pow(initialRadiusSolar / radiusSolar, 1.2);
  const angularVelocityRadS = Math.min(breakupVelocityRadS * MAX_SAFE_ROTATION_FRACTION, baseAngularVel);
  // Moment of inertia for spherical protostar: I ≈ 0.2 * M * R²
  const momentOfInertia = 0.2 * massKg * radiusM * radiusM;
  const angularMomentumJ = momentOfInertia * angularVelocityRadS;

  // ── 6. State Machine & Ignition Logic ──
  let state: ProtostarState = 'COLLAPSING_CORE';
  let formationProgress = 0.0;

  if (currentMassSolar < HYDROGEN_BURNING_MINIMUM_MASS_SOLAR && (age > khTimescaleYears * 0.5 || age > tauAcc * 3.0)) {
    state = 'BROWN_DWARF';
    formationProgress = 1.0;
  } else if (coreTemperatureK >= HYDROGEN_IGNITION_CORE_TEMPERATURE_K && currentMassSolar >= HYDROGEN_BURNING_MINIMUM_MASS_SOLAR) {
    state = age >= khTimescaleYears ? 'ZERO_AGE_MAIN_SEQUENCE' : 'HYDROGEN_IGNITION';
    formationProgress = 1.0;
  } else if (age > tauAcc * 2.5) {
    state = 'PRE_MAIN_SEQUENCE';
    formationProgress = Math.min(0.95, 0.6 + 0.35 * (age / khTimescaleYears));
  } else if (age > tauAcc * 1.0) {
    state = 'T_TAURI';
    formationProgress = Math.min(0.6, 0.3 + 0.3 * (age / (tauAcc * 2.5)));
  } else if (age > tauAcc * 0.2) {
    state = 'ACCRETION';
    formationProgress = Math.min(0.3, 0.1 + 0.2 * (age / tauAcc));
  } else if (age > 0) {
    state = 'PROTOSTAR';
    formationProgress = Math.min(0.1, 0.05 + 0.05 * (age / (tauAcc * 0.2)));
  }

  // ── 7. Disk and Jet Models ──
  const disk = calculateCircumstellarDisk(currentMassSolar, effectiveTemperatureK, accretionRate, age);
  const jets = calculateProtostellarJets(currentMassSolar, radiusSolar, accretionRate, age);

  // ── 8. Phase 7 ZAMS Handoff Model ──
  let finalStellarProperties;
  if (state === 'ZERO_AGE_MAIN_SEQUENCE' || state === 'HYDROGEN_IGNITION') {
    finalStellarProperties = calculateStellarProperties({
      id: params.id,
      name: params.name,
      massSolar: currentMassSolar,
      radiusSolar: zamsRadiusSolar,
      metallicityFeH: params.metallicityFeH,
      evolutionaryState: 'MAIN_SEQUENCE',
    });
  }

  const kelvinHelmholtzTimeYears = calculateKelvinHelmholtzTime(currentMassSolar, radiusSolar, luminositySolar);

  return {
    id: params.id,
    name: params.name,
    parentId: params.parentId,
    massSolar: currentMassSolar,
    massKg,
    radiusSolar,
    radiusM,
    luminositySolar,
    luminosityWatts,
    accretionLuminositySolar: accretionLumSolar,
    internalLuminositySolar: internalLumSolar,
    effectiveTemperatureK,
    coreTemperatureK,
    coreDensityKgM3: coreDensityKgM3,
    accretionRateSolarPerYear: accretionRate,
    ageYears: age,
    kelvinHelmholtzTimeYears,
    angularMomentumJ,
    angularVelocityRadS,
    breakupVelocityRadS,
    state,
    formationProgress,
    disk,
    jets,
    finalStellarProperties,
    position: params.position ?? [0, 0, 0],
  };
}
