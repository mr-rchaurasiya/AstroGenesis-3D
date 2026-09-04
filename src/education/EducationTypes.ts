/**
 * EducationTypes.ts
 * Type definitions for Phase 11 Educational UI & Cosmic Time Explorer.
 * Completely typed models for educational modes, unit systems, detail levels,
 * concept databases, guided lessons, timeline epochs, comparisons, and progress.
 */

import type { StellarEvolutionStage } from '../starevolution/StarEvolutionTypes';
import type { StellarDeathStage, RemnantType } from '../stardeath/StarDeathTypes';

// ── Educational Modes ────────────────────────────────────────────────────────

export type EducationMode =
  | 'EXPLORE'       // General open exploration with contextual prompts
  | 'LEARN'         // Guided interactive step-by-step lessons
  | 'COMPARE'       // Side-by-side comparative object analyzer
  | 'TIMELINE'      // Macro cosmic epochs & stellar age scrubber
  | 'SCIENTIFIC';   // In-depth physical parameters, metrics, & equations

// ── Unit Systems ─────────────────────────────────────────────────────────────

export type UnitSystem =
  | 'SOLAR'         // M☉, R☉, L☉, T(K), AU, yr/Myr/Gyr
  | 'SI'            // kg, m, W, K, s
  | 'ASTRONOMICAL'  // M☉, AU/pc/kpc/Mpc, L☉, km/s, yr
  | 'HUMAN';        // Earth masses, Earth radii, °C/K, light-years, human times

// ── Detail Levels ────────────────────────────────────────────────────────────

export type DetailLevel =
  | 'BEGINNER'      // Conceptual summaries, intuitive analogies, minimal math
  | 'INTERMEDIATE'  // Core astrophysical relations, basic formulas, clear metrics
  | 'ADVANCED';     // Full quantitative parameters, boundary limits, relativistic derivations

// ── Educational Topics & Concepts ────────────────────────────────────────────

export interface ConceptVariable {
  symbol: string;
  name: string;
  unit: string;
  description: string;
}

export interface ConceptEquation {
  title: string;
  latex?: string;
  text: string;
  variables: ConceptVariable[];
  notes?: string;
}

export interface EducationalConcept {
  id: string;
  title: string;
  category: 'FUSION' | 'STELLAR_STRUCTURE' | 'EVOLUTION' | 'REMNANTS' | 'COSMOLOGY' | 'GRAVITY';
  shortExplanation: string;
  detailedExplanation: string;
  keyEquation?: ConceptEquation;
  importance: string;
  relatedTopicIds: string[];
  tags: string[];
  simplifiedModelNote?: string;
}

// ── Guided Lessons ───────────────────────────────────────────────────────────

export interface LessonStep {
  stepNumber: number;
  title: string;
  description: string;
  targetObjectId?: string;
  targetScaleMode?: string;
  suggestedAction?: string;
  keyTakeaway: string;
  equationOrFact?: string;
}

export interface EducationalLesson {
  id: string;
  title: string;
  subtitle: string;
  estimatedMinutes: number;
  difficulty: 'Introductory' | 'Intermediate' | 'Advanced';
  category: string;
  summary: string;
  steps: LessonStep[];
}

// ── Cosmic Timeline Epochs ───────────────────────────────────────────────────

export interface CosmicEpoch {
  id: string;
  name: string;
  timeFromBigBangYears: number; // Age of universe in years (0 to 13.8e9+)
  displayTime: string;
  redshift?: number;
  description: string;
  keyPhenomenon: string;
  category: 'EARLY_UNIVERSE' | 'STRUCTURE_FORMATION' | 'SOLAR_ERA' | 'STELLIFEROUS' | 'DEGENERATE_ERA' | 'BLACK_HOLE_ERA';
}

// ── Stellar Lifecycle Educational Model ──────────────────────────────────────

export interface LifecyclePhaseInfo {
  id: string;
  displayName: string;
  stageKey: StellarEvolutionStage | StellarDeathStage | 'FORMATION';
  durationYears: number;
  description: string;
  primaryEnergySource: string;
  internalState: string;
  radiusRange: string;
  luminosityRange: string;
  temperatureRange: string;
  spectralTypeRange: string;
  isTerminalRemnant?: boolean;
  remnantType?: RemnantType;
}

export interface StellarMassRegimeInfo {
  regimeId: 'VERY_LOW_MASS' | 'SOLAR_LIKE' | 'INTERMEDIATE' | 'MASSIVE' | 'HYPERMASSIVE';
  title: string;
  massRangeSolar: [number, number];
  representativeInitialMass: number;
  estimatedMsLifetimeYears: number;
  evolutionSummary: string;
  terminalFate: string;
  finalRemnant: RemnantType;
  phases: LifecyclePhaseInfo[];
  massLossSignificance: 'Negligible' | 'Moderate (AGB superwinds)' | 'Intense (de Jager stellar winds)';
  simplificationWarning?: string;
}

// ── Comparison System ────────────────────────────────────────────────────────

export interface ComparisonPropertyRow {
  propertyKey: string;
  displayName: string;
  category: 'DIMENSIONS' | 'ENERGETICS' | 'COMPOSITION' | 'TIMELINE' | 'EXTREMES';
  unit: string;
  valueA: number | string | null;
  valueB: number | string | null;
  formattedA: string;
  formattedB: string;
  normalizedRatio?: number; // ratio A/B for visual bar graph (if numeric)
  ratioDescription?: string;
  comparisonNote?: string;
}

export interface ObjectComparisonData {
  id: string;
  name: string;
  type: string;
  massSolar?: number;
  radiusSolar?: number;
  luminositySolar?: number;
  temperatureK?: number;
  densityKgM3?: number;
  surfaceGravityM_S2?: number;
  escapeVelocityKm_S?: number;
  ageYears?: number;
  spectralType?: string;
  remnantType?: RemnantType;
  customProperties?: Record<string, string | number>;
}

// ── User Educational Progress ────────────────────────────────────────────────

export interface EducationalProgress {
  viewedTopicIds: string[];
  exploredObjectIds: string[];
  exploredStageKeys: string[];
  completedLessonIds: string[];
  comparisonsCount: number;
  lastActiveTimestamp: number;
}

// ── Scale Bar Descriptor ─────────────────────────────────────────────────────

export interface ScaleDescriptor {
  metricDistanceMeters: number;
  label: string;
  representativeObject: string;
  astronomicalUnitEquivalent?: string;
}
