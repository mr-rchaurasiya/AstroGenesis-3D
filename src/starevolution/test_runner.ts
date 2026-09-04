import { runStellarValidationSuite } from '../stellar/StellarValidation';
import { runStarBirthValidationSuite } from '../starbirth/StarBirthValidation';
import { runStarEvolutionValidationSuite } from './StarEvolutionValidation';

console.log('=== RUNNING PHASE 7 STELLAR VALIDATION ===');
const p7 = runStellarValidationSuite();
console.log(`Phase 7: ${p7.passedCount}/${p7.totalTests} tests passed (${p7.allPassed ? 'ALL PASS' : 'FAILURES'})`);
if (!p7.allPassed) {
  p7.results.filter(r => !r.passed).forEach(r => console.error(r.message));
}

console.log('\n=== RUNNING PHASE 8 STAR BIRTH VALIDATION ===');
const p8 = runStarBirthValidationSuite();
console.log(`Phase 8: ${p8.passedCount}/${p8.totalTests} tests passed (${p8.allPassed ? 'ALL PASS' : 'FAILURES'})`);
if (!p8.allPassed) {
  p8.results.filter(r => !r.passed).forEach(r => console.error(r.message));
}

console.log('\n=== RUNNING PHASE 9 STAR EVOLUTION VALIDATION ===');
const p9 = runStarEvolutionValidationSuite();
console.log(`Phase 9: ${p9.passedCount}/${p9.totalTests} tests passed (${p9.allPassed ? 'ALL PASS' : 'FAILURES'})`);
p9.results.forEach(r => console.log(`  ${r.message}`));
if (!p9.allPassed) {
  console.error('\nFAILURES IN PHASE 9:');
  p9.results.filter(r => !r.passed).forEach(r => console.error(r.message));
  throw new Error('Phase 9 validation failed');
} else {
  console.log('\n========================================');
  console.log('ALL TESTS PASSED WITH 100% SUCCESS!');
  console.log('========================================');
}
