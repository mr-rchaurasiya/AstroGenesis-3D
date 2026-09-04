/**
 * EducationState.ts
 * Dedicated educational state store & localStorage persistence.
 * Completely deterministic and decoupled from 3D physics rendering loops.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type {
  EducationMode,
  UnitSystem,
  DetailLevel,
  EducationalProgress,
} from './EducationTypes';

export type EducationTab = 'LEARN' | 'TIMELINE' | 'LIFECYCLE' | 'SCIENTIFIC' | 'COMPARE' | 'HR' | 'HELP';

const PROGRESS_STORAGE_KEY = 'cosmic_explorer_educational_progress_v1';

function loadInitialProgress(): EducationalProgress {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(PROGRESS_STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        viewedTopicIds: Array.isArray(parsed.viewedTopicIds) ? parsed.viewedTopicIds : [],
        exploredObjectIds: Array.isArray(parsed.exploredObjectIds) ? parsed.exploredObjectIds : [],
        exploredStageKeys: Array.isArray(parsed.exploredStageKeys) ? parsed.exploredStageKeys : [],
        completedLessonIds: Array.isArray(parsed.completedLessonIds) ? parsed.completedLessonIds : [],
        comparisonsCount: typeof parsed.comparisonsCount === 'number' ? parsed.comparisonsCount : 0,
        lastActiveTimestamp: Date.now(),
      };
    }
  } catch {
    // Fallback on storage errors
  }
  return {
    viewedTopicIds: [],
    exploredObjectIds: [],
    exploredStageKeys: [],
    completedLessonIds: [],
    comparisonsCount: 0,
    lastActiveTimestamp: Date.now(),
  };
}

function saveProgressToStorage(progress: EducationalProgress): void {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress));
    }
  } catch {
    // Silently ignore storage quota or private mode issues
  }
}

export interface EducationStoreState {
  educationMode: EducationMode;
  unitSystem: UnitSystem;
  detailLevel: DetailLevel;

  selectedTopicId: string | null;
  selectedLessonId: string | null;
  activeLessonStepIndex: number;

  comparisonObjectAId: string | null;
  comparisonObjectBId: string | null;

  showEducationalOverlay: boolean;
  showEducationPanel: boolean;
  activeEducationTab: EducationTab;

  activeTooltipConceptId: string | null;
  tooltipPosition: { x: number; y: number } | null;

  showHelpModal: boolean;
  showShortcutsModal: boolean;
  showAboutModal: boolean;

  progress: EducationalProgress;

  // Actions
  setEducationMode: (mode: EducationMode) => void;
  setUnitSystem: (system: UnitSystem) => void;
  setDetailLevel: (level: DetailLevel) => void;

  setSelectedTopicId: (topicId: string | null) => void;
  startLesson: (lessonId: string) => void;
  nextLessonStep: () => void;
  prevLessonStep: () => void;
  exitLesson: () => void;

  setComparisonObjects: (idA: string | null, idB: string | null) => void;

  toggleEducationalOverlay: () => void;
  toggleEducationPanel: () => void;
  setActiveEducationTab: (tab: EducationTab) => void;

  openConceptTooltip: (conceptId: string, position?: { x: number; y: number }) => void;
  closeConceptTooltip: () => void;

  toggleHelpModal: () => void;
  toggleShortcutsModal: () => void;
  toggleAboutModal: () => void;

  // Progress actions
  markTopicViewed: (topicId: string) => void;
  markObjectExplored: (objectId: string) => void;
  markStageExplored: (stageKey: string) => void;
  markLessonCompleted: (lessonId: string) => void;
  incrementComparisonCount: () => void;
  resetProgress: () => void;
}

export const useEducationStore = create<EducationStoreState>()(
  subscribeWithSelector((set, get) => ({
    educationMode: 'EXPLORE',
    unitSystem: 'SOLAR',
    detailLevel: 'INTERMEDIATE',

    selectedTopicId: null,
    selectedLessonId: null,
    activeLessonStepIndex: 0,

    comparisonObjectAId: 'sun',
    comparisonObjectBId: 'sirius-b',

    showEducationalOverlay: true,
    showEducationPanel: false,
    activeEducationTab: 'LEARN',

    activeTooltipConceptId: null,
    tooltipPosition: null,

    showHelpModal: false,
    showShortcutsModal: false,
    showAboutModal: false,

    progress: loadInitialProgress(),

    // ── Actions ────────────────────────────────────────────────────────────

    setEducationMode: (mode) => {
      const tabMap: Record<EducationMode, EducationTab> = {
        EXPLORE: 'LEARN',
        LEARN: 'LEARN',
        COMPARE: 'COMPARE',
        TIMELINE: 'TIMELINE',
        SCIENTIFIC: 'SCIENTIFIC',
      };
      set({
        educationMode: mode,
        activeEducationTab: tabMap[mode] ?? 'LEARN',
        showEducationPanel: mode !== 'EXPLORE',
      });
    },

    setUnitSystem: (unitSystem) => set({ unitSystem }),

    setDetailLevel: (detailLevel) => set({ detailLevel }),

    setSelectedTopicId: (selectedTopicId) => {
      if (selectedTopicId) {
        get().markTopicViewed(selectedTopicId);
      }
      set({ selectedTopicId });
    },

    startLesson: (lessonId) => {
      set({
        selectedLessonId: lessonId,
        activeLessonStepIndex: 0,
        educationMode: 'LEARN',
        activeEducationTab: 'LEARN',
        showEducationPanel: true,
      });
      get().markTopicViewed(lessonId);
    },

    nextLessonStep: () => {
      set((state) => ({
        activeLessonStepIndex: state.activeLessonStepIndex + 1,
      }));
    },

    prevLessonStep: () => {
      set((state) => ({
        activeLessonStepIndex: Math.max(0, state.activeLessonStepIndex - 1),
      }));
    },

    exitLesson: () => {
      set({ selectedLessonId: null, activeLessonStepIndex: 0 });
    },

    setComparisonObjects: (idA, idB) => {
      set({ comparisonObjectAId: idA, comparisonObjectBId: idB });
      get().incrementComparisonCount();
    },

    toggleEducationalOverlay: () =>
      set((state) => ({ showEducationalOverlay: !state.showEducationalOverlay })),

    toggleEducationPanel: () =>
      set((state) => ({ showEducationPanel: !state.showEducationPanel })),

    setActiveEducationTab: (tab) =>
      set({ activeEducationTab: tab, showEducationPanel: true }),

    openConceptTooltip: (conceptId, position) => {
      get().markTopicViewed(conceptId);
      set({
        activeTooltipConceptId: conceptId,
        tooltipPosition: position ?? null,
      });
    },

    closeConceptTooltip: () =>
      set({ activeTooltipConceptId: null, tooltipPosition: null }),

    toggleHelpModal: () =>
      set((state) => ({ showHelpModal: !state.showHelpModal })),

    toggleShortcutsModal: () =>
      set((state) => ({ showShortcutsModal: !state.showShortcutsModal })),

    toggleAboutModal: () =>
      set((state) => ({ showAboutModal: !state.showAboutModal })),

    // ── Progress Management ────────────────────────────────────────────────

    markTopicViewed: (topicId) => {
      set((state) => {
        if (state.progress.viewedTopicIds.includes(topicId)) return state;
        const nextProgress: EducationalProgress = {
          ...state.progress,
          viewedTopicIds: [...state.progress.viewedTopicIds, topicId],
          lastActiveTimestamp: Date.now(),
        };
        saveProgressToStorage(nextProgress);
        return { progress: nextProgress };
      });
    },

    markObjectExplored: (objectId) => {
      set((state) => {
        if (state.progress.exploredObjectIds.includes(objectId)) return state;
        const nextProgress: EducationalProgress = {
          ...state.progress,
          exploredObjectIds: [...state.progress.exploredObjectIds, objectId],
          lastActiveTimestamp: Date.now(),
        };
        saveProgressToStorage(nextProgress);
        return { progress: nextProgress };
      });
    },

    markStageExplored: (stageKey) => {
      set((state) => {
        if (state.progress.exploredStageKeys.includes(stageKey)) return state;
        const nextProgress: EducationalProgress = {
          ...state.progress,
          exploredStageKeys: [...state.progress.exploredStageKeys, stageKey],
          lastActiveTimestamp: Date.now(),
        };
        saveProgressToStorage(nextProgress);
        return { progress: nextProgress };
      });
    },

    markLessonCompleted: (lessonId) => {
      set((state) => {
        if (state.progress.completedLessonIds.includes(lessonId)) return state;
        const nextProgress: EducationalProgress = {
          ...state.progress,
          completedLessonIds: [...state.progress.completedLessonIds, lessonId],
          lastActiveTimestamp: Date.now(),
        };
        saveProgressToStorage(nextProgress);
        return { progress: nextProgress };
      });
    },

    incrementComparisonCount: () => {
      set((state) => {
        const nextProgress: EducationalProgress = {
          ...state.progress,
          comparisonsCount: state.progress.comparisonsCount + 1,
          lastActiveTimestamp: Date.now(),
        };
        saveProgressToStorage(nextProgress);
        return { progress: nextProgress };
      });
    },

    resetProgress: () => {
      const fresh: EducationalProgress = {
        viewedTopicIds: [],
        exploredObjectIds: [],
        exploredStageKeys: [],
        completedLessonIds: [],
        comparisonsCount: 0,
        lastActiveTimestamp: Date.now(),
      };
      saveProgressToStorage(fresh);
      set({ progress: fresh });
    },
  }))
);
