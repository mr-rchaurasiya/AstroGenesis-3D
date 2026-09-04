/**
 * SpiralArm.ts
 * Mathematical model for the Milky Way logarithmic spiral arms and Orion Spur.
 * Computes galactocentric positions, pitch angles, and radial dispersion.
 */

import type { SpiralArmDefinition } from './MilkyWayTypes';

/**
 * Computes the radius r(theta) of a logarithmic spiral arm:
 * r(theta) = r0 * exp((theta - startTheta) * tan(pitchAngle))
 */
export function sampleSpiralArmRadius(
  arm: SpiralArmDefinition,
  theta: number
): number {
  const pitchRad = (arm.pitchAngleDeg * Math.PI) / 180.0;
  const deltaTheta = theta - arm.startTheta;
  const k = Math.tan(pitchRad);
  return arm.r0Kpc * Math.exp(k * deltaTheta);
}

/**
 * Samples a random 3D position [x, y, z] along a specified spiral arm in kiloparsecs.
 * @param arm Spiral arm configuration
 * @param progress 0.0 to 1.0 along the arm's angular span
 * @param rng Deterministic random generator returning [0, 1)
 */
export function sampleSpiralArmPoint(
  arm: SpiralArmDefinition,
  progress: number,
  rng: () => number
): { positionKpc: [number, number, number]; isClump: boolean } {
  const theta = arm.startTheta + progress * (arm.endTheta - arm.startTheta);
  const idealRadius = sampleSpiralArmRadius(arm, theta);

  // Controlled stochastic dispersion (Gaussian-like Box-Muller)
  const u1 = Math.max(1e-6, rng());
  const u2 = rng();
  const radialJitter = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2) * (arm.widthKpc * 0.5);

  const finalRadius = Math.max(0.5, idealRadius + radialJitter);

  // Starburst clump / H II ionization knot probability (15% chance of localized clustering)
  const isClump = rng() < 0.15;
  const clumpOffsetTheta = isClump ? (rng() - 0.5) * 0.05 : 0;
  const finalTheta = theta + clumpOffsetTheta;

  const xKpc = finalRadius * Math.cos(finalTheta);
  const zKpc = finalRadius * Math.sin(finalTheta);

  // Thin disk vertical scale height (z0 ~ 0.30 kpc)
  const v1 = Math.max(1e-6, rng());
  const v2 = rng();
  const yKpc = Math.sqrt(-2.0 * Math.log(v1)) * Math.sin(2.0 * Math.PI * v2) * 0.25;

  return {
    positionKpc: [xKpc, yKpc, zKpc],
    isClump,
  };
}
