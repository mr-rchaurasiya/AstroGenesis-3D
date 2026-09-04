/**
 * NeutronStarModel.ts
 * Ultra-compact Neutron Star / Pulsar remnant model:
 * Nuclear saturation density, relativistic compactness, surface gravity,
 * thermal cooling, and magnetic dipole pulsar spin-down.
 */

import {
  CANONICAL_NEUTRON_STAR_RADIUS_KM,
  CANONICAL_NEUTRON_STAR_RADIUS_SOLAR,
  CANONICAL_PULSAR_MAGNETIC_FIELD_GAUSS,
  CANONICAL_YOUNG_PULSAR_PERIOD_S,
} from './StarDeathConstants';
import {
  calculateNeutronStarCompactness,
  calculateCompactEscapeVelocity,
  calculatePulsarSpinDown,
  calculateLogG,
} from './RemnantPhysics';
import { SOLAR_MASS_KG } from '../stellar/StellarConstants';
import type { NeutronStarProperties } from './StarDeathTypes';

/**
 * Calculates complete physical state of a compact Neutron Star or Pulsar.
 *
 * @param massSolar - Neutron star mass in Solar masses M_☉ (~1.4 - 2.1 M_☉)
 * @param coolingAgeYears - Time elapsed since core collapse in Earth years
 * @param initialSpinPeriodS - Initial spin period in seconds (default: 33 ms)
 * @param magneticFieldGauss - Surface magnetic field in Gauss (default: 10¹² G)
 * @returns NeutronStarProperties
 */
export function calculateNeutronStarState(
  massSolar: number = 1.44,
  coolingAgeYears: number = 1000,
  initialSpinPeriodS: number = CANONICAL_YOUNG_PULSAR_PERIOD_S,
  magneticFieldGauss: number = CANONICAL_PULSAR_MAGNETIC_FIELD_GAUSS,
): NeutronStarProperties {
  const M = Math.max(1.1, Math.min(2.8, isFinite(massSolar) ? massSolar : 1.44));
  const age = Math.max(0, isFinite(coolingAgeYears) ? coolingAgeYears : 0);
  const B = Math.max(1.0e8, isFinite(magneticFieldGauss) ? magneticFieldGauss : CANONICAL_PULSAR_MAGNETIC_FIELD_GAUSS);
  const P0 = Math.max(0.001, isFinite(initialSpinPeriodS) ? initialSpinPeriodS : CANONICAL_YOUNG_PULSAR_PERIOD_S);

  // 1. Physical dimensions (nuclear radius ~11.5 km)
  const radiusKm = CANONICAL_NEUTRON_STAR_RADIUS_KM;
  const radiusSolar = CANONICAL_NEUTRON_STAR_RADIUS_SOLAR;

  // 2. Relativistic compactness & escape velocity
  const compactness = calculateNeutronStarCompactness(M, radiusKm);
  const { kmS: escapeVelocityKmS, fractionC: escapeVelocityFractionC } = calculateCompactEscapeVelocity(M, radiusKm);

  // 3. Central nuclear saturation mass density (~3×10¹⁷ kg/m³ = 300 million tons/cm³)
  const radiusMeters = radiusKm * 1000.0;
  const volumeM3 = (4.0 / 3.0) * Math.PI * Math.pow(radiusMeters, 3);
  const meanDensityKgM3 = (M * SOLAR_MASS_KG) / volumeM3;

  // 4. Logarithmic surface gravity (~14.3)
  const surfaceGravityLogG = calculateLogG(M, radiusSolar);

  // 5. Thermal neutrino + photon cooling (Modified Urca process)
  // Initial: T ~ 10⁷ K -> drops to ~10⁶ K by 10³ yr -> ~10⁵ K by 10⁶ yr
  const effectiveTemperatureK = Math.max(
    10000.0,
    1.0e7 * Math.pow(1.0 + age / 10.0, -0.18),
  );

  // 6. Pulsar spin evolution & magnetic braking: P(t) = sqrt(P_0² + 2 * P * P_dot * t)
  const { pDot } = calculatePulsarSpinDown(P0, B);
  const SECONDS_PER_YEAR = 365.25 * 86400;
  const spinPeriodSeconds = Math.sqrt(P0 * P0 + 2.0 * pDot * age * SECONDS_PER_YEAR);
  const spinFrequencyRadS = (2.0 * Math.PI) / spinPeriodSeconds;

  // Pulsar death line check: if spin period is too slow and B is low, pulsar mechanism turns off
  const isPulsar = spinPeriodSeconds < 8.0 && B >= 1.0e10;

  // 7. Bolometric luminosity (thermal + spin-down rotational power radiation)
  const rotationalEnergyLossWatts = 1.0e31 * Math.pow(B / 1.0e12, 2) * Math.pow(0.033 / spinPeriodSeconds, 4);
  const rotationalLumSolar = rotationalEnergyLossWatts / 3.828e26;
  const thermalLumSolar = Math.max(1.0e-5, 0.05 * Math.pow(effectiveTemperatureK / 5778.0, 4) * Math.pow(radiusSolar, 2));
  const luminositySolar = Math.max(1.0e-5, thermalLumSolar + (isPulsar ? rotationalLumSolar : 0));

  return {
    massSolar: M,
    radiusKm,
    radiusSolar,
    meanDensityKgM3,
    compactness,
    escapeVelocityKmS,
    escapeVelocityFractionC,
    surfaceGravityLogG,
    effectiveTemperatureK,
    luminositySolar,
    spinPeriodSeconds,
    spinFrequencyRadS,
    magneticFieldGauss: B,
    spinDownRate: pDot,
    isPulsar,
    coolingAgeYears: age,
  };
}
