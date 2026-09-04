/**
 * StellarComposition.ts
 * Stellar composition modeling: elemental mass fractions (X, Y, Z),
 * metallicity [Fe/H] conversions, mean molecular weight, and conservation validation.
 */

import {
  SOLAR_HYDROGEN_FRACTION,
  SOLAR_HELIUM_FRACTION,
  SOLAR_METAL_FRACTION,
  SOLAR_ZX_RATIO,
} from './StellarConstants';
import type { StellarComposition } from './StellarTypes';

// Primordial Big Bang Nucleosynthesis helium mass fraction
const PRIMORDIAL_HELIUM_Y0 = 0.245;

// Galactic chemical enrichment factor dY/dZ (typically 1.4 to 2.0)
const HELIUM_ENRICHMENT_DY_DZ = 1.4;

/**
 * Computes mean molecular weight μ for a fully ionized gas plasma.
 * Formula: 1/μ = 2X + (3/4)Y + (1/2)Z
 * For solar composition: μ_☉ ≈ 0.614
 *
 * @param X - Hydrogen mass fraction
 * @param Y - Helium mass fraction
 * @param Z - Metal mass fraction
 * @returns Mean molecular weight μ in atomic mass units
 */
export function calculateMeanMolecularWeight(X: number, Y: number, Z: number): number {
  const safeX = Math.max(0, X);
  const safeY = Math.max(0, Y);
  const safeZ = Math.max(0, Z);

  const invMu = 2.0 * safeX + 0.75 * safeY + 0.5 * safeZ;
  return invMu > 0 ? 1.0 / invMu : 0.614;
}

/**
 * Converts logarithmic iron-to-hydrogen metallicity [Fe/H] into elemental mass fractions (X, Y, Z).
 * Formula: [Fe/H] = log10( (Z/X) / (Z_☉ / X_☉) )
 *
 * @param feH - Iron abundance index [Fe/H] relative to Sun (e.g., 0.0 for Sun, -1.0 for Pop II, +0.3 for metal-rich)
 * @returns Complete StellarComposition object
 */
export function feHToComposition(feH: number = 0.0): StellarComposition {
  const safeFeH = Math.max(-5.0, Math.min(2.0, isFinite(feH) ? feH : 0.0));

  // (Z/X) ratio
  const zxRatio = SOLAR_ZX_RATIO * Math.pow(10, safeFeH);

  // Derive Z from galactic chemical evolution enrichment relation:
  // Y = Y_0 + (dY/dZ) * Z
  // X = 1 - Y - Z = 1 - Y_0 - (1 + dY/dZ) * Z
  // Z = (Z/X) * X  =>  Z = (zxRatio * (1 - Y_0)) / (1 + zxRatio * (1 + HELIUM_ENRICHMENT_DY_DZ))
  const numerator = zxRatio * (1.0 - PRIMORDIAL_HELIUM_Y0);
  const denominator = 1.0 + zxRatio * (1.0 + HELIUM_ENRICHMENT_DY_DZ);
  const Z = Math.max(0.00001, Math.min(0.10, numerator / denominator));

  const Y = Math.max(PRIMORDIAL_HELIUM_Y0, Math.min(0.50, PRIMORDIAL_HELIUM_Y0 + HELIUM_ENRICHMENT_DY_DZ * Z));
  const X = Math.max(0.40, 1.0 - Y - Z);

  // Normalize to ensure exact unity sum
  const sum = X + Y + Z;
  const normX = X / sum;
  const normY = Y / sum;
  const normZ = Z / sum;

  return {
    hydrogenFraction: normX,
    heliumFraction: normY,
    metalFraction: normZ,
    metallicityFeH: safeFeH,
    meanMolecularWeight: calculateMeanMolecularWeight(normX, normY, normZ),
  };
}

/**
 * Creates and validates a composition from custom X, Y, Z or [Fe/H] input.
 * Ensures X + Y + Z = 1.0 strictly within tolerance.
 *
 * @param custom - Optional composition overrides
 * @returns Validated StellarComposition
 */
export function createStellarComposition(custom?: {
  hydrogenFraction?: number;
  heliumFraction?: number;
  metalFraction?: number;
  metallicityFeH?: number;
}): StellarComposition {
  if (!custom) {
    return feHToComposition(0.0);
  }

  if (custom.metallicityFeH !== undefined && custom.metalFraction === undefined) {
    return feHToComposition(custom.metallicityFeH);
  }

  let Z = custom.metalFraction !== undefined ? Math.max(0, custom.metalFraction) : SOLAR_METAL_FRACTION;
  let X = custom.hydrogenFraction !== undefined ? Math.max(0, custom.hydrogenFraction) : SOLAR_HYDROGEN_FRACTION;
  let Y = custom.heliumFraction !== undefined ? Math.max(0, custom.heliumFraction) : SOLAR_HELIUM_FRACTION;

  // Re-normalize if sum deviates
  const total = X + Y + Z;
  if (total > 0 && Math.abs(total - 1.0) > 1e-4) {
    X /= total;
    Y /= total;
    Z /= total;
  }

  // Calculate equivalent [Fe/H]
  const currentZX = X > 0 ? Z / X : SOLAR_ZX_RATIO;
  const derivedFeH = Math.log10(Math.max(1e-6, currentZX / SOLAR_ZX_RATIO));

  return {
    hydrogenFraction: X,
    heliumFraction: Y,
    metalFraction: Z,
    metallicityFeH: custom.metallicityFeH ?? derivedFeH,
    meanMolecularWeight: calculateMeanMolecularWeight(X, Y, Z),
  };
}

/**
 * Validates that a composition satisfies physical conservation laws (X, Y, Z >= 0 and sum ≈ 1).
 *
 * @param comp - Composition to validate
 * @returns boolean true if valid
 */
export function validateComposition(comp: StellarComposition): boolean {
  if (comp.hydrogenFraction < 0 || comp.heliumFraction < 0 || comp.metalFraction < 0) {
    return false;
  }
  const sum = comp.hydrogenFraction + comp.heliumFraction + comp.metalFraction;
  return Math.abs(sum - 1.0) <= 0.001;
}
