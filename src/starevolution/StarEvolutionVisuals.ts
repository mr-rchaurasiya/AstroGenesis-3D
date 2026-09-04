/**
 * StarEvolutionVisuals.ts
 * Visual property derivation and shader parameter mapping for Stellar Evolution components.
 * Pure TypeScript functions decoupled from direct Three.js/React rendering.
 */

import type { StellarEvolutionProperties, StarEvolutionVisualProperties } from './StarEvolutionTypes';
import { deriveStellarVisualProperties } from '../stellar/StellarClassification';

/**
 * Derives comprehensive visual rendering properties for an evolving star.
 *
 * @param star - Current stellar evolution state
 * @returns StarEvolutionVisualProperties
 */
export function deriveStarEvolutionVisualProperties(
  star: StellarEvolutionProperties,
): StarEvolutionVisualProperties {
  // Leverage Phase 7 blackbody color and base visual derivations
  const stellarVisual = deriveStellarVisualProperties(
    star.effectiveTemperatureK,
    star.luminositySolar,
    star.radiusSolar,
  );

  // Derive atmospheric pulsation amplitude for giant and supergiant stages
  let pulsationAmplitude = 0.0;
  if (star.stage === 'RED_GIANT' || star.stage === 'ASYMPTOTIC_GIANT_BRANCH') {
    // Mira-like and semi-regular pulsation for cool extended giants
    pulsationAmplitude = Math.min(0.35, 0.1 + 0.25 * Math.min(1.0, star.radiusSolar / 200));
  } else if (star.stage === 'SUPERGIANT') {
    // Macro-turbulent and Cepheid-like pulsation
    pulsationAmplitude = Math.min(0.25, 0.08 + 0.17 * Math.min(1.0, star.radiusSolar / 800));
  } else if (star.stage === 'SUBGIANT') {
    pulsationAmplitude = 0.02;
  }

  // Granulation scale: massive giants have huge convective cells, MS stars have fine granules
  let granulationScale = 1.0;
  if (star.radiusSolar > 50) {
    granulationScale = 4.5;
  } else if (star.radiusSolar > 10) {
    granulationScale = 2.5;
  } else if (star.radiusSolar < 0.5) {
    granulationScale = 0.6;
  }

  // Visual radius for exploration scale (clamped & non-linearly scaled for aesthetic viewport framing)
  // Ensures giants are visibly massive while small dwarfs remain legible
  let visualRadiusExploration = Math.max(0.5, 1.8 * Math.pow(Math.max(0.1, star.radiusSolar), 0.45));
  if (star.stage === 'RED_GIANT' || star.stage === 'ASYMPTOTIC_GIANT_BRANCH') {
    visualRadiusExploration = Math.min(25.0, Math.max(4.0, 2.5 * Math.pow(star.radiusSolar, 0.48)));
  } else if (star.stage === 'SUPERGIANT') {
    visualRadiusExploration = Math.min(40.0, Math.max(6.0, 3.0 * Math.pow(star.radiusSolar, 0.5)));
  }

  // Scientific visual radius
  const visualRadiusScientific = Math.max(0.1, star.radiusSolar);

  // Dynamic bloom intensity based on bolometric luminosity
  const logL = Math.log10(Math.max(1e-4, star.luminositySolar));
  const bloomIntensity = Math.min(4.5, Math.max(0.6, 1.0 + 0.5 * logL));

  return {
    hexColor: stellarVisual.hexColor,
    coronaColor: stellarVisual.coronaColor,
    visualRadiusExploration,
    visualRadiusScientific,
    brightness: stellarVisual.brightness,
    bloomIntensity,
    pulsationAmplitude,
    granulationScale,
    stellarVisual,
  };
}
