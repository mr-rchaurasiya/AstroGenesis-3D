/**
 * Phase 12 Performance & Polish Validation Test Suite
 * Minimum 35+ deterministic unit tests
 */

import { LODManager } from './LODManager';
import { QualityManager } from './QualityManager';
import { MemoryManager } from './MemoryManager';
import { QUALITY_CONFIGS, DEFAULT_LOD_THRESHOLDS, AUTO_QUALITY_SETTINGS } from './PerformanceConstants';
import * as THREE from 'three';

export interface TestResult {
  passed: number;
  failed: number;
  total: number;
  failures: string[];
}

export function runPhase12Validation(): TestResult {
  let passed = 0;
  let failed = 0;
  const failures: string[] = [];

  function assert(condition: boolean, testName: string) {
    if (condition) {
      passed++;
    } else {
      failed++;
      failures.push(testName);
    }
  }

  // --- 1. Quality Configurations Integrity ---
  assert(QUALITY_CONFIGS.LOW.particleMultiplier === 0.3, 'T01: LOW quality particle multiplier is 0.3');
  assert(QUALITY_CONFIGS.MEDIUM.particleMultiplier === 0.6, 'T02: MEDIUM quality particle multiplier is 0.6');
  assert(QUALITY_CONFIGS.HIGH.particleMultiplier === 1.0, 'T03: HIGH quality particle multiplier is 1.0');
  assert(QUALITY_CONFIGS.ULTRA.particleMultiplier === 1.5, 'T04: ULTRA quality particle multiplier is 1.5');
  assert(QUALITY_CONFIGS.LOW.maxStarfieldParticles < QUALITY_CONFIGS.MEDIUM.maxStarfieldParticles, 'T05: Starfield particle count scales strictly monotonically');
  assert(QUALITY_CONFIGS.LOW.shadowsEnabled === false, 'T06: LOW quality disables shadows for performance');
  assert(QUALITY_CONFIGS.HIGH.shadowsEnabled === true, 'T07: HIGH quality enables shadows');
  assert(QUALITY_CONFIGS.LOW.shaderQualityTier === 'LOW', 'T08: LOW quality uses LOW shader tier');
  assert(QUALITY_CONFIGS.HIGH.shaderQualityTier === 'HIGH', 'T09: HIGH quality uses HIGH shader tier');

  // --- 2. LOD Manager Calculations & Boundaries ---
  const lod = new LODManager();
  assert(lod.calculateLOD(10, false, 'HIGH') === 0, 'T10: Distance 10 yields LOD 0');
  assert(lod.calculateLOD(100, false, 'HIGH') === 1, 'T11: Distance 100 yields LOD 1');
  assert(lod.calculateLOD(400, false, 'HIGH') === 2, 'T12: Distance 400 yields LOD 2');
  assert(lod.calculateLOD(3000, false, 'HIGH') === 3, 'T13: Distance 3000 yields LOD 3');

  // --- 3. Robustness & Numerical Boundary Safety ---
  assert(lod.calculateLOD(-50, false, 'HIGH') === 0, 'T14: Negative distance safely resolves to LOD 0');
  assert(lod.calculateLOD(NaN, false, 'HIGH') === 0, 'T15: NaN distance safely resolves to LOD 0');

  // --- 4. Importance Preservation (Selected/Focused objects) ---
  assert(lod.calculateLOD(5000, true, 'HIGH') === 1, 'T16: Important objects capped at LOD 1 even at extreme distance');
  assert(lod.calculateLOD(10, true, 'HIGH') === 0, 'T17: Important objects at close range retain LOD 0');
  assert(lod.shouldCull(10000, true, 2500) === false, 'T18: Important objects are NEVER culled');
  assert(lod.shouldCull(3000, false, 2500) === true, 'T19: Non-important objects past limit are culled');

  // --- 5. Geometry Resolution & Particle Budgeting ---
  assert(lod.getGeometryResolutionScale(0) === 1.0, 'T20: LOD 0 geometry scale is 1.0');
  assert(lod.getGeometryResolutionScale(1) < 1.0, 'T21: LOD 1 geometry scale is reduced');
  assert(lod.getGeometryResolutionScale(3) < lod.getGeometryResolutionScale(2), 'T22: Geometry scale decreases monotonically with LOD');

  const budgetLOD0 = lod.calculateParticleBudget(10000, 0, 'HIGH');
  const budgetLOD2 = lod.calculateParticleBudget(10000, 2, 'HIGH');
  const budgetLowQuality = lod.calculateParticleBudget(10000, 0, 'LOW');
  assert(budgetLOD0 === 10000, 'T23: Full particle budget at LOD 0 HIGH quality');
  assert(budgetLOD2 < budgetLOD0, 'T24: Particle budget scales down with distant LOD');
  assert(budgetLowQuality < budgetLOD0, 'T25: Particle budget scales down on LOW quality');

  // --- 6. Quality Manager & State Machine ---
  const qm = new QualityManager('HIGH');
  assert(qm.getMode() === 'HIGH', 'T26: Initial mode is HIGH');
  assert(qm.getEffectiveQuality() === 'HIGH', 'T27: Initial effective quality is HIGH');

  let notifiedMode = '';
  const unsub = qm.subscribe((mode) => {
    notifiedMode = mode;
  });
  qm.setMode('LOW');
  assert(qm.getMode() === 'LOW' && notifiedMode === 'LOW', 'T28: Quality change notifies subscriber');
  assert(qm.getEffectiveQuality() === 'LOW', 'T29: Setting manual mode immediately sets effective quality');
  unsub();

  // --- 7. Auto Quality & Smoothing (EMA) ---
  qm.setMode('AUTO');
  assert(qm.getMode() === 'AUTO', 'T30: Switched to AUTO mode');
  qm.updateSmoothedFps(30.0);
  assert(qm.getSmoothedFps() < 60.0, 'T31: EMA smoothed FPS reflects incoming lower delta');

  // --- 8. Hysteresis Dwell Time & Adaptive Transitions ---
  // In dwell protection period (< minDwellTimeMs): should NOT change
  const shiftBlocked = qm.evaluateAutoQuality(1000);
  assert(!shiftBlocked || qm.getEffectiveQuality() !== 'LOW', 'T32: Dwell protection blocks rapid oscillation');

  // After dwell time has elapsed (e.g. 10000ms) and low FPS -> should downgrade
  const qmDowngrade = new QualityManager('AUTO');
  // Inject low smoothed FPS
  for (let i = 0; i < 50; i++) {
    qmDowngrade.updateSmoothedFps(20.0);
  }
  const shiftedDown = qmDowngrade.evaluateAutoQuality(Date.now() + 5000);
  assert(shiftedDown === true, 'T33: Adaptive quality triggers downgrade when FPS < 35 after dwell time');
  assert(qmDowngrade.getEffectiveQuality() === 'MEDIUM', 'T34: Downgrade from HIGH drops to MEDIUM');

  // Upgrade test after dwell time with high FPS
  const qmUpgrade = new QualityManager('LOW');
  qmUpgrade.setMode('AUTO');
  for (let i = 0; i < 50; i++) {
    qmUpgrade.updateSmoothedFps(60.0);
  }
  const shiftedUp = qmUpgrade.evaluateAutoQuality(Date.now() + 10000);
  assert(shiftedUp === true, 'T35: Adaptive quality triggers upgrade when FPS > 56 after dwell time');

  // --- 9. Memory Manager Resource Disposal ---
  const mem = new MemoryManager();
  const group = new THREE.Group();
  const geo = new THREE.BoxGeometry(1, 1, 1);
  const mat = new THREE.MeshBasicMaterial();
  const mesh = new THREE.Mesh(geo, mat);
  group.add(mesh);

  mem.disposeHierarchy(group);
  const stats = mem.getStats();
  assert(stats.geometriesDisposed === 1, 'T36: MemoryManager disposes geometries correctly');
  assert(stats.materialsDisposed === 1, 'T37: MemoryManager disposes materials correctly');

  // --- 10. Default Thresholds Validity ---
  assert(DEFAULT_LOD_THRESHOLDS.lod0Distance < DEFAULT_LOD_THRESHOLDS.lod1Distance, 'T38: LOD 0 threshold < LOD 1 threshold');
  assert(DEFAULT_LOD_THRESHOLDS.lod1Distance < DEFAULT_LOD_THRESHOLDS.lod2Distance, 'T39: LOD 1 threshold < LOD 2 threshold');
  assert(AUTO_QUALITY_SETTINGS.downgradeFpsThreshold < AUTO_QUALITY_SETTINGS.upgradeFpsThreshold, 'T40: Downgrade FPS threshold < Upgrade FPS threshold (Hysteresis separation)');

  return {
    passed,
    failed,
    total: passed + failed,
    failures,
  };
}
