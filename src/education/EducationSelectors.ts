/**
 * EducationSelectors.ts
 * Selectors and data resolvers for Phase 11 Educational UI.
 * Extracts catalog and benchmark object comparison models,
 * resolves concepts, and creates memoized data maps.
 */

import type { ObjectComparisonData, EducationalConcept, EducationalLesson } from './EducationTypes';
import { EDUCATIONAL_CONCEPTS } from './EducationContent';
import { EDUCATIONAL_LESSONS } from './EducationTopics';
import { EARTH_MASS_KG, EARTH_RADIUS_M, SOLAR_MASS_KG, SOLAR_RADIUS_M } from './EducationConstants';

/**
 * Curated list of benchmark celestial objects for educational inspection and comparison.
 */
export const BENCHMARK_OBJECTS: ObjectComparisonData[] = [
  {
    id: 'sun',
    name: 'The Sun (Sol)',
    type: 'Main Sequence Yellow Dwarf (G2V)',
    massSolar: 1.0,
    radiusSolar: 1.0,
    luminositySolar: 1.0,
    temperatureK: 5778,
    densityKgM3: 1408,
    surfaceGravityM_S2: 274.0,
    escapeVelocityKm_S: 617.7,
    ageYears: 4.6e9,
    spectralType: 'G2V',
    remnantType: 'WHITE_DWARF',
    customProperties: {
      'Core Process': 'p-p Chain Hydrogen Fusion',
      'Habitable Zone': '0.95 - 1.37 AU',
      'Distance': '1 AU (149.6M km)',
    },
  },
  {
    id: 'sirius-a',
    name: 'Sirius A',
    type: 'Main Sequence White Star (A1V)',
    massSolar: 2.06,
    radiusSolar: 1.71,
    luminositySolar: 25.4,
    temperatureK: 9940,
    densityKgM3: 578,
    surfaceGravityM_S2: 194.0,
    escapeVelocityKm_S: 677.0,
    ageYears: 2.4e8,
    spectralType: 'A1V',
    remnantType: 'WHITE_DWARF',
    customProperties: {
      'Distance': '8.6 light-years',
      'Core Process': 'CNO Fusion Dominant',
    },
  },
  {
    id: 'betelgeuse',
    name: 'Betelgeuse (α Orionis)',
    type: 'Red Supergiant (M1-2 Ia-ab)',
    massSolar: 16.5,
    radiusSolar: 764.0,
    luminositySolar: 126000,
    temperatureK: 3600,
    densityKgM3: 5.2e-5, // Extremely diffuse envelope
    surfaceGravityM_S2: 0.0076,
    escapeVelocityKm_S: 90.7,
    ageYears: 8.5e6,
    spectralType: 'M1Ia',
    remnantType: 'NEUTRON_STAR',
    customProperties: {
      'Distance': '548 light-years',
      'Core Process': 'Advanced Core Helium/Carbon Burning',
      'Envelope Size': 'Extends past Jupiter orbit',
    },
  },
  {
    id: 'rigel',
    name: 'Rigel (β Orionis)',
    type: 'Blue Supergiant (B8Ia)',
    massSolar: 21.0,
    radiusSolar: 78.9,
    luminositySolar: 120000,
    temperatureK: 12100,
    densityKgM3: 0.06,
    surfaceGravityM_S2: 9.1,
    escapeVelocityKm_S: 319.0,
    ageYears: 8.0e6,
    spectralType: 'B8Ia',
    remnantType: 'NEUTRON_STAR',
    customProperties: {
      'Distance': '860 light-years',
      'Core Process': 'Rapid CNO Core Burning',
    },
  },
  {
    id: 'sirius-b',
    name: 'Sirius B (The Pup)',
    type: 'Carbon-Oxygen White Dwarf (DA2)',
    massSolar: 1.018,
    radiusSolar: 0.0084, // ~0.92 Earth radius
    luminositySolar: 0.056,
    temperatureK: 25200,
    densityKgM3: 2.4e9, // 2.4 million g/cm³
    surfaceGravityM_S2: 3.8e6,
    escapeVelocityKm_S: 5200.0,
    ageYears: 1.2e8, // cooling age
    spectralType: 'DA2',
    remnantType: 'WHITE_DWARF',
    customProperties: {
      'Degeneracy Support': 'Electron Degeneracy Pressure',
      'Chandrasekhar Fraction': '70.7% of M_Ch',
      'Radius Equivalent': '5,840 km (~Earth size)',
    },
  },
  {
    id: 'crab-pulsar',
    name: 'Crab Pulsar (PSR B0531+21)',
    type: 'Young Rotation-Powered Pulsar (Neutron Star)',
    massSolar: 1.4,
    radiusSolar: 1.652e-5, // 11.5 km
    luminositySolar: 1e-4, // optical thermal (plus relativistic beam)
    temperatureK: 1.6e6,
    densityKgM3: 4.4e17, // nuclear saturation density
    surfaceGravityM_S2: 1.4e12,
    escapeVelocityKm_S: 182000.0, // ~61% c
    ageYears: 970, // Born 1054 AD supernova
    spectralType: 'Pulsar',
    remnantType: 'NEUTRON_STAR',
    customProperties: {
      'Spin Period': '33.5 milliseconds (30 rev/sec)',
      'Surface Magnetic Field': '3.8 × 10⁸ Tesla',
      'Relativistic Compactness': 'Ξ = 0.185',
    },
  },
  {
    id: 'cygnus-x1',
    name: 'Cygnus X-1 Black Hole',
    type: 'Stellar-Mass Black Hole & X-ray Binary',
    massSolar: 21.2,
    radiusSolar: 8.98e-5, // Schwarzschild radius rs = 62.5 km
    luminositySolar: 25000, // Accretion disk luminosity
    temperatureK: 5.0e6, // Inner accretion disk
    densityKgM3: 1e20, // Singularity / Horizon effective
    surfaceGravityM_S2: 1e13,
    escapeVelocityKm_S: 299792.0, // = c at horizon
    ageYears: 5e6,
    spectralType: 'Black Hole',
    remnantType: 'BLACK_HOLE',
    customProperties: {
      'Schwarzschild Radius (rs)': '62.6 km',
      'Photon Sphere (1.5 rs)': '93.9 km',
      'ISCO Radius (3.0 rs)': '187.8 km',
      'Accretion Efficiency': 'η ≈ 8%',
    },
  },
  {
    id: 'earth',
    name: 'Earth (Terra)',
    type: 'Terrestrial Habitable Planet',
    massSolar: EARTH_MASS_KG / SOLAR_MASS_KG,
    radiusSolar: EARTH_RADIUS_M / SOLAR_RADIUS_M,
    luminositySolar: 0.0,
    temperatureK: 288,
    densityKgM3: 5515,
    surfaceGravityM_S2: 9.81,
    escapeVelocityKm_S: 11.2,
    ageYears: 4.54e9,
    spectralType: 'Terrestrial Planet',
    customProperties: {
      'Atmosphere': '78% N₂, 21% O₂, 1% Ar/CO₂',
      'Surface Water Coverage': '71%',
      'Orbital Period': '365.25 days (1.0 AU)',
    },
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    type: 'Gas Giant Planet',
    massSolar: 0.000954, // 318 Earth masses
    radiusSolar: 0.1004, // 11.2 Earth radii
    luminositySolar: 0.0,
    temperatureK: 165,
    densityKgM3: 1326,
    surfaceGravityM_S2: 24.79,
    escapeVelocityKm_S: 59.5,
    ageYears: 4.56e9,
    spectralType: 'Gas Giant',
    customProperties: {
      'Magnetic Field': '14× Earth field',
      'Known Moons': '95 (4 Galilean moons)',
      'Orbital Period': '11.86 Earth years (5.2 AU)',
    },
  },
  {
    id: 'andromeda',
    name: 'Andromeda Galaxy (M31)',
    type: 'Barred Spiral Galaxy (SA(s)b)',
    massSolar: 1.5e12,
    radiusSolar: 1.0e11, // ~110,000 light-years
    luminositySolar: 2.6e10,
    temperatureK: 0,
    densityKgM3: 1e-21,
    surfaceGravityM_S2: 1e-9,
    escapeVelocityKm_S: 500.0,
    ageYears: 1.0e10,
    spectralType: 'Spiral Galaxy',
    customProperties: {
      'Distance': '2.537 Million light-years',
      'Star Population': '~1 Trillion Stars',
      'Milky Way Collision': 'In ~4.5 Billion Years',
    },
  },
];

/**
 * Finds a concept by ID.
 */
export function getConceptById(id: string): EducationalConcept | undefined {
  return EDUCATIONAL_CONCEPTS.find((c) => c.id === id);
}

/**
 * Finds a lesson by ID.
 */
export function getLessonById(id: string): EducationalLesson | undefined {
  return EDUCATIONAL_LESSONS.find((l) => l.id === id);
}

/**
 * Finds an object comparison data item by ID.
 */
export function getComparisonObjectById(id: string): ObjectComparisonData | undefined {
  return BENCHMARK_OBJECTS.find((o) => o.id === id);
}
