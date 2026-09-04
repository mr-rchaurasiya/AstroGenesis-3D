/**
 * DeathTracks.ts
 * Deterministic benchmark death evolution tracks for stellar remnants:
 * 1 M_☉ (Sun -> WD), 5 M_☉ (Intermediate -> WD), 8 M_☉ (Transition -> WD/NS),
 * 10 M_☉ (Massive -> SN -> NS), 20 M_☉ (Heavy Massive -> SN -> NS/BH), 30 M_☉ (Hypermassive -> SN -> BH).
 */

import type { DeathTrack, DeathTrackPoint } from './StarDeathTypes';
import { advanceStellarDeath } from './StellarDeath';

/**
 * Generates an array of time-ordered death track points across the post-death epoch.
 *
 * @param initialMassSolar - Progenitor initial mass in M_☉
 * @param sampleCount - Number of sample points (default: 40)
 * @returns DeathTrack
 */
export function generateDeathTrack(
  initialMassSolar: number,
  _sampleCount: number = 40,
): DeathTrack {
  const M0 = Math.max(0.08, isFinite(initialMassSolar) ? initialMassSolar : 1.0);

  // Determine initial baseline state
  const zamsState = advanceStellarDeath({
    progenitorInitialMassSolar: M0,
    currentMassSolar: M0,
    coreMassSolar: Math.max(0.1, M0 * 0.15),
    deathAgeYears: 0,
  });

  const remnantType = zamsState.remnantType;
  const points: DeathTrackPoint[] = [];

  // Use logarithmic time spacing from 0 to 10^10 years
  // 0 yr, 1 yr, 10 yr, 100 yr, 1000 yr, 10^4 yr, 10^5 yr, ... 10^10 yr
  const logTimes = [
    0,
    0.001,
    0.01,
    0.1,
    0.5,
    1.0,
    5.0,
    10.0,
    50.0,
    100.0,
    500.0,
    1000.0,
    5000.0,
    10000.0,
    50000.0,
    100000.0,
    500000.0,
    1.0e6,
    5.0e6,
    1.0e7,
    5.0e7,
    1.0e8,
    5.0e8,
    1.0e9,
    5.0e9,
    1.0e10,
  ];

  for (const age of logTimes) {
    const state = advanceStellarDeath({
      progenitorInitialMassSolar: M0,
      currentMassSolar: M0,
      coreMassSolar: Math.max(0.1, M0 * 0.15),
      deathAgeYears: age,
    });

    points.push({
      ageYears: state.deathAgeYears,
      stage: state.stage,
      massSolar: state.currentMassSolar,
      coreMassSolar: state.currentMassSolar,
      luminositySolar: state.luminositySolar,
      radiusSolar: state.radiusSolar,
      effectiveTemperatureK: state.effectiveTemperatureK,
      remnantType: state.remnantType,
    });
  }

  return {
    progenitorMassSolar: M0,
    remnantType,
    points,
  };
}

/**
 * Standard benchmark preset death tracks.
 */
export const BENCHMARK_DEATH_TRACKS = {
  get '1.0M'() {
    return generateDeathTrack(1.0);
  },
  get '5.0M'() {
    return generateDeathTrack(5.0);
  },
  get '8.0M'() {
    return generateDeathTrack(8.0);
  },
  get '10.0M'() {
    return generateDeathTrack(10.0);
  },
  get '20.0M'() {
    return generateDeathTrack(20.0);
  },
  get '30.0M'() {
    return generateDeathTrack(30.0);
  },
};
