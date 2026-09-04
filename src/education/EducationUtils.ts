/**
 * EducationUtils.ts
 * Educational computation and mapping utilities for Phase 11.
 * Provides mass-regime classification, lifecycle stage lookup,
 * cosmic epoch finder, camera scale matcher, and comparison builder.
 */

import type {
  CosmicEpoch,
  ScaleDescriptor,
  StellarMassRegimeInfo,
  LifecyclePhaseInfo,
  ComparisonPropertyRow,
  ObjectComparisonData,
  UnitSystem,
} from './EducationTypes';
import {
  COSMIC_EPOCHS,
  SCALE_BENCHMARKS,
  STELLAR_MASS_REGIMES,
} from './EducationConstants';
import {
  formatMass,
  formatRadius,
  formatLuminosity,
  formatTemperature,
  formatDensity,
  formatGravity,
  formatVelocity,
  formatTimescale,
} from './EducationFormatter';

/**
 * Classifies stellar mass into an educational mass regime.
 */
export function classifyMassRegime(initialMassSolar: number): StellarMassRegimeInfo {
  if (initialMassSolar < 0.35) {
    return STELLAR_MASS_REGIMES[0]; // VERY_LOW_MASS
  }
  if (initialMassSolar <= 2.0) {
    return STELLAR_MASS_REGIMES[1]; // SOLAR_LIKE
  }
  if (initialMassSolar <= 25.0) {
    return STELLAR_MASS_REGIMES[2]; // MASSIVE
  }
  return STELLAR_MASS_REGIMES[3];   // HYPERMASSIVE
}

/**
 * Finds the corresponding lifecycle phase info for a given stage key and initial mass.
 */
export function getLifecyclePhaseInfo(stageKey: string, initialMassSolar = 1.0): LifecyclePhaseInfo | null {
  const regime = classifyMassRegime(initialMassSolar);
  const found = regime.phases.find((p) => p.stageKey === stageKey || p.id === stageKey);
  if (found) return found;

  // Fallback to first phase or generic
  return regime.phases[0] ?? null;
}

/**
 * Finds the closest cosmic epoch for an elapsed time from Big Bang in years.
 */
export function findCosmicEpochForTime(timeFromBigBangYears: number): CosmicEpoch {
  if (timeFromBigBangYears <= 0) return COSMIC_EPOCHS[0];

  for (let i = COSMIC_EPOCHS.length - 1; i >= 0; i--) {
    if (timeFromBigBangYears >= COSMIC_EPOCHS[i].timeFromBigBangYears) {
      return COSMIC_EPOCHS[i];
    }
  }
  return COSMIC_EPOCHS[0];
}

/**
 * Finds the closest scale benchmark for a given camera distance in meters.
 */
export function findScaleBenchmark(distanceMeters: number): ScaleDescriptor {
  if (distanceMeters <= 0) return SCALE_BENCHMARKS[0];

  let best = SCALE_BENCHMARKS[0];
  let minDiff = Math.abs(Math.log10(distanceMeters) - Math.log10(best.metricDistanceMeters));

  for (let i = 1; i < SCALE_BENCHMARKS.length; i++) {
    const diff = Math.abs(Math.log10(distanceMeters) - Math.log10(SCALE_BENCHMARKS[i].metricDistanceMeters));
    if (diff < minDiff) {
      minDiff = diff;
      best = SCALE_BENCHMARKS[i];
    }
  }

  return best;
}

/**
 * Builds side-by-side comparison property rows for two astronomical objects.
 */
export function buildComparisonRows(
  objA: ObjectComparisonData,
  objB: ObjectComparisonData,
  unitSystem: UnitSystem = 'SOLAR'
): ComparisonPropertyRow[] {
  const rows: ComparisonPropertyRow[] = [];

  // 1. Mass
  if (objA.massSolar !== undefined || objB.massSolar !== undefined) {
    const valA = objA.massSolar ?? null;
    const valB = objB.massSolar ?? null;
    const ratio = (valA !== null && valB !== null && valB > 0) ? valA / valB : undefined;
    rows.push({
      propertyKey: 'mass',
      displayName: 'Mass',
      category: 'DIMENSIONS',
      unit: unitSystem === 'SI' ? 'kg' : 'M☉',
      valueA: valA,
      valueB: valB,
      formattedA: valA !== null ? formatMass(valA, unitSystem) : '—',
      formattedB: valB !== null ? formatMass(valB, unitSystem) : '—',
      normalizedRatio: ratio,
      ratioDescription: ratio !== undefined ? `${ratio > 1 ? `${ratio.toFixed(1)}× more massive` : `${(1 / ratio).toFixed(1)}× less massive`}` : undefined,
    });
  }

  // 2. Radius
  if (objA.radiusSolar !== undefined || objB.radiusSolar !== undefined) {
    const valA = objA.radiusSolar ?? null;
    const valB = objB.radiusSolar ?? null;
    const ratio = (valA !== null && valB !== null && valB > 0) ? valA / valB : undefined;
    rows.push({
      propertyKey: 'radius',
      displayName: 'Radius',
      category: 'DIMENSIONS',
      unit: unitSystem === 'SI' ? 'm' : 'R☉',
      valueA: valA,
      valueB: valB,
      formattedA: valA !== null ? formatRadius(valA, unitSystem) : '—',
      formattedB: valB !== null ? formatRadius(valB, unitSystem) : '—',
      normalizedRatio: ratio,
      ratioDescription: ratio !== undefined ? `${ratio > 1 ? `${ratio.toFixed(1)}× larger radius` : `${(1 / ratio).toFixed(1)}× smaller radius`}` : undefined,
    });
  }

  // 3. Luminosity
  if (objA.luminositySolar !== undefined || objB.luminositySolar !== undefined) {
    const valA = objA.luminositySolar ?? null;
    const valB = objB.luminositySolar ?? null;
    const ratio = (valA !== null && valB !== null && valB > 0) ? valA / valB : undefined;
    rows.push({
      propertyKey: 'luminosity',
      displayName: 'Luminosity',
      category: 'ENERGETICS',
      unit: unitSystem === 'SI' ? 'W' : 'L☉',
      valueA: valA,
      valueB: valB,
      formattedA: valA !== null ? formatLuminosity(valA, unitSystem) : '—',
      formattedB: valB !== null ? formatLuminosity(valB, unitSystem) : '—',
      normalizedRatio: ratio,
      ratioDescription: ratio !== undefined ? `${ratio > 1 ? `${ratio.toFixed(1)}× more luminous` : `${(1 / ratio).toFixed(1)}× dimmer`}` : undefined,
    });
  }

  // 4. Effective Temperature
  if (objA.temperatureK !== undefined || objB.temperatureK !== undefined) {
    const valA = objA.temperatureK ?? null;
    const valB = objB.temperatureK ?? null;
    rows.push({
      propertyKey: 'temperature',
      displayName: 'Surface Temperature',
      category: 'ENERGETICS',
      unit: 'K',
      valueA: valA,
      valueB: valB,
      formattedA: valA !== null ? formatTemperature(valA, unitSystem) : '—',
      formattedB: valB !== null ? formatTemperature(valB, unitSystem) : '—',
    });
  }

  // 5. Mass Density
  if (objA.densityKgM3 !== undefined || objB.densityKgM3 !== undefined) {
    const valA = objA.densityKgM3 ?? null;
    const valB = objB.densityKgM3 ?? null;
    rows.push({
      propertyKey: 'density',
      displayName: 'Mean Density',
      category: 'EXTREMES',
      unit: 'kg/m³',
      valueA: valA,
      valueB: valB,
      formattedA: valA !== null ? formatDensity(valA) : '—',
      formattedB: valB !== null ? formatDensity(valB) : '—',
    });
  }

  // 6. Surface Gravity
  if (objA.surfaceGravityM_S2 !== undefined || objB.surfaceGravityM_S2 !== undefined) {
    const valA = objA.surfaceGravityM_S2 ?? null;
    const valB = objB.surfaceGravityM_S2 ?? null;
    rows.push({
      propertyKey: 'gravity',
      displayName: 'Surface Gravity',
      category: 'EXTREMES',
      unit: 'm/s²',
      valueA: valA,
      valueB: valB,
      formattedA: valA !== null ? formatGravity(valA, unitSystem) : '—',
      formattedB: valB !== null ? formatGravity(valB, unitSystem) : '—',
    });
  }

  // 7. Escape Velocity
  if (objA.escapeVelocityKm_S !== undefined || objB.escapeVelocityKm_S !== undefined) {
    const valA = objA.escapeVelocityKm_S ?? null;
    const valB = objB.escapeVelocityKm_S ?? null;
    rows.push({
      propertyKey: 'escapeVelocity',
      displayName: 'Escape Velocity',
      category: 'EXTREMES',
      unit: 'km/s',
      valueA: valA,
      valueB: valB,
      formattedA: valA !== null ? formatVelocity(valA) : '—',
      formattedB: valB !== null ? formatVelocity(valB) : '—',
    });
  }

  // 8. Age
  if (objA.ageYears !== undefined || objB.ageYears !== undefined) {
    const valA = objA.ageYears ?? null;
    const valB = objB.ageYears ?? null;
    rows.push({
      propertyKey: 'age',
      displayName: 'Age / Lifetime',
      category: 'TIMELINE',
      unit: 'years',
      valueA: valA,
      valueB: valB,
      formattedA: valA !== null ? formatTimescale(valA, unitSystem) : '—',
      formattedB: valB !== null ? formatTimescale(valB, unitSystem) : '—',
    });
  }

  // 9. Spectral Type / Classification
  if (objA.spectralType !== undefined || objB.spectralType !== undefined) {
    rows.push({
      propertyKey: 'spectralType',
      displayName: 'Spectral Type',
      category: 'COMPOSITION',
      unit: '',
      valueA: objA.spectralType ?? '—',
      valueB: objB.spectralType ?? '—',
      formattedA: objA.spectralType ?? '—',
      formattedB: objB.spectralType ?? '—',
    });
  }

  // 10. Final Remnant Fate
  if (objA.remnantType !== undefined || objB.remnantType !== undefined) {
    rows.push({
      propertyKey: 'remnantType',
      displayName: 'Terminal Remnant',
      category: 'TIMELINE',
      unit: '',
      valueA: objA.remnantType ?? '—',
      valueB: objB.remnantType ?? '—',
      formattedA: objA.remnantType ? objA.remnantType.replace(/_/g, ' ') : '—',
      formattedB: objB.remnantType ? objB.remnantType.replace(/_/g, ' ') : '—',
    });
  }

  return rows;
}
