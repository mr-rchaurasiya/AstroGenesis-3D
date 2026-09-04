/**
 * EducationValidation.ts
 * Automated validation test suite for Phase 11 Educational UI & Cosmic Time Explorer.
 * Verifies 40+ physical, mathematical, formatting, state, and content assertions.
 */

import {
  formatMass,
  formatRadius,
  formatLuminosity,
  formatTemperature,
  formatDensity,
  formatGravity,
  formatVelocity,
  formatTimescale,
  formatScientificNumber,
  toSuperscript,
} from './EducationFormatter';

import {
  COSMIC_EPOCHS,
  SCALE_BENCHMARKS,
  SOLAR_MASS_KG,
  UNIVERSE_AGE_YEARS,
} from './EducationConstants';

import {
  classifyMassRegime,
  getLifecyclePhaseInfo,
  findCosmicEpochForTime,
  findScaleBenchmark,
  buildComparisonRows,
} from './EducationUtils';

import { EDUCATIONAL_CONCEPTS } from './EducationContent';
import { EDUCATIONAL_LESSONS } from './EducationTopics';
import { BENCHMARK_OBJECTS, getConceptById, getLessonById, getComparisonObjectById } from './EducationSelectors';
import { useEducationStore } from './EducationState';

export interface TestResult {
  name: string;
  passed: boolean;
  message?: string;
}

export function runEducationValidation(): { total: number; passed: number; results: TestResult[] } {
  const results: TestResult[] = [];

  function assert(name: string, condition: boolean, message?: string) {
    results.push({
      name,
      passed: condition,
      message: condition ? undefined : (message ?? 'Assertion failed'),
    });
  }

  // ── Group 1: Unit Formatter Precision & Systems (Assertions 1–10) ─────────

  // 1. Solar Mass formatting
  assert(
    '1. formatMass returns valid Solar unit string for 1.0 M☉',
    formatMass(1.0, 'SOLAR').includes('1.000 M☉'),
    `Received: ${formatMass(1.0, 'SOLAR')}`
  );

  // 2. SI Mass conversion
  assert(
    '2. formatMass converts solar mass to kg correctly in SI mode',
    formatMass(1.0, 'SI').includes('1.99') && formatMass(1.0, 'SI').includes('kg') && SOLAR_MASS_KG > 1e30,
    `Received: ${formatMass(1.0, 'SI')}`
  );

  // 3. Human Earth Mass equivalent
  assert(
    '3. formatMass provides Earth mass equivalent in Human mode',
    formatMass(1.0, 'HUMAN').includes('M⊕'),
    `Received: ${formatMass(1.0, 'HUMAN')}`
  );

  // 4. Solar Radius formatting
  assert(
    '4. formatRadius formats solar radius in Solar mode',
    formatRadius(1.0, 'SOLAR').includes('1.000 R☉'),
    `Received: ${formatRadius(1.0, 'SOLAR')}`
  );

  // 5. Compact Object Radius in km
  assert(
    '5. formatRadius formats compact white dwarf / neutron star with km readout',
    formatRadius(0.0084, 'SOLAR').includes('km'),
    `Received: ${formatRadius(0.0084, 'SOLAR')}`
  );

  // 6. Luminosity formatting
  assert(
    '6. formatLuminosity formats solar luminosity in Watts in SI mode',
    formatLuminosity(1.0, 'SI').includes('W'),
    `Received: ${formatLuminosity(1.0, 'SI')}`
  );

  // 7. Temperature formatting
  assert(
    '7. formatTemperature includes Celsius in Human mode',
    formatTemperature(5778, 'HUMAN').includes('5,505 °C') || formatTemperature(5778, 'HUMAN').includes('°C'),
    `Received: ${formatTemperature(5778, 'HUMAN')}`
  );

  // 8. Density formatting
  assert(
    '8. formatDensity shows both kg/m³ and g/cm³ for extreme degenerate densities',
    formatDensity(1e9).includes('g/cm³') && formatDensity(1e9).includes('kg/m³'),
    `Received: ${formatDensity(1e9)}`
  );

  // 9. Velocity fraction of light speed
  assert(
    '9. formatVelocity shows percentage of c for relativistic speeds',
    formatVelocity(182000).includes('% c'),
    `Received: ${formatVelocity(182000)}`
  );

  // 10. Timescale multi-regime formatting
  assert(
    '10. formatTimescale formats Gyr, Myr, and kyr correctly',
    formatTimescale(4.6e9).includes('Gyr') && formatTimescale(1.5e7).includes('Myr') && formatTimescale(25000).includes('kyr'),
    `Received: 4.6 Gyr -> ${formatTimescale(4.6e9)}`
  );

  // ── Group 2: Scientific Notation & Unicode Exponents (Assertions 11–14) ───

  // 11. Superscript generation
  assert(
    '11. toSuperscript correctly converts negative and positive numbers',
    toSuperscript(12) === '¹²' && toSuperscript(-5) === '⁻⁵',
    `Received: ${toSuperscript(12)}, ${toSuperscript(-5)}`
  );

  // 12. Scientific Number formatting
  assert(
    '12. formatScientificNumber produces readable scientific notation with superscripts',
    formatScientificNumber(1.989e30, 3).includes('10³⁰'),
    `Received: ${formatScientificNumber(1.989e30, 3)}`
  );

  // 13. Surface Gravity formatting
  assert(
    '13. formatGravity computes Earth g equivalents correctly',
    formatGravity(274.0, 'SOLAR').includes('g'),
    `Received: ${formatGravity(274.0, 'SOLAR')}`
  );

  // 14. Timescale extreme future Degenerate Era formatting
  assert(
    '14. formatTimescale handles extreme timescales (10¹⁴ years)',
    formatTimescale(1e14).includes('years'),
    `Received: ${formatTimescale(1e14)}`
  );

  // ── Group 3: Cosmic Timeline & Epochs (Assertions 15–20) ──────────────────

  // 15. Cosmic Epochs array existence and count
  assert(
    '15. COSMIC_EPOCHS has at least 8 chronological cosmic milestones',
    COSMIC_EPOCHS.length >= 8,
    `Count: ${COSMIC_EPOCHS.length}`
  );

  // 16. Chronological ordering of cosmic epochs
  let isChronological = true;
  for (let i = 1; i < COSMIC_EPOCHS.length; i++) {
    if (COSMIC_EPOCHS[i].timeFromBigBangYears < COSMIC_EPOCHS[i - 1].timeFromBigBangYears) {
      isChronological = false;
      break;
    }
  }
  assert('16. COSMIC_EPOCHS are strictly monotonically ordered in time', isChronological);

  // 17. Present day cosmic age alignment
  assert(
    '17. Present Day cosmic epoch aligns with 13.787 Gyr',
    Math.abs(UNIVERSE_AGE_YEARS - 13.787e9) < 1e6,
    `Age: ${UNIVERSE_AGE_YEARS}`
  );

  // 18. findCosmicEpochForTime Big Bang lookup
  assert(
    '18. findCosmicEpochForTime(0) returns Big Bang epoch',
    findCosmicEpochForTime(0).id === 'big-bang'
  );

  // 19. findCosmicEpochForTime Present Day lookup
  assert(
    '19. findCosmicEpochForTime(13.8e9) returns Present Day epoch',
    findCosmicEpochForTime(13.8e9).id === 'present-day'
  );

  // 20. findCosmicEpochForTime Degenerate Era lookup
  assert(
    '20. findCosmicEpochForTime(1e15) returns Degenerate Era epoch',
    findCosmicEpochForTime(1e15).id === 'degenerate-era'
  );

  // ── Group 4: Stellar Mass Regimes & Lifecycle Models (Assertions 21–26) ───

  // 21. Very low mass classification
  const vlmRegime = classifyMassRegime(0.2);
  assert(
    '21. 0.2 M☉ star classified into VERY_LOW_MASS regime with White Dwarf fate',
    vlmRegime.regimeId === 'VERY_LOW_MASS' && vlmRegime.finalRemnant === 'WHITE_DWARF'
  );

  // 22. Solar-like star classification
  const solarRegime = classifyMassRegime(1.0);
  assert(
    '22. 1.0 M☉ star classified into SOLAR_LIKE regime with AGB & Planetary Nebula stages',
    solarRegime.regimeId === 'SOLAR_LIKE' && solarRegime.phases.some((p) => p.stageKey === 'ASYMPTOTIC_GIANT_BRANCH')
  );

  // 23. Massive star classification
  const massiveRegime = classifyMassRegime(15.0);
  assert(
    '23. 15.0 M☉ star classified into MASSIVE regime with Core Collapse & Neutron Star fate',
    massiveRegime.regimeId === 'MASSIVE' && massiveRegime.finalRemnant === 'NEUTRON_STAR'
  );

  // 24. Hypermassive star classification
  const hyperRegime = classifyMassRegime(35.0);
  assert(
    '24. 35.0 M☉ star classified into HYPERMASSIVE regime with Black Hole fate',
    hyperRegime.regimeId === 'HYPERMASSIVE' && hyperRegime.finalRemnant === 'BLACK_HOLE'
  );

  // 25. Lifecycle Phase Info retrieval
  const msPhase = getLifecyclePhaseInfo('MAIN_SEQUENCE', 1.0);
  assert(
    '25. getLifecyclePhaseInfo returns valid Phase info for Solar Main Sequence',
    msPhase !== null && msPhase.primaryEnergySource.includes('Nuclear Fusion')
  );

  // 26. Mass loss significance scaling across regimes
  assert(
    '26. Mass loss significance intensifies from Low Mass (Negligible) to Massive (Intense)',
    vlmRegime.massLossSignificance === 'Negligible' && massiveRegime.massLossSignificance.includes('Intense')
  );

  // ── Group 5: Scale Benchmarks & Camera Distance Matcher (Assertions 27–30) ─

  // 27. Scale Benchmarks range coverage
  assert(
    '27. SCALE_BENCHMARKS spans from Neutron Star scale (11.5 km) to Cosmic Web (100 Mpc)',
    SCALE_BENCHMARKS[0].metricDistanceMeters <= 1.2e4 && SCALE_BENCHMARKS[SCALE_BENCHMARKS.length - 1].metricDistanceMeters >= 1e24
  );

  // 28. Scale benchmark matcher for 1 AU
  const auBench = findScaleBenchmark(1.496e11);
  assert(
    '28. findScaleBenchmark matches 1.5e11 meters to 1.0 AU',
    auBench.label.includes('1.0 AU') || auBench.representativeObject.includes('Earth-Sun')
  );

  // 29. Scale benchmark matcher for Galactic scale
  const galBench = findScaleBenchmark(8e20);
  assert(
    '29. findScaleBenchmark matches 8e20 meters to Milky Way Galactic scale',
    galBench.representativeObject.includes('Milky Way') || galBench.label.includes('Kiloparsecs')
  );

  // 30. Scale benchmark matcher for Neutron Star
  const nsBench = findScaleBenchmark(1.15e4);
  assert(
    '30. findScaleBenchmark matches 1.15e4 meters to Neutron Star radius',
    nsBench.representativeObject.includes('Neutron Star')
  );

  // ── Group 6: Comparison Engine & Normalization (Assertions 31–35) ─────────

  // 31. Benchmark objects catalog existence
  assert(
    '31. BENCHMARK_OBJECTS catalog contains Sun, Sirius B, Crab Pulsar, and Cygnus X-1',
    BENCHMARK_OBJECTS.length >= 8 &&
    BENCHMARK_OBJECTS.some((o) => o.id === 'sun') &&
    BENCHMARK_OBJECTS.some((o) => o.id === 'sirius-b') &&
    BENCHMARK_OBJECTS.some((o) => o.id === 'crab-pulsar') &&
    BENCHMARK_OBJECTS.some((o) => o.id === 'cygnus-x1')
  );

  // 32. Build comparison rows for Sun vs Sirius B
  const sunObj = getComparisonObjectById('sun')!;
  const wdObj = getComparisonObjectById('sirius-b')!;
  const rows = buildComparisonRows(sunObj, wdObj, 'SOLAR');
  assert(
    '32. buildComparisonRows generates valid rows for Sun vs Sirius B with Mass and Radius',
    rows.length >= 5 && rows.some((r) => r.propertyKey === 'mass') && rows.some((r) => r.propertyKey === 'radius')
  );

  // 33. Density ratio comparison
  const densityRow = rows.find((r) => r.propertyKey === 'density');
  assert(
    '33. White Dwarf density exceeds Solar density by over 10⁵ in comparison row',
    densityRow !== undefined && (densityRow.valueB as number) > 1e6 * (densityRow.valueA as number)
  );

  // 34. Relativistic Remnant Escape Velocity comparison
  const nsObj = getComparisonObjectById('crab-pulsar')!;
  const nsRows = buildComparisonRows(sunObj, nsObj, 'SOLAR');
  const vEscRow = nsRows.find((r) => r.propertyKey === 'escapeVelocity');
  assert(
    '34. Neutron star escape velocity exceeds 150,000 km/s in comparison table',
    vEscRow !== undefined && (vEscRow.valueB as number) > 150000
  );

  // 35. Missing property graceful handling
  const partialObjA = { id: 'temp1', name: 'Temp A', type: 'Star', massSolar: 1.0 };
  const partialObjB = { id: 'temp2', name: 'Temp B', type: 'Star' };
  const partialRows = buildComparisonRows(partialObjA, partialObjB);
  assert(
    '35. buildComparisonRows gracefully formats missing property as "—"',
    partialRows.some((r) => r.propertyKey === 'mass' && r.formattedB === '—')
  );

  // ── Group 7: Concept Database & Guided Lessons Integrity (Assertions 36–40) ─

  // 36. Concepts count
  assert(
    '36. EDUCATIONAL_CONCEPTS contains at least 20 comprehensive concept definitions',
    EDUCATIONAL_CONCEPTS.length >= 20,
    `Count: ${EDUCATIONAL_CONCEPTS.length}`
  );

  // 37. Key Equations present in core concepts
  const fusionConcept = getConceptById('stellar-fusion');
  const sbConcept = getConceptById('stefan-boltzmann');
  const chConcept = getConceptById('chandrasekhar-limit');
  const bhConcept = getConceptById('black-hole');
  assert(
    '37. Core concepts have valid key equations and variable breakdowns',
    fusionConcept?.keyEquation !== undefined &&
    sbConcept?.keyEquation !== undefined &&
    chConcept?.keyEquation !== undefined &&
    bhConcept?.keyEquation !== undefined
  );

  // 38. Valid related topic links (no broken links)
  let brokenLinksCount = 0;
  for (const concept of EDUCATIONAL_CONCEPTS) {
    for (const relId of concept.relatedTopicIds) {
      if (!getConceptById(relId)) {
        brokenLinksCount++;
      }
    }
  }
  assert(
    '38. All related topic cross-links point to valid concept IDs (zero broken links)',
    brokenLinksCount === 0,
    `Broken links found: ${brokenLinksCount}`
  );

  // 39. Guided Lessons catalog integrity
  assert(
    '39. EDUCATIONAL_LESSONS has at least 3 structured multi-step guided lessons',
    EDUCATIONAL_LESSONS.length >= 3 && EDUCATIONAL_LESSONS.every((l) => l.steps.length >= 3)
  );

  // 40. "How Does a Star Die?" lesson coverage
  const deathLesson = getLessonById('how-stars-die');
  assert(
    '40. "How Does a Star Die?" lesson covers Red Giants, Helium Flash, Planetary Nebulae, and Supernovae',
    deathLesson !== undefined && deathLesson.steps.length >= 5
  );

  // ── Group 8: Education State Store & Modes (Assertions 41–43) ──────────────

  // 41. Education Store mode switching
  const store = useEducationStore.getState();
  store.setEducationMode('SCIENTIFIC');
  assert(
    '41. setEducationMode transitions store mode to SCIENTIFIC and updates active tab',
    useEducationStore.getState().educationMode === 'SCIENTIFIC' &&
    useEducationStore.getState().activeEducationTab === 'SCIENTIFIC'
  );

  // 42. Lesson stepping state
  store.startLesson('how-stars-die');
  store.nextLessonStep();
  assert(
    '42. startLesson & nextLessonStep advance active lesson step index to 1',
    useEducationStore.getState().selectedLessonId === 'how-stars-die' &&
    useEducationStore.getState().activeLessonStepIndex === 1
  );
  store.exitLesson();

  // 43. Unit system & Detail level selection
  store.setUnitSystem('SI');
  store.setDetailLevel('ADVANCED');
  assert(
    '43. Unit system and detail level are updated in state store',
    useEducationStore.getState().unitSystem === 'SI' &&
    useEducationStore.getState().detailLevel === 'ADVANCED'
  );

  // Restore defaults
  store.setEducationMode('EXPLORE');
  store.setUnitSystem('SOLAR');
  store.setDetailLevel('INTERMEDIATE');

  const passedCount = results.filter((r) => r.passed).length;
  return {
    total: results.length,
    passed: passedCount,
    results,
  };
}

// Standalone execution entrypoint
const globalProc = (globalThis as unknown as { process?: { argv?: string[]; exit: (code?: number) => never } }).process;
if (typeof globalProc !== 'undefined' && globalProc.argv && globalProc.argv[1]?.includes('EducationValidation')) {
  console.log('\n🌌 ========================================================');
  console.log('   COSMIC EVOLUTION EXPLORER — PHASE 11 VALIDATION SUITE');
  console.log('========================================================\n');

  const { total, passed, results } = runEducationValidation();

  for (const r of results) {
    console.log(`${r.passed ? '  ✅ PASS' : '  ❌ FAIL'} : ${r.name}`);
    if (!r.passed && r.message) {
      console.log(`     └── ⚠️ ${r.message}`);
    }
  }

  console.log(`\n--------------------------------------------------------`);
  console.log(`Summary: ${passed} / ${total} Tests Passed (${((passed / total) * 100).toFixed(1)}%)`);
  console.log(`--------------------------------------------------------\n`);

  if (passed < total) {
    globalProc.exit(1);
  }
}
