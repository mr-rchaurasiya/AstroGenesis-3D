/**
 * Quality Manager & Adaptive Auto-Quality Engine
 * Phase 12 - Performance, Polish & Production Hardening
 */

import type { QualityLevel, EffectiveQuality, QualityConfig } from './PerformanceTypes';
import { QUALITY_CONFIGS, AUTO_QUALITY_SETTINGS } from './PerformanceConstants';

export type QualityChangeListener = (quality: QualityLevel, effective: EffectiveQuality) => void;

export class QualityManager {
  private mode: QualityLevel = 'AUTO';
  private effectiveQuality: EffectiveQuality = 'HIGH';
  private smoothedFps: number = 60.0;
  private lastQualityShiftTime: number = 0;
  private listeners: Set<QualityChangeListener> = new Set();

  constructor(initialMode: QualityLevel = 'AUTO') {
    this.setMode(initialMode);
  }

  public getMode(): QualityLevel {
    return this.mode;
  }

  public getEffectiveQuality(): EffectiveQuality {
    return this.effectiveQuality;
  }

  public getEffectiveConfig(): QualityConfig {
    return QUALITY_CONFIGS[this.effectiveQuality];
  }

  public getSmoothedFps(): number {
    return this.smoothedFps;
  }

  public setMode(newMode: QualityLevel): void {
    this.mode = newMode;
    if (newMode !== 'AUTO') {
      this.effectiveQuality = newMode;
    }
    this.notifyListeners();
  }

  /**
   * Records a new frame delta and updates smoothed FPS using Exponential Moving Average.
   * If in AUTO mode, evaluates anti-oscillation hysteresis rules for adaptive scaling.
   */
  public recordFrame(deltaSeconds: number, currentTimeMs: number = Date.now()): void {
    if (deltaSeconds <= 0) return;
    const instantFps = Math.min(240, 1.0 / deltaSeconds);
    const alpha = AUTO_QUALITY_SETTINGS.emaAlpha;
    this.smoothedFps = alpha * instantFps + (1 - alpha) * this.smoothedFps;

    if (this.mode === 'AUTO') {
      this.evaluateAutoQuality(currentTimeMs);
    }
  }

  /**
   * Deterministic test helper for testing EMA updates directly without Date.now() side effects.
   */
  public updateSmoothedFps(instantFps: number): void {
    const alpha = AUTO_QUALITY_SETTINGS.emaAlpha;
    this.smoothedFps = alpha * instantFps + (1 - alpha) * this.smoothedFps;
  }

  /**
   * Evaluates if effective quality should adapt based on smoothed FPS and hysteresis timers.
   */
  public evaluateAutoQuality(currentTimeMs: number): boolean {
    if (this.mode !== 'AUTO') return false;

    const timeSinceLastShift = currentTimeMs - this.lastQualityShiftTime;
    if (timeSinceLastShift < AUTO_QUALITY_SETTINGS.minDwellTimeMs) {
      return false; // In dwell protection period to prevent flickering
    }

    const current = this.effectiveQuality;
    let next: EffectiveQuality = current;

    if (this.smoothedFps < AUTO_QUALITY_SETTINGS.downgradeFpsThreshold) {
      // Downgrade
      if (current === 'ULTRA') next = 'HIGH';
      else if (current === 'HIGH') next = 'MEDIUM';
      else if (current === 'MEDIUM') next = 'LOW';
    } else if (this.smoothedFps > AUTO_QUALITY_SETTINGS.upgradeFpsThreshold) {
      // Upgrade
      if (current === 'LOW') next = 'MEDIUM';
      else if (current === 'MEDIUM') next = 'HIGH';
      else if (current === 'HIGH') next = 'ULTRA';
    }

    if (next !== current) {
      this.effectiveQuality = next;
      this.lastQualityShiftTime = currentTimeMs;
      this.notifyListeners();
      return true;
    }

    return false;
  }

  public subscribe(listener: QualityChangeListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    for (const listener of this.listeners) {
      listener(this.mode, this.effectiveQuality);
    }
  }
}

export const globalQualityManager = new QualityManager();
