/**
 * EducationFormatter.ts
 * Astronomical and Physical Unit Formatter.
 * Handles precision formatting for mass, radius, distance, temperature,
 * luminosity, density, velocity, energy, and timescales across
 * SOLAR, SI, ASTRONOMICAL, and HUMAN unit systems.
 */

import type { UnitSystem } from './EducationTypes';
import {
  SOLAR_MASS_KG,
  SOLAR_RADIUS_M,
  SOLAR_LUMINOSITY_W,
  EARTH_MASS_KG,
  EARTH_RADIUS_M,
  ASTRONOMICAL_UNIT_M,
  LIGHT_YEAR_M,
  PARSEC_M,
  KILOPARSEC_M,
  MEGAPARSEC_M,
} from './EducationConstants';

/**
 * Format standard numeric value to scientific notation or fixed decimals cleanly.
 */
export function formatScientificNumber(value: number, sigFigs = 3): string {
  if (!Number.isFinite(value)) return 'N/A';
  if (value === 0) return '0';

  const absVal = Math.abs(value);
  if (absVal >= 1e-2 && absVal < 1e5) {
    if (absVal >= 100) return value.toFixed(1);
    if (absVal >= 10) return value.toFixed(2);
    if (absVal >= 1) return value.toFixed(sigFigs - 1);
    return value.toPrecision(sigFigs);
  }

  const expStr = value.toExponential(sigFigs - 1);
  const [mantissa, exponent] = expStr.split('e');
  const expNum = parseInt(exponent, 10);
  return `${mantissa} × 10${toSuperscript(expNum)}`;
}

/**
 * Converts standard integer exponent to Unicode superscript digits.
 */
export function toSuperscript(num: number): string {
  const digits: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
    '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '-': '⁻', '+': '⁺',
  };
  return num.toString().split('').map((char) => digits[char] ?? char).join('');
}

/**
 * Formats mass given in Solar Masses (M☉).
 */
export function formatMass(massSolar: number, unitSystem: UnitSystem = 'SOLAR'): string {
  if (!Number.isFinite(massSolar) || massSolar < 0) return 'N/A';

  switch (unitSystem) {
    case 'SOLAR':
      if (massSolar >= 100) return `${massSolar.toFixed(1)} M☉`;
      if (massSolar >= 1) return `${massSolar.toFixed(3)} M☉`;
      if (massSolar >= 0.01) return `${massSolar.toFixed(4)} M☉`;
      return `${formatScientificNumber(massSolar, 3)} M☉`;

    case 'SI': {
      const kg = massSolar * SOLAR_MASS_KG;
      return `${formatScientificNumber(kg, 3)} kg`;
    }

    case 'ASTRONOMICAL':
      return `${formatScientificNumber(massSolar, 3)} M☉`;

    case 'HUMAN': {
      const earthMasses = (massSolar * SOLAR_MASS_KG) / EARTH_MASS_KG;
      if (earthMasses < 10) return `${earthMasses.toFixed(2)} M⊕ (Earth masses)`;
      if (earthMasses < 1000) return `${earthMasses.toFixed(1)} M⊕ (Earth masses)`;
      return `${formatScientificNumber(earthMasses, 3)} M⊕ (${massSolar.toFixed(2)} M☉)`;
    }
  }
}

/**
 * Formats radius given in Solar Radii (R☉).
 */
export function formatRadius(radiusSolar: number, unitSystem: UnitSystem = 'SOLAR'): string {
  if (!Number.isFinite(radiusSolar) || radiusSolar <= 0) return 'N/A';

  const meters = radiusSolar * SOLAR_RADIUS_M;
  const km = meters / 1000;

  switch (unitSystem) {
    case 'SOLAR':
      if (radiusSolar >= 100) return `${radiusSolar.toFixed(1)} R☉`;
      if (radiusSolar >= 0.1) return `${radiusSolar.toFixed(3)} R☉`;
      if (radiusSolar >= 0.001) return `${radiusSolar.toFixed(4)} R☉ (${km.toFixed(0)} km)`;
      return `${formatScientificNumber(radiusSolar, 3)} R☉ (${km.toFixed(1)} km)`;

    case 'SI':
      if (meters < 1e6) return `${meters.toFixed(0)} m`;
      return `${formatScientificNumber(meters, 3)} m`;

    case 'ASTRONOMICAL':
      if (km < 1e6) return `${km.toFixed(1)} km`;
      if (meters < ASTRONOMICAL_UNIT_M * 0.1) return `${(km / 1e3).toFixed(1)}k km`;
      return `${(meters / ASTRONOMICAL_UNIT_M).toFixed(4)} AU`;

    case 'HUMAN': {
      const earthRadii = meters / EARTH_RADIUS_M;
      if (earthRadii < 0.1) return `${km.toFixed(1)} km (${(earthRadii * 100).toFixed(1)}% R⊕)`;
      if (earthRadii < 20) return `${earthRadii.toFixed(2)} R⊕ (Earth radii)`;
      if (radiusSolar < 5) return `${radiusSolar.toFixed(2)} R☉ (${km.toLocaleString()} km)`;
      return `${radiusSolar.toFixed(1)} R☉ (${(meters / ASTRONOMICAL_UNIT_M).toFixed(2)} AU)`;
    }
  }
}

/**
 * Formats distance in meters.
 */
export function formatDistance(distanceMeters: number, unitSystem: UnitSystem = 'ASTRONOMICAL'): string {
  if (!Number.isFinite(distanceMeters) || distanceMeters < 0) return 'N/A';

  const km = distanceMeters / 1000;
  const au = distanceMeters / ASTRONOMICAL_UNIT_M;
  const ly = distanceMeters / LIGHT_YEAR_M;
  const pc = distanceMeters / PARSEC_M;
  const kpc = distanceMeters / KILOPARSEC_M;
  const mpc = distanceMeters / MEGAPARSEC_M;

  switch (unitSystem) {
    case 'SI':
      if (distanceMeters < 1e5) return `${distanceMeters.toFixed(1)} m`;
      return `${formatScientificNumber(distanceMeters, 3)} m`;

    case 'SOLAR':
      if (au < 0.01) return `${km.toLocaleString()} km (${(distanceMeters / SOLAR_RADIUS_M).toFixed(2)} R☉)`;
      if (au < 100) return `${au.toFixed(3)} AU`;
      if (ly < 1000) return `${ly.toFixed(2)} ly`;
      if (kpc < 100) return `${kpc.toFixed(2)} kpc`;
      return `${mpc.toFixed(2)} Mpc`;

    case 'ASTRONOMICAL':
      if (distanceMeters < ASTRONOMICAL_UNIT_M * 0.01) return `${km.toLocaleString()} km`;
      if (distanceMeters < PARSEC_M * 0.1) return `${au.toFixed(3)} AU`;
      if (distanceMeters < KILOPARSEC_M) return `${pc.toFixed(2)} pc`;
      if (distanceMeters < MEGAPARSEC_M) return `${kpc.toFixed(2)} kpc`;
      return `${mpc.toFixed(3)} Mpc`;

    case 'HUMAN':
      if (distanceMeters < 1e4) return `${distanceMeters.toFixed(0)} meters`;
      if (distanceMeters < 1e7) return `${km.toLocaleString()} km`;
      if (au < 50) return `${au.toFixed(2)} AU (${(km / 1e6).toFixed(1)}M km)`;
      if (ly < 10000) return `${ly.toFixed(1)} light-years`;
      if (kpc < 100) return `${kpc.toFixed(1)} thousand light-years`;
      return `${(ly / 1e6).toFixed(2)} million light-years`;
  }
}

/**
 * Formats luminosity in Solar Luminosities (L☉).
 */
export function formatLuminosity(luminositySolar: number, unitSystem: UnitSystem = 'SOLAR'): string {
  if (!Number.isFinite(luminositySolar) || luminositySolar < 0) return 'N/A';

  switch (unitSystem) {
    case 'SOLAR':
    case 'ASTRONOMICAL':
      if (luminositySolar >= 1000) return `${luminositySolar.toLocaleString(undefined, { maximumFractionDigits: 1 })} L☉`;
      if (luminositySolar >= 1) return `${luminositySolar.toFixed(3)} L☉`;
      if (luminositySolar >= 0.001) return `${luminositySolar.toFixed(5)} L☉`;
      return `${formatScientificNumber(luminositySolar, 3)} L☉`;

    case 'SI': {
      const watts = luminositySolar * SOLAR_LUMINOSITY_W;
      return `${formatScientificNumber(watts, 3)} W`;
    }

    case 'HUMAN':
      if (luminositySolar >= 10000) return `${formatScientificNumber(luminositySolar, 2)}× the Sun's brightness`;
      if (luminositySolar >= 1) return `${luminositySolar.toFixed(2)}× Sun's luminosity`;
      return `${(luminositySolar * 100).toFixed(2)}% of the Sun`;
  }
}

/**
 * Formats temperature in Kelvin.
 */
export function formatTemperature(temperatureK: number, unitSystem: UnitSystem = 'SOLAR'): string {
  if (!Number.isFinite(temperatureK) || temperatureK < 0) return 'N/A';

  switch (unitSystem) {
    case 'SOLAR':
    case 'SI':
    case 'ASTRONOMICAL':
      if (temperatureK >= 1e6) return `${(temperatureK / 1e6).toFixed(2)}M K`;
      if (temperatureK >= 1e4) return `${temperatureK.toLocaleString()} K`;
      return `${temperatureK.toFixed(0)} K`;

    case 'HUMAN': {
      const celsius = temperatureK - 273.15;
      if (temperatureK >= 1e6) return `${(temperatureK / 1e6).toFixed(2)} Million K`;
      return `${temperatureK.toLocaleString()} K (${celsius.toLocaleString(undefined, { maximumFractionDigits: 0 })} °C)`;
    }
  }
}

/**
 * Formats mass density in kg/m³.
 */
export function formatDensity(densityKgM3: number): string {
  if (!Number.isFinite(densityKgM3) || densityKgM3 <= 0) return 'N/A';
  if (densityKgM3 >= 1e6) {
    const gCm3 = densityKgM3 / 1000;
    return `${formatScientificNumber(densityKgM3, 3)} kg/m³ (${formatScientificNumber(gCm3, 2)} g/cm³)`;
  }
  return `${formatScientificNumber(densityKgM3, 3)} kg/m³`;
}

/**
 * Formats surface gravity in m/s².
 */
export function formatGravity(gravityM_S2: number, unitSystem: UnitSystem = 'SOLAR'): string {
  if (!Number.isFinite(gravityM_S2) || gravityM_S2 < 0) return 'N/A';

  const earthG = gravityM_S2 / 9.80665;
  switch (unitSystem) {
    case 'HUMAN':
      if (earthG >= 1000) return `${formatScientificNumber(earthG, 3)} g (Earth gravities)`;
      return `${earthG.toFixed(2)} g (Earth gravities)`;

    case 'SI':
    case 'SOLAR':
    case 'ASTRONOMICAL':
    default:
      if (gravityM_S2 >= 1000) return `${formatScientificNumber(gravityM_S2, 3)} m/s² (${earthG.toFixed(1)} g)`;
      return `${gravityM_S2.toFixed(2)} m/s² (${earthG.toFixed(2)} g)`;
  }
}

/**
 * Formats escape velocity in km/s.
 */
export function formatVelocity(velocityKmS: number): string {
  if (!Number.isFinite(velocityKmS) || velocityKmS < 0) return 'N/A';
  const c = 299792.458; // km/s
  if (velocityKmS >= 1000) {
    const fracC = velocityKmS / c;
    return `${formatScientificNumber(velocityKmS, 3)} km/s (${(fracC * 100).toFixed(2)}% c)`;
  }
  return `${velocityKmS.toFixed(2)} km/s`;
}

/**
 * Formats timescales in years.
 */
export function formatTimescale(years: number, unitSystem: UnitSystem = 'SOLAR'): string {
  if (!Number.isFinite(years) || years < 0) return 'N/A';

  if (years < 1) {
    const days = years * 365.25;
    if (days < 1) {
      const hours = days * 24;
      if (hours < 1) {
        const seconds = hours * 3600;
        return `${seconds.toFixed(1)} seconds`;
      }
      return `${hours.toFixed(1)} hours`;
    }
    return `${days.toFixed(1)} days`;
  }

  if (years < 1000) return `${years.toFixed(1)} years`;
  if (years < 1e6) return `${(years / 1e3).toFixed(1)} thousand years (${(years / 1e3).toFixed(1)} kyr)`;
  if (years < 1e9) return `${(years / 1e6).toFixed(2)} Million years (${(years / 1e6).toFixed(1)} Myr)`;
  if (years < 1e12) return `${(years / 1e9).toFixed(3)} Billion years (${(years / 1e9).toFixed(2)} Gyr)`;

  switch (unitSystem) {
    case 'SI': {
      const seconds = years * 365.25 * 86400;
      return `${formatScientificNumber(seconds, 3)} s`;
    }
    default:
      return `${formatScientificNumber(years, 3)} years`;
  }
}
