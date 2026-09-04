/**
 * useAppStore.ts
 * Global application state using Zustand.
 * Phase 1-6: Navigation levels, selected object, time controls, environment, Galaxy, Milky Way, Solar System, and Camera & Navigation.
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { GalaxyData } from '../galaxy/GalaxyTypes';
import type { MilkyWayRegionId } from '../milkyway/MilkyWayTypes';
import type { ScaleMode } from '../solarsystem/SolarSystemTypes';
import type { CameraMode, CameraPresetId, NavigationHistoryItem } from '../camera/CameraTypes';
import { NavigationManager } from '../camera/NavigationManager';
import { resolveLiveTargetInfo } from '../camera/CameraUtils';

// ── Navigation Levels ────────────────────────────────────────────────────────

export type NavigationLevel =
  | 'universe'
  | 'galaxy-cluster'
  | 'galaxy'
  | 'solar-system'
  | 'star'
  | 'planet'
  | 'moon';

export interface NavigationNode {
  id: string;
  label: string;
  level: NavigationLevel;
}

// ── Selected Object ──────────────────────────────────────────────────────────

export interface SelectedObject {
  id: string;
  name: string;
  type: string;
  position: [number, number, number];
  data?: Record<string, unknown>;
}

// ── App State ────────────────────────────────────────────────────────────────

export type EnvironmentQuality = 'low' | 'medium' | 'high' | 'ultra';
export type GalaxyFilterType = 'all' | 'spiral' | 'elliptical' | 'irregular' | 'dwarf';

export interface AppState {
  // Navigation & Hierarchy
  navigationLevel: NavigationLevel;
  breadcrumbs: NavigationNode[];
  selectedObject: SelectedObject | null;

  // Selected Galaxy (Phase 3)
  selectedGalaxy: GalaxyData | null;
  selectedGalaxyId: string | null;

  // Time
  timeScale: number;        // 1 = real-time, higher = accelerated
  isPaused: boolean;
  elapsedTime: number;      // seconds in simulation time

  // Environment & Visual Layers (Phase 2)
  environmentQuality: EnvironmentQuality;
  showNebulae: boolean;
  showCosmicDust: boolean;
  showDistantGalaxies: boolean;
  showCosmicWeb: boolean;

  // Galaxy System (Phase 3)
  showGalaxySystem: boolean;
  galaxyMorphologyFilter: GalaxyFilterType;
  showGalaxyLabels: boolean;

  // Milky Way System (Phase 4)
  isMilkyWayMode: boolean;
  selectedMilkyWayRegion: MilkyWayRegionId | null;
  showMilkyWayArms: boolean;
  showMilkyWayDust: boolean;
  showMilkyWayHalo: boolean;
  showMilkyWayGlobulars: boolean;
  showSolarNeighborhoodAnchor: boolean;

  // Solar System (Phase 5)
  isSolarSystemMode: boolean;
  selectedSolarBodyId: string | null;
  solarScaleMode: ScaleMode;
  solarSimulationTimeDays: number;
  solarTimeScale: number;
  isSolarSimulationPaused: boolean;
  showOrbitLines: boolean;
  showAsteroidBelt: boolean;
  showKuiperBelt: boolean;
  showComets: boolean;
  showMoons: boolean;

  // Camera & Navigation (Phase 6)
  cameraMode: CameraMode;
  focusTargetId: string | null;
  pendingCameraPreset: CameraPresetId | null;
  resetCameraRequested: boolean;
  navigationHistory: NavigationHistoryItem[];
  historyIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;

  // UI
  isLoading: boolean;
  loadingProgress: number;  // 0–100
  showInfoPanel: boolean;
  showControls: boolean;
  showHRDiagram: boolean;
  showBreadcrumbs: boolean;
  showEnvironmentSettings: boolean;

  // Camera coordinates (readout / fallback)
  cameraTarget: [number, number, number] | null;
  cameraDistance: number;

  // Actions
  setNavigationLevel: (level: NavigationLevel) => void;
  pushBreadcrumb: (node: NavigationNode) => void;
  popBreadcrumb: () => void;
  resetBreadcrumbs: () => void;

  setSelectedObject: (obj: SelectedObject | null) => void;

  // Galaxy Actions (Phase 3)
  setSelectedGalaxy: (galaxy: GalaxyData | null) => void;
  clearSelectedGalaxy: () => void;
  setGalaxyMorphologyFilter: (filter: GalaxyFilterType) => void;
  toggleGalaxySystem: () => void;
  toggleGalaxyLabels: () => void;

  // Milky Way Actions (Phase 4)
  enterMilkyWayMode: () => void;
  exitMilkyWayMode: () => void;
  toggleMilkyWayMode: () => void;
  setSelectedMilkyWayRegion: (region: MilkyWayRegionId | null) => void;
  toggleMilkyWayArms: () => void;
  toggleMilkyWayDust: () => void;
  toggleMilkyWayHalo: () => void;
  toggleMilkyWayGlobulars: () => void;
  toggleSolarNeighborhoodAnchor: () => void;

  // Solar System Actions (Phase 5)
  enterSolarSystemMode: (initialBodyId?: string) => void;
  exitSolarSystemMode: () => void;
  toggleSolarSystemMode: () => void;
  selectSolarBody: (id: string | null) => void;
  setSolarScaleMode: (mode: ScaleMode) => void;
  setSolarTimeScale: (scale: number) => void;
  toggleSolarSimulationPause: () => void;
  advanceSolarSimulationTime: (deltaDays: number) => void;
  toggleOrbitLines: () => void;
  toggleAsteroidBelt: () => void;
  toggleKuiperBelt: () => void;
  toggleComets: () => void;
  toggleMoons: () => void;

  // Camera & Navigation Actions (Phase 6)
  setCameraMode: (mode: CameraMode) => void;
  focusObject: (targetId: string) => void;
  followObject: (targetId: string) => void;
  exitFocus: () => void;
  resetCamera: () => void;
  clearResetCameraRequest: () => void;
  navigateToPreset: (presetId: CameraPresetId) => void;
  clearPendingCameraPreset: () => void;
  navigateBack: () => void;
  navigateForward: () => void;

  setTimeScale: (scale: number) => void;
  togglePause: () => void;
  advanceTime: (delta: number) => void;

  // Environment Actions
  setEnvironmentQuality: (quality: EnvironmentQuality) => void;
  toggleNebulae: () => void;
  toggleCosmicDust: () => void;
  toggleDistantGalaxies: () => void;
  toggleCosmicWeb: () => void;

  setLoading: (loading: boolean, progress?: number) => void;
  setLoadingProgress: (progress: number) => void;
  toggleInfoPanel: () => void;
  toggleHRDiagram: () => void;
  toggleEnvironmentSettings: () => void;

  setCameraTarget: (target: [number, number, number] | null) => void;
  setCameraDistance: (distance: number) => void;
}

// ── Store ────────────────────────────────────────────────────────────────────

export const useAppStore = create<AppState>()(
  subscribeWithSelector((set, get) => ({
    // Navigation
    navigationLevel: 'universe',
    breadcrumbs: [{ id: 'universe', label: 'Universe', level: 'universe' }],
    selectedObject: null,

    // Selected Galaxy (Phase 3)
    selectedGalaxy: null,
    selectedGalaxyId: null,

    // Time
    timeScale: 1,
    isPaused: false,
    elapsedTime: 0,

    // Environment (Phase 2)
    environmentQuality: 'high',
    showNebulae: true,
    showCosmicDust: true,
    showDistantGalaxies: true,
    showCosmicWeb: true,

    // Galaxy System (Phase 3)
    showGalaxySystem: true,
    galaxyMorphologyFilter: 'all',
    showGalaxyLabels: true,

    // Milky Way System (Phase 4)
    isMilkyWayMode: false,
    selectedMilkyWayRegion: null,
    showMilkyWayArms: true,
    showMilkyWayDust: true,
    showMilkyWayHalo: true,
    showMilkyWayGlobulars: true,
    showSolarNeighborhoodAnchor: true,

    // Solar System (Phase 5)
    isSolarSystemMode: false,
    selectedSolarBodyId: null,
    solarScaleMode: 'exploration',
    solarSimulationTimeDays: 0,
    solarTimeScale: 1.0, // 1.0 day/second
    isSolarSimulationPaused: false,
    showOrbitLines: true,
    showAsteroidBelt: true,
    showKuiperBelt: true,
    showComets: true,
    showMoons: true,

    // Camera & Navigation (Phase 6)
    cameraMode: 'FREE',
    focusTargetId: null,
    pendingCameraPreset: null,
    resetCameraRequested: false,
    navigationHistory: [{ id: 'universe', name: 'Universe', level: 'universe', timestamp: Date.now() }],
    historyIndex: 0,
    canGoBack: false,
    canGoForward: false,

    // UI
    isLoading: true,
    loadingProgress: 0,
    showInfoPanel: false,
    showControls: true,
    showHRDiagram: false,
    showBreadcrumbs: true,
    showEnvironmentSettings: false,

    // Camera
    cameraTarget: null,
    cameraDistance: 120,

    // ── Navigation Actions ─────────────────────────────────────────────────

    setNavigationLevel: (level) =>
      set({ navigationLevel: level }),

    pushBreadcrumb: (node) =>
      set((state) => ({
        breadcrumbs: [...state.breadcrumbs, node],
        navigationLevel: node.level,
      })),

    popBreadcrumb: () =>
      set((state) => {
        if (state.breadcrumbs.length <= 1) return state;
        const next = state.breadcrumbs.slice(0, -1);
        const last = next[next.length - 1];
        return {
          breadcrumbs: next,
          navigationLevel: last.level,
        };
      }),

    resetBreadcrumbs: () =>
      set({
        breadcrumbs: [{ id: 'universe', label: 'Universe', level: 'universe' }],
        navigationLevel: 'universe',
        isSolarSystemMode: false,
        isMilkyWayMode: false,
        selectedSolarBodyId: null,
        selectedGalaxy: null,
        selectedGalaxyId: null,
        selectedObject: null,
        focusTargetId: null,
        cameraMode: 'FREE',
        pendingCameraPreset: 'UNIVERSE_OVERVIEW',
      }),

    // ── Object Selection ───────────────────────────────────────────────────

    setSelectedObject: (obj) =>
      set({ selectedObject: obj, showInfoPanel: obj !== null }),

    // ── Galaxy Actions (Phase 3) ───────────────────────────────────────────

    setSelectedGalaxy: (galaxy) => {
      if (galaxy) {
        get().focusObject(galaxy.id);
      }
      set({
        selectedGalaxy: galaxy,
        selectedGalaxyId: galaxy ? galaxy.id : null,
        selectedObject: galaxy
          ? {
              id: galaxy.id,
              name: galaxy.catalogName,
              type: galaxy.morphology,
              position: galaxy.position,
              data: galaxy as unknown as Record<string, unknown>,
            }
          : null,
        showInfoPanel: galaxy !== null,
      });
    },

    clearSelectedGalaxy: () =>
      set({
        selectedGalaxy: null,
        selectedGalaxyId: null,
        selectedObject: null,
        showInfoPanel: false,
      }),

    setGalaxyMorphologyFilter: (filter) =>
      set({ galaxyMorphologyFilter: filter }),

    toggleGalaxySystem: () =>
      set((state) => ({ showGalaxySystem: !state.showGalaxySystem })),

    toggleGalaxyLabels: () =>
      set((state) => ({ showGalaxyLabels: !state.showGalaxyLabels })),

    // ── Milky Way Actions (Phase 4) ────────────────────────────────────────

    enterMilkyWayMode: () => {
      set((state) => ({
        isMilkyWayMode: true,
        isSolarSystemMode: false,
        navigationLevel: 'galaxy',
        selectedMilkyWayRegion: 'solar-neighborhood',
        breadcrumbs: [
          ...state.breadcrumbs.filter((b) => b.id !== 'milky-way' && b.id !== 'solar-system'),
          { id: 'milky-way', label: 'Milky Way', level: 'galaxy' },
        ],
        pendingCameraPreset: 'MILKY_WAY_OVERVIEW',
      }));
    },

    exitMilkyWayMode: () =>
      set({
        isMilkyWayMode: false,
        isSolarSystemMode: false,
        selectedMilkyWayRegion: null,
        navigationLevel: 'universe',
        breadcrumbs: [{ id: 'universe', label: 'Universe', level: 'universe' }],
        pendingCameraPreset: 'UNIVERSE_OVERVIEW',
      }),

    toggleMilkyWayMode: () => {
      const isCurrentlyMilkyWay = get().isMilkyWayMode;
      if (isCurrentlyMilkyWay) {
        get().exitMilkyWayMode();
      } else {
        get().enterMilkyWayMode();
      }
    },

    setSelectedMilkyWayRegion: (region) => {
      set({ selectedMilkyWayRegion: region });
      if (region) {
        get().focusObject(region);
      }
    },

    toggleMilkyWayArms: () =>
      set((state) => ({ showMilkyWayArms: !state.showMilkyWayArms })),

    toggleMilkyWayDust: () =>
      set((state) => ({ showMilkyWayDust: !state.showMilkyWayDust })),

    toggleMilkyWayHalo: () =>
      set((state) => ({ showMilkyWayHalo: !state.showMilkyWayHalo })),

    toggleMilkyWayGlobulars: () =>
      set((state) => ({ showMilkyWayGlobulars: !state.showMilkyWayGlobulars })),

    toggleSolarNeighborhoodAnchor: () =>
      set((state) => ({ showSolarNeighborhoodAnchor: !state.showSolarNeighborhoodAnchor })),

    // ── Solar System Actions (Phase 5) ─────────────────────────────────────

    enterSolarSystemMode: (initialBodyId = 'sun') => {
      set((state) => ({
        isSolarSystemMode: true,
        isMilkyWayMode: false,
        selectedSolarBodyId: initialBodyId,
        navigationLevel: 'solar-system',
        breadcrumbs: [
          ...state.breadcrumbs.filter((b) => b.id !== 'solar-system'),
          { id: 'solar-system', label: 'Solar System', level: 'solar-system' },
        ],
        showInfoPanel: true,
        pendingCameraPreset: initialBodyId === 'sun' ? 'SOLAR_SYSTEM_OVERVIEW' : null,
      }));
      if (initialBodyId && initialBodyId !== 'sun') {
        get().focusObject(initialBodyId);
      }
    },

    exitSolarSystemMode: () =>
      set({
        isSolarSystemMode: false,
        selectedSolarBodyId: null,
        navigationLevel: 'galaxy',
        breadcrumbs: [
          { id: 'universe', label: 'Universe', level: 'universe' },
          { id: 'milky-way', label: 'Milky Way', level: 'galaxy' },
        ],
        pendingCameraPreset: 'MILKY_WAY_OVERVIEW',
      }),

    toggleSolarSystemMode: () => {
      const isCurrentlySolar = get().isSolarSystemMode;
      if (isCurrentlySolar) {
        get().exitSolarSystemMode();
      } else {
        get().enterSolarSystemMode('sun');
      }
    },

    selectSolarBody: (id) => {
      set({
        selectedSolarBodyId: id,
        selectedGalaxy: null,
        selectedGalaxyId: null,
        showInfoPanel: id !== null,
      });
      if (id) {
        get().focusObject(id);
      }
    },

    setSolarScaleMode: (mode) =>
      set({ solarScaleMode: mode }),

    setSolarTimeScale: (scale) =>
      set({ solarTimeScale: Math.max(0, scale) }),

    toggleSolarSimulationPause: () =>
      set((state) => ({ isSolarSimulationPaused: !state.isSolarSimulationPaused })),

    advanceSolarSimulationTime: (deltaDays) =>
      set((state) => ({
        solarSimulationTimeDays: state.solarSimulationTimeDays + deltaDays,
      })),

    toggleOrbitLines: () =>
      set((state) => ({ showOrbitLines: !state.showOrbitLines })),

    toggleAsteroidBelt: () =>
      set((state) => ({ showAsteroidBelt: !state.showAsteroidBelt })),

    toggleKuiperBelt: () =>
      set((state) => ({ showKuiperBelt: !state.showKuiperBelt })),

    toggleComets: () =>
      set((state) => ({ showComets: !state.showComets })),

    toggleMoons: () =>
      set((state) => ({ showMoons: !state.showMoons })),

    // ── Camera & Navigation Actions (Phase 6) ──────────────────────────────

    setCameraMode: (mode) =>
      set({ cameraMode: mode }),

    focusObject: (targetId: string) => {
      const state = get();
      const targetInfo = resolveLiveTargetInfo(targetId, state.solarSimulationTimeDays, state.solarScaleMode);
      if (!targetInfo) return;

      const crumbs = NavigationManager.buildBreadcrumbsForTarget(
        targetId,
        targetInfo.level,
        targetInfo.name,
        targetInfo.parentBodyId
      );

      // Append to history
      const historyItem: NavigationHistoryItem = {
        id: targetId,
        name: targetInfo.name,
        level: targetInfo.level,
        timestamp: Date.now(),
      };
      const newHistory = [...state.navigationHistory.slice(0, state.historyIndex + 1), historyItem];
      const newIndex = newHistory.length - 1;

      set({
        focusTargetId: targetId,
        cameraMode: 'TRANSITION',
        navigationLevel: targetInfo.level,
        breadcrumbs: crumbs,
        navigationHistory: newHistory,
        historyIndex: newIndex,
        canGoBack: newIndex > 0,
        canGoForward: false,
        showInfoPanel: true,
      });
    },

    followObject: (targetId: string) =>
      set({
        focusTargetId: targetId,
        cameraMode: 'FOLLOW',
      }),

    exitFocus: () =>
      set({
        cameraMode: 'FREE',
        focusTargetId: null,
      }),

    resetCamera: () =>
      set({
        resetCameraRequested: true,
        focusTargetId: null,
        selectedSolarBodyId: null,
        selectedGalaxyId: null,
      }),

    clearResetCameraRequest: () =>
      set({ resetCameraRequested: false }),

    navigateToPreset: (presetId: CameraPresetId) => {
      const level = NavigationManager.mapPresetToLevel(presetId);
      const isSolar = level === 'solar-system' || level === 'star' || level === 'planet' || level === 'moon';
      const isMilkyWay = level === 'galaxy';

      set((state) => ({
        pendingCameraPreset: presetId,
        cameraMode: 'TRANSITION',
        navigationLevel: level,
        isSolarSystemMode: isSolar,
        isMilkyWayMode: isMilkyWay,
        breadcrumbs: [
          { id: 'universe', label: 'Universe', level: 'universe' },
          ...(isMilkyWay || isSolar ? [{ id: 'milky-way', label: 'Milky Way', level: 'galaxy' as const }] : []),
          ...(isSolar ? [{ id: 'solar-system', label: 'Solar System', level: 'solar-system' as const }] : []),
        ],
        navigationHistory: [
          ...state.navigationHistory.slice(0, state.historyIndex + 1),
          { id: presetId, name: presetId.replace(/_/g, ' '), level, timestamp: Date.now() },
        ],
        historyIndex: state.historyIndex + 1,
        canGoBack: true,
        canGoForward: false,
      }));
    },

    clearPendingCameraPreset: () =>
      set({ pendingCameraPreset: null }),

    navigateBack: () => {
      const { navigationHistory, historyIndex } = get();
      if (historyIndex > 0) {
        const prev = navigationHistory[historyIndex - 1];
        set({
          historyIndex: historyIndex - 1,
          canGoBack: historyIndex - 1 > 0,
          canGoForward: true,
        });
        if (prev.id in NavigationManager.mapPresetToLevel) {
          get().navigateToPreset(prev.id as CameraPresetId);
        } else {
          get().focusObject(prev.id);
        }
      }
    },

    navigateForward: () => {
      const { navigationHistory, historyIndex } = get();
      if (historyIndex < navigationHistory.length - 1) {
        const next = navigationHistory[historyIndex + 1];
        set({
          historyIndex: historyIndex + 1,
          canGoBack: true,
          canGoForward: historyIndex + 1 < navigationHistory.length - 1,
        });
        if (next.id in NavigationManager.mapPresetToLevel) {
          get().navigateToPreset(next.id as CameraPresetId);
        } else {
          get().focusObject(next.id);
        }
      }
    },

    // ── Time Actions ───────────────────────────────────────────────────────

    setTimeScale: (scale) => set({ timeScale: Math.max(0, scale) }),

    togglePause: () => set((state) => ({ isPaused: !state.isPaused })),

    advanceTime: (delta) =>
      set((state) => ({
        elapsedTime: state.isPaused
          ? state.elapsedTime
          : state.elapsedTime + delta * state.timeScale,
      })),

    // ── Environment Actions (Phase 2) ──────────────────────────────────────

    setEnvironmentQuality: (quality) => set({ environmentQuality: quality }),

    toggleNebulae: () =>
      set((state) => ({ showNebulae: !state.showNebulae })),

    toggleCosmicDust: () =>
      set((state) => ({ showCosmicDust: !state.showCosmicDust })),

    toggleDistantGalaxies: () =>
      set((state) => ({ showDistantGalaxies: !state.showDistantGalaxies })),

    toggleCosmicWeb: () =>
      set((state) => ({ showCosmicWeb: !state.showCosmicWeb })),

    // ── UI Actions ─────────────────────────────────────────────────────────

    setLoading: (loading, progress) =>
      set({
        isLoading: loading,
        ...(progress !== undefined ? { loadingProgress: progress } : {}),
      }),

    setLoadingProgress: (progress) =>
      set({ loadingProgress: Math.min(100, Math.max(0, progress)) }),

    toggleInfoPanel: () =>
      set((state) => ({ showInfoPanel: !state.showInfoPanel })),

    toggleHRDiagram: () =>
      set((state) => ({ showHRDiagram: !state.showHRDiagram })),

    toggleEnvironmentSettings: () =>
      set((state) => ({ showEnvironmentSettings: !state.showEnvironmentSettings })),

    // ── Camera Actions ─────────────────────────────────────────────────────

    setCameraTarget: (target) => set({ cameraTarget: target }),

    setCameraDistance: (distance) =>
      set({ cameraDistance: Math.max(0.1, distance) }),
  })),
);
