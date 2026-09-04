/**
 * src/education/index.ts
 * Main entrypoint & unified exports for Phase 11 Educational UI & Cosmic Time Explorer.
 */

export * from './EducationTypes';
export * from './EducationConstants';
export * from './EducationFormatter';
export * from './EducationContent';
export * from './EducationTopics';
export * from './EducationUtils';
export * from './EducationState';
export * from './EducationSelectors';

// Components
export { ConceptTooltip } from './components/ConceptTooltip';
export { ScaleIndicator } from './components/ScaleIndicator';
export { UnitToggle } from './components/UnitToggle';
export { StageIndicator } from './components/StageIndicator';
export { ProgressIndicator } from './components/ProgressIndicator';
export { CosmicTimeControls } from './components/CosmicTimeControls';
export { CosmicTimeline } from './components/CosmicTimeline';
export { StellarLifecyclePanel } from './components/StellarLifecyclePanel';
export { ScientificDataPanel } from './components/ScientificDataPanel';
export { ComparisonPanel } from './components/ComparisonPanel';
export { HRDiagramPanel } from './components/HRDiagramPanel';
export { ObjectInfoPanel } from './components/ObjectInfoPanel';
export { HelpPanel } from './components/HelpPanel';
export { KeyboardShortcutsPanel } from './components/KeyboardShortcutsPanel';
export { AboutPanel } from './components/AboutPanel';
export { EducationalOverlay } from './components/EducationalOverlay';
export { EducationPanel } from './components/EducationPanel';
