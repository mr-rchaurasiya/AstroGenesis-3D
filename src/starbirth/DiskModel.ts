/**
 * DiskModel.ts
 * Circumstellar protoplanetary accretion disk structure, temperature and density profiles,
 * and photoevaporative dissipation dynamics.
 */

import { DEFAULT_DISK_MASS_FRACTION } from './StarBirthConstants';
import type { CircumstellarDiskProperties } from './StarBirthTypes';

/**
 * Creates or updates a circumstellar accretion disk associated with a forming protostar.
 *
 * @param protostarMassSolar - Current mass of central protostar in M_☉
 * @param effectiveTemperatureK - Effective temperature of central star
 * @param accretionRateSolarPerYear - Current mass accretion rate
 * @param ageYears - Current age in Earth years
 * @returns CircumstellarDiskProperties
 */
export function calculateCircumstellarDisk(
  protostarMassSolar: number,
  effectiveTemperatureK: number,
  accretionRateSolarPerYear: number,
  ageYears: number,
): CircumstellarDiskProperties {
  const m = Math.max(0.01, protostarMassSolar);
  const age = Math.max(0, ageYears);

  // Protoplanetary disks typically survive ~3 to 10 million years before photoevaporating
  const diskLifetimeYears = 5.0e6;
  const dissipationProgress = Math.min(1.0, age / diskLifetimeYears);

  // Disk mass is typically 10-20% of stellar mass early on, decaying to 0 as it dissipates
  const initialDiskMass = m * DEFAULT_DISK_MASS_FRACTION;
  const currentDiskMass = Math.max(0, initialDiskMass * (1.0 - dissipationProgress));

  // Inner radius (dust sublimation boundary where T ~ 1500K): ~0.05 to 0.3 AU
  const innerRadiusAU = Math.max(0.05, 0.1 * Math.sqrt(Math.max(0.1, protostarMassSolar)));
  // Outer radius: ~50 to 150 AU
  const outerRadiusAU = Math.max(30.0, 100.0 * Math.pow(m, 0.33));

  // Temperature gradient: T(r) = T_in * (r / r_in)^(-3/4)
  const temperatureInnerK = Math.min(2500, Math.max(1200, effectiveTemperatureK * 0.4));
  const temperatureOuterK = Math.max(10, temperatureInnerK * Math.pow(outerRadiusAU / innerRadiusAU, -0.75));

  return {
    massSolar: currentDiskMass,
    innerRadiusAU,
    outerRadiusAU,
    accretionRateSolarPerYear: accretionRateSolarPerYear * (1.0 - dissipationProgress * 0.9),
    temperatureInnerK,
    temperatureOuterK,
    inclinationDeg: 30.0, // Standard display tilt
    dissipationProgress,
  };
}
