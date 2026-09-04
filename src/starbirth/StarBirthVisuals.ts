/**
 * StarBirthVisuals.ts
 * Visual property derivation and shader uniforms mapping for star birth components.
 * Completely decoupled from Three.js and React rendering.
 */

import type { ProtostarProperties, StarBirthVisualProperties } from './StarBirthTypes';
import { deriveStellarVisualProperties } from '../stellar/StellarClassification';

/**
 * Derives comprehensive visual rendering properties for a protostellar system.
 *
 * @param protostar - Protostar physics properties
 * @returns StarBirthVisualProperties
 */
export function deriveProtostarVisualProperties(protostar: ProtostarProperties): StarBirthVisualProperties {
  const stellarVisual = deriveStellarVisualProperties(
    protostar.effectiveTemperatureK,
    protostar.luminositySolar,
    protostar.radiusSolar,
  );

  // Accretion disk inner boundary color (hot emission: ~1500–2500K golden white/orange)
  const diskInnerColor = protostar.disk.temperatureInnerK > 1800 ? '#fff0c2' : '#ff9933';
  // Accretion disk outer boundary color (cool dark silicate/carbon dust: ~30–100K reddish brown)
  const diskOuterColor = '#3a1f18';

  // Bipolar jet color (Herbig-Haro shock excited hydrogen-alpha and forbidden lines: high excitation cyan-magenta)
  const jetColor = protostar.jets.jetVelocityKmS > 250 ? '#80d4ff' : '#ff66b2';

  // Exploration visual radius with non-linear boost for visibility in space scene
  const visualRadiusExploration = Math.max(0.6, Math.min(15.0, 2.0 * Math.pow(protostar.radiusSolar, 0.4)));
  // Scientific radius
  const visualRadiusScientific = Math.max(0.1, protostar.radiusSolar * 1.5);

  return {
    hexColor: stellarVisual.hexColor,
    coronaColor: stellarVisual.coronaColor,
    visualRadiusExploration,
    visualRadiusScientific,
    brightness: stellarVisual.brightness,
    bloomIntensity: Math.min(3.0, stellarVisual.bloomIntensity + protostar.jets.activity * 0.8),
    diskInnerColor,
    diskOuterColor,
    jetColor,
    stellarVisual,
  };
}
