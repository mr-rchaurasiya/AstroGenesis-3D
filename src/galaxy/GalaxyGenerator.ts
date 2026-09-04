/**
 * GalaxyGenerator.ts
 * Deterministic procedural generator for all galaxy morphologies.
 * Translates GalaxyParameters into GPU-ready typed array buffers with 0 React component overhead.
 */

import * as THREE from 'three';
import type { GalaxyParameters, GalaxyGeometryData } from './GalaxyTypes';
import {
  sampleExponentialDiskRadius,
  sampleVerticalScaleHeight,
  sampleSersicRadius,
  computeSpiralArmPosition,
  computeIrregularPosition,
} from '../utils/galaxyMathUtils';
import {
  createSeededRNG,
  randomOnSphere,
  clamp,
} from '../utils/mathUtils';
import {
  randomStarTemperature,
  temperatureToColor,
} from '../utils/colorUtils';

export function generateGalaxyGeometry(
  params: GalaxyParameters,
  particleScale: number = 1.0,
): GalaxyGeometryData {
  const rng = createSeededRNG(params.seed);
  const totalStars = Math.max(800, Math.round(params.starParticleCount * particleScale));
  const totalDust = Math.max(100, Math.round(params.dustParticleCount * particleScale));

  const positions = new Float32Array(totalStars * 3);
  const colors = new Float32Array(totalStars * 3);
  const sizes = new Float32Array(totalStars);
  const opacities = new Float32Array(totalStars);
  const types = new Float32Array(totalStars);
  const orbitalDistances = new Float32Array(totalStars);
  const angles = new Float32Array(totalStars);

  let starIdx = 0;

  // ── Helper to push a star into GPU buffers ─────────────────────────────────
  const addStar = (
    pos: THREE.Vector3,
    tempK: number,
    baseSize: number,
    opacity: number,
    starType: number,
  ) => {
    positions[starIdx * 3]     = pos.x;
    positions[starIdx * 3 + 1] = pos.y;
    positions[starIdx * 3 + 2] = pos.z;

    // Apply temperature and population color bias
    let col = temperatureToColor(tempK);
    if (params.temperatureBias !== 0) {
      if (params.temperatureBias > 0) {
        // Bias towards younger blue
        col.lerp(new THREE.Color(0.6, 0.8, 1.0), params.temperatureBias * 0.4);
      } else {
        // Bias towards older warm amber/red
        col.lerp(new THREE.Color(1.0, 0.75, 0.4), Math.abs(params.temperatureBias) * 0.5);
      }
    }

    colors[starIdx * 3]     = col.r;
    colors[starIdx * 3 + 1] = col.g;
    colors[starIdx * 3 + 2] = col.b;

    sizes[starIdx] = baseSize * (0.7 + rng() * 0.6);
    opacities[starIdx] = clamp(opacity, 0.1, 1.0);
    types[starIdx] = starType;

    const r = Math.sqrt(pos.x * pos.x + pos.z * pos.z);
    orbitalDistances[starIdx] = r;
    angles[starIdx] = Math.atan2(pos.z, pos.x);

    starIdx++;
  };

  const R = params.sceneRadius;

  // ── 1. SPIRAL & BARRED SPIRAL GENERATION ──────────────────────────────────
  if (params.morphology === 'spiral' || params.morphology === 'barred-spiral') {
    const isBarred = params.morphology === 'barred-spiral';
    const bulgeCount = Math.round(totalStars * (params.bulgeRatio + 0.05));
    const armCount = Math.round(totalStars * 0.42);
    const diskCount = totalStars - bulgeCount - armCount;

    const barLength = isBarred ? R * params.barLengthRatio : 0;
    const barWidth = isBarred ? R * params.barWidthRatio : 0;

    // A. Central Bulge (Sérsic Spheroid, older yellow/orange stars)
    const bulgeRadius = R * params.bulgeRatio;
    for (let i = 0; i < bulgeCount; i++) {
      const r = sampleSersicRadius(bulgeRadius * 0.4, bulgeRadius, 3.5, rng);
      const spherePoint = randomOnSphere(r, rng);
      // Flatten bulge vertically slightly
      spherePoint.y *= 0.65;

      const temp = 3600 + rng() * 2200; // Cooler 3600K–5800K
      const coreBoost = 1.0 - (r / bulgeRadius);
      addStar(spherePoint, temp, (1.2 + coreBoost * 1.5) * params.coreBrightness, 0.85 + coreBoost * 0.15, 0);
    }

    // B. Spiral Arms (Logarithmic density waves, young blue stars + OB associations)
    for (let i = 0; i < armCount; i++) {
      const armIndex = i % params.armCount;
      const t = rng(); // Along arm progress [0, 1]

      const armResult = computeSpiralArmPosition(
        armIndex,
        params.armCount,
        t,
        R,
        Math.max(bulgeRadius * 0.8, barLength * 0.8),
        params.armTightness,
        params.armWidth,
        isBarred,
        barLength,
        barWidth,
        rng,
      );

      // Higher temperature (hot young O/B/A stars in arm starburst knots: 7,500K–28,000K)
      let temp = 7500 + rng() * 20000;
      if (rng() < 0.2) temp = 4500 + rng() * 2000; // Some background disk stars in arms

      const size = (1.1 + (1.0 - armResult.distanceFromArmCenter) * 1.4) * (0.8 + 0.4 * (1.0 - t));
      addStar(armResult.position, temp, size, 0.75 + (1.0 - armResult.distanceFromArmCenter) * 0.25, 2);
    }

    // C. Galactic Disk (Exponential falloff, mixed stellar population)
    const diskScaleLength = R * 0.35;
    const diskScaleHeight = R * params.diskThicknessRatio;
    for (let i = 0; i < diskCount; i++) {
      const r = sampleExponentialDiskRadius(R, diskScaleLength, rng);
      const theta = rng() * Math.PI * 2.0;
      const y = sampleVerticalScaleHeight(diskScaleHeight, rng);

      const pos = new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
      const temp = randomStarTemperature(rng);
      const brightness = 1.0 - (r / R) * 0.5;

      addStar(pos, temp, 0.9 * brightness, 0.6 * brightness, 1);
    }
  }

  // ── 2. ELLIPTICAL GALAXY GENERATION ───────────────────────────────────────
  else if (params.morphology === 'elliptical') {
    const effectiveRadius = R * 0.4;
    for (let i = 0; i < totalStars; i++) {
      const r = sampleSersicRadius(effectiveRadius, R, params.sersicIndex, rng);
      const spherePoint = randomOnSphere(r, rng);

      // Apply triaxial / elliptical flattening
      spherePoint.y *= (1.0 - params.ellipticity * 0.8);
      spherePoint.z *= (1.0 - params.ellipticity * 0.3);

      // Older population: K and M dwarfs, orange giants (3,000K–5,500K)
      const temp = 3000 + rng() * 2600;
      const coreFactor = Math.exp(-r / (R * 0.25));
      const size = (0.9 + coreFactor * 1.8) * params.coreBrightness;

      addStar(spherePoint, temp, size, 0.7 + coreFactor * 0.3, 0);
    }
  }

  // ── 3. IRREGULAR & DWARF GALAXY GENERATION ─────────────────────────────────
  else {
    for (let i = 0; i < totalStars; i++) {
      const pos = computeIrregularPosition(R, params.clumpiness, params.asymmetryFactor, rng);

      let temp = randomStarTemperature(rng);
      // Irregulars have patchy hot blue starbursts
      if (params.morphology === 'irregular' || params.morphology === 'dwarf-irregular') {
        if (rng() < 0.4) temp = 9000 + rng() * 20000;
      }

      const r = pos.length();
      const normDist = r / R;
      const size = (0.8 + rng() * 0.8) * (1.0 - normDist * 0.3);

      addStar(pos, temp, size, 0.65 * (1.0 - normDist * 0.4), 3);
    }
  }

  // ── DUST GENERATION (For Spirals and Dusty Peculiar Galaxies) ──────────────
  let dustPositions: Float32Array | undefined;
  let dustColors: Float32Array | undefined;
  let dustSizes: Float32Array | undefined;
  let dustOpacities: Float32Array | undefined;

  if (params.dustParticleCount > 0 && params.dustAbsorption > 0.05) {
    dustPositions = new Float32Array(totalDust * 3);
    dustColors = new Float32Array(totalDust * 3);
    dustSizes = new Float32Array(totalDust);
    dustOpacities = new Float32Array(totalDust);

    const dustTones = [
      new THREE.Color(0.12, 0.08, 0.05), // Warm carbon dust
      new THREE.Color(0.06, 0.05, 0.07), // Opaque silhouette lane
      new THREE.Color(0.16, 0.09, 0.04), // Warm amber dust front
    ];

    for (let i = 0; i < totalDust; i++) {
      let dPos: THREE.Vector3;

      if (params.morphology === 'spiral' || params.morphology === 'barred-spiral') {
        // Dust traces the inner edge of spiral arms
        const armIndex = i % params.armCount;
        const t = 0.1 + rng() * 0.85;
        const armResult = computeSpiralArmPosition(
          armIndex,
          params.armCount,
          t,
          R * 0.95,
          R * params.bulgeRatio * 0.7,
          params.armTightness,
          params.armWidth * 0.7, // Tighter dust lane
          params.morphology === 'barred-spiral',
          R * params.barLengthRatio,
          R * params.barWidthRatio,
          rng,
        );
        dPos = armResult.position;
      } else {
        // Diffuse dust disc / band
        const r = sampleExponentialDiskRadius(R * 0.8, R * 0.3, rng);
        const theta = rng() * Math.PI * 2.0;
        const y = sampleVerticalScaleHeight(R * 0.02, rng);
        dPos = new THREE.Vector3(r * Math.cos(theta), y, r * Math.sin(theta));
      }

      dustPositions[i * 3]     = dPos.x;
      dustPositions[i * 3 + 1] = dPos.y;
      dustPositions[i * 3 + 2] = dPos.z;

      const tone = dustTones[Math.floor(rng() * dustTones.length)];
      dustColors[i * 3]     = tone.r;
      dustColors[i * 3 + 1] = tone.g;
      dustColors[i * 3 + 2] = tone.b;

      dustSizes[i] = 18.0 + rng() * 24.0;
      dustOpacities[i] = params.dustAbsorption * (0.3 + rng() * 0.4);
    }
  }

  // Core glow properties
  let coreColor: [number, number, number] = [1.0, 0.92, 0.78];
  if (params.temperatureBias < -0.2) coreColor = [1.0, 0.82, 0.58]; // Warm yellow-red
  if (params.temperatureBias > 0.2) coreColor = [0.85, 0.92, 1.0];   // Blue-white

  return {
    positions,
    colors,
    sizes,
    opacities,
    types,
    orbitalDistances,
    angles,
    dustPositions,
    dustColors,
    dustSizes,
    dustOpacities,
    coreColor,
    coreRadius: R * (params.bulgeRatio > 0 ? params.bulgeRatio * 0.75 : 0.15),
    coreIntensity: params.coreBrightness,
  };
}
