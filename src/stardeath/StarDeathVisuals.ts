/**
 * StarDeathVisuals.ts
 * Visual property derivation and shader parameter mapping for Star Death & Remnant components.
 * Pure TypeScript functions decoupled from direct Three.js/React rendering.
 */

import type { StellarDeathProperties, StarDeathVisualProperties } from './StarDeathTypes';
import { deriveStellarVisualProperties } from '../stellar/StellarClassification';

/**
 * Derives comprehensive visual rendering properties for a stellar death remnant.
 *
 * @param deathState - Current stellar death state
 * @returns StarDeathVisualProperties
 */
export function deriveStarDeathVisualProperties(
  deathState: StellarDeathProperties,
): StarDeathVisualProperties {
  const remnantType = deathState.remnantType;

  // Derive base blackbody visual properties where temperature is defined
  const tempK = Math.max(1000.0, deathState.effectiveTemperatureK);
  const stellarVisual = deriveStellarVisualProperties(
    tempK,
    Math.max(1.0e-5, deathState.luminositySolar),
    Math.max(1.0e-5, deathState.radiusSolar),
  );

  let coreHexColor = stellarVisual.hexColor;
  let glowColor = stellarVisual.coronaColor;
  let visualRadiusExploration = 1.0;
  let visualRadiusScientific = Math.max(0.01, deathState.radiusSolar);
  let envelopeVisualRadius = 0.0;
  let brightness = stellarVisual.brightness;
  let bloomIntensity = 1.2;
  let lensingStrength = 0.0;
  let pulsarBeamAngleRad = 0.0;
  let diskColor = '#ffcc66';

  if (remnantType === 'WHITE_DWARF') {
    // ── White Dwarf: Ultra-dense hot blue-white / diamond sphere ──
    coreHexColor = deathState.effectiveTemperatureK > 25000 ? '#d4f0ff' : deathState.effectiveTemperatureK > 10000 ? '#ffffff' : '#ffe0b2';
    glowColor = '#80d4ff';
    visualRadiusExploration = 0.8; // Compact legible sphere
    visualRadiusScientific = Math.max(0.005, deathState.radiusSolar);
    brightness = Math.min(1.0, Math.max(0.4, deathState.effectiveTemperatureK / 40000));
    bloomIntensity = Math.min(3.0, 1.2 + brightness * 1.5);
    lensingStrength = 0.15;

    // Planetary nebula envelope overlay if active
    if (deathState.planetaryNebula && deathState.planetaryNebula.visibilityFraction > 0.01) {
      envelopeVisualRadius = Math.min(45.0, Math.max(3.0, 2.5 * Math.pow(deathState.planetaryNebula.nebulaRadiusAU, 0.4)));
      glowColor = '#00ffcc'; // [O III] doubly ionized oxygen emerald/cyan
    }
  } else if (remnantType === 'NEUTRON_STAR') {
    // ── Neutron Star / Pulsar: Hyper-dense ultra-compact relativistic beacon ──
    coreHexColor = '#99e6ff'; // Hot cyan/electric blue
    glowColor = '#3399ff';
    visualRadiusExploration = 0.5; // Very small compact core
    visualRadiusScientific = Math.max(0.001, deathState.radiusSolar);
    brightness = 1.0;
    bloomIntensity = 2.5;
    lensingStrength = 0.65; // Strong gravitational deflection

    if (deathState.neutronStar?.isPulsar) {
      pulsarBeamAngleRad = 0.35; // ~20 degree relativistic emission cone
    }

    // Supernova remnant shell overlay during explosive phase
    if (deathState.supernova && deathState.supernova.lightCurveFraction > 0.001) {
      envelopeVisualRadius = Math.min(60.0, Math.max(4.0, 3.0 * Math.pow(deathState.supernova.ejectaRadiusAU, 0.45)));
      glowColor = '#ff3366'; // High-energy synchrotron magenta/crimson
      bloomIntensity = Math.min(5.0, 2.5 + deathState.supernova.lightCurveFraction * 3.0);
    }
  } else {
    // ── Black Hole: Non-luminous dark event horizon with accretion ring & lensing ──
    coreHexColor = '#000000'; // Pure dark event horizon
    glowColor = '#ff8800'; // Golden accretion glow
    visualRadiusExploration = Math.min(3.5, Math.max(0.7, 0.6 * Math.pow(deathState.currentMassSolar, 0.4)));
    visualRadiusScientific = Math.max(0.005, deathState.radiusSolar);
    brightness = deathState.blackHole?.hasAccretionDisk ? 0.95 : 0.1;
    bloomIntensity = deathState.blackHole?.hasAccretionDisk ? 2.8 : 0.4;
    lensingStrength = 0.95; // Extreme spacetime curvature
    diskColor = deathState.blackHole && deathState.blackHole.innerDiskTemperatureK > 5.0e6 ? '#ffeedd' : '#ff9933';

    // Supernova remnant shell if young
    if (deathState.supernova && deathState.supernova.lightCurveFraction > 0.001) {
      envelopeVisualRadius = Math.min(60.0, Math.max(4.0, 3.0 * Math.pow(deathState.supernova.ejectaRadiusAU, 0.45)));
    }
  }

  return {
    coreHexColor,
    glowColor,
    visualRadiusExploration,
    visualRadiusScientific,
    envelopeVisualRadius,
    brightness,
    bloomIntensity,
    lensingStrength,
    pulsarBeamAngleRad,
    diskColor,
  };
}
