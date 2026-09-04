/**
 * CoreCollapse.ts
 * Iron-core gravitational collapse, photodisintegration, electron capture,
 * and rapid implosion dynamics leading to core bounce and supernova shock launch.
 */

export interface CoreCollapseState {
  coreMassSolar: number;
  coreRadiusKm: number;
  infallVelocityKmS: number;
  coreDensityKgM3: number;
  coreTemperatureK: number;
  collapseProgress: number;
  isBounced: boolean;
}

/**
 * Calculates core structural parameters during dynamic gravitational collapse.
 *
 * @param coreMassSolar - Inward iron core mass in M_☉ (~1.4 - 3.0 M_☉)
 * @param collapseProgress - Normalized progress fraction (0.0 = onset of instability, 1.0 = nuclear bounce)
 * @returns CoreCollapseState
 */
export function calculateCoreCollapseState(
  coreMassSolar: number,
  collapseProgress: number,
): CoreCollapseState {
  const M = Math.max(1.2, isFinite(coreMassSolar) ? coreMassSolar : 1.5);
  const tau = Math.max(0, Math.min(1.0, isFinite(collapseProgress) ? collapseProgress : 0));

  // Initial progenitor iron core radius: ~1500 km -> collapsing down to ~12 km nuclear bounce radius
  const initialRadiusKm = 1500.0;
  const finalRadiusKm = 12.0;
  const coreRadiusKm = initialRadiusKm * Math.pow(finalRadiusKm / initialRadiusKm, tau);

  // Infall velocity: free-fall acceleration reaches ~70,000 km/s (~0.23 c)
  const maxInfallKmS = 70000.0 * Math.sqrt(M / 1.5);
  const infallVelocityKmS = maxInfallKmS * Math.sin(tau * Math.PI * 0.5);

  // Central core density: rises from ~10¹⁰ kg/m³ to nuclear saturation density ~3×10¹⁷ kg/m³
  const initialDensityKgM3 = 1.0e10;
  const finalDensityKgM3 = 3.0e17;
  const coreDensityKgM3 = initialDensityKgM3 * Math.pow(finalDensityKgM3 / initialDensityKgM3, tau);

  // Central core temperature: rises from ~5×10⁹ K to ~10¹¹ K (neutrino sphere formation)
  const initialTempK = 5.0e9;
  const finalTempK = 1.2e11;
  const coreTemperatureK = initialTempK * Math.pow(finalTempK / initialTempK, tau);

  const isBounced = tau >= 0.99;

  return {
    coreMassSolar: M,
    coreRadiusKm,
    infallVelocityKmS,
    coreDensityKgM3,
    coreTemperatureK,
    collapseProgress: tau,
    isBounced,
  };
}
