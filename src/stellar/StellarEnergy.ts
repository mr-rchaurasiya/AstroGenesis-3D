/**
 * StellarEnergy.ts
 * Simplified nuclear energy generation models (PP-chain, CNO cycle),
 * core thermodynamics, mass-energy conversion, and hydrostatic equilibrium proxies.
 */

import {
  SPEED_OF_LIGHT_C,
  BOLTZMANN_CONSTANT_K,
  ATOMIC_MASS_UNIT_KG,
  SOLAR_LUMINOSITY_W,
  SOLAR_CORE_TEMPERATURE_K,
  SOLAR_CORE_DENSITY_KGM3,
  HYDROGEN_FUSION_EFFICIENCY,
  CORE_FUSION_MASS_FRACTION_MS,
} from './StellarConstants';
import type { StellarCoreProperties, StellarComposition, FusionProcessType } from './StellarTypes';

/**
 * Estimates stellar core temperature in Kelvin based on mass, radius, and mean molecular weight.
 * Virial theorem scaling: T_c ∝ μ * (M / R)
 *
 * @param massSolar - Stellar mass (M_☉)
 * @param radiusSolar - Stellar radius (R_☉)
 * @param mu - Mean molecular weight (relative to solar ~0.614)
 * @returns Core temperature in Kelvin
 */
export function estimateCoreTemperature(massSolar: number, radiusSolar: number, mu: number = 0.614): number {
  const m = Math.max(0.01, massSolar);
  const r = Math.max(0.01, radiusSolar);
  const muRatio = Math.max(0.5, mu / 0.614);

  // Scaled from solar reference
  return SOLAR_CORE_TEMPERATURE_K * (m / r) * muRatio;
}

/**
 * Estimates stellar central core density in kg/m³ based on mass, radius, and central concentration.
 * Central density scaling: ρ_c ∝ (M / R³)
 *
 * @param massSolar - Stellar mass (M_☉)
 * @param radiusSolar - Stellar radius (R_☉)
 * @returns Core density in kg/m³
 */
export function estimateCoreDensity(massSolar: number, radiusSolar: number): number {
  const m = Math.max(0.01, massSolar);
  const r = Math.max(0.01, radiusSolar);

  const meanDensityFactor = m / Math.pow(r, 3);
  return SOLAR_CORE_DENSITY_KGM3 * meanDensityFactor;
}

/**
 * Computes relative energy generation rates for the Proton-Proton (PP) chain and CNO cycle.
 *
 * PP-chain:  ε_pp  ∝ ρ * X² * T_6^4
 * CNO-cycle: ε_cno ∝ ρ * X * Z * T_6^17
 * (where T_6 = T_core / 10^6 K)
 *
 * At T_c ≈ 1.57e7 K (Sun): PP chain produces ~99%, CNO produces ~1%.
 * Cross-over occurs smoothly at T_c ≈ 1.8e7 K (~1.3 M_☉).
 *
 * @param coreTempK - Core temperature in Kelvin
 * @param coreDensityKgM3 - Core density in kg/m³
 * @param composition - Elemental mass fractions (X, Y, Z)
 * @returns Object with relative rates and dominant mechanism
 */
export function calculateNuclearEnergyGeneration(
  coreTempK: number,
  coreDensityKgM3: number,
  composition: StellarComposition,
): {
  ppRate: number;
  cnoRate: number;
  dominantProcess: FusionProcessType;
} {
  const T6 = Math.max(1.0, coreTempK / 1e6); // Temperature in units of 10^6 K
  const rhoNorm = Math.max(0.01, coreDensityKgM3 / SOLAR_CORE_DENSITY_KGM3);

  const X = Math.max(0.01, composition.hydrogenFraction);
  const Z = Math.max(0.0001, composition.metalFraction);

  // Scaled empirical reaction rate factors normalized to give ~99% PP and ~1% CNO for Sun at T6=15.7
  const kPP = 1.0;
  const kCNO = 1.0e-17; // Scaled so that at T6=15.7: kCNO * 15.7^17 * Z ≈ 0.01 * kPP * 15.7^4 * X

  const ppRaw = kPP * rhoNorm * Math.pow(X, 2) * Math.pow(T6, 4);
  const cnoRaw = kCNO * rhoNorm * X * Z * Math.pow(T6, 17);

  const totalRaw = ppRaw + cnoRaw;
  const ppRate = totalRaw > 0 ? ppRaw / totalRaw : 1.0;
  const cnoRate = totalRaw > 0 ? cnoRaw / totalRaw : 0.0;

  let dominantProcess: FusionProcessType = 'PP_CHAIN';
  if (cnoRate > 0.5) {
    dominantProcess = 'CNO_CYCLE';
  }

  return {
    ppRate,
    cnoRate,
    dominantProcess,
  };
}

/**
 * Computes complete stellar core physics properties and hydrostatic equilibrium proxy values.
 *
 * @param massSolar - Stellar mass in M_☉
 * @param radiusSolar - Stellar radius in R_☉
 * @param luminositySolar - Stellar luminosity in L_☉
 * @param composition - Stellar elemental composition
 * @returns StellarCoreProperties
 */
export function calculateCoreProperties(
  massSolar: number,
  radiusSolar: number,
  luminositySolar: number,
  composition: StellarComposition,
): StellarCoreProperties {
  const coreTempK = estimateCoreTemperature(massSolar, radiusSolar, composition.meanMolecularWeight);
  const coreDensityKgM3 = estimateCoreDensity(massSolar, radiusSolar);

  // Ideal gas core thermal pressure proxy: P = (ρ * k_B * T) / (μ * m_u)
  const muKg = composition.meanMolecularWeight * ATOMIC_MASS_UNIT_KG;
  const corePressurePa = (coreDensityKgM3 * BOLTZMANN_CONSTANT_K * coreTempK) / muKg;

  // Nuclear fusion calculation
  const { ppRate, cnoRate, dominantProcess } = calculateNuclearEnergyGeneration(
    coreTempK,
    coreDensityKgM3,
    composition,
  );

  // Inward gravitational pressure proxy: P_grav ∝ G * M² / R⁴
  const m = Math.max(0.01, massSolar);
  const r = Math.max(0.01, radiusSolar);
  const gravitationalPressureProxy = (m * m) / Math.pow(r, 4);

  // Outward thermal & radiation pressure proxy: P_out ∝ (M / R³) * T_c
  const thermalPressureProxy = (m / Math.pow(r, 3)) * (coreTempK / SOLAR_CORE_TEMPERATURE_K);

  // Equilibrium ratio normalized to 1.0 for stable hydrostatic equilibrium
  const equilibriumRatio = gravitationalPressureProxy > 0
    ? thermalPressureProxy / gravitationalPressureProxy
    : 1.0;

  // Mass & radius fraction of energy generation core (typically 10-25% for MS stars)
  const coreRadiusFraction = 0.20;
  const coreMassFraction = CORE_FUSION_MASS_FRACTION_MS;

  return {
    coreTemperatureK: coreTempK,
    coreDensityKgM3: coreDensityKgM3,
    corePressurePa,
    coreRadiusFraction,
    coreMassFraction,
    ppChainRateRelative: ppRate,
    cnoCycleRateRelative: cnoRate,
    dominantFusionProcess: dominantProcess,
    gravitationalPressureProxy,
    thermalPressureProxy,
    equilibriumRatio,
  };
}

/**
 * Calculates stellar hydrogen fuel mass consumption rates and mass-energy conversion.
 * Formula: E = η * m_H * c²  =>  dm_H/dt = L / (η * c²)
 * where η = 0.00712 (0.712% mass conversion efficiency).
 *
 * For the Sun (L = 3.828e26 W):
 * - Hydrogen consumed: dm_H/dt ≈ 5.98e11 kg/s (~600 million metric tons/s)
 * - Rest mass directly converted to pure photon energy: dm_rad/dt = L/c² ≈ 4.26e9 kg/s (~4.26 million metric tons/s)
 *
 * @param luminosityWatts - Bolometric luminosity in Watts
 * @returns Object with consumption and radiation rates in kg/s
 */
export function calculateFusionMassConversion(luminosityWatts: number): {
  hydrogenBurningRateKgS: number;
  massLossRadiationRateKgS: number;
} {
  const L = Math.max(0, isFinite(luminosityWatts) ? luminosityWatts : SOLAR_LUMINOSITY_W);
  const c2 = SPEED_OF_LIGHT_C * SPEED_OF_LIGHT_C;

  const massLossRadiationRateKgS = L / c2;
  const hydrogenBurningRateKgS = L / (HYDROGEN_FUSION_EFFICIENCY * c2);

  return {
    hydrogenBurningRateKgS,
    massLossRadiationRateKgS,
  };
}
