/**
 * CoreEvolution.ts
 * Core nuclear composition tracking (H -> He -> C/O),
 * virial core temperature growth, and central compression density models.
 */

import {
  HELIUM_IGNITION_CORE_TEMPERATURE_K,
  CARBON_IGNITION_CORE_TEMPERATURE_K,
} from './StarEvolutionConstants';
import { SOLAR_CORE_TEMPERATURE_K, SOLAR_CORE_DENSITY_KGM3 } from '../stellar/StellarConstants';

/**
 * Calculates core hydrogen and helium mass fractions during Main Sequence evolution.
 *
 * @param initialX - Initial hydrogen fraction (e.g. ~0.7381)
 * @param initialY - Initial helium fraction (e.g. ~0.2485)
 * @param evolutionFraction - Normalized MS progress (0.0 = ZAMS, 1.0 = H-exhaustion)
 * @returns Object with core X and core Y
 */
export function calculateMainSequenceCoreComposition(
  initialX: number,
  initialY: number,
  evolutionFraction: number,
): {
  coreHydrogenFraction: number;
  coreHeliumFraction: number;
  coreCarbonOxygenFraction: number;
} {
  const tau = Math.max(0, Math.min(1.0, isFinite(evolutionFraction) ? evolutionFraction : 0));
  const X0 = Math.max(0.1, initialX);
  const Y0 = Math.max(0.1, initialY);

  // Monotonic core hydrogen depletion: X_core = X_0 * (1 - tau^1.2)
  const coreHydrogenFraction = Math.max(0.0, X0 * (1.0 - Math.pow(tau, 1.2)));
  // Core helium accumulation: Y_core = Y_0 + (X_0 - X_core)
  const coreHeliumFraction = Math.min(1.0, Y0 + (X0 - coreHydrogenFraction));

  return {
    coreHydrogenFraction,
    coreHeliumFraction,
    coreCarbonOxygenFraction: 0.0,
  };
}

/**
 * Calculates core composition during Helium Burning (Horizontal Branch, Red Clump, Supergiant core).
 *
 * @param heBurningFraction - Normalized progress of helium burning phase (0.0 = ignition, 1.0 = exhaustion)
 * @returns Object with core He and core C/O
 */
export function calculateHeliumBurningCoreComposition(
  heBurningFraction: number,
): {
  coreHydrogenFraction: number;
  coreHeliumFraction: number;
  coreCarbonOxygenFraction: number;
} {
  const tau = Math.max(0, Math.min(1.0, isFinite(heBurningFraction) ? heBurningFraction : 0));

  // Triple-alpha conversion: 3 ⁴He -> ¹²C (+ ¹²C(α,γ)¹⁶O)
  const coreHeliumFraction = Math.max(0.0, 1.0 - tau);
  const coreCarbonOxygenFraction = Math.min(1.0, tau);

  return {
    coreHydrogenFraction: 0.0,
    coreHeliumFraction,
    coreCarbonOxygenFraction,
  };
}

/**
 * Calculates core temperature and core mass density throughout all evolutionary stages.
 *
 * @param initialMassSolar - Initial star mass in M_☉
 * @param zamsRadiusSolar - Initial ZAMS radius in R_☉
 * @param stage - Evolutionary stage
 * @param progressWithinStage - Progress fraction (0.0 to 1.0) within current stage
 * @returns Object with core temperature in Kelvin and core density in kg/m³
 */
export function calculateCoreThermodynamics(
  initialMassSolar: number,
  zamsRadiusSolar: number,
  stage: string,
  progressWithinStage: number,
): {
  coreTemperatureK: number;
  coreDensityKgM3: number;
} {
  const M = Math.max(0.08, initialMassSolar);
  const R0 = Math.max(0.05, zamsRadiusSolar);
  const tau = Math.max(0, Math.min(1.0, progressWithinStage));

  // Base ZAMS core conditions
  const baseTempK = SOLAR_CORE_TEMPERATURE_K * (M / R0);
  const baseDensityKgM3 = SOLAR_CORE_DENSITY_KGM3 * (M / Math.pow(R0, 3));

  let coreTemperatureK = baseTempK;
  let coreDensityKgM3 = baseDensityKgM3;

  switch (stage) {
    case 'ZERO_AGE_MAIN_SEQUENCE':
    case 'MAIN_SEQUENCE':
      // Main Sequence: core heats up ~40% and density increases ~120% as mean molecular weight μ rises
      coreTemperatureK = baseTempK * (1.0 + 0.40 * tau);
      coreDensityKgM3 = baseDensityKgM3 * (1.0 + 1.20 * tau);
      break;

    case 'HYDROGEN_DEPLETION':
    case 'SUBGIANT':
      // Subgiant: inert isothermal helium core contracts; temperature rises towards He ignition threshold
      coreTemperatureK = baseTempK * 1.40 + (HELIUM_IGNITION_CORE_TEMPERATURE_K - baseTempK * 1.40) * 0.4 * tau;
      coreDensityKgM3 = baseDensityKgM3 * (2.2 + 8.0 * tau);
      break;

    case 'RED_GIANT':
    case 'SUPERGIANT':
      // Giant branch: core contracts severely; core density reaches ~10⁷ - 10⁸ kg/m³; T_core reaches ~10⁸ K
      coreTemperatureK = HELIUM_IGNITION_CORE_TEMPERATURE_K * (0.6 + 0.4 * tau);
      coreDensityKgM3 = baseDensityKgM3 * (10.0 + 500.0 * Math.pow(tau, 1.5));
      break;

    case 'HELIUM_IGNITION':
    case 'HELIUM_BURNING':
      // Stable core helium burning at T_core ~ 1.0e8 to 2.5e8 K
      coreTemperatureK = HELIUM_IGNITION_CORE_TEMPERATURE_K * (1.0 + 0.8 * tau);
      coreDensityKgM3 = Math.max(1.0e7, baseDensityKgM3 * 200.0 * (1.0 + tau));
      break;

    case 'ASYMPTOTIC_GIANT_BRANCH':
    case 'POST_HELIUM':
      // Carbon-Oxygen core contraction towards ~6e8 K for massive stars or degenerate cooling for low-mass
      if (M >= 8.0) {
        coreTemperatureK = HELIUM_IGNITION_CORE_TEMPERATURE_K * 1.8 + (CARBON_IGNITION_CORE_TEMPERATURE_K - HELIUM_IGNITION_CORE_TEMPERATURE_K * 1.8) * tau;
        coreDensityKgM3 = Math.max(1.0e8, baseDensityKgM3 * 2000.0 * (1.0 + 3.0 * tau));
      } else {
        coreTemperatureK = HELIUM_IGNITION_CORE_TEMPERATURE_K * (1.5 - 0.3 * tau); // Degenerate cooling begins
        coreDensityKgM3 = Math.max(1.0e8, baseDensityKgM3 * 5000.0 * (1.0 + 2.0 * tau));
      }
      break;

    default:
      coreTemperatureK = baseTempK;
      coreDensityKgM3 = baseDensityKgM3;
      break;
  }

  return {
    coreTemperatureK: Math.max(1.0e6, coreTemperatureK),
    coreDensityKgM3: Math.max(1.0e3, coreDensityKgM3),
  };
}
