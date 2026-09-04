/**
 * StellarModels.ts
 * Central deterministic calculation pipeline and model orchestrator for stellar objects.
 * Transforms raw inputs into fully populated, physically validated StellarProperties.
 */

import {
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  SOLAR_AGE_YEARS,
} from './StellarConstants';
import type {
  StellarProperties,
  StellarModelInput,
  StellarVisualProperties,
  HRDataPoint,
} from './StellarTypes';
import {
  massToMainSequenceLuminosity,
  massToMainSequenceRadius,
  stefanBoltzmannTemperature,
  stefanBoltzmannLuminosity,
  calculateSurfaceGravity,
  calculateMeanDensity,
  calculateEscapeVelocity,
  calculateEddingtonLuminosity,
  calculateGravitationalBindingEnergy,
} from './StellarPhysics';
import { createStellarComposition } from './StellarComposition';
import {
  calculateCoreProperties,
  calculateFusionMassConversion,
} from './StellarEnergy';
import {
  classifySpectralType,
  determineLuminosityClass,
  calculateBolometricMagnitude,
  calculateAbsoluteVisualMagnitude,
  calculateApparentMagnitude,
  deriveStellarVisualProperties,
} from './StellarClassification';
import {
  calculateMainSequenceLifetime,
  calculateAgingProgress,
} from './StellarLifetime';

/**
 * Primary deterministic physics pipeline to compute all stellar characteristics.
 * Guaranteed to return clean, non-NaN physical values.
 *
 * @param input - Input parameters defining the star
 * @returns Complete StellarProperties object
 */
export function calculateStellarProperties(input: StellarModelInput): StellarProperties {
  // ── 1. Normalize Mass ──
  const massSolar = Math.max(0.01, isFinite(input.massSolar) ? input.massSolar : 1.0);
  const massKg = massSolar * SOLAR_MASS_KG;

  // ── 2. Evolutionary State & Luminosity Class ──
  const evolutionaryState = input.evolutionaryState ?? 'MAIN_SEQUENCE';

  // ── 3. Determine Radius & Luminosity ──
  let radiusSolar = input.radiusSolar;
  let luminositySolar = input.luminositySolar;
  let effectiveTemperatureK = input.effectiveTemperatureK;

  if (radiusSolar === undefined && luminositySolar === undefined) {
    // Standard Main Sequence empirical derivation
    luminositySolar = massToMainSequenceLuminosity(massSolar);
    radiusSolar = massToMainSequenceRadius(massSolar);
    effectiveTemperatureK = stefanBoltzmannTemperature(luminositySolar, radiusSolar);
  } else if (radiusSolar !== undefined && luminositySolar !== undefined) {
    // Both provided: derive temperature via Stefan-Boltzmann
    effectiveTemperatureK = effectiveTemperatureK ?? stefanBoltzmannTemperature(luminositySolar, radiusSolar);
  } else if (radiusSolar !== undefined && effectiveTemperatureK !== undefined) {
    // Radius & Temperature provided: derive luminosity
    luminositySolar = stefanBoltzmannLuminosity(radiusSolar, effectiveTemperatureK);
  } else if (luminositySolar !== undefined && effectiveTemperatureK !== undefined) {
    // Luminosity & Temperature provided: derive radius
    radiusSolar = massToMainSequenceRadius(massSolar);
  } else if (radiusSolar !== undefined) {
    // Only radius provided: approximate luminosity
    luminositySolar = massToMainSequenceLuminosity(massSolar);
    effectiveTemperatureK = effectiveTemperatureK ?? stefanBoltzmannTemperature(luminositySolar, radiusSolar);
  } else if (luminositySolar !== undefined) {
    // Only luminosity provided: approximate radius
    radiusSolar = massToMainSequenceRadius(massSolar);
    effectiveTemperatureK = effectiveTemperatureK ?? stefanBoltzmannTemperature(luminositySolar, radiusSolar);
  } else {
    luminositySolar = massToMainSequenceLuminosity(massSolar);
    radiusSolar = massToMainSequenceRadius(massSolar);
    effectiveTemperatureK = stefanBoltzmannTemperature(luminositySolar, radiusSolar);
  }

  // Safety clamps
  radiusSolar = Math.max(1e-5, radiusSolar);
  luminositySolar = Math.max(1e-10, luminositySolar);
  effectiveTemperatureK = Math.max(250, effectiveTemperatureK);

  const radiusM = radiusSolar * SOLAR_RADIUS_M;
  const luminosityWatts = luminositySolar * SOLAR_LUMINOSITY_W;

  // ── 4. Composition ──
  const composition = createStellarComposition({
    hydrogenFraction: input.hydrogenFraction,
    metalFraction: input.metalFraction,
    metallicityFeH: input.metallicityFeH,
  });

  // ── 5. Gravitational & Dynamic Properties ──
  const gravity = calculateSurfaceGravity(massKg, radiusM);
  const density = calculateMeanDensity(massKg, radiusM);
  const escapeVelocity = calculateEscapeVelocity(massKg, radiusM);
  const bindingEnergy = calculateGravitationalBindingEnergy(massKg, radiusM);

  // ── 6. Eddington Luminosity ──
  const eddington = calculateEddingtonLuminosity(massKg, composition.hydrogenFraction);
  const eddingtonRatio = luminosityWatts / eddington.watts;

  // ── 7. Classification ──
  const spectralInfo = classifySpectralType(effectiveTemperatureK);
  const luminosityClass = determineLuminosityClass(
    evolutionaryState,
    gravity.logG,
    input.luminosityClass,
  );
  const fullSpectralDesignation = `${spectralInfo.spectralClass}${luminosityClass}`;

  // ── 8. Magnitudes ──
  const bolometricMagnitude = calculateBolometricMagnitude(luminositySolar);
  const absoluteMagnitude = calculateAbsoluteVisualMagnitude(luminositySolar, effectiveTemperatureK);
  const apparentMagnitude = input.distanceParsecs !== undefined
    ? calculateApparentMagnitude(absoluteMagnitude, input.distanceParsecs)
    : undefined;

  // ── 9. Lifetimes & Aging ──
  const msLifetimeYears = calculateMainSequenceLifetime(massSolar, luminositySolar);
  const ageYears = input.ageYears !== undefined
    ? Math.max(0, input.ageYears)
    : (massSolar === 1.0 ? SOLAR_AGE_YEARS : msLifetimeYears * 0.45);
  const { remainingLifetimeYears, fractionalAge } = calculateAgingProgress(ageYears, msLifetimeYears);

  // ── 10. Core Physics & Nuclear Fusion ──
  const core = calculateCoreProperties(massSolar, radiusSolar, luminositySolar, composition);
  const { hydrogenBurningRateKgS, massLossRadiationRateKgS } = calculateFusionMassConversion(luminosityWatts);

  const starId = input.id ?? `star_${massSolar.toFixed(2)}M_${Date.now().toString(36)}`;
  const starName = input.name ?? `Star (${fullSpectralDesignation})`;

  return {
    id: starId,
    name: starName,
    massSolar,
    massKg,
    radiusSolar,
    radiusM,
    luminositySolar,
    luminosityWatts,
    effectiveTemperatureK,
    surfaceGravityMs2: gravity.ms2,
    surfaceGravitySolar: gravity.solar,
    surfaceGravityLogG: gravity.logG,
    meanDensityKgM3: density.kgm3,
    meanDensitySolar: density.solar,
    escapeVelocityMs: escapeVelocity.ms,
    escapeVelocityKms: escapeVelocity.kms,
    gravitationalBindingEnergyJoules: bindingEnergy,
    bolometricMagnitude,
    absoluteMagnitude,
    apparentMagnitude,
    distanceParsecs: input.distanceParsecs,
    eddingtonLuminosityWatts: eddington.watts,
    eddingtonLuminositySolar: eddington.solar,
    eddingtonRatio,
    evolutionaryState,
    spectralTypeLetter: spectralInfo.letter,
    spectralSubtype: spectralInfo.subtype,
    spectralClass: spectralInfo.spectralClass,
    luminosityClass,
    fullSpectralDesignation,
    ageYears,
    mainSequenceLifetimeYears: msLifetimeYears,
    remainingLifetimeYears,
    fractionalAge,
    composition,
    core,
    fusionPowerWatts: luminosityWatts,
    fusionPowerSolar: luminositySolar,
    hydrogenBurningRateKgS,
    massLossRadiationRateKgS,
    rotationPeriodDays: input.rotationPeriodDays ?? (massSolar >= 2.0 ? 1.2 : 25.0),
    rotationVelocityKms: input.rotationPeriodDays ? (2 * Math.PI * radiusM) / (input.rotationPeriodDays * 86400 * 1000) : 2.0,
    magneticActivityIndex: massSolar < 1.5 ? 0.7 : 0.2, // Convective envelope stars have stronger dynamos
    activityCycleYears: massSolar === 1.0 ? 11.0 : undefined,
    flareRatePerHour: massSolar < 0.4 ? 0.8 : 0.01,
  };
}

/**
 * Extracts pure rendering visual properties from a calculated StellarProperties object.
 */
export function calculateStellarVisualProperties(properties: StellarProperties): StellarVisualProperties {
  return deriveStellarVisualProperties(
    properties.effectiveTemperatureK,
    properties.luminositySolar,
    properties.radiusSolar,
  );
}

/**
 * Time-aware API for future Phase 9 stellar evolution integration.
 * Evaluates the stellar state at an arbitrary target age in years.
 */
export function calculateStellarStateAtAge(
  baseProperties: StellarProperties,
  targetAgeYears: number,
): StellarProperties {
  return calculateStellarProperties({
    id: baseProperties.id,
    name: baseProperties.name,
    massSolar: baseProperties.massSolar,
    radiusSolar: baseProperties.radiusSolar,
    luminositySolar: baseProperties.luminositySolar,
    effectiveTemperatureK: baseProperties.effectiveTemperatureK,
    ageYears: targetAgeYears,
    metallicityFeH: baseProperties.composition.metallicityFeH,
    evolutionaryState: baseProperties.evolutionaryState,
    luminosityClass: baseProperties.luminosityClass,
    distanceParsecs: baseProperties.distanceParsecs,
    rotationPeriodDays: baseProperties.rotationPeriodDays,
  });
}

/**
 * Formats a StellarProperties object into an HR Diagram coordinate data point.
 */
export function extractHRDataPoint(properties: StellarProperties): HRDataPoint {
  const visual = calculateStellarVisualProperties(properties);
  return {
    id: properties.id,
    name: properties.name,
    effectiveTemperatureK: properties.effectiveTemperatureK,
    luminositySolar: properties.luminositySolar,
    absoluteMagnitude: properties.absoluteMagnitude,
    spectralClass: properties.spectralClass,
    luminosityClass: properties.luminosityClass,
    evolutionaryState: properties.evolutionaryState,
    colorHex: visual.hexColor,
  };
}

// ── Standard Reference Star Generators ───────────────────────────────────────

/**
 * Creates primary validation benchmark: The Sun (Sol).
 * Target: 1.0 M_☉, 1.0 R_☉, 1.0 L_☉, ~5778 K, G2V, age ~4.6 Gyr.
 */
export function createSunReference(): StellarProperties {
  return calculateStellarProperties({
    id: 'sun_reference',
    name: 'Sun (Sol)',
    massSolar: 1.0,
    radiusSolar: 1.0,
    luminositySolar: 1.0,
    effectiveTemperatureK: 5778,
    ageYears: 4.603e9,
    metallicityFeH: 0.0,
    evolutionaryState: 'MAIN_SEQUENCE',
    luminosityClass: 'V',
    distanceParsecs: 0.000004848, // 1 AU in parsecs
    rotationPeriodDays: 25.38,
  });
}

/**
 * Creates Red Dwarf benchmark: Proxima Centauri / Gliese 581.
 * Target: ~0.12 M_☉, ~0.15 R_☉, ~0.0017 L_☉, ~3050 K, M5.5V.
 */
export function createRedDwarfReference(): StellarProperties {
  return calculateStellarProperties({
    id: 'proxima_reference',
    name: 'Proxima Centauri',
    massSolar: 0.122,
    radiusSolar: 0.154,
    luminositySolar: 0.0017,
    effectiveTemperatureK: 3042,
    ageYears: 4.85e9,
    metallicityFeH: 0.21,
    evolutionaryState: 'MAIN_SEQUENCE',
    luminosityClass: 'V',
    distanceParsecs: 1.301,
  });
}

/**
 * Creates A-type star benchmark: Sirius A.
 * Target: ~2.06 M_☉, ~1.71 R_☉, ~25.4 L_☉, ~9940 K, A1V.
 */
export function createSiriusAReference(): StellarProperties {
  return calculateStellarProperties({
    id: 'sirius_a_reference',
    name: 'Sirius A (Alpha Canis Majoris)',
    massSolar: 2.063,
    radiusSolar: 1.711,
    luminositySolar: 25.4,
    effectiveTemperatureK: 9940,
    ageYears: 2.42e8,
    metallicityFeH: 0.50,
    evolutionaryState: 'MAIN_SEQUENCE',
    luminosityClass: 'V',
    distanceParsecs: 2.64,
  });
}

/**
 * Creates Massive Blue Supergiant benchmark: Rigel.
 * Target: ~21 M_☉, ~79 R_☉, ~120,000 L_☉, ~12,100 K, B8Ia.
 */
export function createRigelReference(): StellarProperties {
  return calculateStellarProperties({
    id: 'rigel_reference',
    name: 'Rigel (Beta Orionis)',
    massSolar: 21.0,
    radiusSolar: 78.9,
    luminositySolar: 120000,
    effectiveTemperatureK: 12100,
    ageYears: 8.0e6,
    metallicityFeH: 0.05,
    evolutionaryState: 'HELIUM_BURNING',
    luminosityClass: 'Ia',
    distanceParsecs: 260.0,
  });
}

/**
 * Creates Red Supergiant benchmark: Betelgeuse.
 * Target: ~16.5 M_☉, ~764 R_☉, ~126,000 L_☉, ~3600 K, M2Iab.
 */
export function createBetelgeuseReference(): StellarProperties {
  return calculateStellarProperties({
    id: 'betelgeuse_reference',
    name: 'Betelgeuse (Alpha Orionis)',
    massSolar: 16.5,
    radiusSolar: 764.0,
    luminositySolar: 126000,
    effectiveTemperatureK: 3600,
    ageYears: 8.5e6,
    metallicityFeH: 0.10,
    evolutionaryState: 'AGB',
    luminosityClass: 'Ia',
    distanceParsecs: 168.0,
  });
}

/**
 * Creates White Dwarf benchmark: Sirius B.
 * Target: ~1.018 M_☉, ~0.0084 R_☉, ~0.056 L_☉, ~25,200 K, VII.
 */
export function createSiriusBWhiteDwarfReference(): StellarProperties {
  return calculateStellarProperties({
    id: 'sirius_b_reference',
    name: 'Sirius B',
    massSolar: 1.018,
    radiusSolar: 0.0084,
    luminositySolar: 0.056,
    effectiveTemperatureK: 25200,
    ageYears: 2.28e8,
    evolutionaryState: 'WHITE_DWARF',
    luminosityClass: 'VII',
    distanceParsecs: 2.64,
  });
}
