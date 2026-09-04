/**
 * galaxyPresets.ts
 * Curated structural and visual galaxy presets for testing and inspection.
 * Includes grand spirals, barred spirals, giant ellipticals, peculiar galaxies, and dwarfs.
 */

import type { GalaxyData } from './GalaxyTypes';
import { getDefaultGalaxyParameters } from './GalaxyConfig';

export const GALAXY_PRESETS: GalaxyData[] = [
  // 1. Andromeda-like Grand Design Spiral
  {
    id: 'GAL-001',
    catalogName: 'Andromeda Archetype (M31-Type)',
    seed: 104729,
    morphology: 'spiral',
    subtype: 'Sb',
    position: [0, 0, 0],
    rotation: [0.45, 0.6, 0.1],
    scale: 1.0,
    parameters: {
      ...getDefaultGalaxyParameters('spiral', 104729),
      massSolar: 1.2e12,
      radiusKpc: 35.0,
      luminositySolar: 3.6e10,
      starCountEstimate: 1.0e12,
      sceneRadius: 85.0,
      armCount: 2,
      armTightness: 0.62,
      armWidth: 0.24,
      bulgeRatio: 0.19,
      coreBrightness: 1.7,
      temperatureBias: 0.15,
      dustAbsorption: 0.70,
    },
  },

  // 2. Milky Way Archetype Barred Spiral
  {
    id: 'GAL-002',
    catalogName: 'Milky Way Archetype (SBb-Type)',
    seed: 204857,
    morphology: 'barred-spiral',
    subtype: 'SBb',
    position: [650, 120, -500],
    rotation: [0.65, 1.2, 0.25],
    scale: 0.95,
    parameters: {
      ...getDefaultGalaxyParameters('barred-spiral', 204857),
      massSolar: 1.15e12,
      radiusKpc: 30.0,
      luminositySolar: 2.8e10,
      starCountEstimate: 4.0e11,
      sceneRadius: 78.0,
      armCount: 4,
      armTightness: 0.55,
      armWidth: 0.32,
      barLengthRatio: 0.32,
      barWidthRatio: 0.08,
      bulgeRatio: 0.22,
      coreBrightness: 1.9,
      temperatureBias: 0.08,
      dustAbsorption: 0.75,
    },
  },

  // 3. Pinwheel Grand Spiral (M101-Type)
  {
    id: 'GAL-003',
    catalogName: 'Pinwheel Multi-Arm Spiral (M101-Type)',
    seed: 307211,
    morphology: 'spiral',
    subtype: 'Sc',
    position: [-850, 260, 450],
    rotation: [0.2, 0.4, 0.05], // Nearly face-on
    scale: 1.15,
    parameters: {
      ...getDefaultGalaxyParameters('spiral', 307211),
      massSolar: 1.0e12,
      radiusKpc: 42.0,
      luminositySolar: 3.0e10,
      starCountEstimate: 5.0e11,
      sceneRadius: 95.0,
      armCount: 3,
      armTightness: 0.48,
      armWidth: 0.35,
      bulgeRatio: 0.12,
      coreBrightness: 1.3,
      temperatureBias: 0.3, // Very blue young starburst arms
      dustAbsorption: 0.65,
    },
  },

  // 4. Messier 87-type Giant Elliptical
  {
    id: 'GAL-004',
    catalogName: 'Virgo A Giant Elliptical (M87-Type)',
    seed: 409381,
    morphology: 'elliptical',
    subtype: 'E0',
    position: [1200, -320, 850],
    rotation: [0.1, 0.2, 0.0],
    scale: 1.3,
    parameters: {
      ...getDefaultGalaxyParameters('elliptical', 409381),
      massSolar: 3.0e12,
      radiusKpc: 60.0,
      luminositySolar: 8.0e10,
      starCountEstimate: 2.0e12,
      sceneRadius: 110.0,
      ellipticity: 0.1,
      sersicIndex: 5.2,
      coreBrightness: 2.8,
      temperatureBias: -0.45,
      dustAbsorption: 0.1,
    },
  },

  // 5. Centaurus A-like Peculiar Elliptical with Dark Dust Belt
  {
    id: 'GAL-005',
    catalogName: 'Centaurus Peculiar Dusty Elliptical',
    seed: 512483,
    morphology: 'elliptical',
    subtype: 'E3',
    position: [-1100, -280, -900],
    rotation: [1.1, 0.7, 0.4],
    scale: 1.05,
    parameters: {
      ...getDefaultGalaxyParameters('elliptical', 512483),
      massSolar: 1.5e12,
      radiusKpc: 38.0,
      luminositySolar: 4.5e10,
      starCountEstimate: 8.0e11,
      sceneRadius: 82.0,
      ellipticity: 0.38,
      sersicIndex: 4.0,
      dustParticleCount: 2200,
      dustAbsorption: 0.85,
      coreBrightness: 2.0,
      temperatureBias: -0.2,
    },
  },

  // 6. Large Magellanic-type Irregular Galaxy
  {
    id: 'GAL-006',
    catalogName: 'Magellanic Irregular (LMC-Type)',
    seed: 614927,
    morphology: 'irregular',
    subtype: 'Irr-I',
    position: [420, -180, 700],
    rotation: [0.75, 1.4, 0.3],
    scale: 0.65,
    parameters: {
      ...getDefaultGalaxyParameters('irregular', 614927),
      massSolar: 4.0e10,
      radiusKpc: 14.0,
      luminositySolar: 5.0e9,
      starCountEstimate: 3.5e10,
      sceneRadius: 48.0,
      clumpiness: 0.8,
      asymmetryFactor: 0.7,
      coreBrightness: 0.95,
      temperatureBias: 0.35,
      dustAbsorption: 0.55,
    },
  },

  // 7. Fornax Dwarf Spheroidal
  {
    id: 'GAL-007',
    catalogName: 'Fornax Dwarf Spheroidal (dSph)',
    seed: 718301,
    morphology: 'dwarf-spheroidal',
    subtype: 'dSph',
    position: [-350, 420, -650],
    rotation: [0.3, 0.5, 0.2],
    scale: 0.45,
    parameters: {
      ...getDefaultGalaxyParameters('dwarf-spheroidal', 718301),
      massSolar: 6.0e7,
      radiusKpc: 2.8,
      luminositySolar: 2.5e7,
      starCountEstimate: 6.0e7,
      sceneRadius: 24.0,
      ellipticity: 0.25,
      sersicIndex: 1.2,
      coreBrightness: 0.6,
      temperatureBias: -0.25,
      dustAbsorption: 0.05,
    },
  },

  // 8. Sculptor Dwarf Irregular
  {
    id: 'GAL-008',
    catalogName: 'Sculptor Dwarf Irregular (dIrr)',
    seed: 821493,
    morphology: 'dwarf-irregular',
    subtype: 'dIrr',
    position: [780, 350, 320],
    rotation: [0.9, 0.3, 0.6],
    scale: 0.5,
    parameters: {
      ...getDefaultGalaxyParameters('dwarf-irregular', 821493),
      massSolar: 1.5e8,
      radiusKpc: 4.2,
      luminositySolar: 9.5e7,
      starCountEstimate: 1.8e8,
      sceneRadius: 30.0,
      clumpiness: 0.65,
      asymmetryFactor: 0.45,
      coreBrightness: 0.75,
      temperatureBias: 0.2,
      dustAbsorption: 0.35,
    },
  },
];
