/**
 * StellarValidation.ts
 * Comprehensive automated validation suite, physical sanity checks, and benchmark verifications
 * for the Stellar Physics Engine.
 */

import {
  createSunReference,
  createRedDwarfReference,
  createSiriusAReference,
  createRigelReference,
  createBetelgeuseReference,
  createSiriusBWhiteDwarfReference,
  calculateStellarProperties,
} from './StellarModels';
import {
  massToMainSequenceLuminosity,
  massToMainSequenceRadius,
  stefanBoltzmannTemperature,
  calculateSurfaceGravity,
  calculateMeanDensity,
  calculateEscapeVelocity,
  calculateEddingtonLuminosity,
} from './StellarPhysics';
import {
  classifySpectralType,
  calculateBolometricMagnitude,
  calculateApparentMagnitude,
  blackbodyTemperatureToRGB,
} from './StellarClassification';
import { calculateMainSequenceLifetime } from './StellarLifetime';
import { validateComposition, feHToComposition } from './StellarComposition';

export interface ValidationResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface StellarValidationReport {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: ValidationResult[];
}

/**
 * Runs the full test suite and returns structured validation results.
 */
export function runStellarValidationSuite(): StellarValidationReport {
  const results: ValidationResult[] = [];

  function assert(name: string, condition: boolean, message: string, details?: Record<string, unknown>) {
    results.push({
      testName: name,
      passed: condition,
      message: condition ? `PASS: ${message}` : `FAIL: ${message}`,
      details,
    });
  }

  // ── 1. Sun Reference Benchmark ──────────────────────────────────────────────
  const sun = createSunReference();
  assert(
    'Sun: Mass, Radius, Luminosity',
    Math.abs(sun.massSolar - 1.0) < 0.001 &&
    Math.abs(sun.radiusSolar - 1.0) < 0.001 &&
    Math.abs(sun.luminositySolar - 1.0) < 0.001,
    `Sun values: Mass=${sun.massSolar} M_☉, Radius=${sun.radiusSolar} R_☉, Luminosity=${sun.luminositySolar} L_☉`,
    { massSolar: sun.massSolar, radiusSolar: sun.radiusSolar, luminositySolar: sun.luminositySolar },
  );

  assert(
    'Sun: Temperature and Spectral Class',
    sun.effectiveTemperatureK >= 5700 && sun.effectiveTemperatureK <= 5850 &&
    sun.spectralTypeLetter === 'G' &&
    sun.luminosityClass === 'V',
    `Sun temperature: ${sun.effectiveTemperatureK}K, Spectral Designation: ${sun.fullSpectralDesignation}`,
    { tempK: sun.effectiveTemperatureK, spectralClass: sun.fullSpectralDesignation },
  );

  assert(
    'Sun: Main Sequence Lifetime',
    sun.mainSequenceLifetimeYears >= 9.0e9 && sun.mainSequenceLifetimeYears <= 1.1e10,
    `Sun MS Lifetime: ${(sun.mainSequenceLifetimeYears / 1e9).toFixed(2)} Gyr (Expected ~10 Gyr)`,
    { msLifetimeYears: sun.mainSequenceLifetimeYears },
  );

  assert(
    'Sun: Core Fusion & PP Dominance',
    sun.core.dominantFusionProcess === 'PP_CHAIN' && sun.core.ppChainRateRelative > 0.90,
    `Sun PP-chain fraction: ${(sun.core.ppChainRateRelative * 100).toFixed(1)}% (Expected >90%)`,
    { ppRate: sun.core.ppChainRateRelative, cnoRate: sun.core.cnoCycleRateRelative },
  );

  // ── 2. Red Dwarf Benchmark (Proxima Centauri) ──────────────────────────────
  const redDwarf = createRedDwarfReference();
  assert(
    'Red Dwarf: Temperature & Spectral Class',
    redDwarf.effectiveTemperatureK < 3500 &&
    redDwarf.spectralTypeLetter === 'M' &&
    redDwarf.luminositySolar < 0.01,
    `Red dwarf: T=${redDwarf.effectiveTemperatureK}K, Class=${redDwarf.fullSpectralDesignation}, L=${redDwarf.luminositySolar} L_☉`,
    { temp: redDwarf.effectiveTemperatureK, class: redDwarf.fullSpectralDesignation },
  );

  assert(
    'Red Dwarf: Extended Lifespan',
    redDwarf.mainSequenceLifetimeYears > 1.0e11,
    `Red dwarf MS Lifetime: ${(redDwarf.mainSequenceLifetimeYears / 1e12).toFixed(2)} Trillion Years`,
    { msLifetimeYears: redDwarf.mainSequenceLifetimeYears },
  );

  // ── 3. A-type Benchmark (Sirius A) ─────────────────────────────────────────
  const siriusA = createSiriusAReference();
  assert(
    'Sirius A: Temperature & A-Class',
    siriusA.effectiveTemperatureK >= 9000 && siriusA.effectiveTemperatureK <= 10500 &&
    siriusA.spectralTypeLetter === 'A',
    `Sirius A: T=${siriusA.effectiveTemperatureK}K, Class=${siriusA.fullSpectralDesignation}`,
    { temp: siriusA.effectiveTemperatureK, class: siriusA.fullSpectralDesignation },
  );

  // ── 4. Blue Supergiant Benchmark (Rigel) ───────────────────────────────────
  const rigel = createRigelReference();
  assert(
    'Rigel: High Mass & Luminosity',
    rigel.massSolar > 15 && rigel.luminositySolar > 50000 &&
    (rigel.spectralTypeLetter === 'B' || rigel.spectralTypeLetter === 'O') &&
    rigel.luminosityClass === 'Ia',
    `Rigel: L=${rigel.luminositySolar} L_☉, Class=${rigel.fullSpectralDesignation}`,
    { luminosity: rigel.luminositySolar, class: rigel.fullSpectralDesignation },
  );

  // ── 5. Red Supergiant Benchmark (Betelgeuse) ───────────────────────────────
  const betelgeuse = createBetelgeuseReference();
  assert(
    'Betelgeuse: Enormous Radius & Cool Temperature',
    betelgeuse.radiusSolar > 500 && betelgeuse.effectiveTemperatureK < 4000 &&
    betelgeuse.spectralTypeLetter === 'M',
    `Betelgeuse: R=${betelgeuse.radiusSolar} R_☉, T=${betelgeuse.effectiveTemperatureK}K`,
    { radius: betelgeuse.radiusSolar, temp: betelgeuse.effectiveTemperatureK },
  );

  // ── 6. White Dwarf Benchmark (Sirius B) ─────────────────────────────────────
  const siriusB = createSiriusBWhiteDwarfReference();
  assert(
    'Sirius B: Compact Radius & High Surface Gravity',
    siriusB.radiusSolar < 0.02 &&
    siriusB.surfaceGravityLogG > 7.0 &&
    siriusB.luminosityClass === 'VII',
    `Sirius B: R=${siriusB.radiusSolar} R_☉, log(g)=${siriusB.surfaceGravityLogG.toFixed(2)}, Class=${siriusB.fullSpectralDesignation}`,
    { radius: siriusB.radiusSolar, logG: siriusB.surfaceGravityLogG },
  );

  // ── 7. Monotonic Physical Sanity Checks ────────────────────────────────────
  const masses = [0.1, 0.5, 1.0, 2.0, 5.0, 10.0, 30.0];
  let lumMonotonic = true;
  let lifetimeMonotonic = true;

  for (let i = 0; i < masses.length - 1; i++) {
    const l1 = massToMainSequenceLuminosity(masses[i]);
    const l2 = massToMainSequenceLuminosity(masses[i + 1]);
    if (l2 <= l1) lumMonotonic = false;

    const t1 = calculateMainSequenceLifetime(masses[i], l1);
    const t2 = calculateMainSequenceLifetime(masses[i + 1], l2);
    if (t2 >= t1) lifetimeMonotonic = false;
  }

  assert(
    'Main Sequence: Monotonic Mass-Luminosity Scaling',
    lumMonotonic,
    'Luminosity strictly increases with mass across Main Sequence',
  );

  assert(
    'Main Sequence: Shorter Lifetimes for Higher Mass Stars',
    lifetimeMonotonic,
    'Main sequence lifetime strictly decreases with increasing mass',
  );

  // ── 8. Stefan-Boltzmann Physical Consistency ──────────────────────────────
  const testT = stefanBoltzmannTemperature(16.0, 2.0); // L=16, R=2 => T = T_☉ * (16/4)^0.25 = T_☉ * 4^0.25 = T_☉ * sqrt(2) ≈ 8171 K
  const expectedT = 5772 * Math.pow(4, 0.25);
  assert(
    'Stefan-Boltzmann Inversion Consistency',
    Math.abs(testT - expectedT) < 5.0,
    `Derived T=${testT.toFixed(1)}K, Expected=${expectedT.toFixed(1)}K`,
    { testT, expectedT },
  );

  // ── 9. Composition Conservation ────────────────────────────────────────────
  const comp1 = feHToComposition(0.0);
  const comp2 = feHToComposition(-2.0);
  const comp3 = feHToComposition(0.5);

  assert(
    'Composition: Unity Conservation (X + Y + Z = 1)',
    validateComposition(comp1) && validateComposition(comp2) && validateComposition(comp3),
    'All elemental mass fractions sum to 1.0 within numerical tolerance',
    { comp1, comp2, comp3 },
  );

  // ── 10. Magnitude Inversion & Distance Modulus ─────────────────────────────
  const mBolSun = calculateBolometricMagnitude(1.0);
  const mBol100L = calculateBolometricMagnitude(100.0);
  assert(
    'Bolometric Magnitude Inversion',
    mBol100L < mBolSun && Math.abs((mBolSun - mBol100L) - 5.0) < 0.01,
    `100x luminosity produces exactly 5.0 magnitudes brighter (mBol Sun=${mBolSun.toFixed(2)}, 100L=${mBol100L.toFixed(2)})`,
  );

  const mApp10pc = calculateApparentMagnitude(4.83, 10.0);
  const mApp100pc = calculateApparentMagnitude(4.83, 100.0);
  assert(
    'Distance Modulus Scaling (10pc vs 100pc)',
    Math.abs(mApp10pc - 4.83) < 0.01 && Math.abs(mApp100pc - 9.83) < 0.01,
    `At 10pc m_V=${mApp10pc.toFixed(2)}, at 100pc m_V=${mApp100pc.toFixed(2)} (+5.0 mag for 10x distance)`,
  );

  // ── 11. Numerical Safety & Edge Cases ──────────────────────────────────────
  const zeroMassStar = calculateStellarProperties({ massSolar: 0 });
  const negativeMassStar = calculateStellarProperties({ massSolar: -5 });
  const hugeMassStar = calculateStellarProperties({ massSolar: 1000 });

  assert(
    'Numerical Safety: Zero & Negative Mass Clamping',
    isFinite(zeroMassStar.luminosityWatts) && !isNaN(zeroMassStar.effectiveTemperatureK) &&
    isFinite(negativeMassStar.surfaceGravityMs2) && !isNaN(negativeMassStar.meanDensityKgM3) &&
    isFinite(hugeMassStar.eddingtonLuminosityWatts),
    'Safe handling of zero, negative, and extreme stellar parameters without NaN or Infinity',
  );

  // ── 12. Blackbody RGB Validity ─────────────────────────────────────────────
  const rgbCool = blackbodyTemperatureToRGB(2000);
  const rgbHot = blackbodyTemperatureToRGB(35000);
  assert(
    'Blackbody Color Validity',
    rgbCool[0] >= 0 && rgbCool[0] <= 1 && rgbHot[2] >= 0 && rgbHot[2] <= 1 &&
    rgbCool[0] > rgbCool[2] && rgbHot[2] > rgbHot[0], // Cool = red dominant, Hot = blue dominant
    `Cool 2000K: [${rgbCool.map(v => v.toFixed(2)).join(', ')}], Hot 35000K: [${rgbHot.map(v => v.toFixed(2)).join(', ')}]`,
  );

  // ── 13. Pure Formula Unit Tests: Gravity, Density, Escape Velocity, Eddington ──
  const gSun = calculateSurfaceGravity(1.98847e30, 6.957e8);
  const rhoSun = calculateMeanDensity(1.98847e30, 6.957e8);
  const vEscSun = calculateEscapeVelocity(1.98847e30, 6.957e8);
  const eddSun = calculateEddingtonLuminosity(1.98847e30);
  const rMS2 = massToMainSequenceRadius(2.0);

  assert(
    'Pure Formulas: Solar Gravity & Escape Velocity',
    Math.abs(gSun.solar - 1.0) < 0.01 &&
    Math.abs(rhoSun.solar - 1.0) < 0.01 &&
    vEscSun.kms >= 610 && vEscSun.kms <= 625 &&
    eddSun.solar > 30000 &&
    rMS2 > 1.0,
    `Solar g=${gSun.ms2.toFixed(1)} m/s² (ratio=${gSun.solar.toFixed(2)}), ρ=${rhoSun.kgm3.toFixed(0)} kg/m³, v_esc=${vEscSun.kms.toFixed(1)} km/s, L_Edd=${eddSun.solar.toFixed(0)} L_☉`,
    { gSun, rhoSun, vEscSun, eddSun, rMS2 },
  );

  // ── 14. Pure Formula: Spectral Classification Hierarchy ──
  const specO = classifySpectralType(40000);
  const specB = classifySpectralType(20000);
  const specA = classifySpectralType(8500);
  const specF = classifySpectralType(6800);
  const specG = classifySpectralType(5778);
  const specK = classifySpectralType(4500);
  const specM = classifySpectralType(3000);
  const specL = classifySpectralType(1800);
  const specT = classifySpectralType(1000);
  const specY = classifySpectralType(500);

  assert(
    'Spectral Classification: Complete OBAFGKMLTY Sequence',
    specO.letter === 'O' &&
    specB.letter === 'B' &&
    specA.letter === 'A' &&
    specF.letter === 'F' &&
    specG.letter === 'G' && specG.spectralClass === 'G2' &&
    specK.letter === 'K' &&
    specM.letter === 'M' &&
    specL.letter === 'L' &&
    specT.letter === 'T' &&
    specY.letter === 'Y',
    `Classified sequence: ${[specO, specB, specA, specF, specG, specK, specM, specL, specT, specY].map(s => s.spectralClass).join(' -> ')}`,
  );

  const passedCount = results.filter(r => r.passed).length;
  const failedCount = results.length - passedCount;

  return {
    totalTests: results.length,
    passedCount,
    failedCount,
    allPassed: failedCount === 0,
    results,
  };
}

