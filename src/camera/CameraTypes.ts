/**
 * @file CameraTypes.ts
 * @description Strongly typed definitions for camera state, modes, presets, transitions, and navigation.
 */

import type { NavigationLevel } from '../store/useAppStore';

export type CameraMode = 'FREE' | 'FOCUS' | 'FOLLOW' | 'TRANSITION';

export type CameraPresetId =
  | 'UNIVERSE_OVERVIEW'
  | 'GALAXY_OVERVIEW'
  | 'MILKY_WAY_OVERVIEW'
  | 'SOLAR_SYSTEM_OVERVIEW'
  | 'SUN_CLOSEUP'
  | 'EARTH_MOON'
  | 'JUPITER_SYSTEM'
  | 'SATURN_SYSTEM';

export interface CameraTargetInfo {
  id: string;
  name: string;
  type: string;
  position: [number, number, number];
  radius: number;
  framingDistance: number;
  parentBodyId?: string;
  level: NavigationLevel;
}

export interface CameraPreset {
  id: CameraPresetId;
  name: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
  fov?: number;
  distance?: number;
  level: NavigationLevel;
  associatedBodyId?: string;
}

export interface NavigationHistoryItem {
  id: string;
  name: string;
  level: NavigationLevel;
  timestamp: number;
}

export interface CameraTransitionRequest {
  startPos: [number, number, number];
  endPos: [number, number, number];
  startTarget: [number, number, number];
  endTarget: [number, number, number];
  duration: number; // seconds
  startTime: number;
  targetId?: string;
  followAfterArrival?: boolean;
}
