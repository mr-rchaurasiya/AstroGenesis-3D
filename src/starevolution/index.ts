/**
 * starevolution/index.ts
 * Public entrypoint for Phase 9 Stellar Evolution Engine.
 */

// Types & Constants
export * from './StarEvolutionTypes';
export * from './StarEvolutionConstants';

// Physics Models
export * from './MainSequenceEvolution';
export * from './CoreEvolution';
export * from './PostMainSequence';
export * from './GiantBranchModel';
export * from './HeliumBurning';
export * from './MassLossModel';

// Master Coordinator & Track Data
export * from './StellarEvolution';
export * from './HRDiagramData';
export * from './EvolutionTracks';

// Visuals & 3D Components
export * from './StarEvolutionVisuals';
export * from './MainSequenceStar';
export * from './EvolvedStar';
export * from './StellarEvolutionSystem';

// Validation Suite
export * from './StarEvolutionValidation';
