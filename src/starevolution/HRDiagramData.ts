/**
 * HRDiagramData.ts
 * Generates continuous, deterministic Hertzsprung-Russell (HR) diagram evolutionary tracks
 * from Zero-Age Main Sequence through all post-main-sequence stages up to post-helium handoff.
 */

import type { EvolutionTrack, EvolutionTrackPoint } from './StarEvolutionTypes';
import { advanceStellarEvolution } from './StellarEvolution';
import { deriveStellarVisualProperties } from '../stellar/StellarClassification';

/**
 * Generates an array of time-ordered evolutionary track points across a star's full lifetime.
 *
 * @param initialMassSolar - Initial ZAMS star mass in M_☉
 * @param metallicityFeH - Metallicity index [Fe/H] (default: 0.0)
 * @param sampleCount - Number of track sample points (default: 60)
 * @returns EvolutionTrack
 */
export function generateEvolutionTrack(
  initialMassSolar: number,
  metallicityFeH: number = 0.0,
  sampleCount: number = 60,
): EvolutionTrack {
  const M0 = Math.max(0.08, isFinite(initialMassSolar) ? initialMassSolar : 1.0);
  const count = Math.max(10, Math.min(200, sampleCount));

  // Determine base lifetime to set total time domain
  const zamsState = advanceStellarEvolution({ initialMassSolar: M0, currentAgeYears: 0, metallicityFeH });
  const totalLifespan = zamsState.totalLifespanYears;
  const msLifetime = zamsState.mainSequenceLifetimeYears;

  const points: EvolutionTrackPoint[] = [];

  // Allocate ~50% of samples to Main Sequence, ~50% to Post-Main-Sequence (where rapid HR movement occurs)
  const msSamples = Math.floor(count * 0.45);
  const postMsSamples = count - msSamples;

  // 1. Main Sequence Samples
  for (let i = 0; i < msSamples; i++) {
    const frac = i / (msSamples - 1);
    const age = msLifetime * frac;
    const state = advanceStellarEvolution({ initialMassSolar: M0, currentAgeYears: age, metallicityFeH });
    const visual = deriveStellarVisualProperties(state.effectiveTemperatureK, state.luminositySolar, state.radiusSolar);

    points.push({
      ageYears: state.ageYears,
      luminositySolar: state.luminositySolar,
      effectiveTemperatureK: state.effectiveTemperatureK,
      radiusSolar: state.radiusSolar,
      absoluteMagnitude: state.absoluteMagnitude,
      stage: state.stage,
      spectralClass: state.spectralClass,
      luminosityClass: state.luminosityClass,
      colorHex: visual.hexColor,
    });
  }

  // 2. Post-Main-Sequence Samples (Subgiant -> Giant -> He Burning -> AGB)
  if (totalLifespan > msLifetime) {
    const postMsDuration = totalLifespan - msLifetime;
    for (let i = 1; i <= postMsSamples; i++) {
      const frac = i / postMsSamples;
      const age = msLifetime + postMsDuration * frac;
      const state = advanceStellarEvolution({ initialMassSolar: M0, currentAgeYears: age, metallicityFeH });
      const visual = deriveStellarVisualProperties(state.effectiveTemperatureK, state.luminositySolar, state.radiusSolar);

      points.push({
        ageYears: state.ageYears,
        luminositySolar: state.luminositySolar,
        effectiveTemperatureK: state.effectiveTemperatureK,
        radiusSolar: state.radiusSolar,
        absoluteMagnitude: state.absoluteMagnitude,
        stage: state.stage,
        spectralClass: state.spectralClass,
        luminosityClass: state.luminosityClass,
        colorHex: visual.hexColor,
      });
    }
  }

  return {
    initialMassSolar: M0,
    metallicityFeH,
    points,
  };
}
