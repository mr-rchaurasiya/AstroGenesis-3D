/**
 * Performance Constants & Preset Configurations
 * Phase 12 - Performance, Polish & Production Hardening
 */

import type { QualityConfig, QualityLevel, RenderBudget, LODThresholds } from './PerformanceTypes';

export const QUALITY_CONFIGS: Record<QualityLevel, QualityConfig> = {
  LOW: {
    name: 'LOW',
    particleMultiplier: 0.3,
    shadowsEnabled: false,
    bloomEnabled: false,
    antiAliasing: false,
    maxDrawDistanceMultiplier: 0.6,
    geometryResolutionMultiplier: 0.5,
    shaderQualityTier: 'LOW',
    maxStarfieldParticles: 5000,
  },
  MEDIUM: {
    name: 'MEDIUM',
    particleMultiplier: 0.6,
    shadowsEnabled: true,
    bloomEnabled: true,
    antiAliasing: true,
    maxDrawDistanceMultiplier: 0.8,
    geometryResolutionMultiplier: 0.75,
    shaderQualityTier: 'MEDIUM',
    maxStarfieldParticles: 15000,
  },
  HIGH: {
    name: 'HIGH',
    particleMultiplier: 1.0,
    shadowsEnabled: true,
    bloomEnabled: true,
    antiAliasing: true,
    maxDrawDistanceMultiplier: 1.0,
    geometryResolutionMultiplier: 1.0,
    shaderQualityTier: 'HIGH',
    maxStarfieldParticles: 35000,
  },
  ULTRA: {
    name: 'ULTRA',
    particleMultiplier: 1.5,
    shadowsEnabled: true,
    bloomEnabled: true,
    antiAliasing: true,
    maxDrawDistanceMultiplier: 1.5,
    geometryResolutionMultiplier: 1.25,
    shaderQualityTier: 'HIGH',
    maxStarfieldParticles: 50000,
  },
  AUTO: {
    name: 'AUTO',
    particleMultiplier: 1.0,
    shadowsEnabled: true,
    bloomEnabled: true,
    antiAliasing: true,
    maxDrawDistanceMultiplier: 1.0,
    geometryResolutionMultiplier: 1.0,
    shaderQualityTier: 'HIGH',
    maxStarfieldParticles: 35000,
  },
};

export const DEFAULT_RENDER_BUDGET: RenderBudget = {
  targetFps: 60,
  maxFrameTimeMs: 16.67,
  maxDrawCalls: 150,
  maxTriangles: 1_000_000,
};

export const DEFAULT_LOD_THRESHOLDS: LODThresholds = {
  lod0Distance: 50,    // < 50 scene units -> LOD 0 (High)
  lod1Distance: 200,   // 50..200 -> LOD 1 (Medium)
  lod2Distance: 800,   // 200..800 -> LOD 2 (Low)
  lod3Distance: 2500,  // > 800 -> LOD 3 (Impostor/Culled)
};

export const AUTO_QUALITY_SETTINGS = {
  sampleWindowSize: 60,         // 60 frames (~1 sec at 60fps)
  emaAlpha: 0.05,               // Exponential moving average smoothing factor
  downgradeFpsThreshold: 35.0,  // Drop quality if smoothed FPS drops below 35
  upgradeFpsThreshold: 56.0,    // Boost quality if smoothed FPS stays above 56
  minDwellTimeMs: 3000,         // Minimum 3.0s between quality shifts to prevent oscillation
};
