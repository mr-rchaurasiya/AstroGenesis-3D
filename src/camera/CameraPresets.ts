/**
 * @file CameraPresets.ts
 * @description Preset camera positions and orientations for hierarchical universe scales.
 */

import type { CameraPreset, CameraPresetId } from './CameraTypes';

export const CAMERA_PRESETS: Record<CameraPresetId, CameraPreset> = {
  UNIVERSE_OVERVIEW: {
    id: 'UNIVERSE_OVERVIEW',
    name: 'Cosmic Overview',
    description: 'Deep cosmic overview showing the observable universe, cosmic web, and galaxy clusters.',
    position: [0, 0, 140],
    target: [0, 0, 0],
    fov: 60,
    distance: 140,
    level: 'universe',
  },
  GALAXY_OVERVIEW: {
    id: 'GALAXY_OVERVIEW',
    name: 'Galaxy Population View',
    description: 'Overview of neighboring galaxies and morphological clusters.',
    position: [0, 35, 80],
    target: [0, 0, 0],
    fov: 60,
    distance: 90,
    level: 'galaxy-cluster',
  },
  MILKY_WAY_OVERVIEW: {
    id: 'MILKY_WAY_OVERVIEW',
    name: 'Milky Way Galaxy',
    description: 'Oblique view of the barred spiral Milky Way with major arms and central bulge.',
    position: [0, 45, 75],
    target: [0, 0, 0],
    fov: 55,
    distance: 85,
    level: 'galaxy',
  },
  SOLAR_SYSTEM_OVERVIEW: {
    id: 'SOLAR_SYSTEM_OVERVIEW',
    name: 'Solar System Overview',
    description: 'Ecliptic top-angled view of the Sun and planetary orbital planes.',
    position: [0, 60, 95],
    target: [0, 0, 0],
    fov: 55,
    distance: 110,
    level: 'solar-system',
  },
  SUN_CLOSEUP: {
    id: 'SUN_CLOSEUP',
    name: 'The Sun (Sol)',
    description: 'Close inspection of the solar photosphere and corona.',
    position: [0, 3, 10],
    target: [0, 0, 0],
    fov: 50,
    distance: 10,
    level: 'star',
    associatedBodyId: 'sun',
  },
  EARTH_MOON: {
    id: 'EARTH_MOON',
    name: 'Earth & Moon System',
    description: 'Framed inspection of Earth, atmosphere, cloud layer, and orbiting Moon.',
    position: [24, 3, 26],
    target: [22, 0, 22],
    fov: 45,
    distance: 6,
    level: 'planet',
    associatedBodyId: 'earth',
  },
  JUPITER_SYSTEM: {
    id: 'JUPITER_SYSTEM',
    name: 'Jupiter & Galilean Moons',
    description: 'Gas giant Jupiter with its Great Red Spot and orbiting Galilean satellites.',
    position: [52, 6, 56],
    target: [48, 0, 48],
    fov: 45,
    distance: 12,
    level: 'planet',
    associatedBodyId: 'jupiter',
  },
  SATURN_SYSTEM: {
    id: 'SATURN_SYSTEM',
    name: 'Saturn & Ring System',
    description: 'Ringed gas giant Saturn showcasing the Cassini division and major icy moons.',
    position: [68, 10, 72],
    target: [62, 0, 62],
    fov: 45,
    distance: 14,
    level: 'planet',
    associatedBodyId: 'saturn',
  },
};

export const PRESET_LIST = Object.values(CAMERA_PRESETS);
