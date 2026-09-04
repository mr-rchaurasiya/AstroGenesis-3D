/**
 * Performance & Quality System Types
 * Phase 12 - Performance, Polish & Production Hardening
 */

export type QualityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA' | 'AUTO';

export type EffectiveQuality = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

export type LODLevel = 0 | 1 | 2 | 3; // 0 = Ultra Close / Full, 1 = Medium, 2 = Far, 3 = Impostor / Cullable

export interface QualityConfig {
  name: QualityLevel;
  particleMultiplier: number;
  shadowsEnabled: boolean;
  bloomEnabled: boolean;
  antiAliasing: boolean;
  maxDrawDistanceMultiplier: number;
  geometryResolutionMultiplier: number;
  shaderQualityTier: 'LOW' | 'MEDIUM' | 'HIGH';
  maxStarfieldParticles: number;
}

export interface FrameMetrics {
  fps: number;
  frameTimeMs: number;
  drawCalls: number;
  triangles: number;
  geometries: number;
  textures: number;
}

export interface RenderBudget {
  targetFps: number;
  maxFrameTimeMs: number;
  maxDrawCalls: number;
  maxTriangles: number;
}

export interface LODThresholds {
  lod0Distance: number; // Full detail
  lod1Distance: number; // Medium detail
  lod2Distance: number; // Low detail / simplified
  lod3Distance: number; // Distant impostor or culled
}

export interface ObjectLODState {
  objectId: string;
  distanceToCamera: number;
  lodLevel: LODLevel;
  isImportant: boolean; // Selected or focused objects never culled
}
