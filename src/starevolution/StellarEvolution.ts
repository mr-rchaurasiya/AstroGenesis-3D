/**
 * StellarEvolution.ts
 * Primary Master Public Coordinator for the Phase 9 Stellar Evolution Engine.
 * Advances stellar age, computes stage transitions, updates core/photospheric properties,
 * mass loss, and Morgan-Keenan spectral classifications.
 */

import {
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
} from '../stellar/StellarConstants';
import {
  massToMainSequenceLuminosity,
} from '../stellar/StellarPhysics';
import { calculateMainSequenceLifetime } from '../stellar/StellarLifetime';
import {
  classifySpectralType,
  determineLuminosityClass,
  calculateBolometricMagnitude,
  calculateAbsoluteVisualMagnitude,
} from '../stellar/StellarClassification';
import { createStellarComposition } from '../stellar/StellarComposition';

import type {
  StellarEvolutionProperties,
  StellarEvolutionConfig,
  StellarEvolutionStage,
} from './StarEvolutionTypes';
import {
  SUBGIANT_DURATION_FRACTION,
  RED_GIANT_DURATION_FRACTION,
  HELIUM_BURNING_DURATION_FRACTION,
  AGB_DURATION_FRACTION,
  FULLY_CONVECTIVE_MASS_LIMIT_SOLAR,
  MASSIVE_STAR_MASS_LIMIT_SOLAR,
} from './StarEvolutionConstants';

import { calculateMainSequenceState } from './MainSequenceEvolution';
import { calculateSubgiantState } from './PostMainSequence';
import { calculateGiantState } from './GiantBranchModel';
import { calculateHeliumBurningState } from './HeliumBurning';
import { calculateCumulativeMassLoss } from './MassLossModel';

/**
 * Initializes a new StellarEvolutionProperties object at ZAMS (age = 0).
 */
export function initializeStellarEvolution(config: StellarEvolutionConfig): StellarEvolutionProperties {
  const initialMassSolar = Math.max(0.08, isFinite(config.initialMassSolar) ? config.initialMassSolar : 1.0);
  const metallicityFeH = config.metallicityFeH ?? 0.0;
  const initialAgeYears = config.initialAgeYears ?? 0.0;

  return advanceStellarEvolution({
    initialMassSolar,
    id: config.id,
    name: config.name,
    metallicityFeH,
    currentAgeYears: initialAgeYears,
    position: config.position,
  });
}

/**
 * Advances or calculates the complete physical and evolutionary state of a star at any arbitrary age.
 * Supports passing either an existing star object + new age, or a configuration object.
 */
export function advanceStellarEvolution(
  starOrConfig:
    | StellarEvolutionProperties
    | StellarEvolutionConfig
    | {
        initialMassSolar: number;
        currentAgeYears: number;
        id?: string;
        name?: string;
        metallicityFeH?: number;
        position?: [number, number, number];
      },
  targetAgeYears?: number,
): StellarEvolutionProperties {
  let M0: number;
  let age: number;
  let starId: string;
  let starName: string | undefined;
  let feH: number;
  let position: [number, number, number];

  if ('currentAgeYears' in starOrConfig && typeof starOrConfig.currentAgeYears === 'number' && targetAgeYears === undefined) {
    M0 = starOrConfig.initialMassSolar;
    age = starOrConfig.currentAgeYears;
    starId = starOrConfig.id ?? `star_evol_${M0.toFixed(2)}M_${Date.now().toString(36)}`;
    starName = starOrConfig.name;
    feH = starOrConfig.metallicityFeH ?? 0.0;
    position = starOrConfig.position ?? [0, 0, 0];
  } else {
    M0 = starOrConfig.initialMassSolar;
    if (targetAgeYears !== undefined) {
      age = targetAgeYears;
    } else if ('ageYears' in starOrConfig) {
      age = starOrConfig.ageYears;
    } else if ('initialAgeYears' in starOrConfig && starOrConfig.initialAgeYears !== undefined) {
      age = starOrConfig.initialAgeYears;
    } else {
      age = 0;
    }
    starId = starOrConfig.id ?? `star_evol_${M0.toFixed(2)}M_${Date.now().toString(36)}`;
    starName = starOrConfig.name;
    const comp = 'composition' in starOrConfig ? starOrConfig.composition : undefined;
    const directFeH = 'metallicityFeH' in starOrConfig ? starOrConfig.metallicityFeH : undefined;
    feH = comp?.metallicityFeH ?? directFeH ?? 0.0;
    position = starOrConfig.position ?? [0, 0, 0];
  }

  M0 = Math.max(0.08, isFinite(M0) ? M0 : 1.0);
  age = Math.max(0, isFinite(age) ? age : 0);
  feH = isFinite(feH) ? feH : 0.0;

  const composition = createStellarComposition({ metallicityFeH: feH });
  const zamsBaseLum = massToMainSequenceLuminosity(M0);
  const zamsLuminosity = zamsBaseLum * Math.pow(10, -0.06 * feH);
  const msLifetimeYears = calculateMainSequenceLifetime(M0, zamsLuminosity);

  const isLowMass = M0 < FULLY_CONVECTIVE_MASS_LIMIT_SOLAR;
  const isMassive = M0 >= MASSIVE_STAR_MASS_LIMIT_SOLAR;

  // ── 1. Calculate Evolutionary Stage Timelines ──
  const subgiantDuration = isLowMass ? 0 : msLifetimeYears * SUBGIANT_DURATION_FRACTION;
  const rgbDuration = isLowMass ? 0 : msLifetimeYears * RED_GIANT_DURATION_FRACTION;
  const heBurningDuration = isLowMass ? 0 : msLifetimeYears * HELIUM_BURNING_DURATION_FRACTION;
  const agbDuration = isLowMass ? 0 : msLifetimeYears * AGB_DURATION_FRACTION;

  const totalLifespanYears = msLifetimeYears + subgiantDuration + rgbDuration + heBurningDuration + agbDuration;

  // ── 2. Determine Current Evolutionary Stage & Photospheric Properties ──
  let stage: StellarEvolutionStage = 'MAIN_SEQUENCE';
  let stageProgress = 0.0;
  let evolutionFraction = 0.0;

  let luminositySolar = zamsLuminosity;
  let radiusSolar = 1.0;
  let effectiveTemperatureK = 5778;
  let coreTemperatureK = 1.57e7;
  let coreDensityKgM3 = 1.62e5;
  let coreHydrogenFraction = composition.hydrogenFraction;
  let coreHeliumFraction = composition.heliumFraction;
  let coreCarbonOxygenFraction = 0.0;
  let coreMassSolar = M0 * 0.10;

  if (age <= msLifetimeYears || isLowMass) {
    // ── MAIN SEQUENCE STAGE ──
    evolutionFraction = Math.min(1.0, age / msLifetimeYears);
    stageProgress = evolutionFraction;

    const msState = calculateMainSequenceState(
      M0,
      age,
      feH,
      composition.hydrogenFraction,
      composition.heliumFraction,
    );

    luminositySolar = msState.luminositySolar;
    radiusSolar = msState.radiusSolar;
    effectiveTemperatureK = msState.effectiveTemperatureK;
    coreTemperatureK = msState.coreTemperatureK;
    coreDensityKgM3 = msState.coreDensityKgM3;
    coreHydrogenFraction = msState.coreHydrogenFraction;
    coreHeliumFraction = msState.coreHeliumFraction;
    stage = msState.stage;
  } else if (age <= msLifetimeYears + subgiantDuration && !isMassive) {
    // ── SUBGIANT STAGE ──
    evolutionFraction = 1.0;
    stage = 'SUBGIANT';
    const subgiantAge = age - msLifetimeYears;
    stageProgress = subgiantDuration > 0 ? Math.min(1.0, subgiantAge / subgiantDuration) : 1.0;

    const sgState = calculateSubgiantState(M0, stageProgress);
    luminositySolar = sgState.luminositySolar;
    radiusSolar = sgState.radiusSolar;
    effectiveTemperatureK = sgState.effectiveTemperatureK;
    coreTemperatureK = sgState.coreTemperatureK;
    coreDensityKgM3 = sgState.coreDensityKgM3;
    coreHydrogenFraction = 0.0;
    coreHeliumFraction = 1.0;
    coreMassSolar = sgState.coreMassSolar;
  } else if (age <= msLifetimeYears + subgiantDuration + rgbDuration) {
    // ── RED GIANT / SUPERGIANT STAGE ──
    evolutionFraction = 1.0;
    const giantAge = age - (msLifetimeYears + subgiantDuration);
    stageProgress = rgbDuration > 0 ? Math.min(1.0, giantAge / rgbDuration) : 1.0;

    const giantState = calculateGiantState(M0, stageProgress, false);
    luminositySolar = giantState.luminositySolar;
    radiusSolar = giantState.radiusSolar;
    effectiveTemperatureK = giantState.effectiveTemperatureK;
    coreTemperatureK = giantState.coreTemperatureK;
    coreDensityKgM3 = giantState.coreDensityKgM3;
    coreHydrogenFraction = 0.0;
    coreHeliumFraction = 1.0;
    coreMassSolar = giantState.coreMassSolar;
    stage = giantState.stage;
  } else if (age <= msLifetimeYears + subgiantDuration + rgbDuration + heBurningDuration) {
    // ── HELIUM IGNITION / BURNING STAGE ──
    evolutionFraction = 1.0;
    const heAge = age - (msLifetimeYears + subgiantDuration + rgbDuration);
    stageProgress = heBurningDuration > 0 ? Math.min(1.0, heAge / heBurningDuration) : 1.0;

    const heState = calculateHeliumBurningState(M0, stageProgress);
    luminositySolar = heState.luminositySolar;
    radiusSolar = heState.radiusSolar;
    effectiveTemperatureK = heState.effectiveTemperatureK;
    coreTemperatureK = heState.coreTemperatureK;
    coreDensityKgM3 = heState.coreDensityKgM3;
    coreHydrogenFraction = 0.0;
    coreHeliumFraction = heState.coreHeliumFraction;
    coreCarbonOxygenFraction = heState.coreCarbonOxygenFraction;
    coreMassSolar = heState.coreMassSolar;
    stage = heState.stage;
  } else if (age <= totalLifespanYears) {
    // ── ASYMPTOTIC GIANT BRANCH / LATE EVOLUTION STAGE ──
    evolutionFraction = 1.0;
    const agbAge = age - (msLifetimeYears + subgiantDuration + rgbDuration + heBurningDuration);
    stageProgress = agbDuration > 0 ? Math.min(1.0, agbAge / agbDuration) : 1.0;

    const agbState = calculateGiantState(M0, stageProgress, true);
    luminositySolar = agbState.luminositySolar;
    radiusSolar = agbState.radiusSolar;
    effectiveTemperatureK = agbState.effectiveTemperatureK;
    coreTemperatureK = agbState.coreTemperatureK;
    coreDensityKgM3 = agbState.coreDensityKgM3;
    coreHydrogenFraction = 0.0;
    coreHeliumFraction = 0.0;
    coreCarbonOxygenFraction = 1.0;
    coreMassSolar = agbState.coreMassSolar;
    stage = agbState.stage;
  } else {
    // ── POST-HELIUM HANDOFF ENDPOINT (Phase 10 Boundary) ──
    evolutionFraction = 1.0;
    stage = 'POST_HELIUM';
    stageProgress = 1.0;

    const finalGiant = calculateGiantState(M0, 1.0, true);
    luminositySolar = finalGiant.luminositySolar * 1.1;
    radiusSolar = finalGiant.radiusSolar * 1.1;
    effectiveTemperatureK = finalGiant.effectiveTemperatureK;
    coreTemperatureK = finalGiant.coreTemperatureK * 1.2;
    coreDensityKgM3 = finalGiant.coreDensityKgM3 * 2.0;
    coreHydrogenFraction = 0.0;
    coreHeliumFraction = 0.0;
    coreCarbonOxygenFraction = 1.0;
    coreMassSolar = finalGiant.coreMassSolar;
  }

  // ── 3. Mass Loss & Conservation ──
  const { currentMassSolar, ejectedMassSolar, massLossRateSolarPerYear } = calculateCumulativeMassLoss(
    M0,
    age,
    msLifetimeYears,
    stage,
    coreMassSolar,
    radiusSolar,
    luminositySolar,
  );

  const envelopeMassSolar = Math.max(0, currentMassSolar - coreMassSolar);
  const massKg = currentMassSolar * SOLAR_MASS_KG;
  const radiusM = radiusSolar * SOLAR_RADIUS_M;
  const luminosityWatts = luminositySolar * SOLAR_LUMINOSITY_W;

  // ── 4. Gravitational Acceleration (SI m/s² and log g) ──
  const G = 6.67430e-11;
  const surfaceGravityMs2 = (G * massKg) / (radiusM * radiusM);
  const surfaceGravitySolar = surfaceGravityMs2 / 274.2;
  const surfaceGravityLogG = Math.log10(Math.max(1e-10, surfaceGravityMs2 * 100)); // cgs cm/s²

  // ── 5. Morgan-Keenan Spectral Classification ──
  const spectralInfo = classifySpectralType(effectiveTemperatureK);
  const luminosityClass = determineLuminosityClass(
    stage === 'SUPERGIANT'
      ? 'AGB'
      : stage === 'RED_GIANT' || stage === 'ASYMPTOTIC_GIANT_BRANCH'
      ? 'RED_GIANT'
      : stage === 'SUBGIANT'
      ? 'SUBGIANT'
      : 'MAIN_SEQUENCE',
    surfaceGravityLogG,
  );

  const fullSpectralDesignation = `${spectralInfo.spectralClass}${luminosityClass}`;
  const bolometricMagnitude = calculateBolometricMagnitude(luminositySolar);
  const absoluteMagnitude = calculateAbsoluteVisualMagnitude(luminositySolar, effectiveTemperatureK);

  const finalName = starName ?? `Evolving Star (${fullSpectralDesignation})`;

  return {
    id: starId,
    name: finalName,
    initialMassSolar: M0,
    currentMassSolar,
    massKg,
    coreMassSolar,
    envelopeMassSolar,
    ejectedMassSolar,
    massLossRateSolarPerYear,
    ageYears: age,
    mainSequenceLifetimeYears: msLifetimeYears,
    remainingMainSequenceLifetimeYears: Math.max(0, msLifetimeYears - age),
    evolutionFraction,
    totalLifespanYears,
    stage,
    luminositySolar,
    luminosityWatts,
    radiusSolar,
    radiusM,
    effectiveTemperatureK,
    surfaceGravityMs2,
    surfaceGravitySolar,
    surfaceGravityLogG,
    coreTemperatureK,
    coreDensityKgM3,
    composition,
    coreHydrogenFraction,
    coreHeliumFraction,
    coreCarbonOxygenFraction,
    spectralTypeLetter: spectralInfo.letter,
    spectralSubtype: spectralInfo.subtype,
    spectralClass: spectralInfo.spectralClass,
    luminosityClass,
    fullSpectralDesignation,
    bolometricMagnitude,
    absoluteMagnitude,
    isMainSequence: stage === 'ZERO_AGE_MAIN_SEQUENCE' || stage === 'MAIN_SEQUENCE' || stage === 'HYDROGEN_DEPLETION',
    isPostMainSequence: stage !== 'ZERO_AGE_MAIN_SEQUENCE' && stage !== 'MAIN_SEQUENCE' && stage !== 'HYDROGEN_DEPLETION',
    isHeliumBurning: stage === 'HELIUM_IGNITION' || stage === 'HELIUM_BURNING',
    isMassiveStar: isMassive,
    isLowMassStar: isLowMass,
    position,
  };
}
