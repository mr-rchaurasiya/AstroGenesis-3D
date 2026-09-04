/**
 * galaxyMathUtils.ts
 * Mathematical functions and coordinate transformations for procedural galaxy generation.
 * Includes logarithmic spirals, density wave distributions, de Vaucouleurs & Sérsic profiles,
 * and exponential disk scale heights.
 */

import * as THREE from 'three';
import { clamp, lerp, fbm3D } from './mathUtils';

// ── Exponential Disk Profile ─────────────────────────────────────────────────

/**
 * Samples a radial distance following an exponential surface brightness profile:
 * I(r) = I_0 * exp(-r / h_r)
 * Cumulative distribution function inversion for uniform random variable u in [0, 1).
 */
export function sampleExponentialDiskRadius(
  maxRadius: number,
  scaleLength: number,
  rng: () => number,
): number {
  // Invert CDF: r = -h_r * ln(1 - u)
  const u = clamp(rng(), 0.0001, 0.9999);
  const r = -scaleLength * Math.log(1.0 - u * (1.0 - Math.exp(-maxRadius / scaleLength)));
  return Math.min(maxRadius, r);
}

/**
 * Samples vertical height following an isothermal sheet sech^2(z / z_0) profile.
 */
export function sampleVerticalScaleHeight(scaleHeight: number, rng: () => number): number {
  const u = clamp(rng(), 0.001, 0.999);
  // Inverse of tanh(z/z0) gives sech^2 distribution:
  // z = z0 * atanh(2u - 1)
  const x = 2.0 * u - 1.0;
  const z = 0.5 * Math.log((1.0 + x) / (1.0 - x)) * scaleHeight;
  return clamp(z, -scaleHeight * 4.0, scaleHeight * 4.0);
}

// ── de Vaucouleurs & Sérsic Spheroid Profile ─────────────────────────────────

/**
 * Samples a radial distance for a spheroidal stellar distribution (elliptical galaxy or bulge)
 * following a Sérsic profile: I(r) = I_e * exp(-b_n * ((r/r_e)^(1/n) - 1)).
 * For n = 4, this is the classic de Vaucouleurs profile.
 */
export function sampleSersicRadius(
  effectiveRadius: number,
  maxRadius: number,
  sersicIndex: number = 4.0,
  rng: () => number,
): number {
  // Approximation of Sérsic inverted cumulative distribution
  const u = clamp(rng(), 0.0001, 0.9999);
  const p = 1.0 / (2.0 * sersicIndex);
  const r = effectiveRadius * Math.pow(-Math.log(1.0 - u), 1.0 / p) * 0.35;
  return Math.min(maxRadius, Math.max(0.1, r));
}

// ── Spiral Arm Mathematical Model ────────────────────────────────────────────

export interface SpiralPointResult {
  position: THREE.Vector3;
  armIndex: number;
  distanceFromArmCenter: number;
}

/**
 * Computes a point along a logarithmic spiral arm:
 * r(theta) = r_0 * exp(k * (theta - theta_0))
 * with arm width dispersion, pitch tightness, and bar elongation.
 */
export function computeSpiralArmPosition(
  armIndex: number,
  totalArms: number,
  t: number, // Normalized position along arm [0, 1]
  maxRadius: number,
  innerRadius: number,
  pitchTightness: number, // k factor (higher = tighter winding)
  armWidth: number,
  isBarred: boolean,
  barLength: number,
  barWidth: number,
  rng: () => number,
): SpiralPointResult {
  // Angular offset for current arm
  const armAngleOffset = (armIndex / totalArms) * Math.PI * 2.0;

  // Radial progression: non-linear distribution concentrating star formation
  const r = innerRadius + (maxRadius - innerRadius) * Math.pow(t, 0.85);

  // Logarithmic spiral angle: theta = (1/k) * ln(r / r_0)
  const k = Math.max(0.2, pitchTightness);
  const theta = (1.0 / k) * Math.log(Math.max(1.0, r / Math.max(1.0, innerRadius))) + armAngleOffset;

  // Tangential & perpendicular dispersion across arm width
  const localArmSpread = armWidth * r * (0.08 + 0.15 * t);
  const normalJitter = (rng() + rng() - 1.0) * localArmSpread; // Approximate Gaussian
  const tangentialJitter = (rng() - 0.5) * localArmSpread * 0.5;

  // Compute base spiral coordinates
  let x = (r + tangentialJitter) * Math.cos(theta) - normalJitter * Math.sin(theta);
  let z = (r + tangentialJitter) * Math.sin(theta) + normalJitter * Math.cos(theta);

  // If barred spiral and within bar radius, transition smoothly into linear stellar bar
  if (isBarred && barLength > 0 && r < barLength * 1.3) {
    const barBlend = smoothstep(barLength * 1.3, barLength * 0.4, r);
    // Linear bar orientation along arm base axis
    const barProgress = (r / barLength) * (armIndex % 2 === 0 ? 1 : -1);
    const barX = barProgress * barLength * 0.9 * Math.cos(armAngleOffset);
    const barZ = barProgress * barLength * 0.9 * Math.sin(armAngleOffset);

    // Add bar thickness dispersion
    const barPerpX = -Math.sin(armAngleOffset) * (rng() - 0.5) * barWidth;
    const barPerpZ =  Math.cos(armAngleOffset) * (rng() - 0.5) * barWidth;

    x = lerp(x, barX + barPerpX, barBlend);
    z = lerp(z, barZ + barPerpZ, barBlend);
  }

  // Vertical thickness flattens at core, flares slightly at outer edge
  const verticalScaleHeight = maxRadius * 0.03 * (0.8 + 0.4 * t);
  const y = sampleVerticalScaleHeight(verticalScaleHeight, rng);

  return {
    position: new THREE.Vector3(x, y, z),
    armIndex,
    distanceFromArmCenter: Math.abs(normalJitter) / localArmSpread,
  };
}

// ── Irregular & Dwarf Clumpy Distribution ────────────────────────────────────

/**
 * Computes a position in an asymmetric, clumpy irregular galaxy.
 */
export function computeIrregularPosition(
  maxRadius: number,
  clumpiness: number,
  asymmetry: number,
  rng: () => number,
): THREE.Vector3 {
  // Base flattened disk or elongated cloud
  const r = maxRadius * Math.pow(rng(), 0.7);
  let theta = rng() * Math.PI * 2.0;

  // Asymmetric stretch along preferred angle
  const stretch = 1.0 + asymmetry * 0.6;
  let x = r * Math.cos(theta) * stretch;
  let z = r * Math.sin(theta);

  // Procedural 3D noise perturbation creates localized clumpy starburst regions
  const nX = fbm3D(x * 0.05, z * 0.05, 0.0, 3);
  const nZ = fbm3D((x + 20.0) * 0.05, (z + 20.0) * 0.05, 0.5, 3);

  x += (nX - 0.5) * maxRadius * clumpiness * 0.6;
  z += (nZ - 0.5) * maxRadius * clumpiness * 0.6;

  // Vertical dispersion
  const heightScale = maxRadius * 0.15;
  const y = (rng() - 0.5) * heightScale * (1.0 - (r / maxRadius) * 0.5);

  return new THREE.Vector3(x, y, z);
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}
