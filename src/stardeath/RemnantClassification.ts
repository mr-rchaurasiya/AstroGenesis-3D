/**
 * RemnantClassification.ts
 * Deterministic stellar death pathway and compact remnant classification.
 * Uses final core mass, current stellar mass, composition, and evolutionary history
 * rather than simplistic initial mass thresholds alone.
 */

import {
  CHANDRASEKHAR_MASS_LIMIT_SOLAR,
  TOV_MASS_LIMIT_SOLAR,
  MAXIMUM_WHITE_DWARF_CORE_MASS_SOLAR,
  NOMINAL_CORE_COLLAPSE_INITIAL_MASS_SOLAR,
  DIRECT_BLACK_HOLE_INITIAL_MASS_SOLAR,
} from './StarDeathConstants';
import type { RemnantType, StellarDeathStage } from './StarDeathTypes';
import type { StellarEvolutionProperties } from '../starevolution/StarEvolutionTypes';

export interface RemnantClassificationResult {
  remnantType: RemnantType;
  initialDeathStage: StellarDeathStage;
  estimatedRemnantMassSolar: number;
  estimatedEjectaMassSolar: number;
  isCoreCollapse: boolean;
  classificationReason: string;
}

/**
 * Classifies the stellar death pathway and final compact remnant for an evolved star.
 *
 * @param star - Evolved progenitor star properties (from Phase 9 POST_HELIUM or AGB)
 * @returns RemnantClassificationResult
 */
export function classifyStellarRemnant(star: {
  initialMassSolar: number;
  currentMassSolar: number;
  coreMassSolar: number;
  envelopeMassSolar?: number;
  coreCarbonOxygenFraction?: number;
  metallicityFeH?: number;
}): RemnantClassificationResult {
  const M0 = Math.max(0.08, isFinite(star.initialMassSolar) ? star.initialMassSolar : 1.0);
  const Mcore = Math.max(0.1, isFinite(star.coreMassSolar) ? star.coreMassSolar : M0 * 0.15);
  const Mcurr = Math.max(Mcore, isFinite(star.currentMassSolar) ? star.currentMassSolar : M0);

  // 1. Low / Intermediate Mass Pathway: White Dwarf Formation via Planetary Nebula
  // Condition: Core mass below Chandrasekhar limit and progenitor did not reach massive core-collapse regime
  if (Mcore <= MAXIMUM_WHITE_DWARF_CORE_MASS_SOLAR && M0 < NOMINAL_CORE_COLLAPSE_INITIAL_MASS_SOLAR) {
    const remnantMass = Math.min(CHANDRASEKHAR_MASS_LIMIT_SOLAR - 0.02, Mcore);
    const ejectaMass = Math.max(0, Mcurr - remnantMass);

    return {
      remnantType: 'WHITE_DWARF',
      initialDeathStage: 'ENVELOPE_EJECTION',
      estimatedRemnantMassSolar: remnantMass,
      estimatedEjectaMassSolar: ejectaMass,
      isCoreCollapse: false,
      classificationReason: `Degenerate C/O core mass (${remnantMass.toFixed(2)} M☉) is below Chandrasekhar limit (${CHANDRASEKHAR_MASS_LIMIT_SOLAR} M☉). Envelope ejected into Planetary Nebula.`,
    };
  }

  // 2. Massive Star Pathway: Core Collapse Supernova
  // Core exceeds Chandrasekhar limit -> undergoes catastrophic gravitational collapse
  const isDirectBlackHole = M0 >= DIRECT_BLACK_HOLE_INITIAL_MASS_SOLAR || Mcore > 5.0;

  if (!isDirectBlackHole && Mcore < 3.5) {
    // Neutron Star Remnant (1.4 M_☉ - 2.1 M_☉)
    const remnantMass = Math.min(
      TOV_MASS_LIMIT_SOLAR - 0.05,
      Math.max(1.25, 1.1 + 0.12 * Mcore),
    );
    const ejectaMass = Math.max(0, Mcurr - remnantMass);

    return {
      remnantType: 'NEUTRON_STAR',
      initialDeathStage: 'CORE_COLLAPSE',
      estimatedRemnantMassSolar: remnantMass,
      estimatedEjectaMassSolar: ejectaMass,
      isCoreCollapse: true,
      classificationReason: `Massive core collapsed into degenerate neutron core (${remnantMass.toFixed(2)} M☉) below TOV limit (${TOV_MASS_LIMIT_SOLAR} M☉). Supernova ejects outer envelope.`,
    };
  } else {
    // Stellar Black Hole Remnant (> 2.2 M_☉, typically 3 - 20 M_☉ depending on progenitor mass)
    const fallbackFraction = M0 > 30.0 ? 0.75 : 0.50;
    const remnantMass = Math.max(
      TOV_MASS_LIMIT_SOLAR + 0.5,
      Mcore * fallbackFraction + (Mcurr - Mcore) * 0.25,
    );
    const ejectaMass = Math.max(0, Mcurr - remnantMass);

    return {
      remnantType: 'BLACK_HOLE',
      initialDeathStage: 'CORE_COLLAPSE',
      estimatedRemnantMassSolar: remnantMass,
      estimatedEjectaMassSolar: ejectaMass,
      isCoreCollapse: true,
      classificationReason: `Massive collapsing core (${Mcore.toFixed(2)} M☉) exceeds TOV limit (${TOV_MASS_LIMIT_SOLAR} M☉). Gravitational collapse forms Stellar Black Hole.`,
    };
  }
}

/**
 * Convenience helper to classify directly from Phase 9 StellarEvolutionProperties.
 */
export function classifyFromEvolutionProperties(star: StellarEvolutionProperties): RemnantClassificationResult {
  return classifyStellarRemnant({
    initialMassSolar: star.initialMassSolar,
    currentMassSolar: star.currentMassSolar,
    coreMassSolar: star.coreMassSolar,
    envelopeMassSolar: star.envelopeMassSolar,
    coreCarbonOxygenFraction: star.coreCarbonOxygenFraction,
    metallicityFeH: star.composition.metallicityFeH,
  });
}
