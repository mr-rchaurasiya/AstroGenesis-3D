/**
 * JetsModel.ts
 * Magnetocentrifugal bipolar protostellar jets and Herbig-Haro collimated outflows.
 */

import {
  GRAVITATIONAL_CONSTANT_G,
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  BIPOLAR_JET_MASS_LOSS_FRACTION,
} from './StarBirthConstants';
import type { ProtostellarJetProperties } from './StarBirthTypes';

/**
 * Computes bipolar jet kinematics and physical parameters.
 *
 * @param massSolar - Protostar mass in M_☉
 * @param radiusSolar - Protostar radius in R_☉
 * @param accretionRateSolarPerYear - Instantaneous accretion rate in M_☉/yr
 * @param ageYears - Current protostellar age in Earth years
 * @param axis - Orientation unit vector (default: [0, 1, 0])
 * @returns ProtostellarJetProperties
 */
export function calculateProtostellarJets(
  massSolar: number,
  radiusSolar: number,
  accretionRateSolarPerYear: number,
  ageYears: number,
  axis: [number, number, number] = [0, 1, 0],
): ProtostellarJetProperties {
  const mKg = Math.max(0.01, massSolar) * SOLAR_MASS_KG;
  const rM = Math.max(0.01, radiusSolar) * SOLAR_RADIUS_M;

  // Magnetocentrifugal jet launch velocity scales with stellar escape velocity: v_jet ≈ v_esc
  const escapeVelocityMs = Math.sqrt((2 * GRAVITATIONAL_CONSTANT_G * mKg) / rM);
  const jetVelocityKmS = escapeVelocityMs / 1000.0;

  // Mass loss rate through bipolar outflow
  const massLossRateSolarPerYear = accretionRateSolarPerYear * BIPOLAR_JET_MASS_LOSS_FRACTION;

  // Activity normalized: highest when accretion rate is high (~1e-5 M_☉/yr)
  const normalizedActivity = Math.max(0, Math.min(1.0, accretionRateSolarPerYear / 1.0e-5));

  // Jet length extends over time (capped at ~2000 AU for visible Herbig-Haro structures)
  const lengthAU = Math.max(5.0, Math.min(2000.0, 50.0 + (ageYears / 1000.0) * 10.0)) * normalizedActivity;

  // Opening angle: highly collimated (~5° to 12°)
  const openingAngleDeg = 8.0;

  return {
    jetVelocityKmS,
    massLossRateSolarPerYear,
    openingAngleDeg,
    lengthAU,
    activity: normalizedActivity,
    axis,
  };
}
