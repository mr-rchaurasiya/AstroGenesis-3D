/**
 * StarBirthValidation.ts
 * Automated validation suite and benchmark assertions for the Star Birth / Star Formation Engine.
 */

import {
  calculateCloudDensity,
  calculateFreeFallTime,
  calculateJeansInstability,
  calculateVirialParameter,
  createMolecularCloud,
} from './MolecularCloud';
import { evolveCloudCollapse } from './CloudCollapse';
import { calculateAccretionRate, calculateAccretionLuminosity } from './AccretionModel';
import { calculateKelvinHelmholtzTime, evolveProtostar } from './Protostar';
import {
  initializeStarFormationSystem,
  evolveStarFormationSystem,
  calculatePreMainSequenceState,
  sampleKroupaIMF,
} from './StarFormation';

export interface StarBirthValidationResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: Record<string, unknown>;
}

export interface StarBirthValidationReport {
  totalTests: number;
  passedCount: number;
  failedCount: number;
  allPassed: boolean;
  results: StarBirthValidationResult[];
}

/**
 * Runs the full Star Birth test suite and returns structured validation results.
 */
export function runStarBirthValidationSuite(): StarBirthValidationReport {
  const results: StarBirthValidationResult[] = [];

  function assert(name: string, condition: boolean, message: string, details?: Record<string, unknown>) {
    results.push({
      testName: name,
      passed: condition,
      message: condition ? `PASS: ${message}` : `FAIL: ${message}`,
      details,
    });
  }

  // ── 1. Cloud Density & Free-Fall Time ────────────────────────────────────────
  const { kgm3, numberDensityCm3 } = calculateCloudDensity(100.0, 1.5);
  const { years: tFFYears } = calculateFreeFallTime(kgm3);
  assert(
    'Cloud Density & Free-Fall Time',
    kgm3 > 1e-20 && kgm3 < 1e-17 &&
    numberDensityCm3 > 100 &&
    tFFYears > 1.0e5 && tFFYears < 2.0e7,
    `GMC density=${kgm3.toExponential(2)} kg/m³ (${numberDensityCm3.toFixed(0)} cm⁻³), t_ff=${(tFFYears / 1e6).toFixed(2)} Myr`,
    { kgm3, numberDensityCm3, tFFYears },
  );

  // ── 2. Jeans Instability (Length & Mass) ────────────────────────────────────
  const { soundSpeedMs, jeansLengthPc, jeansMassSolar } = calculateJeansInstability(15.0, kgm3);
  assert(
    'Jeans Instability Physics',
    soundSpeedMs > 200 && soundSpeedMs < 400 &&
    jeansLengthPc > 0.05 && jeansLengthPc < 5.0 &&
    jeansMassSolar > 0.1 && jeansMassSolar < 500.0,
    `Sound speed c_s=${soundSpeedMs.toFixed(1)} m/s, λ_J=${jeansLengthPc.toFixed(2)} pc, M_J=${jeansMassSolar.toFixed(1)} M_☉`,
    { soundSpeedMs, jeansLengthPc, jeansMassSolar },
  );

  // ── 3. Virial Parameter & Gravitational Instability ──────────────────────────
  const virialBound = calculateVirialParameter(0.2, 0.2, 100.0);
  const virialUnbound = calculateVirialParameter(5.0, 1.5, 10.0);
  assert(
    'Virial Stability Parameter',
    virialBound < 1.0 && virialUnbound > 1.0,
    `Dense core clump α_vir=${virialBound.toFixed(2)} (<1 bound), diffuse cloud α_vir=${virialUnbound.toFixed(2)} (>1 unbound)`,
    { virialBound, virialUnbound },
  );

  // ── 4. Cloud Collapse Dynamics ──────────────────────────────────────────────
  const cloudInitial = createMolecularCloud({ cloudMassSolar: 100.0, cloudRadiusPc: 1.5 });
  const cloudCollapsed = evolveCloudCollapse(cloudInitial, cloudInitial.freeFallTimeYears * 0.8);
  assert(
    'Cloud Collapse: Contraction & Density Increase',
    cloudCollapsed.radiusPc < cloudInitial.radiusPc &&
    cloudCollapsed.meanDensityKgM3 > cloudInitial.meanDensityKgM3 &&
    cloudCollapsed.collapseProgress > 0.7,
    `Radius contracted from ${cloudInitial.radiusPc.toFixed(2)} pc to ${cloudCollapsed.radiusPc.toFixed(2)} pc, progress=${(cloudCollapsed.collapseProgress * 100).toFixed(1)}%`,
    { rInitial: cloudInitial.radiusPc, rCollapsed: cloudCollapsed.radiusPc },
  );

  // ── 5. Mass Accretion Rate & Decline ───────────────────────────────────────
  const accEarly = calculateAccretionRate(1.0, 1.0e4);
  const accLate = calculateAccretionRate(1.0, 5.0e5);
  assert(
    'Accretion Rate Exponential Decline',
    accEarly > 1e-6 && accLate < accEarly && accLate > 0,
    `Accretion rate: Early=${accEarly.toExponential(2)} M_☉/yr, Late=${accLate.toExponential(2)} M_☉/yr`,
    { accEarly, accLate },
  );

  // ── 6. Accretion Shock Luminosity ──────────────────────────────────────────
  const accLum = calculateAccretionLuminosity(0.5, 3.0, 1.0e-5);
  assert(
    'Accretion Shock Luminosity',
    accLum.solar > 1.0 && accLum.watts > 1.0e26,
    `Accretion Luminosity: ${accLum.solar.toFixed(2)} L_☉ (${accLum.watts.toExponential(2)} W)`,
    { accLum },
  );

  // ── 7. Kelvin-Helmholtz Contraction Timescale ───────────────────────────────
  const tKHSun = calculateKelvinHelmholtzTime(1.0, 1.0, 1.0);
  assert(
    'Kelvin-Helmholtz Timescale',
    tKHSun > 1.0e7 && tKHSun < 5.0e7,
    `Solar Kelvin-Helmholtz time: ${(tKHSun / 1e6).toFixed(2)} Myr (Expected ~30 Myr)`,
    { tKHSun },
  );

  // ── 8. Protostellar Contraction & Core Temperature Growth ───────────────────
  const protoEarly = evolveProtostar({
    id: 'proto_test',
    name: 'Test Protostar',
    parentId: 'cloud_test',
    targetFinalMassSolar: 1.0,
    ageYears: 5.0e4,
  });
  const protoLate = evolveProtostar({
    id: 'proto_test',
    name: 'Test Protostar',
    parentId: 'cloud_test',
    targetFinalMassSolar: 1.0,
    ageYears: 3.5e7,
  });
  assert(
    'Protostellar Contraction & Core Temperature Rise',
    protoLate.radiusSolar < protoEarly.radiusSolar &&
    protoLate.coreTemperatureK > protoEarly.coreTemperatureK &&
    protoLate.coreDensityKgM3 > protoEarly.coreDensityKgM3,
    `Radius shrunk from ${protoEarly.radiusSolar.toFixed(2)} to ${protoLate.radiusSolar.toFixed(2)} R_☉; T_core rose from ${protoEarly.coreTemperatureK.toExponential(2)} K to ${protoLate.coreTemperatureK.toExponential(2)} K`,
    { protoEarly, protoLate },
  );

  // ── 9. Hydrogen Ignition & Sun-like ZAMS Handoff ────────────────────────────
  assert(
    'Sun-like Star Hydrogen Ignition & ZAMS Handoff',
    protoLate.state === 'ZERO_AGE_MAIN_SEQUENCE' &&
    protoLate.coreTemperatureK >= 1.0e7 &&
    protoLate.finalStellarProperties !== undefined &&
    protoLate.finalStellarProperties.spectralTypeLetter === 'G',
    `Ignition confirmed: State=${protoLate.state}, T_core=${(protoLate.coreTemperatureK / 1e6).toFixed(2)}M K, Spectral Class=${protoLate.finalStellarProperties?.fullSpectralDesignation}`,
    { finalStar: protoLate.finalStellarProperties },
  );

  // ── 10. Brown Dwarf / Substellar Boundary Check ─────────────────────────────
  const brownDwarf = evolveProtostar({
    id: 'brown_dwarf_test',
    name: 'Substellar Core',
    parentId: 'cloud_test',
    targetFinalMassSolar: 0.04, // 40 Jupiter masses (< 0.075 M_☉)
    ageYears: 5.0e7,
  });
  assert(
    'Brown Dwarf Substellar Boundary (<0.075 M_☉)',
    brownDwarf.state === 'BROWN_DWARF' &&
    brownDwarf.coreTemperatureK < 1.0e7 &&
    brownDwarf.finalStellarProperties === undefined,
    `Substellar object (0.04 M_☉): State=${brownDwarf.state}, T_core=${(brownDwarf.coreTemperatureK / 1e6).toFixed(2)}M K (No sustained hydrogen burning)`,
    { brownDwarf },
  );

  // ── 11. Massive Star Fast Formation ─────────────────────────────────────────
  const massiveProto = evolveProtostar({
    id: 'massive_proto_test',
    name: 'Massive Protostar (15 M_☉)',
    parentId: 'cloud_test',
    targetFinalMassSolar: 15.0,
    ageYears: 1.0e6,
  });
  assert(
    'Massive Star Formation (15 M_☉)',
    massiveProto.massSolar > 5.0 &&
    massiveProto.luminositySolar > 1000.0 &&
    massiveProto.coreTemperatureK > 1.0e7,
    `Massive protostar: Mass=${massiveProto.massSolar.toFixed(1)} M_☉, L=${massiveProto.luminositySolar.toFixed(0)} L_☉, T_core=${(massiveProto.coreTemperatureK / 1e6).toFixed(1)}M K`,
    { massiveProto },
  );

  // ── 12. Rotational Breakup Safety ───────────────────────────────────────────
  assert(
    'Rotational Breakup Velocity Bounds',
    protoLate.angularVelocityRadS <= protoLate.breakupVelocityRadS &&
    isFinite(protoLate.angularVelocityRadS),
    `Angular velocity ${protoLate.angularVelocityRadS.toExponential(2)} rad/s <= Breakup ${protoLate.breakupVelocityRadS.toExponential(2)} rad/s`,
    { omega: protoLate.angularVelocityRadS, omegaBreakup: protoLate.breakupVelocityRadS },
  );

  // ── 13. Circumstellar Disk & Jet Outflow Coupling ────────────────────────────
  assert(
    'Circumstellar Disk & Bipolar Jet Coupling',
    protoEarly.disk.massSolar > 0 &&
    protoEarly.jets.jetVelocityKmS > 50 &&
    protoEarly.jets.activity > 0 &&
    protoLate.disk.dissipationProgress > 0.9,
    `Early disk=${protoEarly.disk.massSolar.toFixed(3)} M_☉, Jet v=${protoEarly.jets.jetVelocityKmS.toFixed(0)} km/s; Late disk dissipated=${(protoLate.disk.dissipationProgress * 100).toFixed(0)}%`,
  );

  // ── 14. Gas Mass Conservation in Formation Complex ──────────────────────────
  const systemInitial = initializeStarFormationSystem({ cloudMassSolar: 100.0, targetStarMassSolar: 1.0 });
  const systemEvolved = evolveStarFormationSystem(systemInitial, 5.0e5);
  const totalMassAccounted =
    systemEvolved.cloud.gasRemainingSolar +
    systemEvolved.totalStellarMassSolar +
    systemEvolved.totalOutflowMassSolar;
  assert(
    'Gas Conservation (M_initial ≈ M_gas + M_stars + M_outflow)',
    Math.abs(totalMassAccounted - systemEvolved.totalInitialGasSolar) < 0.01,
    `Initial Gas=${systemEvolved.totalInitialGasSolar} M_☉, Accounted=${totalMassAccounted.toFixed(2)} M_☉ (Gas=${systemEvolved.cloud.gasRemainingSolar.toFixed(1)}, Stars=${systemEvolved.totalStellarMassSolar.toFixed(1)}, Outflow=${systemEvolved.totalOutflowMassSolar.toFixed(1)})`,
    { initial: systemEvolved.totalInitialGasSolar, accounted: totalMassAccounted },
  );

  // ── 15. Pre-Main-Sequence Track API & Kroupa IMF ─────────────────────────────
  const pmsStar = calculatePreMainSequenceState(2.0, 1.0e6);
  const imfSample = sampleKroupaIMF(() => 0.5);
  assert(
    'PMS Track API & Kroupa IMF Sampling',
    pmsStar.massSolar > 1.5 && pmsStar.radiusSolar > 1.0 &&
    imfSample > 0.05 && imfSample < 50.0,
    `PMS 2.0 M_☉ star at 1 Myr: Mass=${pmsStar.massSolar.toFixed(2)} M_☉, Radius=${pmsStar.radiusSolar.toFixed(2)} R_☉; Sampled IMF=${imfSample.toFixed(2)} M_☉`,
    { pmsStar, imfSample },
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
