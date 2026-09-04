/**
 * StellarConstants.ts
 * Central scientific constants and reference values for the Stellar Physics Engine.
 * Values are given in SI units unless explicitly noted.
 */

// ── Fundamental Physical Constants (CODATA 2018 / IAU) ───────────────────────

/** Gravitational constant G in m³ kg⁻¹ s⁻² */
export const GRAVITATIONAL_CONSTANT_G = 6.67430e-11;

/** Speed of light in vacuum c in m s⁻¹ */
export const SPEED_OF_LIGHT_C = 2.99792458e8;

/** Stefan-Boltzmann constant σ in W m⁻² K⁻⁴ */
export const STEFAN_BOLTZMANN_SIGMA = 5.670374419e-8;

/** Boltzmann constant k_B in J K⁻¹ */
export const BOLTZMANN_CONSTANT_K = 1.380649e-23;

/** Planck constant h in J s */
export const PLANCK_CONSTANT_H = 6.62607015e-34;

/** Proton mass m_p in kg */
export const PROTON_MASS_KG = 1.67262192369e-27;

/** Electron mass m_e in kg */
export const ELECTRON_MASS_KG = 9.1093837015e-31;

/** Atomic mass unit u in kg */
export const ATOMIC_MASS_UNIT_KG = 1.66053906660e-27;

/** Thomson scattering cross-section σ_T in m² */
export const THOMSON_CROSS_SECTION_M2 = 6.6524587321e-29;

/** Electron scattering opacity coefficient κ_es in m² kg⁻¹ (0.04 m² kg⁻¹ = 0.40 cm² g⁻¹ for pure ionized hydrogen) */
export const ELECTRON_SCATTERING_OPACITY_BASE = 0.02; // κ = 0.02 * (1 + X) m² kg⁻¹

// ── Standard Solar Reference Values (IAU / NASA) ─────────────────────────────

/** Solar mass M_☉ in kg */
export const SOLAR_MASS_KG = 1.98847e30;

/** Solar nominal radius R_☉ in meters (IAU 2015 nominal value) */
export const SOLAR_RADIUS_M = 6.957e8;

/** Solar nominal luminosity L_☉ in Watts (IAU 2015 nominal value) */
export const SOLAR_LUMINOSITY_W = 3.828e26;

/** Solar effective surface temperature T_eff,☉ in Kelvin */
export const SOLAR_TEMPERATURE_K = 5772; // Standard nominal IAU value (also commonly 5778 K)

/** Solar age in years */
export const SOLAR_AGE_YEARS = 4.603e9;

/** Solar surface gravity g_☉ in m s⁻² (GM_☉ / R_☉²) */
export const SOLAR_SURFACE_GRAVITY_MS2 = (GRAVITATIONAL_CONSTANT_G * SOLAR_MASS_KG) / (SOLAR_RADIUS_M * SOLAR_RADIUS_M); // ~274.78 m/s²

/** Solar mean density ρ_☉ in kg m⁻³ */
export const SOLAR_MEAN_DENSITY_KGM3 = SOLAR_MASS_KG / ((4 / 3) * Math.PI * Math.pow(SOLAR_RADIUS_M, 3)); // ~1408 kg/m³

/** Solar escape velocity v_esc,☉ in m s⁻¹ */
export const SOLAR_ESCAPE_VELOCITY_MS = Math.sqrt((2 * GRAVITATIONAL_CONSTANT_G * SOLAR_MASS_KG) / SOLAR_RADIUS_M); // ~617.5 km/s

/** Solar core temperature in Kelvin */
export const SOLAR_CORE_TEMPERATURE_K = 1.57e7; // 15.7 million K

/** Solar core density in kg m⁻³ */
export const SOLAR_CORE_DENSITY_KGM3 = 1.62e5; // 162,000 kg/m³ (162 g/cm³)

/** Solar absolute bolometric magnitude M_bol,☉ */
export const SOLAR_ABSOLUTE_BOLOMETRIC_MAGNITUDE = 4.74;

/** Solar absolute visual magnitude M_V,☉ */
export const SOLAR_ABSOLUTE_VISUAL_MAGNITUDE = 4.83;

// ── Solar Photospheric Composition (Asplund et al. 2009 / Grevesse & Sauval) ─

/** Solar hydrogen mass fraction X_☉ */
export const SOLAR_HYDROGEN_FRACTION = 0.7381;

/** Solar helium mass fraction Y_☉ */
export const SOLAR_HELIUM_FRACTION = 0.2485;

/** Solar metallicity (heavy elements) mass fraction Z_☉ */
export const SOLAR_METAL_FRACTION = 0.0134;

/** Solar iron-to-hydrogen ratio reference (Z/X)_☉ */
export const SOLAR_ZX_RATIO = SOLAR_METAL_FRACTION / SOLAR_HYDROGEN_FRACTION; // ~0.01815

// ── Astronomical Units & Conversions ──────────────────────────────────────────

/** Year in SI seconds (Julian year: 365.25 days) */
export const YEAR_IN_SECONDS = 31557600;

/** Astronomical Unit AU in meters */
export const ASTRONOMICAL_UNIT_M = 1.495978707e11;

/** Parsec in meters */
export const PARSEC_IN_METERS = 3.085677581e16;

/** Light year in meters */
export const LIGHT_YEAR_IN_METERS = 9.460730472e15;

// ── Nuclear Fusion & Energy Conversion Constants ──────────────────────────────

/** Mass-to-energy conversion efficiency for 4 ¹H -> ⁴He (0.712% of rest mass) */
export const HYDROGEN_FUSION_EFFICIENCY = 0.00712;

/** Typical core mass fraction participating in Main Sequence hydrogen fusion */
export const CORE_FUSION_MASS_FRACTION_MS = 0.10;

/** Standard nominal Main Sequence lifetime factor in years: ~10 billion years */
export const NOMINAL_SOLAR_MS_LIFETIME_YEARS = 1.0e10;

/** Minimum asymptotic lifetime for hypermassive stars due to mass loss (years) */
export const MINIMUM_STELLAR_LIFETIME_YEARS = 3.0e6;
