/**
 * StarEvolutionValidation.ts
 * Comprehensive automated validation suite and benchmark scenarios for the Stellar Evolution Engine.
 * Tests physical laws, core composition depletion, thermodynamics, mass loss conservation,
 * spectral transitions, HR tracks, and benchmark stars (0.1 to 30 M_☉).
 */

import {
  initializeStellarEvolution,
  advanceStellarEvolution,
} from './StellarEvolution';
import { calculateMainSequenceState } from './MainSequenceEvolution';
import { calculateMainSequenceCoreComposition, calculateCoreThermodynamics } from './CoreEvolution';
import { calculateSubgiantState } from './PostMainSequence';
import { calculateRedGiantState, calculateSupergiantState } from './GiantBranchModel';
import { calculateHeliumBurningState } from './HeliumBurning';
import { calculateMassLossRate } from './MassLossModel';
import { generateEvolutionTrack } from './HRDiagramData';
import { BENCHMARK_TRACKS } from './EvolutionTracks';

export interface StarEvolutionValidationResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface StarEvolutionValidationReport {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: StarEvolutionValidationResult[];
}

/**
 * Executes the complete Stellar Evolution validation suite.
 */
export function runStarEvolutionValidationSuite(): StarEvolutionValidationReport {
  const results: StarEvolutionValidationResult[] = [];

  function assert(name: string, condition: boolean, message: string, details?: Record<string, unknown>) {
    results.push({
      testName: name,
      passed: condition,
      message: condition ? `PASS: ${message}` : `FAIL: ${message}`,
      details,
    });
  }

  // ── 1. ZAMS Star Initialization ──────────────────────────────────────────
  const zamsSun = initializeStellarEvolution({ initialMassSolar: 1.0 });
  assert(
    'Test 1: ZAMS star initializes correctly',
    zamsSun.stage === 'ZERO_AGE_MAIN_SEQUENCE' &&
    Math.abs(zamsSun.currentMassSolar - 1.0) < 1e-4 &&
    Math.abs(zamsSun.luminositySolar - 1.0) < 0.1 &&
    Math.abs(zamsSun.radiusSolar - 1.0) < 0.1 &&
    zamsSun.effectiveTemperatureK > 5500 && zamsSun.effectiveTemperatureK < 6000,
    `Sun ZAMS: L=${zamsSun.luminositySolar.toFixed(3)} L☉, R=${zamsSun.radiusSolar.toFixed(3)} R☉, T=${zamsSun.effectiveTemperatureK.toFixed(0)} K`,
    { zamsSun }
  );

  // ── 2. Age Starts at Zero ────────────────────────────────────────────────
  assert(
    'Test 2: Age starts at zero',
    zamsSun.ageYears === 0,
    `Initial age = ${zamsSun.ageYears} years`,
    { age: zamsSun.ageYears }
  );

  // ── 3. Evolution Fraction Begins at Zero ──────────────────────────────────
  assert(
    'Test 3: Evolution fraction begins near zero',
    Math.abs(zamsSun.evolutionFraction) < 1e-6,
    `Initial evolutionFraction = ${zamsSun.evolutionFraction}`,
    { evolutionFraction: zamsSun.evolutionFraction }
  );

  // ── 4. Main-Sequence Hydrogen Decreases Monotonically ─────────────────────
  const h0 = calculateMainSequenceCoreComposition(0.7381, 0.2485, 0.0).coreHydrogenFraction;
  const hMid = calculateMainSequenceCoreComposition(0.7381, 0.2485, 0.5).coreHydrogenFraction;
  const hEnd = calculateMainSequenceCoreComposition(0.7381, 0.2485, 1.0).coreHydrogenFraction;
  assert(
    'Test 4: Main-sequence hydrogen decreases monotonically',
    h0 > hMid && hMid > hEnd && hEnd < 0.05,
    `X_core: start=${h0.toFixed(3)}, mid=${hMid.toFixed(3)}, end=${hEnd.toFixed(3)}`,
    { h0, hMid, hEnd }
  );

  // ── 5. Core Helium Increases Monotonically ────────────────────────────────
  const he0 = calculateMainSequenceCoreComposition(0.7381, 0.2485, 0.0).coreHeliumFraction;
  const heMid = calculateMainSequenceCoreComposition(0.7381, 0.2485, 0.5).coreHeliumFraction;
  const heEnd = calculateMainSequenceCoreComposition(0.7381, 0.2485, 1.0).coreHeliumFraction;
  assert(
    'Test 5: Core helium increases monotonically',
    he0 < heMid && heMid < heEnd && heEnd > 0.95,
    `Y_core: start=${he0.toFixed(3)}, mid=${heMid.toFixed(3)}, end=${heEnd.toFixed(3)}`,
    { he0, heMid, heEnd }
  );

  // ── 6. Main-Sequence Luminosity Remains Positive ──────────────────────────
  const msSun = calculateMainSequenceState(1.0, 5.0e9, 0.0);
  assert(
    'Test 6: Main-sequence luminosity remains positive',
    Number.isFinite(msSun.luminositySolar) && msSun.luminositySolar > 0 && msSun.luminositySolar >= zamsSun.luminositySolar,
    `MS Luminosity=${msSun.luminositySolar.toFixed(3)} L☉ > 0 (ZAMS: ${zamsSun.luminositySolar.toFixed(3)})`,
    { luminositySolar: msSun.luminositySolar }
  );

  // ── 7. Main-Sequence Radius Remains Positive ──────────────────────────────
  assert(
    'Test 7: Main-sequence radius remains positive',
    Number.isFinite(msSun.radiusSolar) && msSun.radiusSolar > 0 && msSun.radiusSolar >= zamsSun.radiusSolar,
    `MS Radius=${msSun.radiusSolar.toFixed(3)} R☉ > 0 (ZAMS: ${zamsSun.radiusSolar.toFixed(3)})`,
    { radiusSolar: msSun.radiusSolar }
  );

  // ── 8. Effective Temperature Remains Finite ──────────────────────────────
  assert(
    'Test 8: Effective temperature remains finite',
    Number.isFinite(msSun.effectiveTemperatureK) && msSun.effectiveTemperatureK > 2000 && msSun.effectiveTemperatureK < 60000,
    `T_eff=${msSun.effectiveTemperatureK.toFixed(0)} K is finite & physically bound`,
    { effectiveTemperatureK: msSun.effectiveTemperatureK }
  );

  // ── 9. Sun-like Star Remains Main Sequence Before Expected Lifetime ───────
  const sun4_5Gyr = advanceStellarEvolution(zamsSun, 4.6e9);
  assert(
    'Test 9: Sun-like star remains main sequence before expected lifetime',
    sun4_5Gyr.stage === 'MAIN_SEQUENCE' && sun4_5Gyr.isMainSequence === true,
    `Age 4.6 Gyr Stage: ${sun4_5Gyr.stage}, isMainSequence: ${sun4_5Gyr.isMainSequence}`,
    { stage: sun4_5Gyr.stage }
  );

  // ── 10. Sun-like Star Enters Post-MS Near Lifetime Boundary ───────────────
  const sun10Gyr = advanceStellarEvolution(zamsSun, 1.05e10);
  assert(
    'Test 10: Sun-like star enters post-main-sequence evolution near lifetime boundary',
    sun10Gyr.stage === 'SUBGIANT' || sun10Gyr.stage === 'HYDROGEN_DEPLETION' || sun10Gyr.stage === 'RED_GIANT',
    `Age 10.5 Gyr Stage: ${sun10Gyr.stage}, isPostMS: ${sun10Gyr.isPostMainSequence}`,
    { stage: sun10Gyr.stage, isPostMS: sun10Gyr.isPostMainSequence }
  );

  // ── 11. Solar-like Subgiant Radius > ZAMS Radius ─────────────────────────
  const subgiant = calculateSubgiantState(1.0, 0.5);
  assert(
    'Test 11: Solar-like subgiant radius is larger than ZAMS radius',
    subgiant.radiusSolar > zamsSun.radiusSolar * 1.2,
    `Subgiant R=${subgiant.radiusSolar.toFixed(2)} R☉ > ZAMS R=${zamsSun.radiusSolar.toFixed(2)} R☉`,
    { subgiantRadius: subgiant.radiusSolar }
  );

  // ── 12. Red Giant Luminosity > ZAMS Luminosity ────────────────────────────
  const rgb = calculateRedGiantState(1.0, 0.95);
  assert(
    'Test 12: Red giant luminosity is greater than ZAMS luminosity',
    rgb.luminositySolar > zamsSun.luminositySolar * 10.0,
    `RGB L=${rgb.luminositySolar.toFixed(1)} L☉ >> ZAMS L=${zamsSun.luminositySolar.toFixed(2)} L☉`,
    { rgbLuminosity: rgb.luminositySolar }
  );

  // ── 13. Red Giant Effective Temperature < ZAMS Temperature ───────────────
  assert(
    'Test 13: Red giant effective temperature is lower than ZAMS temperature',
    rgb.effectiveTemperatureK < zamsSun.effectiveTemperatureK - 1500,
    `RGB T_eff=${rgb.effectiveTemperatureK.toFixed(0)} K < ZAMS T_eff=${zamsSun.effectiveTemperatureK.toFixed(0)} K`,
    { rgbTeff: rgb.effectiveTemperatureK }
  );

  // ── 14. Core Temperature Rises During Post-Main-Sequence ──────────────────
  const msTc = msSun.coreTemperatureK;
  const rgbTc = rgb.coreTemperatureK;
  assert(
    'Test 14: Core temperature rises during post-main-sequence evolution',
    rgbTc > msTc,
    `RGB T_core=${rgbTc.toExponential(2)} K > MS T_core=${msTc.toExponential(2)} K`,
    { msTc, rgbTc }
  );

  // ── 15. Helium Ignition Around Correct Order of Magnitude (~10^8 K) ───────
  const heIgnitionThermo = calculateCoreThermodynamics(1.0, 1.0, 'HELIUM_IGNITION', 0.25);
  assert(
    'Test 15: Helium ignition occurs around the correct order of magnitude',
    heIgnitionThermo.coreTemperatureK >= 0.8e8 && heIgnitionThermo.coreTemperatureK <= 1.5e8,
    `He Ignition T_core=${heIgnitionThermo.coreTemperatureK.toExponential(2)} K ~ 10^8 K`,
    { heIgnitionThermo }
  );

  // ── 16. Helium Burning Decreases Core Helium ──────────────────────────────
  const heBurnEarly = calculateHeliumBurningState(1.0, 0.1);
  const heBurnLate = calculateHeliumBurningState(1.0, 0.8);
  assert(
    'Test 16: Helium burning decreases core helium',
    heBurnEarly.coreHeliumFraction > heBurnLate.coreHeliumFraction &&
    heBurnLate.coreCarbonOxygenFraction > heBurnEarly.coreCarbonOxygenFraction,
    `He Burn: Y_early=${heBurnEarly.coreHeliumFraction.toFixed(2)}, Y_late=${heBurnLate.coreHeliumFraction.toFixed(2)}, CO_late=${heBurnLate.coreCarbonOxygenFraction.toFixed(2)}`,
    { heBurnEarly, heBurnLate }
  );

  // ── 17. Massive Stars Evolve Substantially Faster Than Sun-like Stars ──────
  const ms10 = initializeStellarEvolution({ initialMassSolar: 10.0 });
  assert(
    'Test 17: Massive stars evolve substantially faster than Sun-like stars',
    ms10.mainSequenceLifetimeYears < zamsSun.mainSequenceLifetimeYears / 100,
    `10 M☉ MS lifetime=${(ms10.mainSequenceLifetimeYears / 1e6).toFixed(1)} Myr << 1 M☉ MS lifetime=${(zamsSun.mainSequenceLifetimeYears / 1e9).toFixed(1)} Gyr`,
    { tau10: ms10.mainSequenceLifetimeYears, tauSun: zamsSun.mainSequenceLifetimeYears }
  );

  // ── 18. Mass Loss Never Increases Stellar Mass ────────────────────────────
  const windRate = calculateMassLossRate(10.0, 20.0, 1.0e4, 'SUPERGIANT');
  const massiveEvolved = advanceStellarEvolution(ms10, ms10.mainSequenceLifetimeYears * 1.05);
  assert(
    'Test 18: Mass loss never increases stellar mass',
    windRate >= 0 && massiveEvolved.currentMassSolar <= massiveEvolved.initialMassSolar,
    `10 M☉ Current mass=${massiveEvolved.currentMassSolar.toFixed(3)} M☉ <= Initial mass=${massiveEvolved.initialMassSolar.toFixed(3)} M☉ (wind: ${windRate.toExponential(2)} M☉/yr)`,
    { currentMass: massiveEvolved.currentMassSolar, initialMass: massiveEvolved.initialMassSolar }
  );

  // ── 19. Spectral Classification Responds to Effective Temperature ────────
  const sunRGB = advanceStellarEvolution(zamsSun, 1.15e10);
  assert(
    'Test 19: Spectral classification responds to effective temperature',
    zamsSun.spectralClass.startsWith('G') &&
    (sunRGB.luminosityClass === 'III' || sunRGB.luminosityClass === 'II') &&
    (sunRGB.spectralClass.startsWith('K') || sunRGB.spectralClass.startsWith('M')),
    `Sun MS=${zamsSun.fullSpectralDesignation}, RGB=${sunRGB.fullSpectralDesignation}`,
    { sunMS: zamsSun.fullSpectralDesignation, rgb: sunRGB.fullSpectralDesignation }
  );

  // ── 20. HR Evolution Track is Monotonic in Time with Finite Points ────────
  const trackSun = generateEvolutionTrack(1.0, 0.0, 40);
  let timeMonotonic = true;
  let allPointsFinite = true;
  for (let i = 1; i < trackSun.points.length; i++) {
    if (trackSun.points[i].ageYears < trackSun.points[i - 1].ageYears) {
      timeMonotonic = false;
    }
    const pt = trackSun.points[i];
    if (!Number.isFinite(pt.luminositySolar) || !Number.isFinite(pt.effectiveTemperatureK) || !Number.isFinite(pt.radiusSolar)) {
      allPointsFinite = false;
    }
  }
  assert(
    'Test 20: HR evolution track is monotonic in time and contains valid finite points',
    timeMonotonic && allPointsFinite && trackSun.points.length >= 30,
    `HR Track has ${trackSun.points.length} points, timeMonotonic=${timeMonotonic}, allPointsFinite=${allPointsFinite}`,
    { pointsCount: trackSun.points.length }
  );

  // ── 21. Benchmark Scenario A: Red Dwarf (0.1 M☉) ──────────────────────────
  const trackDwarf = BENCHMARK_TRACKS['0.2M'];
  const dwarfMS = initializeStellarEvolution({ initialMassSolar: 0.1 });
  assert(
    'Test 21: Benchmark Scenario A — Red Dwarf (0.1 M☉)',
    dwarfMS.mainSequenceLifetimeYears > 5.0e11 &&
    trackDwarf.points.every((p) => p.effectiveTemperatureK < 4500),
    `0.1 M☉ lifetime=${(dwarfMS.mainSequenceLifetimeYears / 1e12).toFixed(1)} Trillion Years, all cool M-dwarfs`,
    { lifetime: dwarfMS.mainSequenceLifetimeYears }
  );

  // ── 22. Benchmark Scenario B: Sun (1.0 M☉) ────────────────────────────────
  const trackSunBenchmark = BENCHMARK_TRACKS['1.0M'];
  const hasRGB = trackSunBenchmark.points.some((p) => p.stage === 'RED_GIANT');
  const hasHeBurning = trackSunBenchmark.points.some((p) => p.stage === 'HELIUM_BURNING');
  assert(
    'Test 22: Benchmark Scenario B — Sun (1.0 M☉)',
    hasRGB && hasHeBurning && trackSunBenchmark.points.length >= 30,
    `Sun benchmark track transitions through RGB (found: ${hasRGB}) and Helium Burning (found: ${hasHeBurning})`,
    { hasRGB, hasHeBurning }
  );

  // ── 23. Benchmark Scenario C: Intermediate Star (2.0 M☉) ──────────────────
  const track2M = BENCHMARK_TRACKS['2.0M'];
  const star2M = initializeStellarEvolution({ initialMassSolar: 2.0 });
  assert(
    'Test 23: Benchmark Scenario C — Intermediate Star (2.0 M☉)',
    star2M.mainSequenceLifetimeYears < 2.0e9 && star2M.luminositySolar > 10.0 &&
    track2M.points.some((p) => p.stage === 'RED_GIANT' || p.stage === 'ASYMPTOTIC_GIANT_BRANCH'),
    `2.0 M☉ MS lifetime=${(star2M.mainSequenceLifetimeYears / 1e9).toFixed(2)} Gyr, L_ZAMS=${star2M.luminositySolar.toFixed(1)} L☉`,
    { lifetime2M: star2M.mainSequenceLifetimeYears }
  );

  // ── 24. Benchmark Scenario D: Massive Star (10.0 M☉) ──────────────────────
  const track10M = BENCHMARK_TRACKS['10.0M'];
  const sg10 = calculateSupergiantState(10.0, 0.5);
  assert(
    'Test 24: Benchmark Scenario D — Massive Star (10.0 M☉)',
    sg10.luminositySolar > 1.0e4 && sg10.stage === 'SUPERGIANT' &&
    track10M.points.some((p) => p.stage === 'SUPERGIANT'),
    `10 M☉ Supergiant L=${sg10.luminositySolar.toFixed(0)} L☉, R=${sg10.radiusSolar.toFixed(1)} R☉`,
    { sg10Luminosity: sg10.luminositySolar }
  );

  // ── 25. Benchmark Scenario E: Hypermassive Star (30.0 M☉) ──────────────────
  const track30M = BENCHMARK_TRACKS['30.0M'];
  const star30M = initializeStellarEvolution({ initialMassSolar: 30.0 });
  assert(
    'Test 25: Benchmark Scenario E — Hypermassive Star (30.0 M☉)',
    star30M.mainSequenceLifetimeYears < 1.0e7 && star30M.luminositySolar > 5.0e4 &&
    track30M.points.length >= 25,
    `30 M☉ MS lifetime=${(star30M.mainSequenceLifetimeYears / 1e6).toFixed(2)} Myr, L_ZAMS=${star30M.luminositySolar.toFixed(0)} L☉`,
    { star30M }
  );

  // ── 26. Mass Conservation Test ────────────────────────────────────────────
  const evolvedMassive = advanceStellarEvolution(ms10, 2.5e7);
  const totalMassConserved = evolvedMassive.currentMassSolar + evolvedMassive.ejectedMassSolar;
  assert(
    'Test 26: Mass conservation (M_initial = M_current + M_ejected)',
    Math.abs(totalMassConserved - evolvedMassive.initialMassSolar) < 1e-4,
    `M_init=${evolvedMassive.initialMassSolar.toFixed(3)} == M_curr(${evolvedMassive.currentMassSolar.toFixed(3)}) + M_ej(${evolvedMassive.ejectedMassSolar.toFixed(3)})`,
    { totalMassConserved, initialMass: evolvedMassive.initialMassSolar }
  );

  // ── 27. Metallicity Influence ─────────────────────────────────────────────
  const sunMetalRich = calculateMainSequenceState(1.0, 0.0, 0.3);
  const sunMetalPoor = calculateMainSequenceState(1.0, 0.0, -1.0);
  assert(
    'Test 27: Metallicity variation adjusts opacity proxy and stellar parameters',
    sunMetalPoor.effectiveTemperatureK > sunMetalRich.effectiveTemperatureK,
    `Low-metallicity star is hotter (T=${sunMetalPoor.effectiveTemperatureK.toFixed(0)} K) than metal-rich (T=${sunMetalRich.effectiveTemperatureK.toFixed(0)} K)`,
    { metalPoorT: sunMetalPoor.effectiveTemperatureK, metalRichT: sunMetalRich.effectiveTemperatureK }
  );

  // ── 28. Numerical Safety & Edge Case Handling ─────────────────────────────
  const edgeZero = advanceStellarEvolution(zamsSun, -100);
  const edgeHuge = advanceStellarEvolution(zamsSun, 1.0e14);
  assert(
    'Test 28: Numerical safety handles negative and extreme year inputs cleanly',
    edgeZero.ageYears === 0 && Number.isFinite(edgeHuge.radiusSolar) && edgeHuge.radiusSolar > 0 &&
    Number.isFinite(edgeHuge.luminositySolar) && edgeHuge.luminositySolar > 0,
    `Negative age clamped to 0 (${edgeZero.ageYears}), Huge age (${edgeHuge.ageYears}) remains finite L=${edgeHuge.luminositySolar.toFixed(1)}, R=${edgeHuge.radiusSolar.toFixed(1)}`,
    { edgeZero, edgeHuge }
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
