/**
 * EducationConstants.ts
 * Astronomical and educational constants for Phase 11.
 * Provides cosmic epochs, scale benchmarks, mass regime breakdowns,
 * and physical unit conversion constants.
 */

import type { CosmicEpoch, ScaleDescriptor, StellarMassRegimeInfo } from './EducationTypes';

// ── Physical Conversion Constants ────────────────────────────────────────────

export const SOLAR_MASS_KG = 1.98847e30;
export const SOLAR_RADIUS_M = 6.957e8;
export const SOLAR_LUMINOSITY_W = 3.828e26;
export const SOLAR_TEMP_K = 5778;

export const EARTH_MASS_KG = 5.9722e24;
export const EARTH_RADIUS_M = 6.371e6;
export const JUPITER_MASS_KG = 1.898e27;
export const JUPITER_RADIUS_M = 6.9911e7;

export const ASTRONOMICAL_UNIT_M = 1.495978707e11; // 1 AU in meters
export const LIGHT_YEAR_M = 9.4607e15;             // 1 ly in meters
export const PARSEC_M = 3.0857e16;                 // 1 pc in meters
export const KILOPARSEC_M = 3.0857e19;             // 1 kpc in meters
export const MEGAPARSEC_M = 3.0857e22;             // 1 Mpc in meters

export const SPEED_OF_LIGHT_MS = 299792458;
export const GRAVITATIONAL_CONSTANT = 6.6743e-11;
export const STEFAN_BOLTZMANN_CONSTANT = 5.670374419e-8;

// Age of the Universe
export const UNIVERSE_AGE_YEARS = 13.787e9; // 13.787 billion years

// ── Cosmic Timeline Epochs ───────────────────────────────────────────────────

export const COSMIC_EPOCHS: CosmicEpoch[] = [
  {
    id: 'big-bang',
    name: 'The Big Bang & Inflation',
    timeFromBigBangYears: 0,
    displayTime: 't = 0 yr',
    redshift: Infinity,
    description: 'Initial cosmic singularity, exponential inflationary expansion, and electroweak baryogenesis creating matter.',
    keyPhenomenon: 'Inflation & Nucleosynthesis',
    category: 'EARLY_UNIVERSE',
  },
  {
    id: 'recombination',
    name: 'Recombination & Cosmic Microwave Background',
    timeFromBigBangYears: 380_000,
    displayTime: '380,000 yr',
    redshift: 1100,
    description: 'Protons and electrons combine into neutral hydrogen; photons decouple, creating the Cosmic Microwave Background.',
    keyPhenomenon: 'CMB Decoupling',
    category: 'EARLY_UNIVERSE',
  },
  {
    id: 'cosmic-dawn',
    name: 'Cosmic Dawn & First Stars (Population III)',
    timeFromBigBangYears: 100_000_000,
    displayTime: '100 - 200 Myr',
    redshift: 20,
    description: 'Pristine metal-free gas collapses into primordial hypermassive Population III stars, ending the Cosmic Dark Ages.',
    keyPhenomenon: 'First Star Ignitions & Reionization',
    category: 'STRUCTURE_FORMATION',
  },
  {
    id: 'early-galaxies',
    name: 'Protogalaxy & Cosmic Web Assembly',
    timeFromBigBangYears: 1_000_000_000,
    displayTime: '1.0 Gyr',
    redshift: 6,
    description: 'Hierarchical dark matter halo clustering draws baryonic gas into cosmic filaments and active starburst proto-galaxies.',
    keyPhenomenon: 'Filamentary Gas Collapse',
    category: 'STRUCTURE_FORMATION',
  },
  {
    id: 'milky-way-formation',
    name: 'Milky Way Galaxy Assembly',
    timeFromBigBangYears: 4_000_000_000,
    displayTime: '4.0 Gyr (9.8 Gyr ago)',
    redshift: 1.5,
    description: 'Protogalactic mergers form the Milky Way thick disk, central bulge, and ancient globular cluster population.',
    keyPhenomenon: 'Galactic Disk Stabilization',
    category: 'STRUCTURE_FORMATION',
  },
  {
    id: 'solar-system-birth',
    name: 'Solar System & Earth Formation',
    timeFromBigBangYears: 9_200_000_000,
    displayTime: '9.2 Gyr (4.6 Gyr ago)',
    redshift: 0.4,
    description: 'A pre-solar molecular cloud collapses in the Orion Spur, forming the Sun and circumstellar protoplanetary disk.',
    keyPhenomenon: 'Planetesimal Accretion',
    category: 'SOLAR_ERA',
  },
  {
    id: 'present-day',
    name: 'Present Day (Cosmic Era)',
    timeFromBigBangYears: 13_787_000_000,
    displayTime: '13.8 Gyr (Now)',
    redshift: 0.0,
    description: 'Current astronomical era. Active stellar nucleosynthesis, spiral arm kinematics, and human astronomical exploration.',
    keyPhenomenon: 'Stelliferous Era Peak',
    category: 'STELLIFEROUS',
  },
  {
    id: 'andromeda-merger',
    name: 'Future: Milky Way - Andromeda Collision',
    timeFromBigBangYears: 18_300_000_000,
    displayTime: '+4.5 Gyr from now',
    description: 'Gravitational collision of Milky Way and Andromeda (M31), merging into a giant elliptical galaxy (Milkomeda).',
    keyPhenomenon: 'Galactic Cannibalism',
    category: 'STELLIFEROUS',
  },
  {
    id: 'sun-red-giant',
    name: 'Future: Sun Red Giant Phase',
    timeFromBigBangYears: 18_800_000_000,
    displayTime: '+5.0 Gyr from now',
    description: 'Core hydrogen exhaustion in the Sun leads to RGB envelope expansion out to 1 AU and subsequent helium flash.',
    keyPhenomenon: 'Inner Planet Engulfment',
    category: 'STELLIFEROUS',
  },
  {
    id: 'degenerate-era',
    name: 'The Degenerate Era',
    timeFromBigBangYears: 100_000_000_000_000, // 10^14 yr
    displayTime: '10¹⁴ - 10³⁹ yr',
    description: 'All star formation ceases. The universe is populated exclusively by cooling White Dwarfs, Neutron Stars, and Black Holes.',
    keyPhenomenon: 'Remnant Degeneracy & Cooling',
    category: 'DEGENERATE_ERA',
  },
  {
    id: 'black-hole-era',
    name: 'The Black Hole Era',
    timeFromBigBangYears: 1e40, // 10^40 yr
    displayTime: '10⁴⁰ - 10¹⁰⁰ yr',
    description: 'Proton decay dissolves all baryonic degenerate remnants. Only supermassive black holes survive, slowly evaporating via Hawking radiation.',
    keyPhenomenon: 'Hawking Radiation Evaporation',
    category: 'BLACK_HOLE_ERA',
  },
];

// ── Scale Bar Benchmarks ─────────────────────────────────────────────────────

export const SCALE_BENCHMARKS: ScaleDescriptor[] = [
  {
    metricDistanceMeters: 1.15e4, // 11.5 km
    label: '11.5 km',
    representativeObject: 'Neutron Star / Pulsar Radius',
    astronomicalUnitEquivalent: '7.7 × 10⁻⁸ AU',
  },
  {
    metricDistanceMeters: 6.371e6, // 6,371 km
    label: '6,371 km',
    representativeObject: 'Earth Radius / White Dwarf Radius',
    astronomicalUnitEquivalent: '4.2 × 10⁻⁵ AU',
  },
  {
    metricDistanceMeters: 6.957e8, // 696,000 km
    label: '696,000 km',
    representativeObject: 'Solar Radius (1 R☉)',
    astronomicalUnitEquivalent: '0.00465 AU',
  },
  {
    metricDistanceMeters: 1.496e11, // 1 AU
    label: '1.0 AU (150 Million km)',
    representativeObject: 'Earth-Sun Distance / Solar System Inner Core',
    astronomicalUnitEquivalent: '1.00 AU',
  },
  {
    metricDistanceMeters: 5.9e12, // 39.5 AU
    label: '40 AU (6 Billion km)',
    representativeObject: 'Pluto Orbit / Kuiper Belt Boundary',
    astronomicalUnitEquivalent: '39.5 AU',
  },
  {
    metricDistanceMeters: 9.46e15, // 1 ly
    label: '1.0 Light-Year',
    representativeObject: 'Outer Oort Cloud Core',
    astronomicalUnitEquivalent: '63,241 AU',
  },
  {
    metricDistanceMeters: 3.086e16, // 1 pc
    label: '1.0 Parsec (3.26 ly)',
    representativeObject: 'Alpha Centauri Stellar Neighborhood',
    astronomicalUnitEquivalent: '206,265 AU',
  },
  {
    metricDistanceMeters: 3.086e19, // 1 kpc
    label: '1.0 Kiloparsec (3,260 ly)',
    representativeObject: 'Orion Spiral Arm Segment',
    astronomicalUnitEquivalent: '2.06 × 10⁸ AU',
  },
  {
    metricDistanceMeters: 8.0e20, // 26 kpc
    label: '30 Kiloparsecs (100,000 ly)',
    representativeObject: 'Milky Way Galactic Diameter',
    astronomicalUnitEquivalent: '6.2 × 10⁹ AU',
  },
  {
    metricDistanceMeters: 3.086e22, // 1 Mpc
    label: '1.0 Megaparsec (3.26 Million ly)',
    representativeObject: 'Local Group Galaxy Cluster Scale',
    astronomicalUnitEquivalent: '2.06 × 10¹¹ AU',
  },
  {
    metricDistanceMeters: 3.086e24, // 100 Mpc
    label: '100 Megaparsecs',
    representativeObject: 'Large-Scale Cosmic Web Filament Scale',
    astronomicalUnitEquivalent: '2.06 × 10¹³ AU',
  },
];

// ── Stellar Mass Regime Breakdown (Phase 8–10 physics aligned) ───────────────

export const STELLAR_MASS_REGIMES: StellarMassRegimeInfo[] = [
  {
    regimeId: 'VERY_LOW_MASS',
    title: 'Very Low Mass (Red Dwarfs: M < 0.35 M☉)',
    massRangeSolar: [0.08, 0.35],
    representativeInitialMass: 0.2,
    estimatedMsLifetimeYears: 1.0e12, // 1000 Gyr
    evolutionSummary: 'Entirely convective throughout. Hydrogen is uniformly converted to helium with no inert core formation. Lifetimes vastly exceed current cosmic age.',
    terminalFate: 'Slow thermal contraction into a low-mass Helium White Dwarf without entering giant branch or planetary nebula phases.',
    finalRemnant: 'WHITE_DWARF',
    massLossSignificance: 'Negligible',
    phases: [
      {
        id: 'pms-vlm',
        displayName: 'Pre-Main Sequence',
        stageKey: 'FORMATION',
        durationYears: 1.0e8,
        description: 'Gravitational Kelvin-Helmholtz contraction of cool hydrogen gas.',
        primaryEnergySource: 'Gravitational Potential Energy',
        internalState: 'Fully Convective Polytrope',
        radiusRange: '0.5 - 2.0 R☉',
        luminosityRange: '0.01 - 0.1 L☉',
        temperatureRange: '2,800 - 3,300 K',
        spectralTypeRange: 'M5 - M8',
      },
      {
        id: 'ms-vlm',
        displayName: 'Main Sequence (Ultra-Long)',
        stageKey: 'MAIN_SEQUENCE',
        durationYears: 1.0e12,
        description: 'Proton-Proton fusion in fully convective equilibrium.',
        primaryEnergySource: 'p-p I Nuclear Fusion',
        internalState: 'Fully Convective Gas Sphere',
        radiusRange: '0.1 - 0.35 R☉',
        luminosityRange: '0.0001 - 0.015 L☉',
        temperatureRange: '2,500 - 3,400 K',
        spectralTypeRange: 'M4V - M8V',
      },
      {
        id: 'wd-vlm',
        displayName: 'Helium White Dwarf',
        stageKey: 'POST_HELIUM',
        durationYears: 1.0e13,
        description: 'Electron-degenerate helium core gradually cooling over cosmic time.',
        primaryEnergySource: 'Mestel Thermal Residual Cooling',
        internalState: 'Electron-Degenerate Helium',
        radiusRange: '0.015 - 0.020 R☉',
        luminosityRange: '10⁻⁵ - 10⁻³ L☉',
        temperatureRange: '3,000 - 20,000 K',
        spectralTypeRange: 'DA / DC',
        isTerminalRemnant: true,
        remnantType: 'WHITE_DWARF',
      },
    ],
  },
  {
    regimeId: 'SOLAR_LIKE',
    title: 'Solar-Like Stars (0.8 - 1.5 M☉)',
    massRangeSolar: [0.8, 1.5],
    representativeInitialMass: 1.0,
    estimatedMsLifetimeYears: 1.0e10, // 10 Gyr
    evolutionSummary: 'Radiative core with convective envelope. Evolves through Subgiant, Red Giant Tip (Helium Flash), Horizontal Branch/Red Clump, and AGB thermal pulses.',
    terminalFate: 'Thermal pulse envelope detachment forming a colorful Planetary Nebula and leaving an electron-degenerate Carbon-Oxygen White Dwarf.',
    finalRemnant: 'WHITE_DWARF',
    massLossSignificance: 'Moderate (AGB superwinds)',
    phases: [
      {
        id: 'ms-solar',
        displayName: 'Main Sequence',
        stageKey: 'MAIN_SEQUENCE',
        durationYears: 1.0e10,
        description: 'Core Hydrogen fusion via p-p chain in hydrostatic equilibrium.',
        primaryEnergySource: 'p-p I/II Nuclear Fusion',
        internalState: 'Radiative Core, Convective Envelope',
        radiusRange: '0.9 - 1.2 R☉',
        luminosityRange: '0.7 - 1.5 L☉',
        temperatureRange: '5,500 - 6,000 K',
        spectralTypeRange: 'G2V',
      },
      {
        id: 'rgb-solar',
        displayName: 'Red Giant Branch (RGB)',
        stageKey: 'RED_GIANT',
        durationYears: 1.0e9,
        description: 'Inert helium core contracts, hydrogen burns in shell, convective envelope expands dramatically.',
        primaryEnergySource: 'Hydrogen Shell Burning',
        internalState: 'Degenerate He Core, Vast Convective Envelope',
        radiusRange: '10 - 200 R☉',
        luminosityRange: '50 - 2,500 L☉',
        temperatureRange: '3,100 - 4,500 K',
        spectralTypeRange: 'K0III - M3III',
      },
      {
        id: 'he-solar',
        displayName: 'Helium Burning (Red Clump)',
        stageKey: 'HELIUM_BURNING',
        durationYears: 1.0e8,
        description: 'Helium flash ignites triple-alpha fusion in core.',
        primaryEnergySource: 'Triple-Alpha He Fusion (Core) + H Shell',
        internalState: 'Stable He-Burning Core',
        radiusRange: '8 - 15 R☉',
        luminosityRange: '40 - 80 L☉',
        temperatureRange: '4,600 - 5,200 K',
        spectralTypeRange: 'K0III',
      },
      {
        id: 'agb-solar',
        displayName: 'Asymptotic Giant Branch (AGB)',
        stageKey: 'ASYMPTOTIC_GIANT_BRANCH',
        durationYears: 2.0e7,
        description: 'Double shell burning (He + H) around degenerate C/O core with violent thermal pulse superwinds.',
        primaryEnergySource: 'Helium & Hydrogen Dual Shell Burning',
        internalState: 'Degenerate C-O Core, Pulsating Envelope',
        radiusRange: '100 - 400 R☉',
        luminosityRange: '2,000 - 8,000 L☉',
        temperatureRange: '2,800 - 3,300 K',
        spectralTypeRange: 'M4III - M8III',
      },
      {
        id: 'pn-solar',
        displayName: 'Planetary Nebula + WD',
        stageKey: 'ENVELOPE_EJECTION',
        durationYears: 50_000,
        description: 'Detached gas envelope expands at ~20 km/s, ionized by hot central young white dwarf.',
        primaryEnergySource: 'UV Photoionization from Degenerate Core',
        internalState: 'Ionized Expanding Gas Torus + Core',
        radiusRange: '0.1 - 1.0 pc (Nebula)',
        luminosityRange: '100 - 5,000 L☉',
        temperatureRange: '80,000 - 150,000 K (Central Star)',
        spectralTypeRange: 'Planetary Nebula / DAO',
      },
      {
        id: 'wd-solar',
        displayName: 'Carbon-Oxygen White Dwarf',
        stageKey: 'POST_HELIUM',
        durationYears: 1.0e11,
        description: 'Stable degenerate carbon-oxygen core cooling radiatively into a black dwarf.',
        primaryEnergySource: 'Mestel Thermal Residual Cooling',
        internalState: 'Electron-Degenerate Carbon-Oxygen Plasma',
        radiusRange: '0.008 - 0.014 R☉ (~Earth size)',
        luminosityRange: '10⁻⁵ - 10⁻¹ L☉',
        temperatureRange: '3,500 - 100,000 K',
        spectralTypeRange: 'DA / DB / DC',
        isTerminalRemnant: true,
        remnantType: 'WHITE_DWARF',
      },
    ],
  },
  {
    regimeId: 'MASSIVE',
    title: 'Massive Stars (8 - 25 M☉)',
    massRangeSolar: [8.0, 25.0],
    representativeInitialMass: 15.0,
    estimatedMsLifetimeYears: 1.5e7, // 15 Myr
    evolutionSummary: 'Convective core with CNO cycle dominance. Evolves through Blue/Red Supergiant phases, progressive shell burning (C, Ne, O, Si) up to an iron core.',
    terminalFate: 'Iron core collapse, rebound shockwave core-collapse supernova (10⁴⁴ J), ejecting heavy elements and creating a Neutron Star / Pulsar.',
    finalRemnant: 'NEUTRON_STAR',
    massLossSignificance: 'Intense (de Jager stellar winds)',
    phases: [
      {
        id: 'ms-massive',
        displayName: 'Main Sequence (O/B Giant)',
        stageKey: 'MAIN_SEQUENCE',
        durationYears: 1.2e7,
        description: 'Blazing CNO cycle core fusion driving high radiation pressure.',
        primaryEnergySource: 'CNO Nuclear Fusion Cycle',
        internalState: 'Convective Core, Radiative Envelope',
        radiusRange: '4 - 10 R☉',
        luminosityRange: '1,000 - 50,000 L☉',
        temperatureRange: '20,000 - 35,000 K',
        spectralTypeRange: 'O9V - B2V',
      },
      {
        id: 'sg-massive',
        displayName: 'Red Supergiant (RSG)',
        stageKey: 'RED_GIANT',
        durationYears: 1.5e6,
        description: 'Vast luminous envelope with onion-skin advanced nuclear burning shells.',
        primaryEnergySource: 'C, Ne, O, Si Successive Core/Shell Burning',
        internalState: 'Layered Onion Structure to Iron Core',
        radiusRange: '400 - 1,200 R☉',
        luminosityRange: '30,000 - 150,000 L☉',
        temperatureRange: '3,200 - 3,800 K',
        spectralTypeRange: 'M1Ia - M3Ia',
      },
      {
        id: 'sn-massive',
        displayName: 'Type II Supernova Explosion',
        stageKey: 'CORE_COLLAPSE',
        durationYears: 2,
        description: 'Gravitational iron-core collapse and rebound shockwave releasing 10⁴⁴ J of kinetic energy.',
        primaryEnergySource: 'Gravitational Binding Energy + ⁵⁶Ni Decay',
        internalState: 'Relativistic Collapse & Ejecta Shock',
        radiusRange: '100 - 10,000 AU (Expanding)',
        luminosityRange: '10⁹ - 10¹⁰ L☉',
        temperatureRange: '10,000 - 50,000 K',
        spectralTypeRange: 'Type II-P SN',
      },
      {
        id: 'ns-massive',
        displayName: 'Neutron Star / Pulsar',
        stageKey: 'POST_HELIUM',
        durationYears: 1.0e12,
        description: 'Ultra-compact sphere supported by neutron degeneracy pressure and strong magnetic dipole emission.',
        primaryEnergySource: 'Rotational Kinetic Energy / Dipole Spin-Down',
        internalState: 'Neutron-Degenerate Superfluid Nuclear Matter',
        radiusRange: '11.5 km (1.65 × 10⁻⁵ R☉)',
        luminosityRange: '10⁻⁶ - 10⁻² L☉ (Non-thermal beam)',
        temperatureRange: '100,000 - 1,000,000 K',
        spectralTypeRange: 'Radio / X-Ray Pulsar',
        isTerminalRemnant: true,
        remnantType: 'NEUTRON_STAR',
      },
    ],
  },
  {
    regimeId: 'HYPERMASSIVE',
    title: 'Hypermassive Stars (> 25 M☉)',
    massRangeSolar: [25.0, 150.0],
    representativeInitialMass: 35.0,
    estimatedMsLifetimeYears: 4.0e6, // 4 Myr
    evolutionSummary: 'Extremely luminous stars experiencing violent Eddington-limit mass-loss episodes (Wolf-Rayet, Luminous Blue Variable).',
    terminalFate: 'Core mass exceeds TOV limit (2.17 M☉), leading to complete gravitational collapse into a Schwarzschild Stellar Black Hole.',
    finalRemnant: 'BLACK_HOLE',
    massLossSignificance: 'Intense (de Jager stellar winds)',
    phases: [
      {
        id: 'ms-hyper',
        displayName: 'Wolf-Rayet / Hypergiant MS',
        stageKey: 'MAIN_SEQUENCE',
        durationYears: 3.5e6,
        description: 'Near-Eddington luminosity with strong line-driven mass-loss winds.',
        primaryEnergySource: 'CNO Nuclear Fusion Cycle',
        internalState: 'Radiative Atmosphere, Rapid Convective Core',
        radiusRange: '15 - 30 R☉',
        luminosityRange: '100,000 - 1,000,000 L☉',
        temperatureRange: '35,000 - 50,000 K',
        spectralTypeRange: 'O2Ia / WN / WC',
      },
      {
        id: 'bh-hyper',
        displayName: 'Stellar Black Hole & Accretion Disk',
        stageKey: 'POST_HELIUM',
        durationYears: 1.0e67,
        description: 'Gravitational singularity enclosed by an event horizon at rs = 2GM/c² with luminous X-ray accretion disk.',
        primaryEnergySource: 'Gravitational Infall Accretion (η ≈ 0.08)',
        internalState: 'Spacetime Curvature Singularity',
        radiusRange: 'rs = 30 - 150 km',
        luminosityRange: '10³ - 10⁵ L☉ (Accretion disk dependent)',
        temperatureRange: '10⁵ - 10⁷ K (Inner disk)',
        spectralTypeRange: 'High-Mass X-ray Binary',
        isTerminalRemnant: true,
        remnantType: 'BLACK_HOLE',
      },
    ],
  },
];
