/**
 * colorUtils.ts
 * Utilities for computing physically-inspired star colors and UI color values.
 */

import * as THREE from 'three';

/**
 * Convert a blackbody temperature (in Kelvin) to an approximate RGB color.
 * Uses a simplified piecewise approximation of Planckian locus.
 * This is a visual approximation, not a physically exact calculation.
 *
 * @param tempK - Temperature in Kelvin (1000–40000 range produces useful results)
 * @returns THREE.Color
 */
export function temperatureToColor(tempK: number): THREE.Color {
  // Clamp to a safe range
  const t = Math.max(1000, Math.min(40000, tempK)) / 100;

  let r: number, g: number, b: number;

  // Red channel
  if (t <= 66) {
    r = 255;
  } else {
    r = t - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green channel
  if (t <= 66) {
    g = t;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = t - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue channel
  if (t >= 66) {
    b = 255;
  } else if (t <= 19) {
    b = 0;
  } else {
    b = t - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  return new THREE.Color(r / 255, g / 255, b / 255);
}

/**
 * Convert a temperature to a normalized brightness value (0–1)
 * Higher temperatures produce brighter stars.
 */
export function temperatureToBrightness(tempK: number): number {
  // Visual scaling: 3000K = dim, 30000K = very bright
  const normalized = (Math.log10(tempK) - Math.log10(3000)) / (Math.log10(30000) - Math.log10(3000));
  return Math.max(0.1, Math.min(1.0, normalized));
}

/**
 * Returns a weighted random star temperature in Kelvin,
 * biased towards cooler K/M-class stars (which are far more numerous).
 */
export function randomStarTemperature(rng: () => number = Math.random): number {
  const rand = rng();

  // Approximate stellar IMF distribution (most stars are cool)
  if (rand < 0.70) return lerp(2400, 5000, rng());  // M/K (most common)
  if (rand < 0.88) return lerp(5000, 6000, rng());  // G
  if (rand < 0.94) return lerp(6000, 7500, rng());  // F
  if (rand < 0.97) return lerp(7500, 10000, rng()); // A
  if (rand < 0.99) return lerp(10000, 30000, rng());// B
  return lerp(30000, 50000, rng());                  // O (rarest)
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/**
 * Returns a CSS hex string from a THREE.Color
 */
export function threeColorToHex(color: THREE.Color): string {
  return '#' + color.getHexString();
}

/**
 * Create a color slightly dimmed by a given factor (0 = black, 1 = original)
 */
export function dimColor(color: THREE.Color, factor: number): THREE.Color {
  return new THREE.Color(
    color.r * factor,
    color.g * factor,
    color.b * factor,
  );
}

/**
 * Desaturate a THREE.Color towards neutral white/grey by a given factor (0 = unchanged, 1 = grayscale)
 */
export function desaturateColor(color: THREE.Color, amount: number): THREE.Color {
  const luma = 0.299 * color.r + 0.587 * color.g + 0.114 * color.b;
  return new THREE.Color(
    lerp(color.r, luma, amount),
    lerp(color.g, luma, amount),
    lerp(color.b, luma, amount),
  );
}

/**
 * Simulates interstellar extinction/reddening over extreme distance.
 * Short blue wavelengths scatter more, shifting distant stars slightly towards warmer neutral tones.
 */
export function applyInterstellarExtinction(color: THREE.Color, distanceNormalized: number): THREE.Color {
  const scatterBlue = Math.min(0.35, distanceNormalized * 0.25);
  return new THREE.Color(
    color.r,
    color.g * (1 - scatterBlue * 0.4),
    color.b * (1 - scatterBlue),
  );
}

// ── Astrophysical Nebula Palettes ───────────────────────────────────────────

export const NEBULA_PALETTES = {
  /** Hydrogen-alpha emission (deep red/magenta: 656.3 nm) + Oxygen-III (teal: 500.7 nm) */
  EMISSION: {
    primary: new THREE.Color(0.85, 0.15, 0.35),   // H-alpha crimson
    secondary: new THREE.Color(0.08, 0.55, 0.65), // O-III cyan/teal
    core: new THREE.Color(0.98, 0.70, 0.85),      // Ionized energetic core
    accent: new THREE.Color(0.60, 0.10, 0.75),    // Nitrogen/Sulfur purple
  },
  /** Dust reflection nebula (Rayleigh scattering of hot B/A star light) */
  REFLECTION: {
    primary: new THREE.Color(0.20, 0.45, 0.85),   // Scattered deep blue
    secondary: new THREE.Color(0.40, 0.70, 0.95), // Powder blue
    core: new THREE.Color(0.80, 0.90, 1.00),      // Illuminating star reflection
    accent: new THREE.Color(0.15, 0.25, 0.55),    // Deep sky blue
  },
  /** Dark absorption dust cloud (Bok globule / dense molecular pillar) */
  DARK_CLOUD: {
    primary: new THREE.Color(0.04, 0.02, 0.03),   // Dense silicates/carbon
    secondary: new THREE.Color(0.12, 0.06, 0.08), // Warm brown dust boundary
    core: new THREE.Color(0.01, 0.01, 0.01),      // Total optical depth
    accent: new THREE.Color(0.18, 0.10, 0.06),    // Infrared leaking edge
  },
  /** Active star-forming molecular cloud complex (Orion/Carina type) */
  STAR_FORMING: {
    primary: new THREE.Color(0.90, 0.30, 0.20),   // Hot dust & excited hydrogen
    secondary: new THREE.Color(0.25, 0.45, 0.80), // Embedded OB association glow
    core: new THREE.Color(1.00, 0.90, 0.70),      // Embedded protostellar cluster
    accent: new THREE.Color(0.70, 0.18, 0.45),    // Shock front ionization
  },
} as const;
