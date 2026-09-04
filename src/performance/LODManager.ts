/**
 * Level of Detail (LOD) Manager
 * Phase 12 - Performance, Polish & Production Hardening
 */

import type { LODLevel, LODThresholds, QualityLevel } from './PerformanceTypes';
import { DEFAULT_LOD_THRESHOLDS, QUALITY_CONFIGS } from './PerformanceConstants';

export class LODManager {
  private thresholds: LODThresholds;

  constructor(thresholds: LODThresholds = DEFAULT_LOD_THRESHOLDS) {
    this.thresholds = { ...thresholds };
  }

  public setThresholds(thresholds: Partial<LODThresholds>): void {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }

  public getThresholds(): LODThresholds {
    return { ...this.thresholds };
  }

  /**
   * Calculates the appropriate LOD level based on camera distance, object importance, and quality level.
   * Important objects (e.g. focused / selected) are never degraded past LOD 1.
   */
  public calculateLOD(
    distance: number,
    isImportant: boolean = false,
    quality: QualityLevel = 'HIGH'
  ): LODLevel {
    const validDistance = Math.max(0, isNaN(distance) ? 0 : distance);
    const multiplier = QUALITY_CONFIGS[quality]?.maxDrawDistanceMultiplier ?? 1.0;

    const t0 = this.thresholds.lod0Distance * multiplier;
    const t1 = this.thresholds.lod1Distance * multiplier;
    const t2 = this.thresholds.lod2Distance * multiplier;

    let lod: LODLevel;

    if (validDistance <= t0) {
      lod = 0;
    } else if (validDistance <= t1) {
      lod = 1;
    } else if (validDistance <= t2) {
      lod = 2;
    } else {
      lod = 3;
    }

    // Safety rule: Important objects are capped at LOD 1 maximum even at extreme distances
    if (isImportant && lod > 1) {
      return 1;
    }

    return lod;
  }

  /**
   * Determines if an object should be completely culled from rendering.
   * Important objects are NEVER culled.
   */
  public shouldCull(
    distance: number,
    isImportant: boolean = false,
    maxDistance?: number
  ): boolean {
    if (isImportant) return false;
    const limit = maxDistance ?? this.thresholds.lod3Distance;
    return distance > limit;
  }

  /**
   * Returns a geometry resolution scale factor for a given LOD level.
   */
  public getGeometryResolutionScale(lod: LODLevel): number {
    switch (lod) {
      case 0: return 1.0;
      case 1: return 0.6;
      case 2: return 0.35;
      case 3: return 0.15;
      default: return 1.0;
    }
  }

  /**
   * Computes the effective particle budget based on baseline count, LOD tier, and Quality setting.
   */
  public calculateParticleBudget(
    baseCount: number,
    lod: LODLevel,
    quality: QualityLevel = 'HIGH'
  ): number {
    const safeBase = Math.max(0, Math.floor(baseCount));
    const qualityMultiplier = QUALITY_CONFIGS[quality]?.particleMultiplier ?? 1.0;
    const lodMultiplier = this.getGeometryResolutionScale(lod);

    return Math.max(1, Math.floor(safeBase * qualityMultiplier * lodMultiplier));
  }
}

export const globalLODManager = new LODManager();
