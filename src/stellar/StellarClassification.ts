/**
 * StellarClassification.ts
 * Morgan-Keenan spectral classification (O, B, A, F, G, K, M, L, T, Y),
 * luminosity classes (I–VII), bolometric/visual magnitudes, distance modulus,
 * and physically grounded blackbody RGB color mappings.
 */

import {
  SOLAR_ABSOLUTE_BOLOMETRIC_MAGNITUDE,
  SOLAR_ABSOLUTE_VISUAL_MAGNITUDE,
} from './StellarConstants';
import type {
  SpectralTypeLetter,
  SpectralClass,
  LuminosityClass,
  StellarEvolutionaryState,
  StellarVisualProperties,
} from './StellarTypes';

// ── Spectral Type Temperature Boundaries (in Kelvin) ─────────────────────────

interface SpectralBand {
  letter: SpectralTypeLetter;
  minTempK: number;
  maxTempK: number;
  description: string;
}

const SPECTRAL_BANDS: SpectralBand[] = [
  { letter: 'O', minTempK: 30000, maxTempK: 60000, description: 'Ionized helium & nitrogen lines; intensely luminous blue' },
  { letter: 'B', minTempK: 10000, maxTempK: 30000, description: 'Neutral helium & hydrogen Balmer lines; deep blue-white' },
  { letter: 'A', minTempK: 7500,  maxTempK: 10000, description: 'Strongest neutral hydrogen Balmer lines; pure white' },
  { letter: 'F', minTempK: 6000,  maxTempK: 7500,  description: 'Ionized calcium (H & K) & metal lines; yellow-white' },
  { letter: 'G', minTempK: 5200,  maxTempK: 6000,  description: 'Strong ionized calcium & neutral metals; golden yellow (Sun-like)' },
  { letter: 'K', minTempK: 3700,  maxTempK: 5200,  description: 'Neutral metal lines & molecular CH bands; vibrant orange' },
  { letter: 'M', minTempK: 2400,  maxTempK: 3700,  description: 'Strong titanium oxide (TiO) absorption bands; cool deep red' },
  { letter: 'L', minTempK: 1300,  maxTempK: 2400,  description: 'Metal hydride & neutral alkali metal lines; brown dwarf magenta/infrared' },
  { letter: 'T', minTempK: 700,   maxTempK: 1300,  description: 'Strong methane (CH4) & water vapor bands; cool infrared brown dwarf' },
  { letter: 'Y', minTempK: 250,   maxTempK: 700,   description: 'Ammonia (NH3) & cloud condensates; ultra-cool substellar object' },
];

/**
 * Classifies a star into its Morgan-Keenan spectral type and decimal subtype based on effective temperature.
 *
 * @param temperatureK - Effective surface temperature in Kelvin
 * @returns Object with letter, subtype, combined class string, and description
 */
export function classifySpectralType(temperatureK: number): {
  letter: SpectralTypeLetter;
  subtype: number;
  spectralClass: SpectralClass;
  description: string;
} {
  const t = Math.max(250, isFinite(temperatureK) ? temperatureK : 5778);

  // Find matching band or clamp
  let matchedBand: SpectralBand = SPECTRAL_BANDS[SPECTRAL_BANDS.length - 1]; // Default Y
  if (t >= SPECTRAL_BANDS[0].minTempK) {
    matchedBand = SPECTRAL_BANDS[0]; // O
  } else {
    for (const band of SPECTRAL_BANDS) {
      if (t >= band.minTempK && t < band.maxTempK) {
        matchedBand = band;
        break;
      }
    }
  }

  // Calculate subtype: In astronomy, subtype 0 is hottest in the class, subtype 9 is coolest in the class
  // Fractional position from max down to min: 0 at maxTempK, 9 at minTempK (10 bins 0..9)
  const span = Math.max(1, matchedBand.maxTempK - matchedBand.minTempK);
  const fractionCooling = Math.max(0, Math.min(0.999, (matchedBand.maxTempK - t) / span));
  const clampedSubtype = Math.max(0, Math.min(9, Math.floor(fractionCooling * 10)));

  const spectralClass: SpectralClass = `${matchedBand.letter}${clampedSubtype}`;

  return {
    letter: matchedBand.letter,
    subtype: clampedSubtype,
    spectralClass,
    description: matchedBand.description,
  };
}

/**
 * Determines appropriate Morgan-Keenan luminosity class based on evolutionary state and surface gravity.
 *
 * @param evolutionaryState - Current evolutionary state
 * @param logG - Logarithmic surface gravity in cgs units log10(g in cm/s²)
 * @param explicitClass - Optional explicit override
 * @returns LuminosityClass (Ia+, Ia, Ib, II, III, IV, V, VI, VII)
 */
export function determineLuminosityClass(
  evolutionaryState: StellarEvolutionaryState,
  logG: number = 4.44,
  explicitClass?: LuminosityClass,
): LuminosityClass {
  if (explicitClass) return explicitClass;

  switch (evolutionaryState) {
    case 'WHITE_DWARF':
      return 'VII';
    case 'SUBGIANT':
      return 'IV';
    case 'RED_GIANT':
    case 'HELIUM_BURNING':
      return logG < 1.0 ? 'II' : 'III';
    case 'AGB':
    case 'POST_AGB':
      return logG < 0.0 ? 'Ia' : 'Ib';
    case 'MAIN_SEQUENCE':
    case 'PRE_MAIN_SEQUENCE':
    case 'PROTOSTAR':
    default:
      if (logG > 5.0) return 'VI'; // Subdwarf
      if (logG < 2.0) return 'Ib'; // Supergiant
      if (logG < 3.5) return 'III'; // Giant
      return 'V'; // Standard Main Sequence Dwarf
  }
}

// ── Magnitude Calculations ───────────────────────────────────────────────────

/**
 * Computes absolute bolometric magnitude M_bol.
 * Formula: M_bol = M_bol,☉ - 2.5 * log10(L / L_☉) = 4.74 - 2.5 * log10(L / L_☉)
 *
 * @param luminositySolar - Luminosity in Solar units L_☉
 * @returns Absolute bolometric magnitude M_bol
 */
export function calculateBolometricMagnitude(luminositySolar: number): number {
  const L = Math.max(1e-10, isFinite(luminositySolar) ? luminositySolar : 1.0);
  return SOLAR_ABSOLUTE_BOLOMETRIC_MAGNITUDE - 2.5 * Math.log10(L);
}

/**
 * Computes approximate Bolometric Correction (BC) to convert between M_bol and visual magnitude M_V.
 * Formula: M_V = M_bol - BC
 * Uses polynomial fit of standard astrophysical bolometric correction tables vs log10(T_eff).
 *
 * @param temperatureK - Effective temperature in Kelvin
 * @returns Bolometric correction value BC (always <= 0)
 */
export function estimateBolometricCorrection(temperatureK: number): number {
  const logT = Math.log10(Math.max(1000, Math.min(50000, temperatureK)));

  // Polynomial approximation centered on Solar temperature logT_☉ ≈ 3.7618 (BC_☉ ≈ -0.09)
  const x = logT - 3.7618;
  const bc = -0.09 - 1.2 * x * x - 2.5 * Math.pow(x, 4);
  return Math.min(0, bc);
}

/**
 * Computes absolute visual magnitude M_V.
 *
 * @param luminositySolar - Luminosity in L_☉
 * @param temperatureK - Effective temperature in Kelvin
 * @returns Absolute visual magnitude M_V
 */
export function calculateAbsoluteVisualMagnitude(luminositySolar: number, temperatureK: number): number {
  const mBol = calculateBolometricMagnitude(luminositySolar);
  const bc = estimateBolometricCorrection(temperatureK);
  return mBol - bc;
}

/**
 * Computes apparent visual magnitude m_V using distance modulus equation.
 * Formula: m - M = 5 * log10(d / 10 pc) = 5 * log10(d) - 5
 *
 * @param absoluteMagnitude - Absolute visual magnitude M_V
 * @param distanceParsecs - Distance to the star in parsecs (pc)
 * @returns Apparent magnitude m_V
 */
export function calculateApparentMagnitude(absoluteMagnitude: number, distanceParsecs: number): number {
  const d = Math.max(0.0001, isFinite(distanceParsecs) ? distanceParsecs : 10.0);
  const M = isFinite(absoluteMagnitude) ? absoluteMagnitude : SOLAR_ABSOLUTE_VISUAL_MAGNITUDE;

  return M + 5.0 * Math.log10(d) - 5.0;
}

// ── Physical Blackbody RGB Color Mapping ─────────────────────────────────────

/**
 * Maps blackbody temperature to physically motivated normalized linear RGB color channels [0, 1].
 * Uses Tanner Helland / Planckian locus mathematical model with smooth spectral transitions.
 *
 * @param tempK - Temperature in Kelvin
 * @returns RGB tuple [r, g, b] in [0, 1]
 */
export function blackbodyTemperatureToRGB(tempK: number): [number, number, number] {
  const t = Math.max(1000, Math.min(45000, tempK)) / 100;

  let r: number;
  let g: number;
  let b: number;

  // Red Channel
  if (t <= 66) {
    r = 255;
  } else {
    r = t - 60;
    r = 329.698727446 * Math.pow(r, -0.1332047592);
    r = Math.max(0, Math.min(255, r));
  }

  // Green Channel
  if (t <= 66) {
    g = t;
    g = 99.4708025861 * Math.log(g) - 161.1195681661;
    g = Math.max(0, Math.min(255, g));
  } else {
    g = t - 60;
    g = 288.1221695283 * Math.pow(g, -0.0755148492);
    g = Math.max(0, Math.min(255, g));
  }

  // Blue Channel
  if (t >= 66) {
    b = 255;
  } else if (t <= 19) {
    b = 0;
  } else {
    b = t - 10;
    b = 138.5177312231 * Math.log(b) - 305.0447927307;
    b = Math.max(0, Math.min(255, b));
  }

  return [r / 255.0, g / 255.0, b / 255.0];
}

/**
 * Converts normalized RGB channels to CSS hex color code.
 */
export function rgbToHex(rgb: [number, number, number]): string {
  const toHex = (c: number) => {
    const val = Math.max(0, Math.min(255, Math.round(c * 255)));
    return val.toString(16).padStart(2, '0');
  };
  return `#${toHex(rgb[0])}${toHex(rgb[1])}${toHex(rgb[2])}`;
}

/**
 * Calculates complete visual rendering properties from physics data.
 *
 * @param temperatureK - Effective temperature
 * @param luminositySolar - Luminosity in Solar units
 * @param radiusSolar - Radius in Solar units
 * @returns StellarVisualProperties
 */
export function deriveStellarVisualProperties(
  temperatureK: number,
  luminositySolar: number,
  radiusSolar: number,
): StellarVisualProperties {
  const rgb = blackbodyTemperatureToRGB(temperatureK);
  const hexColor = rgbToHex(rgb);

  // Coronal halo color (slightly shifted warmer/more saturated for atmospheric glow)
  const coronaRgb: [number, number, number] = [
    Math.min(1.0, rgb[0] * 1.05),
    Math.min(1.0, rgb[1] * 0.95),
    Math.min(1.0, rgb[2] * 0.90),
  ];
  const coronaColor = rgbToHex(coronaRgb);

  // Normalized visual brightness (logarithmic scale)
  const logL = Math.log10(Math.max(1e-5, luminositySolar));
  const brightness = Math.max(0.1, Math.min(1.0, 0.5 + 0.15 * logL));

  // Bloom intensity factor based on luminosity & temperature
  const bloomIntensity = Math.max(0.4, Math.min(3.5, 1.0 + 0.3 * Math.log10(Math.max(0.1, luminositySolar))));

  // Exploration visual radius (non-linear scaling for visibility)
  const visualRadiusExploration = Math.max(0.4, Math.min(20.0, 1.5 * Math.pow(Math.max(0.01, radiusSolar), 0.35)));

  // Scientific visual radius (linear proportional with gentle floor)
  const visualRadiusScientific = Math.max(0.05, radiusSolar * 1.5);

  const { description } = classifySpectralType(temperatureK);

  return {
    rgbColor: rgb,
    hexColor,
    coronaColor,
    brightness,
    bloomIntensity,
    visualRadiusExploration,
    visualRadiusScientific,
    spectralDescription: description,
  };
}
