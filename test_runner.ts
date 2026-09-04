/**
 * test_runner.ts
 * Master regression test runner for Phases 7, 8, 9, 10, 11, and 12.
 */

import { runStellarValidationSuite } from './src/stellar/StellarValidation';
import { runStarBirthValidationSuite } from './src/starbirth/StarBirthValidation';
import { runStarEvolutionValidationSuite } from './src/starevolution/StarEvolutionValidation';
import { runStarDeathValidationSuite } from './src/stardeath/StarDeathValidation';
import { runEducationValidation } from './src/education/EducationValidation';
import { runPhase12Validation } from './src/performance/PerformanceValidation';

console.log('\n🌌 ========================================================');
console.log('   COSMIC EVOLUTION EXPLORER — MASTER REGRESSION RUNNER');
console.log('========================================================\n');

// 1. Phase 7: Stellar Physics Engine
console.log('--- RUNNING PHASE 7: STELLAR PHYSICS ENGINE ---');
const p7 = runStellarValidationSuite();
console.log(`Phase 7 Result: ${p7.passedCount} / ${p7.totalTests} Passed (${((p7.passedCount / p7.totalTests) * 100).toFixed(1)}%)\n`);

// 2. Phase 8: Star Birth & Protostars
console.log('--- RUNNING PHASE 8: STAR BIRTH & PROTOSTARS ---');
const p8 = runStarBirthValidationSuite();
console.log(`Phase 8 Result: ${p8.passedCount} / ${p8.totalTests} Passed (${((p8.passedCount / p8.totalTests) * 100).toFixed(1)}%)\n`);

// 3. Phase 9: Stellar Evolution
console.log('--- RUNNING PHASE 9: STELLAR EVOLUTION ENGINE ---');
const p9 = runStarEvolutionValidationSuite();
console.log(`Phase 9 Result: ${p9.passedCount} / ${p9.totalTests} Passed (${((p9.passedCount / p9.totalTests) * 100).toFixed(1)}%)\n`);

// 4. Phase 10: Star Death & Stellar Remnants
console.log('--- RUNNING PHASE 10: STAR DEATH & STELLAR REMNANTS ---');
const p10 = runStarDeathValidationSuite();
console.log(`Phase 10 Result: ${p10.passedCount} / ${p10.totalTests} Passed (${((p10.passedCount / p10.totalTests) * 100).toFixed(1)}%)\n`);

// 5. Phase 11: Educational UI & Cosmic Time Explorer
console.log('--- RUNNING PHASE 11: EDUCATIONAL UI & COSMIC TIME EXPLORER ---');
const p11 = runEducationValidation();
console.log(`Phase 11 Result: ${p11.passed} / ${p11.total} Passed (${((p11.passed / p11.total) * 100).toFixed(1)}%)\n`);

// 6. Phase 12: Performance, Polish & Production Hardening
console.log('--- RUNNING PHASE 12: PERFORMANCE, POLISH & PRODUCTION HARDENING ---');
const p12 = runPhase12Validation();
console.log(`Phase 12 Result: ${p12.passed} / ${p12.total} Passed (${((p12.passed / p12.total) * 100).toFixed(1)}%)\n`);

const grandTotal = p7.totalTests + p8.totalTests + p9.totalTests + p10.totalTests + p11.total + p12.total;
const grandPassed = p7.passedCount + p8.passedCount + p9.passedCount + p10.passedCount + p11.passed + p12.passed;

console.log('========================================================');
console.log(`🏆 GRAND TOTAL: ${grandPassed} / ${grandTotal} TESTS PASSED (${((grandPassed / grandTotal) * 100).toFixed(1)}%)`);
console.log('========================================================\n');

if (grandPassed < grandTotal) {
  process.exit(1);
}
