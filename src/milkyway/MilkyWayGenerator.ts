/**
 * MilkyWayGenerator.ts
 * High-performance deterministic GPU typed-array generator for the Milky Way.
 * Generates Bulge, Bar, Thin Disk, Thick Disk, Spiral Arms, Stellar Halo,
 * Globular Clusters, and Interstellar Dust absorption lanes.
 */

import type {
  MilkyWayParameters,
  MilkyWayGeometryData,
  GlobularClusterData,
} from './MilkyWayTypes';
import { MILKY_WAY_SPIRAL_ARMS } from './MilkyWayConfig';
import { sampleSpiralArmPoint } from './SpiralArm';
import { createSeededRNG, randomInSphere } from '../utils/mathUtils';
import { randomStarTemperature, temperatureToColor } from '../utils/colorUtils';

export function generateMilkyWayGeometry(
  params: MilkyWayParameters,
  globularClusters: GlobularClusterData[],
  particleScale = 1.0
): MilkyWayGeometryData {
  const rng = createSeededRNG(params.seed);

  const totalStars = Math.round(params.totalStarParticles * particleScale);
  const totalDust = Math.round(params.dustParticles * particleScale);

  // Stellar budget partition
  const bulgeStars = Math.round(totalStars * 0.16);
  const barStars   = Math.round(totalStars * 0.12);
  const armStars   = Math.round(totalStars * 0.40);
  const thinStars  = Math.round(totalStars * 0.16);
  const thickStars = Math.round(totalStars * 0.10);
  const haloStars  = Math.round(totalStars * 0.04);
  const gcStars    = Math.min(2000, Math.round(globularClusters.length * 12 * particleScale));

  const actualTotalStars = bulgeStars + barStars + armStars + thinStars + thickStars + haloStars + gcStars;

  // Star Buffer Arrays
  const positions        = new Float32Array(actualTotalStars * 3);
  const colors           = new Float32Array(actualTotalStars * 3);
  const sizes            = new Float32Array(actualTotalStars);
  const opacities        = new Float32Array(actualTotalStars);
  const types            = new Float32Array(actualTotalStars);
  const orbitalDistances = new Float32Array(actualTotalStars);
  const angles           = new Float32Array(actualTotalStars);

  let starIdx = 0;

  function addStar(
    x: number,
    y: number,
    z: number,
    temp: number,
    size: number,
    opacity: number,
    typeTag: number
  ) {
    const i3 = starIdx * 3;
    positions[i3]     = x;
    positions[i3 + 1] = y;
    positions[i3 + 2] = z;

    const [r, g, b] = temperatureToColor(temp);
    colors[i3]     = r;
    colors[i3 + 1] = g;
    colors[i3 + 2] = b;

    sizes[starIdx]     = size;
    opacities[starIdx] = opacity;
    types[starIdx]     = typeTag;

    const dist = Math.sqrt(x * x + z * z);
    orbitalDistances[starIdx] = dist;
    angles[starIdx] = Math.atan2(z, x);

    starIdx++;
  }

  const R_gal = params.sceneRadius;

  // ── 1. Central Bulge (Warm, older population, de Vaucouleurs R^1/4 profile) ──
  const bulgeRadiusVisual = (params.bulgeRadiusKpc / 15.0) * R_gal;
  for (let i = 0; i < bulgeStars; i++) {
    const u = Math.max(1e-5, rng());
    const r = Math.pow(-Math.log(u), 0.4) * bulgeRadiusVisual * 0.55;
    const pt = randomInSphere(1.0, rng);
    const norm = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z) || 1;

    // Oblate spheroid (c/a ~ 0.75)
    const x = (pt.x / norm) * r;
    const y = (pt.y / norm) * r * 0.75;
    const z = (pt.z / norm) * r;

    // Population II stars: 3,500K - 5,500K (Warm yellow/orange/red)
    const temp = 3500 + rng() * 2000;
    const size = 1.0 + rng() * 1.6;
    const opacity = 0.55 + rng() * 0.45;

    addStar(x, y, z, temp, size, opacity, 0.0);
  }

  // ── 2. Central Bar (Elongated triaxial structure oriented at ~29°) ──────────
  const barLenVisual = (params.barLengthKpc / 15.0) * R_gal;
  const barWidVisual = (params.barWidthKpc / 15.0) * R_gal;
  const barAng = params.barAngleRad;
  const cosB = Math.cos(barAng);
  const sinB = Math.sin(barAng);

  for (let i = 0; i < barStars; i++) {
    const t = (rng() - 0.5) * 2.0;
    const barX = t * barLenVisual * (1.0 - 0.2 * Math.abs(t)); // Boxy tapered ends
    const barZ = (rng() - 0.5) * 2.0 * barWidVisual * Math.sqrt(Math.max(0.01, 1.0 - t * t));
    const barY = (rng() - 0.5) * 2.0 * barWidVisual * 0.4 * (1.0 - Math.abs(t) * 0.5);

    // Rotate into galactic orientation
    const x = barX * cosB - barZ * sinB;
    const z = barX * sinB + barZ * cosB;
    const y = barY;

    // Warm bar stars (4,000K - 6,200K)
    const temp = 4000 + rng() * 2200;
    const size = 1.1 + rng() * 1.5;
    const opacity = 0.50 + rng() * 0.45;

    addStar(x, y, z, temp, size, opacity, 1.0);
  }

  // ── 3. Major Spiral Arms & Starburst Knots ─────────────────────────────────
  const armDefs = MILKY_WAY_SPIRAL_ARMS;
  for (let i = 0; i < armStars; i++) {
    // Select arm weighted by particleFraction
    const armRoll = rng();
    let accumulated = 0;
    let selectedArm = armDefs[0];
    for (const arm of armDefs) {
      accumulated += arm.particleFraction;
      if (armRoll <= accumulated) {
        selectedArm = arm;
        break;
      }
    }

    const progress = Math.pow(rng(), 0.85); // Denser near inner disk
    const { positionKpc, isClump } = sampleSpiralArmPoint(selectedArm, progress, rng);

    // Map kpc to scene coordinates (15 kpc = R_gal)
    const scaleFactor = R_gal / 15.0;
    const x = positionKpc[0] * scaleFactor;
    const y = positionKpc[1] * scaleFactor;
    const z = positionKpc[2] * scaleFactor;

    let temp: number;
    let size: number;
    let opacity: number;

    if (isClump) {
      // Massive young OB associations & HII regions (12,000K - 32,000K, luminous blue)
      temp = 12000 + rng() * 20000;
      size = 1.6 + rng() * 2.2;
      opacity = 0.85 + rng() * 0.15;
    } else {
      // Mixed disk population with blue arm bias
      temp = randomStarTemperature(rng) + selectedArm.colorBias * 3500;
      size = 0.9 + rng() * 1.4;
      opacity = 0.45 + rng() * 0.50;
    }

    addStar(x, y, z, temp, size, opacity, 4.0);
  }

  // ── 4. Thin Galactic Disk (z0 ~ 300 pc, blue/white + intermediate stars) ───
  const thinDiskHVisual = (params.thinDiskScaleHeightPc / 15000.0) * R_gal;
  for (let i = 0; i < thinStars; i++) {
    // Exponential radial falloff
    const rFrac = -Math.log(Math.max(1e-5, rng())) * 0.38;
    const r = Math.min(R_gal * 1.15, (0.05 + rFrac) * R_gal);
    const theta = rng() * Math.PI * 2;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    // sech^2 vertical profile approximation
    const y = (rng() - 0.5) * 2.0 * thinDiskHVisual * (rng() > 0.5 ? 1 : -1) * -Math.log(Math.max(1e-4, rng()));

    const temp = randomStarTemperature(rng);
    const size = 0.85 + rng() * 1.3;
    const opacity = 0.40 + rng() * 0.45;

    addStar(x, y, z, temp, size, opacity, 2.0);
  }

  // ── 5. Thick Galactic Disk (z0 ~ 1000 pc, older Population II stars) ───────
  const thickDiskHVisual = (params.thickDiskScaleHeightPc / 15000.0) * R_gal;
  for (let i = 0; i < thickStars; i++) {
    const rFrac = -Math.log(Math.max(1e-5, rng())) * 0.45;
    const r = Math.min(R_gal * 1.25, (0.08 + rFrac) * R_gal);
    const theta = rng() * Math.PI * 2;

    const x = r * Math.cos(theta);
    const z = r * Math.sin(theta);
    const y = (rng() - 0.5) * 2.0 * thickDiskHVisual * -Math.log(Math.max(1e-4, rng()));

    // Older stellar population (3,800K - 6,000K, yellow/orange)
    const temp = 3800 + rng() * 2200;
    const size = 0.8 + rng() * 1.1;
    const opacity = 0.30 + rng() * 0.40;

    addStar(x, y, z, temp, size, opacity, 3.0);
  }

  // ── 6. Stellar Halo (Diffuse outer spheroid out to ~35-40 kpc) ──────────────
  const haloRadiusVisual = (params.haloRadiusKpc / 15.0) * R_gal;
  for (let i = 0; i < haloStars; i++) {
    const u = Math.max(1e-5, rng());
    const r = Math.pow(u, 0.4) * haloRadiusVisual;
    const pt = randomInSphere(1.0, rng);
    const norm = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z) || 1;

    const x = (pt.x / norm) * r;
    const y = (pt.y / norm) * r * 0.75;
    const z = (pt.z / norm) * r;

    // Ancient low-metallicity Population II (3,200K - 5,200K)
    const temp = 3200 + rng() * 2000;
    const size = 0.75 + rng() * 0.9;
    const opacity = 0.18 + rng() * 0.30;

    addStar(x, y, z, temp, size, opacity, 5.0);
  }

  // ── 7. Globular Cluster Stars (Compact spherical point swarms) ─────────────
  for (const gc of globularClusters) {
    const starsInCluster = Math.max(8, Math.round(gcStars / globularClusters.length));
    const gcRadiusVisual = (gc.radiusLy / 50000.0) * R_gal * 0.8;

    for (let k = 0; k < starsInCluster && starIdx < actualTotalStars; k++) {
      const pt = randomInSphere(1.0, rng);
      const norm = Math.sqrt(pt.x * pt.x + pt.y * pt.y + pt.z * pt.z) || 1;
      const r = Math.pow(rng(), 2.0) * gcRadiusVisual; // High central density (King profile)

      const x = gc.position[0] + (pt.x / norm) * r;
      const y = gc.position[1] + (pt.y / norm) * r;
      const z = gc.position[2] + (pt.z / norm) * r;

      const temp = 3800 + rng() * 2500;
      const size = 1.1 + rng() * 1.6;
      const opacity = 0.70 + rng() * 0.30;

      addStar(x, y, z, temp, size, opacity, 6.0);
    }
  }

  // ── 8. Interstellar Dust Absorption Lanes ───────────────────────────────────
  const dustPositions = new Float32Array(totalDust * 3);
  const dustColors    = new Float32Array(totalDust * 3);
  const dustSizes     = new Float32Array(totalDust);
  const dustOpacities = new Float32Array(totalDust);

  for (let i = 0; i < totalDust; i++) {
    const i3 = i * 3;

    // 80% concentrated along spiral arms, 20% general midplane
    if (rng() < 0.80) {
      const armIdx = Math.floor(rng() * armDefs.length);
      const arm = armDefs[armIdx];
      const progress = 0.1 + rng() * 0.85;
      const { positionKpc } = sampleSpiralArmPoint(arm, progress, rng);

      const scaleFactor = R_gal / 15.0;
      // Slight inward offset to match trailing edge dark absorption lanes
      dustPositions[i3]     = positionKpc[0] * scaleFactor * 0.96;
      dustPositions[i3 + 1] = positionKpc[1] * scaleFactor * 0.5; // Very thin dust disk
      dustPositions[i3 + 2] = positionKpc[2] * scaleFactor * 0.96;
    } else {
      const r = (0.15 + rng() * 0.85) * R_gal;
      const theta = rng() * Math.PI * 2;
      dustPositions[i3]     = r * Math.cos(theta);
      dustPositions[i3 + 1] = (rng() - 0.5) * thinDiskHVisual * 0.6;
      dustPositions[i3 + 2] = r * Math.sin(theta);
    }

    // Absorption color: dark brown/charcoal with faint warm scattering
    dustColors[i3]     = 0.04 + rng() * 0.03;
    dustColors[i3 + 1] = 0.02 + rng() * 0.02;
    dustColors[i3 + 2] = 0.01 + rng() * 0.01;

    dustSizes[i]     = 5.0 + rng() * 9.0;
    dustOpacities[i] = 0.35 + rng() * 0.45;
  }

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
    coreColor: [1.0, 0.90, 0.72],
    coreRadius: bulgeRadiusVisual * 0.45,
    coreIntensity: params.coreLuminosity,
  };
}
