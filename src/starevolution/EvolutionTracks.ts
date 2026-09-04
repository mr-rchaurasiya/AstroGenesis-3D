/**
 * EvolutionTracks.ts
 * Standard benchmark preset evolutionary tracks (Sun, Red Dwarf, Intermediate, Massive, Hypermassive).
 */

import type { EvolutionTrack } from './StarEvolutionTypes';
import { generateEvolutionTrack } from './HRDiagramData';

/**
 * Generates the complete evolutionary track for a 1.0 M_☉ Sun-like star.
 */
export function getSunEvolutionTrack(sampleCount: number = 60): EvolutionTrack {
  return generateEvolutionTrack(1.0, 0.0, sampleCount);
}

/**
 * Generates the evolutionary track for a 0.2 M_☉ fully convective Red Dwarf.
 */
export function getRedDwarfEvolutionTrack(sampleCount: number = 40): EvolutionTrack {
  return generateEvolutionTrack(0.2, 0.0, sampleCount);
}

/**
 * Generates the evolutionary track for a 2.0 M_☉ intermediate-mass star (Sirius A-like).
 */
export function getIntermediateStarEvolutionTrack(sampleCount: number = 60): EvolutionTrack {
  return generateEvolutionTrack(2.0, 0.0, sampleCount);
}

/**
 * Generates the evolutionary track for a 10.0 M_☉ massive blue supergiant progenitor.
 */
export function getMassiveStarEvolutionTrack(sampleCount: number = 60): EvolutionTrack {
  return generateEvolutionTrack(10.0, 0.0, sampleCount);
}

/**
 * Generates the evolutionary track for a 30.0 M_☉ hypermassive O-type star.
 */
export function getHypermassiveStarEvolutionTrack(sampleCount: number = 60): EvolutionTrack {
  return generateEvolutionTrack(30.0, 0.0, sampleCount);
}

/**
 * Lazy / cached benchmark tracks map for validation and quick lookup.
 */
export const BENCHMARK_TRACKS = {
  get '0.2M'() {
    return getRedDwarfEvolutionTrack(40);
  },
  get '1.0M'() {
    return getSunEvolutionTrack(60);
  },
  get '2.0M'() {
    return getIntermediateStarEvolutionTrack(60);
  },
  get '10.0M'() {
    return getMassiveStarEvolutionTrack(60);
  },
  get '30.0M'() {
    return getHypermassiveStarEvolutionTrack(60);
  },
};
