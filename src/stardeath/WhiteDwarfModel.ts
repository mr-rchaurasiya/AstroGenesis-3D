/**
 * WhiteDwarfModel.ts
 * Electron-degenerate White Dwarf remnant model:
 * Degeneracy mass-radius relation, surface gravity, high-density core, and Mestel thermal cooling.
 */

import {
  calculateWhiteDwarfRadius,
  calculateWhiteDwarfCooling,
  calculateLogG,
} from './RemnantPhysics';
import { SOLAR_MASS_KG, SOLAR_RADIUS_M } from '../stellar/StellarConstants';
import type { WhiteDwarfProperties } from './StarDeathTypes';

/**
 * Calculates complete physical properties of a cooling White Dwarf remnant.
 *
 * @param massSolar - White dwarf mass in Solar masses M_☉
 * @param coolingAgeYears - Time elapsed since formation in Earth years
 * @param compositionType - Core degenerate composition (default: CARBON_OXYGEN)
 * @returns WhiteDwarfProperties
 */
export function calculateWhiteDwarfState(
  massSolar: number,
  coolingAgeYears: number,
  compositionType: 'CARBON_OXYGEN' | 'OXYGEN_NEON_MAGNESIUM' | 'HELIUM' = 'CARBON_OXYGEN',
): WhiteDwarfProperties {
  const M = Math.max(0.1, isFinite(massSolar) ? massSolar : 0.6);
  const age = Math.max(0, isFinite(coolingAgeYears) ? coolingAgeYears : 0);

  // 1. Electron degeneracy mass-radius relation (M increases -> R decreases)
  const { solar: radiusSolar, km: radiusKm } = calculateWhiteDwarfRadius(M);

  // 2. Thermal cooling (Mestel cooling law)
  const { temperatureK, luminositySolar } = calculateWhiteDwarfCooling(M, age);

  // 3. Surface gravity log10(g in cm/s²) (~8.0)
  const surfaceGravityLogG = calculateLogG(M, radiusSolar);

  // 4. Mean core density: ρ = M / (4/3 π R³) in kg/m³ (~10⁸ - 10⁹ kg/m³ = 1 ton/cm³)
  const radiusMeters = radiusSolar * SOLAR_RADIUS_M;
  const volumeM3 = (4.0 / 3.0) * Math.PI * Math.pow(radiusMeters, 3);
  const meanDensityKgM3 = (M * SOLAR_MASS_KG) / volumeM3;

  return {
    massSolar: M,
    radiusSolar,
    radiusKm,
    effectiveTemperatureK: temperatureK,
    luminositySolar,
    meanDensityKgM3,
    surfaceGravityLogG,
    compositionType,
    coolingAgeYears: age,
  };
}
