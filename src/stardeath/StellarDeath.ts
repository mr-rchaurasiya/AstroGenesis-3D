/**
 * StellarDeath.ts
 * Primary Master Public Coordinator for the Phase 10 Stellar Death & Remnants Engine.
 * Manages death stage transitions, envelope detachment, planetary nebulae, core collapse,
 * supernovae, and final compact remnant physics.
 */

import {
  PLANETARY_NEBULA_LIFETIME_YEARS,
} from './StarDeathConstants';
import type {
  StellarDeathProperties,
  StellarDeathConfig,
  StellarDeathStage,
  RemnantType,
} from './StarDeathTypes';
import type { StellarEvolutionProperties } from '../starevolution/StarEvolutionTypes';
import type { LuminosityClass } from '../stellar/StellarTypes';
import { createStellarComposition } from '../stellar/StellarComposition';
import { classifyStellarRemnant } from './RemnantClassification';
import { calculatePlanetaryNebulaState } from './PlanetaryNebulaModel';
import { calculateWhiteDwarfState } from './WhiteDwarfModel';
import { calculateCoreCollapseState } from './CoreCollapse';
import { calculateSupernovaState } from './SupernovaModel';
import { calculateNeutronStarState } from './NeutronStarModel';
import { calculateBlackHoleState } from './BlackHoleModel';

/**
 * Initializes a new StellarDeathProperties system.
 *
 * @param config - Configuration or Phase 9 progenitor star
 * @returns Initialized StellarDeathProperties
 */
export function initializeStellarDeath(config: StellarDeathConfig): StellarDeathProperties {
  const progenitor = config.progenitorStar;
  const initialMassSolar = progenitor
    ? progenitor.initialMassSolar
    : Math.max(0.08, isFinite(config.initialMassSolar ?? 1.0) ? (config.initialMassSolar ?? 1.0) : 1.0);

  const currentMassSolar = progenitor ? progenitor.currentMassSolar : initialMassSolar;
  const coreMassSolar = progenitor ? progenitor.coreMassSolar : Math.max(0.1, initialMassSolar * 0.15);
  const metallicityFeH = progenitor ? progenitor.composition.metallicityFeH : (config.metallicityFeH ?? 0.0);
  const initialAge = config.initialDeathAgeYears ?? 0.0;
  const position = config.position ?? progenitor?.position ?? [0, 0, 0];
  const customId = config.id ?? progenitor?.id ?? `death_${initialMassSolar.toFixed(2)}M_${Date.now().toString(36)}`;
  const customName = config.name ?? (progenitor ? `${progenitor.name} Remnant` : undefined);

  return advanceStellarDeath({
    id: customId,
    name: customName,
    progenitorInitialMassSolar: initialMassSolar,
    currentMassSolar,
    coreMassSolar,
    metallicityFeH,
    deathAgeYears: initialAge,
    position,
  });
}

/**
 * Advances or calculates the complete physical death state of a star at any arbitrary death age.
 */
export function advanceStellarDeath(
  stateOrConfig:
    | StellarDeathProperties
    | StellarDeathConfig
    | {
        id?: string;
        name?: string;
        progenitorInitialMassSolar: number;
        currentMassSolar: number;
        coreMassSolar: number;
        metallicityFeH?: number;
        deathAgeYears: number;
        position?: [number, number, number];
      },
  targetAgeYears?: number,
): StellarDeathProperties {
  let M0: number;
  let Mcurr: number;
  let Mcore: number;
  let age: number;
  let starId: string;
  let starName: string | undefined;
  let feH: number;
  let position: [number, number, number];

  if ('deathAgeYears' in stateOrConfig && typeof stateOrConfig.deathAgeYears === 'number' && targetAgeYears === undefined) {
    M0 = stateOrConfig.progenitorInitialMassSolar;
    Mcurr = stateOrConfig.currentMassSolar;
    Mcore = 'whiteDwarf' in stateOrConfig && stateOrConfig.whiteDwarf
      ? stateOrConfig.whiteDwarf.massSolar
      : 'neutronStar' in stateOrConfig && stateOrConfig.neutronStar
      ? stateOrConfig.neutronStar.massSolar
      : 'blackHole' in stateOrConfig && stateOrConfig.blackHole
      ? stateOrConfig.blackHole.massSolar
      : ('coreMassSolar' in stateOrConfig ? stateOrConfig.coreMassSolar : M0 * 0.15);
    age = stateOrConfig.deathAgeYears;
    starId = stateOrConfig.id ?? `death_${M0.toFixed(2)}M_${Date.now().toString(36)}`;
    starName = stateOrConfig.name;
    const comp = 'composition' in stateOrConfig ? stateOrConfig.composition : undefined;
    const directFeH = 'metallicityFeH' in stateOrConfig ? stateOrConfig.metallicityFeH : undefined;
    feH = comp?.metallicityFeH ?? directFeH ?? 0.0;
    position = stateOrConfig.position ?? [0, 0, 0];
  } else if ('progenitorStar' in stateOrConfig && stateOrConfig.progenitorStar) {
    const p = stateOrConfig.progenitorStar;
    M0 = p.initialMassSolar;
    Mcurr = p.currentMassSolar;
    Mcore = p.coreMassSolar;
    age = targetAgeYears !== undefined ? targetAgeYears : (stateOrConfig.initialDeathAgeYears ?? 0);
    starId = stateOrConfig.id ?? `death_${p.id}`;
    starName = stateOrConfig.name ?? `${p.name} Remnant`;
    feH = p.composition.metallicityFeH ?? 0.0;
    position = stateOrConfig.position ?? p.position;
  } else {
    M0 = ('progenitorInitialMassSolar' in stateOrConfig)
      ? stateOrConfig.progenitorInitialMassSolar
      : (stateOrConfig.initialMassSolar ?? 1.0);
    Mcurr = ('currentMassSolar' in stateOrConfig) ? stateOrConfig.currentMassSolar : M0;
    Mcore = ('coreMassSolar' in stateOrConfig) ? stateOrConfig.coreMassSolar : M0 * 0.15;
    age = targetAgeYears !== undefined ? targetAgeYears : (('deathAgeYears' in stateOrConfig) ? stateOrConfig.deathAgeYears : 0);
    starId = stateOrConfig.id ?? `death_${M0.toFixed(2)}M_${Date.now().toString(36)}`;
    starName = stateOrConfig.name;
    const comp = 'composition' in stateOrConfig ? stateOrConfig.composition : undefined;
    const directFeH = 'metallicityFeH' in stateOrConfig ? stateOrConfig.metallicityFeH : undefined;
    feH = comp?.metallicityFeH ?? directFeH ?? 0.0;
    position = stateOrConfig.position ?? [0, 0, 0];
  }

  M0 = Math.max(0.08, isFinite(M0) ? M0 : 1.0);
  Mcurr = Math.max(0.1, isFinite(Mcurr) ? Mcurr : M0);
  Mcore = Math.max(0.1, isFinite(Mcore) ? Mcore : M0 * 0.15);
  age = Math.max(0, isFinite(age) ? age : 0);
  feH = isFinite(feH) ? feH : 0.0;

  const composition = createStellarComposition({ metallicityFeH: feH });

  // 1. Classify Death Pathway and Remnant Endpoint
  const classification = classifyStellarRemnant({
    initialMassSolar: M0,
    currentMassSolar: Mcurr,
    coreMassSolar: Mcore,
  });

  const remnantType: RemnantType = classification.remnantType;
  let stage: StellarDeathStage = 'POST_HELIUM';

  let luminositySolar = 1.0;
  let radiusSolar = 1.0;
  let effectiveTemperatureK = 10000;
  let spectralClass = 'DA';
  let luminosityClass: LuminosityClass = 'VII';
  let fullSpectralDesignation = 'DA VII';

  let planetaryNebulaState = undefined;
  let supernovaState = undefined;
  let whiteDwarfState = undefined;
  let neutronStarState = undefined;
  let blackHoleState = undefined;

  let remnantMassSolar = classification.estimatedRemnantMassSolar;
  let ejectedMassSolar = Math.max(0, M0 - remnantMassSolar);

  // ── 2. Route Death Pathway ──

  if (remnantType === 'WHITE_DWARF') {
    // ── Low / Intermediate Mass Pathway: Planetary Nebula -> White Dwarf ──
    const envelopeEjectionDuration = 5000.0; // 5,000 years detachment
    const pnVisibilityDuration = PLANETARY_NEBULA_LIFETIME_YEARS; // 50,000 years visible nebula

    if (age < envelopeEjectionDuration) {
      stage = 'ENVELOPE_EJECTION';
    } else if (age < pnVisibilityDuration) {
      stage = 'PLANETARY_NEBULA';
    } else {
      stage = 'WHITE_DWARF';
    }

    // Degenerate white dwarf cooling begins at t = 0
    whiteDwarfState = calculateWhiteDwarfState(remnantMassSolar, age);

    // Planetary nebula envelope expands if age <= 100,000 yr
    if (age <= pnVisibilityDuration * 2.0) {
      planetaryNebulaState = calculatePlanetaryNebulaState(
        ejectedMassSolar,
        age,
        whiteDwarfState.effectiveTemperatureK,
      );
    }

    luminositySolar = whiteDwarfState.luminositySolar + (planetaryNebulaState ? planetaryNebulaState.nebulaLuminositySolar : 0);
    radiusSolar = whiteDwarfState.radiusSolar;
    effectiveTemperatureK = whiteDwarfState.effectiveTemperatureK;
    spectralClass = effectiveTemperatureK > 30000 ? 'DO' : effectiveTemperatureK > 12000 ? 'DA' : 'DB';
    luminosityClass = 'VII';
    fullSpectralDesignation = `${spectralClass} VII (White Dwarf)`;
  } else if (remnantType === 'NEUTRON_STAR') {
    // ── Massive Star Pathway: Core Collapse -> Supernova -> Neutron Star / Pulsar ──
    const coreCollapseDurationYears = 0.001; // ~8 hours collapse & bounce
    const supernovaDurationYears = 3.0; // ~3 years bright supernova phase

    if (age < coreCollapseDurationYears) {
      stage = 'CORE_COLLAPSE';
      const collapseProgress = Math.min(1.0, age / coreCollapseDurationYears);
      const cc = calculateCoreCollapseState(Mcore, collapseProgress);
      radiusSolar = (cc.coreRadiusKm * 1000.0) / 6.957e8;
      luminositySolar = 1000.0;
      effectiveTemperatureK = cc.coreTemperatureK;
    } else if (age < supernovaDurationYears) {
      stage = 'SUPERNOVA';
      const daysSinceExplosion = (age - coreCollapseDurationYears) * 365.25;
      supernovaState = calculateSupernovaState(ejectedMassSolar, daysSinceExplosion);
      luminositySolar = supernovaState.currentLuminositySolar;
      radiusSolar = (supernovaState.ejectaRadiusAU * 1.496e8) / 6.957e5;
      effectiveTemperatureK = Math.max(5000, 25000 * Math.pow(supernovaState.lightCurveFraction, 0.25));
    } else {
      stage = 'NEUTRON_STAR';
    }

    neutronStarState = calculateNeutronStarState(remnantMassSolar, age);

    if (stage === 'NEUTRON_STAR') {
      luminositySolar = neutronStarState.luminositySolar;
      radiusSolar = neutronStarState.radiusSolar;
      effectiveTemperatureK = neutronStarState.effectiveTemperatureK;
    }

    spectralClass = neutronStarState.isPulsar ? 'PSR' : 'NS';
    luminosityClass = '0';
    fullSpectralDesignation = neutronStarState.isPulsar ? `Pulsar (P=${(neutronStarState.spinPeriodSeconds * 1000).toFixed(1)}ms)` : `Neutron Star (${remnantMassSolar.toFixed(2)} M☉)`;
  } else {
    // ── Hypermassive Star Pathway: Core Collapse -> Supernova -> Black Hole ──
    const coreCollapseDurationYears = 0.001;
    const supernovaDurationYears = 3.0;

    if (age < coreCollapseDurationYears) {
      stage = 'CORE_COLLAPSE';
    } else if (age < supernovaDurationYears) {
      stage = 'SUPERNOVA';
      const daysSinceExplosion = (age - coreCollapseDurationYears) * 365.25;
      supernovaState = calculateSupernovaState(ejectedMassSolar, daysSinceExplosion, 2.0);
      luminositySolar = supernovaState.currentLuminositySolar;
      radiusSolar = (supernovaState.ejectaRadiusAU * 1.496e8) / 6.957e5;
      effectiveTemperatureK = Math.max(6000, 30000 * Math.pow(supernovaState.lightCurveFraction, 0.25));
    } else {
      stage = 'BLACK_HOLE';
    }

    blackHoleState = calculateBlackHoleState(remnantMassSolar, age, age > 10.0, 1.0e-9);

    if (stage === 'BLACK_HOLE') {
      luminositySolar = blackHoleState.accretionLuminositySolar;
      radiusSolar = blackHoleState.schwarzschildRadiusSolar;
      effectiveTemperatureK = blackHoleState.hasAccretionDisk ? blackHoleState.innerDiskTemperatureK : 0;
    }

    spectralClass = 'BH';
    luminosityClass = '0';
    fullSpectralDesignation = `Stellar Black Hole (${remnantMassSolar.toFixed(1)} M☉)`;
  }

  // Visual absolute magnitude
  const absoluteMagnitude = luminositySolar > 0 ? 4.74 - 2.5 * Math.log10(Math.max(1e-10, luminositySolar)) : 99.0;
  const defaultName = `${remnantType.replace('_', ' ')} (${M0.toFixed(1)} M☉ Progenitor)`;

  return {
    id: starId,
    name: starName ?? defaultName,
    progenitorInitialMassSolar: M0,
    currentMassSolar: remnantMassSolar,
    ejectedMassSolar,
    composition,
    deathAgeYears: age,
    stage,
    remnantType,
    luminositySolar,
    radiusSolar,
    effectiveTemperatureK,
    absoluteMagnitude,
    spectralClass,
    luminosityClass,
    fullSpectralDesignation,
    planetaryNebula: planetaryNebulaState,
    supernova: supernovaState,
    whiteDwarf: whiteDwarfState,
    neutronStar: neutronStarState,
    blackHole: blackHoleState,
    position,
  };
}

/**
 * Convenience helper to create death system directly from Phase 9 StellarEvolutionProperties.
 */
export function createDeathFromEvolvedStar(star: StellarEvolutionProperties, initialDeathAgeYears: number = 0): StellarDeathProperties {
  return initializeStellarDeath({
    progenitorStar: star,
    initialDeathAgeYears,
  });
}
