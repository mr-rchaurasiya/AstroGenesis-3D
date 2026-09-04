/**
 * mathUtils.ts
 * Common math utilities for 3D scene calculations.
 */

import * as THREE from 'three';

/** Clamp a value between min and max */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Smoothstep interpolation (ease in/out) */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

/** Generate a random point uniformly distributed on a sphere surface */
export function randomOnSphere(radius: number, rng: () => number = Math.random): THREE.Vector3 {
  const theta = rng() * Math.PI * 2;
  const phi = Math.acos(2 * rng() - 1);
  return new THREE.Vector3(
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  );
}

/** Generate a random point within a sphere volume */
export function randomInSphere(radius: number, rng: () => number = Math.random): THREE.Vector3 {
  const r = radius * Math.cbrt(rng()); // cube root for uniform volume
  return randomOnSphere(r, rng);
}

/**
 * Generate a random point in a flattened disk (galaxy disk shape).
 * @param radius  - Maximum radial distance
 * @param height  - Half-height of the disk
 * @param falloff - Density falloff exponent (higher = more concentrated)
 */
export function randomInDisk(
  radius: number,
  height: number,
  falloff: number = 1.5,
  rng: () => number = Math.random,
): THREE.Vector3 {
  const theta = rng() * Math.PI * 2;
  const r = radius * Math.pow(rng(), falloff);
  const y = (rng() * 2 - 1) * height * Math.exp(-r / radius);
  return new THREE.Vector3(
    r * Math.cos(theta),
    y,
    r * Math.sin(theta),
  );
}

/**
 * Compute a point along a logarithmic spiral arm.
 * Used for galaxy arm star placement.
 *
 * @param armIndex  - Which arm (0-based)
 * @param numArms   - Total number of arms
 * @param t         - Normalized position along arm (0–1)
 * @param tightness - Spiral tightness factor
 * @param radius    - Maximum arm radius
 */
export function spiralArmPoint(
  armIndex: number,
  numArms: number,
  t: number,
  tightness: number,
  radius: number,
  spread: number = 0.3,
  rng: () => number = Math.random,
): THREE.Vector3 {
  const armOffset = (armIndex / numArms) * Math.PI * 2;
  const r = t * radius;
  const theta = tightness * Math.log(1 + r) + armOffset;
  const spreadAmount = spread * r * (rng() - 0.5);
  const height = (rng() - 0.5) * 0.1 * radius * Math.exp(-r / radius);
  return new THREE.Vector3(
    (r + spreadAmount) * Math.cos(theta),
    height,
    (r + spreadAmount) * Math.sin(theta),
  );
}

/** Convert degrees to radians */
export const DEG2RAD = Math.PI / 180;
export const RAD2DEG = 180 / Math.PI;

/** Seeded pseudo-random number generator (LCG) */
export function createSeededRNG(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

// ── 3D Value Noise & Fractional Brownian Motion ─────────────────────────────

function fract(n: number): number {
  return n - Math.floor(n);
}

function hash3D(x: number, y: number, z: number): number {
  let h = (x * 127.1 + y * 311.7 + z * 74.7);
  return fract(Math.sin(h) * 43758.5453123);
}

/**
 * 3D Value Noise with cubic Hermite interpolation.
 * Returns values in [0, 1].
 */
export function noise3D(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);

  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;

  // Cubic Hermite curve
  const ux = fx * fx * (3.0 - 2.0 * fx);
  const uy = fy * fy * (3.0 - 2.0 * fy);
  const uz = fz * fz * (3.0 - 2.0 * fz);

  const n000 = hash3D(ix, iy, iz);
  const n100 = hash3D(ix + 1, iy, iz);
  const n010 = hash3D(ix, iy + 1, iz);
  const n110 = hash3D(ix + 1, iy + 1, iz);
  const n001 = hash3D(ix, iy, iz + 1);
  const n101 = hash3D(ix + 1, iy, iz + 1);
  const n011 = hash3D(ix, iy + 1, iz + 1);
  const n111 = hash3D(ix + 1, iy + 1, iz + 1);

  const nx00 = lerp(n000, n100, ux);
  const nx10 = lerp(n010, n110, ux);
  const nx01 = lerp(n001, n101, ux);
  const nx11 = lerp(n011, n111, ux);

  const nxy0 = lerp(nx00, nx10, uy);
  const nxy1 = lerp(nx01, nx11, uy);

  return lerp(nxy0, nxy1, uz);
}

/**
 * 3D Fractional Brownian Motion (fBM) with configurable octaves.
 */
export function fbm3D(
  x: number,
  y: number,
  z: number,
  octaves = 4,
  lacunarity = 2.0,
  gain = 0.5,
): number {
  let value = 0;
  let amplitude = 0.5;
  let frequency = 1.0;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise3D(x * frequency, y * frequency, z * frequency);
    maxValue += amplitude;
    frequency *= lacunarity;
    amplitude *= gain;
  }

  return value / maxValue;
}

/**
 * Catmull-Rom spline interpolation between 4 control points.
 */
export function catmullRom(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const v0 = (p2 - p0) * 0.5;
  const v1 = (p3 - p1) * 0.5;
  const t2 = t * t;
  const t3 = t * t2;
  return (2 * p1 - 2 * p2 + v0 + v1) * t3 +
         (-3 * p1 + 3 * p2 - 2 * v0 - v1) * t2 +
         v0 * t + p1;
}

/**
 * Sample a 3D Catmull-Rom curve from an array of Vector3 control points.
 */
export function sampleCatmullRom3D(points: THREE.Vector3[], t: number): THREE.Vector3 {
  if (points.length < 2) return points[0]?.clone() ?? new THREE.Vector3();
  const clampedT = clamp(t, 0, 1);
  const segmentCount = points.length - 1;
  const scaledT = clampedT * segmentCount;
  const index = Math.min(Math.floor(scaledT), segmentCount - 1);
  const localT = scaledT - index;

  const p0 = points[Math.max(0, index - 1)];
  const p1 = points[index];
  const p2 = points[Math.min(points.length - 1, index + 1)];
  const p3 = points[Math.min(points.length - 1, index + 2)];

  return new THREE.Vector3(
    catmullRom(p0.x, p1.x, p2.x, p3.x, localT),
    catmullRom(p0.y, p1.y, p2.y, p3.y, localT),
    catmullRom(p0.z, p1.z, p2.z, p3.z, localT),
  );
}
