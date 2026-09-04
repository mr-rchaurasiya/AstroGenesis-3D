/**
 * MolecularCloud.ts
 * Pure, deterministic astrophysical equations for Giant Molecular Clouds (GMCs),
 * density conversions, gravitational free-fall times, Jeans instability, and virial equilibrium.
 */

import {
  GRAVITATIONAL_CONSTANT_G,
  BOLTZMANN_CONSTANT_K,
  ATOMIC_MASS_UNIT_KG,
  SOLAR_MASS_KG,
  PARSEC_IN_METERS,
  YEAR_IN_SECONDS,
  MEAN_MOLECULAR_WEIGHT_MOLECULAR,
  ADIABATIC_INDEX_GAMMA,
  FREE_FALL_CONSTANT_FACTOR,
  DEFAULT_CLOUD_TEMPERATURE_K,
} from './StarBirthConstants';
import type { MolecularCloudProperties, StarBirthConfig } from './StarBirthTypes';

// ── 1. Cloud Mass Density & Number Density Conversions ────────────────────────

/**
 * Calculates mean mass density (kg/m³) and molecular number density (particles/cm³)
 * for a spherical gas cloud.
 *
 * @param massSolar - Cloud gas mass in Solar masses M_☉
 * @param radiusPc - Cloud radius in parsecs
 * @returns Object with mass density (kg/m³) and number density (cm⁻³)
 */
export function calculateCloudDensity(
  massSolar: number,
  radiusPc: number,
): {
  kgm3: number;
  numberDensityCm3: number;
} {
  const m = Math.max(0.01, isFinite(massSolar) ? massSolar : 100.0) * SOLAR_MASS_KG;
  const r = Math.max(0.001, isFinite(radiusPc) ? radiusPc : 1.0) * PARSEC_IN_METERS;

  const volume = (4.0 / 3.0) * Math.PI * Math.pow(r, 3);
  const kgm3 = m / volume;

  // Molecular mass particle m_p = μ_mol * m_u
  const particleMassKg = MEAN_MOLECULAR_WEIGHT_MOLECULAR * ATOMIC_MASS_UNIT_KG;
  // Convert particles/m³ to particles/cm³ (divide by 10⁶)
  const numberDensityCm3 = (kgm3 / particleMassKg) * 1.0e-6;

  return { kgm3, numberDensityCm3 };
}

// ── 2. Gravitational Free-Fall Timescale ──────────────────────────────────────

/**
 * Computes the gravitational free-fall time t_ff.
 * Formula: t_ff = sqrt(3π / (32 G ρ))
 *
 * @param densityKgM3 - Mean cloud density in kg/m³
 * @returns Object with free-fall time in SI seconds and Earth years
 */
export function calculateFreeFallTime(densityKgM3: number): {
  seconds: number;
  years: number;
} {
  const rho = Math.max(1e-25, isFinite(densityKgM3) ? densityKgM3 : 1e-19);
  const seconds = FREE_FALL_CONSTANT_FACTOR / Math.sqrt(rho);
  const years = seconds / YEAR_IN_SECONDS;

  return { seconds, years };
}

// ── 3. Jeans Instability (Length & Mass) ──────────────────────────────────────

/**
 * Calculates Jeans length and Jeans mass for gravitational fragmentation.
 *
 * Sound Speed: c_s = sqrt(γ * k_B * T / (μ * m_u))
 * Jeans Length: λ_J = c_s * sqrt(π / (G * ρ))
 * Jeans Mass:   M_J = (4π / 3) * ρ * (λ_J / 2)³ = (π / 6) * ρ * λ_J³
 *
 * @param temperatureK - Gas isothermal temperature in Kelvin
 * @param densityKgM3 - Gas mass density in kg/m³
 * @returns Object with sound speed (m/s), Jeans length (pc), and Jeans mass (M_☉)
 */
export function calculateJeansInstability(
  temperatureK: number,
  densityKgM3: number,
): {
  soundSpeedMs: number;
  jeansLengthPc: number;
  jeansMassSolar: number;
} {
  const T = Math.max(2.7, isFinite(temperatureK) ? temperatureK : DEFAULT_CLOUD_TEMPERATURE_K);
  const rho = Math.max(1e-25, isFinite(densityKgM3) ? densityKgM3 : 1e-19);

  const meanParticleMassKg = MEAN_MOLECULAR_WEIGHT_MOLECULAR * ATOMIC_MASS_UNIT_KG;
  const soundSpeedMs = Math.sqrt((ADIABATIC_INDEX_GAMMA * BOLTZMANN_CONSTANT_K * T) / meanParticleMassKg);

  const jeansLengthM = soundSpeedMs * Math.sqrt(Math.PI / (GRAVITATIONAL_CONSTANT_G * rho));
  const jeansLengthPc = jeansLengthM / PARSEC_IN_METERS;

  const jeansMassKg = (Math.PI / 6.0) * rho * Math.pow(jeansLengthM, 3);
  const jeansMassSolar = jeansMassKg / SOLAR_MASS_KG;

  return {
    soundSpeedMs,
    jeansLengthPc,
    jeansMassSolar,
  };
}

// ── 4. Virial Stability Parameter ─────────────────────────────────────────────

/**
 * Computes the dimensionless virial parameter α_vir.
 * Formula: α_vir = (5 * σ_v² * R) / (G * M)
 *
 * Interpretation:
 * - α_vir < 1.0: Gravitationally bound, prone to spontaneous gravitational collapse.
 * - α_vir ≈ 1.0: In virial equilibrium.
 * - α_vir > 1.0: Supported by turbulence/kinetics, dispersed without external trigger.
 *
 * @param velocityDispersionKmS - Internal turbulent velocity dispersion in km/s
 * @param radiusPc - Cloud radius in parsecs
 * @param massSolar - Cloud mass in Solar masses
 * @returns Dimensionless virial parameter
 */
export function calculateVirialParameter(
  velocityDispersionKmS: number,
  radiusPc: number,
  massSolar: number,
): number {
  const sigmaV = Math.max(0.01, isFinite(velocityDispersionKmS) ? velocityDispersionKmS : 1.0) * 1000.0; // m/s
  const R = Math.max(0.001, isFinite(radiusPc) ? radiusPc : 1.0) * PARSEC_IN_METERS;
  const M = Math.max(0.01, isFinite(massSolar) ? massSolar : 100.0) * SOLAR_MASS_KG;

  return (5.0 * sigmaV * sigmaV * R) / (GRAVITATIONAL_CONSTANT_G * M);
}

// ── 5. Molecular Cloud Factory ────────────────────────────────────────────────

/**
 * Constructs a fully populated MolecularCloudProperties object from configuration inputs.
 */
export function createMolecularCloud(config: StarBirthConfig = {}): MolecularCloudProperties {
  const massSolar = config.cloudMassSolar ?? 100.0;
  const radiusPc = config.cloudRadiusPc ?? 1.5;
  const temperatureK = config.cloudTemperatureK ?? DEFAULT_CLOUD_TEMPERATURE_K;
  const metallicityFeH = config.metallicityFeH ?? 0.0;
  const turbulenceParameter = config.turbulenceParameter ?? 0.25;

  const massKg = massSolar * SOLAR_MASS_KG;
  const radiusM = radiusPc * PARSEC_IN_METERS;

  const { kgm3, numberDensityCm3 } = calculateCloudDensity(massSolar, radiusPc);
  const { years: freeFallTimeYears } = calculateFreeFallTime(kgm3);
  const { jeansLengthPc, jeansMassSolar } = calculateJeansInstability(temperatureK, kgm3);

  // Larson's Law turbulent velocity dispersion scaling: σ_v ≈ 1.1 * (R / 1pc)^0.38 km/s
  const baseSigmaV = 1.1 * Math.pow(Math.max(0.1, radiusPc), 0.38);
  const velocityDispersionKmS = baseSigmaV * (1.0 + turbulenceParameter * 0.5);

  const virialParameter = calculateVirialParameter(velocityDispersionKmS, radiusPc, massSolar);
  const gravitationalBindingEnergyJoules = (3.0 / 5.0) * ((GRAVITATIONAL_CONSTANT_G * massKg * massKg) / radiusM);

  const state = virialParameter < 1.0 ? 'COLLAPSING' : 'STABLE';

  return {
    id: `gmc_${Date.now().toString(36)}`,
    name: 'Giant Molecular Cloud Complex',
    massSolar,
    massKg,
    radiusPc,
    radiusM,
    temperatureK,
    meanDensityKgM3: kgm3,
    numberDensityCm3,
    metallicityFeH,
    velocityDispersionKmS,
    turbulenceParameter,
    rotationParameter: 0.15,
    gravitationalBindingEnergyJoules,
    freeFallTimeYears,
    jeansLengthPc,
    jeansMassSolar,
    virialParameter,
    state,
    collapseProgress: 0.0,
    gasRemainingSolar: massSolar,
    stellarMassFormedSolar: 0.0,
    outflowMassSolar: 0.0,
    position: [0, 0, 0],
  };
}
