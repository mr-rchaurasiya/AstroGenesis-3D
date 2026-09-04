/**
 * scaleUtils.ts
 * Astronomical scale definitions and coordinate transformations for visualization.
 * Provides clean abstractions for mapping real physical scales to normalized scene units.
 */

import { AU_METERS, LIGHT_YEAR_METERS, PARSEC_METERS } from '../astronomy/constants';

// ── Astronomical Distance Units ──────────────────────────────────────────────

export type DistanceUnit = 'meters' | 'au' | 'ly' | 'pc' | 'kpc' | 'mpc';

export const METERS_PER_UNIT: Record<DistanceUnit, number> = {
  meters: 1,
  au: AU_METERS,
  ly: LIGHT_YEAR_METERS,
  pc: PARSEC_METERS,
  kpc: PARSEC_METERS * 1e3,
  mpc: PARSEC_METERS * 1e6,
};

// ── Visual Depth Bands (Scene Units) ─────────────────────────────────────────

export const DEPTH_BANDS = {
  /** Local / Immediate field: 0–250 units (Nearby stars, local system context) */
  NEAR: { min: 0, max: 250, label: 'Local Interstellar' },
  /** Intermediate field: 250–1000 units (Local star clusters, dust clouds, emission nebulae) */
  MID: { min: 250, max: 1000, label: 'Galactic Sector' },
  /** Far field: 1000–3000 units (Distant stars, molecular clouds, outer arm structures) */
  FAR: { min: 1000, max: 3000, label: 'Galactic Arm' },
  /** Deep cosmic background: 3000–8000 units (Cosmic web, distant background galaxies) */
  DEEP: { min: 3000, max: 8000, label: 'Deep Cosmic Horizon' },
} as const;

// ── Scale Conversion Helpers ─────────────────────────────────────────────────

/**
 * Converts astronomical distances (in specified unit) to visual scene units.
 * Applies a compression curve so vast cosmic scales remain visually comprehensible.
 */
export function astroToSceneDistance(value: number, unit: DistanceUnit = 'ly'): number {
  const meters = value * METERS_PER_UNIT[unit];
  const ly = meters / LIGHT_YEAR_METERS;

  // Logarithmic compression for visualization beyond 100 ly
  if (ly <= 10) {
    return ly * 10; // 1 ly = 10 scene units
  } else if (ly <= 1000) {
    return 100 + Math.log10(ly / 10) * 400; // 10-1000 ly maps to 100-900 units
  } else {
    return 900 + Math.log10(ly / 1000) * 1500; // >1000 ly maps to 900-3900+ units
  }
}

/**
 * Formats an astronomical distance into human-readable notation.
 */
export function formatAstroDistance(ly: number): string {
  if (ly < 0.001) {
    const au = (ly * LIGHT_YEAR_METERS) / AU_METERS;
    return `${au.toFixed(1)} AU`;
  }
  if (ly < 1) {
    return `${(ly * 12).toFixed(1)} light-months`;
  }
  if (ly < 1000) {
    return `${ly.toFixed(1)} ly`;
  }
  if (ly < 1e6) {
    return `${(ly / 1e3).toFixed(1)} kly`;
  }
  return `${(ly / 1e6).toFixed(2)} Mly`;
}
