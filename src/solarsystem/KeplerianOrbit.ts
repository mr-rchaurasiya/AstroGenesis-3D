/**
 * KeplerianOrbit.ts
 * Analytical orbital mechanics for elliptical and inclined Keplerian planetary orbits.
 * Computes exact 3D Cartesian coordinates (x, y, z) at simulation time t (in days).
 */

import * as THREE from 'three';
import type { OrbitalElements, ScaleMode } from './SolarSystemTypes';

const DEG2RAD = Math.PI / 180.0;

/**
 * Solves Kepler's equation M = E - e * sin(E) using Newton-Raphson iteration.
 * @param M Mean anomaly in radians [0, 2*pi)
 * @param e Eccentricity [0, 1)
 * @returns Eccentric anomaly E in radians
 */
export function solveKepler(M: number, e: number): number {
  // Normalize M into [0, 2*pi)
  let m = M % (Math.PI * 2);
  if (m < 0) m += Math.PI * 2;

  // Initial guess
  let E = e > 0.8 ? Math.PI : m;

  for (let i = 0; i < 15; i++) {
    const f = E - e * Math.sin(E) - m;
    const fPrime = 1.0 - e * Math.cos(E);
    const delta = f / fPrime;
    E -= delta;
    if (Math.abs(delta) < 1e-7) break;
  }

  return E;
}

/**
 * Maps semi-major axis in AU to scene units according to current ScaleMode.
 */
export function mapOrbitalDistance(
  semiMajorAxisAU: number,
  scaleMode: ScaleMode = 'exploration'
): number {
  if (scaleMode === 'scientific') {
    // 1 AU = 12.0 scene units (astronomical scale)
    return semiMajorAxisAU * 12.0;
  }

  // Exploration Mode: Smooth power-law compression (r ~ a^0.55 * factor)
  // Ensures inner terrestrial planets (0.39 to 1.52 AU) are clearly spaced
  // while outer gas/ice giants (5.2 to 30.1 AU) remain easily accessible in the viewport
  if (semiMajorAxisAU <= 0.05) {
    // Moon scale
    return semiMajorAxisAU * 20.0;
  }
  return 8.0 + Math.pow(semiMajorAxisAU, 0.58) * 16.0;
}

/**
 * Calculates 3D Cartesian position [x, y, z] for a body given its orbital elements and simulation time.
 * @param orbit Orbital parameters
 * @param timeDays Elapsed simulation time in days
 * @param scaleMode 'exploration' or 'scientific'
 */
export function computeKeplerianPosition(
  orbit: OrbitalElements,
  timeDays: number,
  scaleMode: ScaleMode = 'exploration'
): [number, number, number] {
  if (orbit.orbitalPeriodDays <= 0) return [0, 0, 0];

  const aScene = mapOrbitalDistance(orbit.semiMajorAxisAU, scaleMode);
  const e = orbit.eccentricity;
  const inc = (orbit.inclinationDeg || 0) * DEG2RAD;
  const omega = (orbit.argumentOfPeriapsisDeg || 0) * DEG2RAD;
  const Omega = (orbit.longitudeOfAscendingNodeDeg || 0) * DEG2RAD;
  const m0 = (orbit.meanAnomalyAtEpochDeg || 0) * DEG2RAD;

  // Mean anomaly at current time
  const meanMotion = (Math.PI * 2) / orbit.orbitalPeriodDays;
  const M = m0 + meanMotion * timeDays;

  // Eccentric anomaly
  const E = solveKepler(M, e);

  // Orbital plane coordinates (x_orb pointing toward periapsis)
  const xOrb = aScene * (Math.cos(E) - e);
  const zOrb = aScene * (Math.sqrt(Math.max(0.001, 1.0 - e * e)) * Math.sin(E));

  // Rotate by argument of periapsis (omega)
  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);
  const x1 = xOrb * cosW - zOrb * sinW;
  const z1 = xOrb * sinW + zOrb * cosW;

  // Rotate by inclination (inc) around X-axis
  const cosI = Math.cos(inc);
  const sinI = Math.sin(inc);
  const y2 = z1 * sinI;
  const z2 = z1 * cosI;

  // Rotate by longitude of ascending node (Omega) around Y-axis
  const cosO = Math.cos(Omega);
  const sinO = Math.sin(Omega);
  const finalX = x1 * cosO - z2 * sinO;
  const finalZ = x1 * sinO + z2 * cosO;
  const finalY = y2;

  return [finalX, finalY, finalZ];
}

/**
 * Generates an array of 3D points forming a closed Keplerian orbital trajectory line.
 */
export function generateOrbitPath(
  orbit: OrbitalElements,
  scaleMode: ScaleMode = 'exploration',
  segments = 128
): Float32Array {
  const positions = new Float32Array((segments + 1) * 3);
  const aScene = mapOrbitalDistance(orbit.semiMajorAxisAU, scaleMode);
  const e = orbit.eccentricity;
  const inc = (orbit.inclinationDeg || 0) * DEG2RAD;
  const omega = (orbit.argumentOfPeriapsisDeg || 0) * DEG2RAD;
  const Omega = (orbit.longitudeOfAscendingNodeDeg || 0) * DEG2RAD;

  const cosW = Math.cos(omega);
  const sinW = Math.sin(omega);
  const cosI = Math.cos(inc);
  const sinI = Math.sin(inc);
  const cosO = Math.cos(Omega);
  const sinO = Math.sin(Omega);

  for (let i = 0; i <= segments; i++) {
    const E = (i / segments) * Math.PI * 2;
    const xOrb = aScene * (Math.cos(E) - e);
    const zOrb = aScene * (Math.sqrt(Math.max(0.001, 1.0 - e * e)) * Math.sin(E));

    const x1 = xOrb * cosW - zOrb * sinW;
    const z1 = xOrb * sinW + zOrb * cosW;

    const y2 = z1 * sinI;
    const z2 = z1 * cosI;

    const finalX = x1 * cosO - z2 * sinO;
    const finalZ = x1 * sinO + z2 * cosO;
    const finalY = y2;

    const idx = i * 3;
    positions[idx] = finalX;
    positions[idx + 1] = finalY;
    positions[idx + 2] = finalZ;
  }

  return positions;
}

/**
 * Creates a rotation quaternion from axial tilt and current rotation angle.
 */
export function computePlanetaryRotation(
  axialTiltDeg: number,
  rotationAngleRad: number
): THREE.Euler {
  return new THREE.Euler(
    (axialTiltDeg * Math.PI) / 180.0,
    rotationAngleRad,
    0,
    'ZYX'
  );
}
