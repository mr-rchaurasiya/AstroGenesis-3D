/**
 * @file CameraUtils.ts
 * @description Coordinate transformations, live body position resolvers, adaptive clipping planes, and framing calculations.
 */

import type { ScaleMode, CelestialBody, CometTrajectory } from '../solarsystem/SolarSystemTypes';
import {
  SUN_DATA,
  PLANETS_DATA,
  DWARF_PLANETS_DATA,
  COMETS_DATA,
} from '../solarsystem/SolarSystemConfig';
import { computeKeplerianPosition } from '../solarsystem/KeplerianOrbit';
import { GALAXY_PRESETS } from '../galaxy/galaxyPresets';
import { MILKY_WAY_REGIONS } from '../milkyway/MilkyWayConfig';
import type { NavigationLevel } from '../store/useAppStore';
import type { CameraTargetInfo } from './CameraTypes';

/**
 * Calculates scientifically grounded camera distance for framing an object based on its radius and FOV.
 */
export function calculateFramingDistance(
  radius: number,
  fovDeg = 60,
  multiplier = 2.8
): number {
  const fovRad = (fovDeg * Math.PI) / 180.0;
  const baseDistance = radius / Math.tan(fovRad / 2.0);
  return Math.max(0.8, baseDistance * multiplier);
}

/**
 * Resolves the real-time live 3D world position and framing metrics of any celestial body or region.
 */
export function resolveLiveTargetInfo(
  id: string,
  simulationTimeDays: number,
  scaleMode: ScaleMode = 'exploration'
): CameraTargetInfo | null {
  if (!id) return null;

  // 1. Check if Sun
  if (id === 'sun' || id === 'sol') {
    const r = scaleMode === 'exploration' ? SUN_DATA.visualRadiusExploration : SUN_DATA.visualRadiusScientific;
    return {
      id: 'sun',
      name: SUN_DATA.name,
      type: 'star',
      position: [0, 0, 0],
      radius: r,
      framingDistance: calculateFramingDistance(r, 60, 3.2),
      level: 'star',
    };
  }

  // 2. Check Planets
  const planet = PLANETS_DATA.find((p) => p.id === id);
  if (planet) {
    const [px, py, pz] = computeKeplerianPosition(planet.orbit, simulationTimeDays, scaleMode);
    const r = scaleMode === 'exploration' ? planet.visualRadiusExploration : planet.visualRadiusScientific;
    return {
      id: planet.id,
      name: planet.name,
      type: 'planet',
      position: [px, py, pz],
      radius: r,
      framingDistance: calculateFramingDistance(r, 60, planet.rings ? 3.8 : 2.6),
      parentBodyId: 'sun',
      level: 'planet',
    };
  }

  // 3. Check Moons
  for (const parent of PLANETS_DATA) {
    if (parent.majorMoons) {
      const moon = parent.majorMoons.find((m: CelestialBody) => m.id === id);
      if (moon) {
        // Parent live position
        const [ppx, ppy, ppz] = computeKeplerianPosition(parent.orbit, simulationTimeDays, scaleMode);
        // Moon relative position
        const [mrx, mry, mrz] = computeKeplerianPosition(moon.orbit, simulationTimeDays, scaleMode);
        const r = scaleMode === 'exploration' ? moon.visualRadiusExploration : moon.visualRadiusScientific;
        return {
          id: moon.id,
          name: moon.name,
          type: 'moon',
          position: [ppx + mrx, ppy + mry, ppz + mrz],
          radius: r,
          framingDistance: calculateFramingDistance(r, 60, 2.4),
          parentBodyId: parent.id,
          level: 'moon',
        };
      }
    }
  }

  // 4. Check Dwarf Planets & their moons
  for (const dwarf of DWARF_PLANETS_DATA) {
    if (dwarf.id === id) {
      const [dx, dy, dz] = computeKeplerianPosition(dwarf.orbit, simulationTimeDays, scaleMode);
      const r = scaleMode === 'exploration' ? dwarf.visualRadiusExploration : dwarf.visualRadiusScientific;
      return {
        id: dwarf.id,
        name: dwarf.name,
        type: 'dwarf-planet',
        position: [dx, dy, dz],
        radius: r,
        framingDistance: calculateFramingDistance(r, 60, 2.5),
        parentBodyId: 'sun',
        level: 'planet',
      };
    }
    if (dwarf.majorMoons) {
      const dmoon = dwarf.majorMoons.find((m: CelestialBody) => m.id === id);
      if (dmoon) {
        const [dpx, dpy, dpz] = computeKeplerianPosition(dwarf.orbit, simulationTimeDays, scaleMode);
        const [dmx, dmy, dmz] = computeKeplerianPosition(dmoon.orbit, simulationTimeDays, scaleMode);
        const r = scaleMode === 'exploration' ? dmoon.visualRadiusExploration : dmoon.visualRadiusScientific;
        return {
          id: dmoon.id,
          name: dmoon.name,
          type: 'moon',
          position: [dpx + dmx, dpy + dmy, dpz + dmz],
          radius: r,
          framingDistance: calculateFramingDistance(r, 60, 2.4),
          parentBodyId: dwarf.id,
          level: 'moon',
        };
      }
    }
  }

  // 5. Check Comets
  const comet = COMETS_DATA.find((c: CometTrajectory) => c.id === id);
  if (comet) {
    const orbit = {
      semiMajorAxisAU: comet.semiMajorAxisAU,
      eccentricity: comet.eccentricity,
      inclinationDeg: comet.inclinationDeg,
      orbitalPeriodDays: comet.periodYears * 365.25,
    };
    const [cx, cy, cz] = computeKeplerianPosition(orbit, simulationTimeDays, scaleMode);
    return {
      id: comet.id,
      name: comet.name,
      type: 'comet',
      position: [cx, cy, cz],
      radius: 0.6,
      framingDistance: 5.5,
      parentBodyId: 'sun',
      level: 'planet',
    };
  }

  // 6. Check Milky Way Regions
  const mwRegion = MILKY_WAY_REGIONS.find((r) => r.id === id);
  if (mwRegion) {
    return {
      id: mwRegion.id,
      name: mwRegion.name,
      type: 'milky-way-region',
      position: mwRegion.apparentPosition,
      radius: mwRegion.galactocentricRadiusKpc * 2.5,
      framingDistance: Math.max(15, mwRegion.galactocentricRadiusKpc * 3.0),
      level: 'galaxy',
    };
  }

  // 7. Check Preset Galaxies
  const galaxy = GALAXY_PRESETS.find((g) => g.id === id);
  if (galaxy) {
    const sceneRad = galaxy.parameters.sceneRadius || 30;
    return {
      id: galaxy.id,
      name: galaxy.catalogName,
      type: galaxy.morphology,
      position: galaxy.position,
      radius: sceneRad,
      framingDistance: Math.max(25, sceneRad * 1.8),
      level: 'galaxy',
    };
  }

  return null;
}

/**
 * Calculates dynamic near and far clipping planes based on current camera distance and scale to avoid Z-fighting.
 */
export function calculateAdaptiveClippingPlanes(
  cameraDistance: number,
  level: NavigationLevel = 'universe'
): { near: number; far: number } {
  if (level === 'moon' || cameraDistance < 5) {
    return { near: 0.1, far: 50000 };
  }
  if (level === 'planet' || cameraDistance < 50) {
    return { near: 0.2, far: 60000 };
  }
  if (level === 'solar-system' || cameraDistance < 800) {
    return { near: 0.5, far: 80000 };
  }
  if (level === 'galaxy' || cameraDistance < 3000) {
    return { near: 1.0, far: 100000 };
  }
  // Deep Universe Scale
  return { near: 2.0, far: 120000 };
}

/**
 * Computes context-aware adaptive zoom multiplier.
 */
export function calculateScaleAwareZoomSpeed(cameraDistance: number): number {
  if (cameraDistance < 2.0) return 0.2;
  if (cameraDistance < 20.0) return 0.5;
  if (cameraDistance < 200.0) return 0.8;
  if (cameraDistance < 1000.0) return 1.2;
  return 1.8;
}

/**
 * Computes exact camera position and look-at target for framing any celestial body on its illuminated day side.
 */
export function computeTargetFraming(
  targetInfo: CameraTargetInfo
): { cameraPosition: [number, number, number]; targetPosition: [number, number, number] } {
  const targetPos = new THREE.Vector3(...targetInfo.position);

  // If central Sun, star, or near barycenter
  if (targetInfo.id === 'sun' || targetInfo.id === 'sol' || targetInfo.type === 'star' || targetPos.lengthSq() < 0.1) {
    const offset = new THREE.Vector3(0, targetInfo.framingDistance * 0.35, targetInfo.framingDistance).normalize();
    const camPos = targetPos.clone().add(offset.multiplyScalar(targetInfo.framingDistance));
    return {
      cameraPosition: [camPos.x, camPos.y, camPos.z],
      targetPosition: [targetPos.x, targetPos.y, targetPos.z],
    };
  }

  // For planets/moons orbiting the Sun:
  // Sun is at [0, 0, 0]. Vector from Planet towards Sun:
  const toSun = new THREE.Vector3().subVectors(new THREE.Vector3(0, 0, 0), targetPos).normalize();
  const side = new THREE.Vector3(-toSun.z, 0.38, toSun.x).normalize();
  
  // Blend sunward vector (day side) + side angle + slight elevation
  const viewOffset = toSun.clone().multiplyScalar(0.72)
    .add(side.multiplyScalar(0.48))
    .add(new THREE.Vector3(0, 0.35, 0))
    .normalize();

  const camPos = targetPos.clone().add(viewOffset.multiplyScalar(targetInfo.framingDistance));
  return {
    cameraPosition: [camPos.x, camPos.y, camPos.z],
    targetPosition: [targetPos.x, targetPos.y, targetPos.z],
  };
}
