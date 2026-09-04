/**
 * @file solarSystemPresets.ts
 * @description Preset lookup tables and focus definitions for Solar System objects.
 */

import {
  SUN_DATA,
  PLANETS_DATA,
  DWARF_PLANETS_DATA,
  COMETS_DATA,
} from './SolarSystemConfig';
import type { CelestialBody, CometTrajectory } from './SolarSystemTypes';

export interface SolarSystemObjectItem {
  id: string;
  name: string;
  type: string;
  category: string;
  description: string;
  semiMajorAxisAU?: number;
}

/**
 * All celestial bodies mapped by ID for rapid lookup.
 */
export const SOLAR_BODIES_MAP = new Map<string, CelestialBody>();
SOLAR_BODIES_MAP.set(SUN_DATA.id, SUN_DATA);
PLANETS_DATA.forEach((p) => {
  SOLAR_BODIES_MAP.set(p.id, p);
  p.majorMoons?.forEach((m) => SOLAR_BODIES_MAP.set(m.id, m));
});
DWARF_PLANETS_DATA.forEach((d) => {
  SOLAR_BODIES_MAP.set(d.id, d);
  d.majorMoons?.forEach((m) => SOLAR_BODIES_MAP.set(m.id, m));
});

/**
 * All comets mapped by ID.
 */
export const COMETS_MAP = new Map<string, CometTrajectory>();
COMETS_DATA.forEach((c) => COMETS_MAP.set(c.id, c));

/**
 * Get full scientific metadata for any selected Solar System ID.
 */
export function getSolarBodyById(id: string): CelestialBody | CometTrajectory | undefined {
  return SOLAR_BODIES_MAP.get(id) || COMETS_MAP.get(id);
}

/**
 * Hierarchy list for quick navigation dropdown/search in HUD.
 */
export const SOLAR_OBJECT_LIST: SolarSystemObjectItem[] = [
  {
    id: 'sun',
    name: 'The Sun (Sol)',
    type: 'star',
    category: 'Central Star',
    description: SUN_DATA.description,
    semiMajorAxisAU: 0,
  },
  ...PLANETS_DATA.map((p) => ({
    id: p.id,
    name: p.name,
    type: 'planet',
    category: p.planetClass === 'terrestrial' ? 'Terrestrial Planet' : p.planetClass === 'gas-giant' ? 'Gas Giant' : 'Ice Giant',
    description: p.description,
    semiMajorAxisAU: p.orbit.semiMajorAxisAU,
  })),
  ...DWARF_PLANETS_DATA.map((d) => ({
    id: d.id,
    name: d.name,
    type: 'dwarf-planet',
    category: 'Dwarf Planet',
    description: d.description,
    semiMajorAxisAU: d.orbit.semiMajorAxisAU,
  })),
  ...COMETS_DATA.map((c) => ({
    id: c.id,
    name: c.name,
    type: 'comet',
    category: 'Comet',
    description: `${c.name} - orbital period of ${c.periodYears} years.`,
    semiMajorAxisAU: c.semiMajorAxisAU,
  })),
];
