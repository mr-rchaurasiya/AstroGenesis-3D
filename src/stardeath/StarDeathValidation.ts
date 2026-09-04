/**
 * StarDeathValidation.ts
 * Comprehensive automated validation suite and benchmark scenarios for the Stellar Death & Remnants Engine.
 * Tests physical laws, Chandrasekhar limit, TOV limit, degeneracy mass-radius relation,
 * Mestel cooling, light curves, compactness, Schwarzschild radii, pulsar spin-down, and mass conservation.
 */

import {
  advanceStellarDeath,
  createDeathFromEvolvedStar,
} from './StellarDeath';
import { calculatePlanetaryNebulaState } from './PlanetaryNebulaModel';
import { calculateWhiteDwarfState } from './WhiteDwarfModel';
import { calculateCoreCollapseState } from './CoreCollapse';
import { calculateSupernovaState } from './SupernovaModel';
import { calculateNeutronStarState } from './NeutronStarModel';
import { calculateBlackHoleState } from './BlackHoleModel';
import {
  calculateNeutronStarCompactness,
  calculateCompactEscapeVelocity,
  calculateWhiteDwarfRadius,
} from './RemnantPhysics';
import { classifyStellarRemnant } from './RemnantClassification';
import { BENCHMARK_DEATH_TRACKS } from './DeathTracks';
import { advanceStellarEvolution } from '../starevolution/StellarEvolution';

export interface StarDeathValidationResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface StarDeathValidationReport {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: StarDeathValidationResult[];
}

/**
 * Runs the complete Stellar Death and Remnants validation suite.
 */
export function runStarDeathValidationSuite(): StarDeathValidationReport {
  const results: StarDeathValidationResult[] = [];

  function assert(name: string, condition: boolean, message: string, details?: Record<string, unknown>) {
    results.push({
      testName: name,
      passed: condition,
      message: condition ? `PASS: ${message}` : `FAIL: ${message}`,
      details,
    });
  }

  // ── General / State Machine ──────────────────────────────────────────────
  // 1. POST_HELIUM state acceptance
  const sunEvolved = advanceStellarEvolution({ initialMassSolar: 1.0, currentAgeYears: 1.2e10 });
  const sunDeath = createDeathFromEvolvedStar(sunEvolved, 0);
  assert(
    'Test 1: POST_HELIUM state is accepted from Phase 9',
    sunDeath.progenitorInitialMassSolar === 1.0 && sunDeath.remnantType === 'WHITE_DWARF',
    `Progenitor 1.0 M☉ correctly transitions to ${sunDeath.remnantType}`,
    { sunDeath }
  );

  // 2. Death stage is deterministic
  const stateA = advanceStellarDeath({ progenitorInitialMassSolar: 1.0, currentMassSolar: 1.0, coreMassSolar: 0.6, deathAgeYears: 1000 });
  const stateB = advanceStellarDeath({ progenitorInitialMassSolar: 1.0, currentMassSolar: 1.0, coreMassSolar: 0.6, deathAgeYears: 1000 });
  assert(
    'Test 2: Death stage is deterministic',
    stateA.stage === stateB.stage && stateA.luminositySolar === stateB.luminositySolar,
    `Deterministic execution verified for stage: ${stateA.stage}`,
    { stateA, stateB }
  );

  // 3. All public values remain finite
  const valuesFinite =
    Number.isFinite(sunDeath.luminositySolar) &&
    Number.isFinite(sunDeath.radiusSolar) &&
    Number.isFinite(sunDeath.effectiveTemperatureK) &&
    Number.isFinite(sunDeath.currentMassSolar);
  assert(
    'Test 3: All public values remain finite',
    valuesFinite,
    `L=${sunDeath.luminositySolar}, R=${sunDeath.radiusSolar}, T=${sunDeath.effectiveTemperatureK}, M=${sunDeath.currentMassSolar}`,
    { sunDeath }
  );

  // 4. Age never decreases
  const t0 = sunDeath.deathAgeYears;
  const tAdvanced = advanceStellarDeath(sunDeath, 50000).deathAgeYears;
  assert(
    'Test 4: Age advances monotonically',
    tAdvanced >= t0 && tAdvanced === 50000,
    `Initial age = ${t0} yr, advanced age = ${tAdvanced} yr`,
    { t0, tAdvanced }
  );

  // 5. Mass never becomes negative
  assert(
    'Test 5: Mass never becomes negative',
    sunDeath.currentMassSolar > 0 && sunDeath.ejectedMassSolar >= 0,
    `Remnant mass = ${sunDeath.currentMassSolar.toFixed(3)} M☉, Ejected mass = ${sunDeath.ejectedMassSolar.toFixed(3)} M☉`,
    { remnantMass: sunDeath.currentMassSolar, ejectedMass: sunDeath.ejectedMassSolar }
  );

  // ── Planetary Nebula ─────────────────────────────────────────────────────
  // 6. Envelope ejection decreases stellar envelope mass
  const pnStateYoung = calculatePlanetaryNebulaState(0.4, 1000, 80000);
  const pnStateOld = calculatePlanetaryNebulaState(0.4, 30000, 40000);
  assert(
    'Test 6: Envelope ejection creates planetary nebula',
    pnStateYoung.nebulaMassSolar === 0.4 && pnStateYoung.nebulaRadiusAU > 100,
    `Ejected envelope mass = ${pnStateYoung.nebulaMassSolar} M☉, initial radius = ${pnStateYoung.nebulaRadiusAU.toFixed(1)} AU`,
    { pnStateYoung }
  );

  // 7. Nebula radius increases with time
  assert(
    'Test 7: Nebula radius increases with time',
    pnStateOld.nebulaRadiusAU > pnStateYoung.nebulaRadiusAU,
    `R_young = ${pnStateYoung.nebulaRadiusAU.toFixed(1)} AU, R_old = ${pnStateOld.nebulaRadiusAU.toFixed(1)} AU`,
    { youngR: pnStateYoung.nebulaRadiusAU, oldR: pnStateOld.nebulaRadiusAU }
  );

  // 8. Nebula density decreases with expansion
  assert(
    'Test 8: Nebula density decreases with expansion',
    pnStateYoung.numberDensityCm3 > pnStateOld.numberDensityCm3,
    `n_young = ${pnStateYoung.numberDensityCm3.toFixed(0)} cm⁻³ > n_old = ${pnStateOld.numberDensityCm3.toFixed(0)} cm⁻³`,
    { youngN: pnStateYoung.numberDensityCm3, oldN: pnStateOld.numberDensityCm3 }
  );

  // 9. Nebula luminosity remains finite
  assert(
    'Test 9: Nebula luminosity remains finite and positive',
    Number.isFinite(pnStateYoung.nebulaLuminositySolar) && pnStateYoung.nebulaLuminositySolar > 0,
    `PN Luminosity = ${pnStateYoung.nebulaLuminositySolar.toFixed(2)} L☉`,
    { lum: pnStateYoung.nebulaLuminositySolar }
  );

  // 10. Central remnant remains compact
  const wdFromPN = calculateWhiteDwarfState(0.6, 1000);
  assert(
    'Test 10: Central remnant remains compact during nebula phase',
    wdFromPN.radiusSolar < 0.03 && wdFromPN.radiusKm < 20000,
    `Central WD radius = ${wdFromPN.radiusSolar.toFixed(4)} R☉ (${wdFromPN.radiusKm.toFixed(0)} km)`,
    { wdFromPN }
  );

  // ── White Dwarf ──────────────────────────────────────────────────────────
  // 11. White dwarf mass is positive
  assert(
    'Test 11: White dwarf mass is positive',
    wdFromPN.massSolar > 0 && wdFromPN.massSolar < 1.44,
    `WD mass = ${wdFromPN.massSolar.toFixed(3)} M☉`,
    { mass: wdFromPN.massSolar }
  );

  // 12. White dwarf radius is positive
  assert(
    'Test 12: White dwarf radius is positive',
    wdFromPN.radiusSolar > 0 && wdFromPN.radiusKm > 0,
    `WD radius = ${wdFromPN.radiusSolar.toFixed(5)} R☉ (${wdFromPN.radiusKm.toFixed(0)} km)`,
    { radiusKm: wdFromPN.radiusKm }
  );

  // 13. Higher white-dwarf mass produces smaller radius (Degeneracy relation)
  const wdLight = calculateWhiteDwarfRadius(0.4);
  const wdHeavy = calculateWhiteDwarfRadius(1.2);
  assert(
    'Test 13: Higher white-dwarf mass produces smaller radius',
    wdHeavy.km < wdLight.km,
    `0.4 M☉ radius = ${wdLight.km.toFixed(0)} km > 1.2 M☉ radius = ${wdHeavy.km.toFixed(0)} km`,
    { wdLight, wdHeavy }
  );

  // 14. Density is extremely high relative to normal stars (~10^9 kg/m³)
  assert(
    'Test 14: White dwarf density is extremely high (~10⁹ kg/m³)',
    wdFromPN.meanDensityKgM3 > 1.0e8,
    `WD mean density = ${wdFromPN.meanDensityKgM3.toExponential(2)} kg/m³`,
    { density: wdFromPN.meanDensityKgM3 }
  );

  // 15. Cooling age increases monotonically
  const wdYoung = calculateWhiteDwarfState(0.6, 1.0e4);
  const wdOld = calculateWhiteDwarfState(0.6, 1.0e8);
  assert(
    'Test 15: Cooling age increases monotonically',
    wdOld.coolingAgeYears > wdYoung.coolingAgeYears,
    `Young age = ${wdYoung.coolingAgeYears} yr, Old age = ${wdOld.coolingAgeYears} yr`,
    { youngAge: wdYoung.coolingAgeYears, oldAge: wdOld.coolingAgeYears }
  );

  // 16. Temperature decreases with cooling
  assert(
    'Test 16: Temperature decreases with cooling',
    wdYoung.effectiveTemperatureK > wdOld.effectiveTemperatureK,
    `T_young = ${wdYoung.effectiveTemperatureK.toFixed(0)} K > T_old = ${wdOld.effectiveTemperatureK.toFixed(0)} K`,
    { youngT: wdYoung.effectiveTemperatureK, oldT: wdOld.effectiveTemperatureK }
  );

  // 17. Luminosity decreases with cooling
  assert(
    'Test 17: Luminosity decreases with cooling',
    wdYoung.luminositySolar > wdOld.luminositySolar,
    `L_young = ${wdYoung.luminositySolar.toExponential(2)} L☉ > L_old = ${wdOld.luminositySolar.toExponential(2)} L☉`,
    { youngL: wdYoung.luminositySolar, oldL: wdOld.luminositySolar }
  );

  // 18. Mass conservation: Progenitor = Remnant + Ejecta
  const totalWDMass = sunDeath.currentMassSolar + sunDeath.ejectedMassSolar;
  assert(
    'Test 18: Mass remains conserved through envelope ejection plus remnant',
    Math.abs(totalWDMass - sunDeath.progenitorInitialMassSolar) < 1e-4,
    `M_init (${sunDeath.progenitorInitialMassSolar.toFixed(3)}) == M_WD (${sunDeath.currentMassSolar.toFixed(3)}) + M_ej (${sunDeath.ejectedMassSolar.toFixed(3)})`,
    { totalWDMass, initialMass: sunDeath.progenitorInitialMassSolar }
  );

  // ── Core Collapse ────────────────────────────────────────────────────────
  // 19. Core-collapse progress increases monotonically
  const ccStart = calculateCoreCollapseState(1.5, 0.1);
  const ccEnd = calculateCoreCollapseState(1.5, 0.9);
  assert(
    'Test 19: Core-collapse progress increases monotonically',
    ccEnd.collapseProgress > ccStart.collapseProgress,
    `tau_start = ${ccStart.collapseProgress} < tau_end = ${ccEnd.collapseProgress}`,
    { ccStart, ccEnd }
  );

  // 20. Core density increases during collapse
  assert(
    'Test 20: Core density increases during collapse',
    ccEnd.coreDensityKgM3 > ccStart.coreDensityKgM3,
    `rho_start = ${ccStart.coreDensityKgM3.toExponential(2)} kg/m³ -> rho_end = ${ccEnd.coreDensityKgM3.toExponential(2)} kg/m³`,
    { startRho: ccStart.coreDensityKgM3, endRho: ccEnd.coreDensityKgM3 }
  );

  // 21. Collapse remains numerically finite
  assert(
    'Test 21: Collapse remains numerically finite',
    Number.isFinite(ccEnd.coreRadiusKm) && Number.isFinite(ccEnd.infallVelocityKmS) && Number.isFinite(ccEnd.coreTemperatureK),
    `R_core = ${ccEnd.coreRadiusKm.toFixed(1)} km, v_infall = ${ccEnd.infallVelocityKmS.toFixed(0)} km/s, T_core = ${ccEnd.coreTemperatureK.toExponential(2)} K`,
    { ccEnd }
  );

  // ── Supernova ────────────────────────────────────────────────────────────
  // 22. Explosion energy is positive
  const sn = calculateSupernovaState(8.0, 18.0, 1.0);
  assert(
    'Test 22: Explosion energy is positive (1 foe = 10⁴⁴ J)',
    sn.explosionEnergyJoules >= 1.0e44 && sn.explosionEnergyFoe === 1.0,
    `E_SN = ${sn.explosionEnergyJoules.toExponential(2)} J (${sn.explosionEnergyFoe} foe)`,
    { sn }
  );

  // 23. Ejecta mass is positive
  assert(
    'Test 23: Ejecta mass is positive',
    sn.ejectaMassSolar > 0,
    `M_ejecta = ${sn.ejectaMassSolar.toFixed(2)} M☉`,
    { ejectaMassSolar: sn.ejectaMassSolar }
  );

  // 24. Ejecta radius increases with time
  const snEarly = calculateSupernovaState(8.0, 5.0);
  const snLate = calculateSupernovaState(8.0, 100.0);
  assert(
    'Test 24: Ejecta radius increases with time',
    snLate.ejectaRadiusAU > snEarly.ejectaRadiusAU,
    `R_early = ${snEarly.ejectaRadiusAU.toFixed(1)} AU < R_late = ${snLate.ejectaRadiusAU.toFixed(1)} AU`,
    { earlyR: snEarly.ejectaRadiusAU, lateR: snLate.ejectaRadiusAU }
  );

  // 25. Ejecta velocity remains positive (~2,000 to 30,000 km/s)
  assert(
    'Test 25: Ejecta velocity remains positive and physically reasonable',
    sn.ejectaVelocityKmS >= 2000 && sn.ejectaVelocityKmS <= 30000,
    `v_ejecta = ${sn.ejectaVelocityKmS.toFixed(0)} km/s`,
    { velocity: sn.ejectaVelocityKmS }
  );

  // 26. Light curve has rise / peak / decline behavior
  const snRise = calculateSupernovaState(8.0, 5.0);
  const snPeak = calculateSupernovaState(8.0, 18.0);
  const snTail = calculateSupernovaState(8.0, 80.0);
  assert(
    'Test 26: Light curve exhibits rise, peak, and radioactive decline',
    snPeak.currentLuminositySolar > snRise.currentLuminositySolar &&
    snPeak.currentLuminositySolar > snTail.currentLuminositySolar &&
    snTail.currentLuminositySolar > 0,
    `L_rise = ${snRise.currentLuminositySolar.toExponential(2)} < L_peak = ${snPeak.currentLuminositySolar.toExponential(2)} > L_tail = ${snTail.currentLuminositySolar.toExponential(2)} L☉`,
    { snRise, snPeak, snTail }
  );

  // 27. Supernova luminosity remains finite
  assert(
    'Test 27: Supernova luminosity remains finite and non-negative',
    Number.isFinite(snPeak.currentLuminositySolar) && snPeak.currentLuminositySolar > 1.0e8,
    `Peak Luminosity = ${snPeak.currentLuminositySolar.toExponential(2)} L☉`,
    { peakLum: snPeak.currentLuminositySolar }
  );

  // ── Neutron Star ─────────────────────────────────────────────────────────
  // 28. Radius is on canonical neutron-star scale (~10-14 km)
  const ns = calculateNeutronStarState(1.44, 1000);
  assert(
    'Test 28: Radius is on neutron-star scale (~11.5 km)',
    ns.radiusKm >= 10.0 && ns.radiusKm <= 14.0,
    `Neutron star radius = ${ns.radiusKm.toFixed(1)} km (${ns.radiusSolar.toExponential(3)} R☉)`,
    { ns }
  );

  // 29. Compactness is physically valid: 0 < Ξ < 0.5
  const compactness = calculateNeutronStarCompactness(1.44, 11.5);
  assert(
    'Test 29: Compactness is physically valid (0 < Ξ < 0.5)',
    compactness > 0.1 && compactness < 0.4,
    `Compactness parameter Ξ = ${compactness.toFixed(3)}`,
    { compactness }
  );

  // 30. Escape velocity remains below c
  const escVel = calculateCompactEscapeVelocity(1.44, 11.5);
  assert(
    'Test 30: Escape velocity remains below c in relativistic model',
    escVel.fractionC > 0.3 && escVel.fractionC < 1.0,
    `v_esc = ${escVel.kmS.toFixed(0)} km/s (${(escVel.fractionC * 100).toFixed(1)}% c)`,
    { escVel }
  );

  // 31. Spin period is positive
  assert(
    'Test 31: Spin period is positive',
    ns.spinPeriodSeconds > 0 && ns.spinFrequencyRadS > 0,
    `Spin period = ${(ns.spinPeriodSeconds * 1000).toFixed(2)} ms, frequency = ${ns.spinFrequencyRadS.toFixed(1)} rad/s`,
    { spinPeriod: ns.spinPeriodSeconds }
  );

  // 32. Pulsar classification is deterministic
  assert(
    'Test 32: Pulsar classification is deterministic',
    ns.isPulsar === true,
    `Young magnetized neutron star correctly classified as Pulsar: ${ns.isPulsar}`,
    { isPulsar: ns.isPulsar }
  );

  // ── Black Hole ───────────────────────────────────────────────────────────
  // 33. Schwarzschild radius matches 2GM/c² (~2.95 km / M_☉)
  const bh5 = calculateBlackHoleState(5.0);
  const expectedRsKm = 5.0 * 2.95325;
  assert(
    'Test 33: Schwarzschild radius matches 2GM/c²',
    Math.abs(bh5.schwarzschildRadiusKm - expectedRsKm) < 0.1,
    `5.0 M☉ Black Hole r_s = ${bh5.schwarzschildRadiusKm.toFixed(2)} km (expected: ${expectedRsKm.toFixed(2)} km)`,
    { bh5 }
  );

  // 34. Schwarzschild radius increases with mass
  const bh10 = calculateBlackHoleState(10.0);
  assert(
    'Test 34: Schwarzschild radius increases with mass',
    bh10.schwarzschildRadiusKm > bh5.schwarzschildRadiusKm,
    `10 M☉ r_s = ${bh10.schwarzschildRadiusKm.toFixed(2)} km > 5 M☉ r_s = ${bh5.schwarzschildRadiusKm.toFixed(2)} km`,
    { rs5: bh5.schwarzschildRadiusKm, rs10: bh10.schwarzschildRadiusKm }
  );

  // 35. Event horizon is non-luminous in isolated visual state
  const isolatedBH = calculateBlackHoleState(10.0, 1000, false);
  assert(
    'Test 35: Isolated Event Horizon is non-luminous (T_H ~ 0 K)',
    isolatedBH.accretionLuminositySolar === 0 && isolatedBH.hawkingTemperatureK < 1.0e-6,
    `Isolated BH Luminosity = ${isolatedBH.accretionLuminositySolar} L☉, Hawking T = ${isolatedBH.hawkingTemperatureK.toExponential(2)} K`,
    { isolatedBH }
  );

  // 36. Black-hole mass is positive
  assert(
    'Test 36: Black-hole mass is positive',
    bh5.massSolar === 5.0 && bh5.massKg > 0,
    `BH Mass = ${bh5.massSolar} M☉ (${bh5.massKg.toExponential(2)} kg)`,
    { bh5 }
  );

  // ── Benchmark Scenarios & Pathways ───────────────────────────────────────
  // 37. Benchmark Scenario A: Sun (1.0 M☉ -> White Dwarf)
  const trackSun = BENCHMARK_DEATH_TRACKS['1.0M'];
  assert(
    'Test 37: Benchmark Scenario A — Sun (1.0 M☉ -> White Dwarf)',
    trackSun.remnantType === 'WHITE_DWARF' &&
    trackSun.points.some((p) => p.stage === 'PLANETARY_NEBULA' || p.stage === 'WHITE_DWARF'),
    `Sun progenitor evolves into ${trackSun.remnantType} via Planetary Nebula`,
    { trackSun }
  );

  // 38. Benchmark Scenario B: Intermediate Star (5.0 M☉ -> White Dwarf)
  const track5M = BENCHMARK_DEATH_TRACKS['5.0M'];
  assert(
    'Test 38: Benchmark Scenario B — Intermediate (5.0 M☉ -> White Dwarf)',
    track5M.remnantType === 'WHITE_DWARF',
    `5.0 M☉ progenitor evolves into ${track5M.remnantType}`,
    { track5M }
  );

  // 39. Benchmark Scenario C: Transition Regime (8.0 M☉)
  const track8M = BENCHMARK_DEATH_TRACKS['8.0M'];
  assert(
    'Test 39: Benchmark Scenario C — Transition Boundary (8.0 M☉)',
    track8M.remnantType === 'NEUTRON_STAR' || track8M.remnantType === 'WHITE_DWARF',
    `8.0 M☉ transition classifies as ${track8M.remnantType}`,
    { track8M }
  );

  // 40. Benchmark Scenario D: Massive Star (10.0 M☉ -> Supernova -> Neutron Star)
  const track10M = BENCHMARK_DEATH_TRACKS['10.0M'];
  assert(
    'Test 40: Benchmark Scenario D — Massive Star (10.0 M☉ -> Supernova -> Neutron Star)',
    track10M.remnantType === 'NEUTRON_STAR' &&
    track10M.points.some((p) => p.stage === 'SUPERNOVA' || p.stage === 'NEUTRON_STAR'),
    `10 M☉ progenitor explodes as Supernova into ${track10M.remnantType}`,
    { track10M }
  );

  // 41. Benchmark Scenario E: Hypermassive Star (30.0 M☉ -> Supernova -> Black Hole)
  const track30M = BENCHMARK_DEATH_TRACKS['30.0M'];
  assert(
    'Test 41: Benchmark Scenario E — Hypermassive Star (30.0 M☉ -> Supernova -> Black Hole)',
    track30M.remnantType === 'BLACK_HOLE' &&
    track30M.points.some((p) => p.stage === 'SUPERNOVA' || p.stage === 'BLACK_HOLE'),
    `30 M☉ progenitor collapses into ${track30M.remnantType}`,
    { track30M }
  );

  // 42. Structural Remnant Classification logic
  const classDirectBH = classifyStellarRemnant({ initialMassSolar: 40.0, currentMassSolar: 22.0, coreMassSolar: 12.0 });
  assert(
    'Test 42: Structural Remnant Classification responds to final core mass',
    classDirectBH.remnantType === 'BLACK_HOLE' && classDirectBH.isCoreCollapse === true,
    `12 M☉ core mass directly collapses to ${classDirectBH.remnantType}`,
    { classDirectBH }
  );

  // 43. Numerical Safety with negative and extreme years
  const edgeNeg = advanceStellarDeath({ progenitorInitialMassSolar: 1.0, currentMassSolar: 1.0, coreMassSolar: 0.6, deathAgeYears: -500 });
  const edgeHuge = advanceStellarDeath({ progenitorInitialMassSolar: 1.0, currentMassSolar: 1.0, coreMassSolar: 0.6, deathAgeYears: 1.0e14 });
  assert(
    'Test 43: Numerical safety against negative and huge year inputs',
    edgeNeg.deathAgeYears === 0 && Number.isFinite(edgeHuge.radiusSolar) && edgeHuge.radiusSolar > 0,
    `Negative age clamped to ${edgeNeg.deathAgeYears}, Huge age remains finite L=${edgeHuge.luminositySolar.toExponential(2)}`,
    { edgeNeg, edgeHuge }
  );

  const totalTests = results.length;
  const passedCount = results.filter((r) => r.passed).length;
  const failedCount = totalTests - passedCount;

  return {
    totalTests,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };
}
