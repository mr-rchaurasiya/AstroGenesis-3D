# PHASE 7 — STELLAR PHYSICS ENGINE
## Cosmic Evolution Explorer — Scientific Architecture & Technical Specification

---

### 1. Executive Summary & Purpose

Phase 7 establishes a modular, testable, and physically grounded **Stellar Physics Engine** in `src/stellar/`.
The engine serves as the unified scientific foundation for all stellar phenomena in the Cosmic Evolution Explorer, decoupling pure physical simulations and astrophysical calculations from Three.js rendering loops and React state cycles.

This system provides complete analytical models for:
- Piecewise empirical mass-luminosity ($L \propto M^\alpha$) and mass-radius relations.
- Stefan-Boltzmann blackbody radiation law ($L = 4\pi R^2 \sigma T^4$).
- Hydrostatic surface gravity ($g = GM/R^2$) and mean density ($\rho = M / V$).
- Surface escape velocity ($v_\text{esc} = \sqrt{2GM/R}$) and gravitational binding energy.
- Theoretical Eddington luminosity limit ($L_\text{Edd} = 4\pi G M c / \kappa$) and Eddington ratio $\Gamma = L / L_\text{Edd}$.
- Nuclear fusion energetics: Proton-Proton (PP) chain vs Carbon-Nitrogen-Oxygen (CNO) cycle transitions, core temperature and density estimation, and mass-energy conversion rates ($E = \eta m c^2$).
- Main-sequence nuclear timescale lifetime ($t_\text{MS} \propto M/L$).
- Chemical composition conservation ($X + Y + Z = 1.0$) and iron-to-hydrogen metallicity conversions $[Fe/H]$.
- Morgan-Keenan spectral classification (O, B, A, F, G, K, M, L, T, Y with continuous 0–9 subtypes).
- Luminosity classification (Classes 0, Ia+, Ia, Ib, II, III, IV, V, VI, VII).
- Absolute/bolometric magnitudes and distance modulus apparent magnitude ($m - M = 5 \log_{10}(d / 10\text{pc})$).
- Physically motivated Planckian locus Blackbody RGB color mapping.
- Reusable Hertzsprung-Russell (HR) diagram data extraction.
- Automated validation suite with 20 deterministic sanity checks.

---

### 2. Physics Engine Architecture

```
src/stellar/
├── StellarConstants.ts       # Central SI & astronomical reference constants
├── StellarTypes.ts           # Strongly typed data models and interfaces
├── StellarPhysics.ts         # Pure deterministic equations (L, R, T, g, ρ, vesc, LEdd, U)
├── StellarComposition.ts     # Elemental fractions X, Y, Z, [Fe/H], mean molecular weight μ
├── StellarEnergy.ts          # Core thermodynamics, PP/CNO nuclear fusion, mass conversion
├── StellarClassification.ts  # MK spectral/luminosity classes, magnitudes, blackbody RGB
├── StellarLifetime.ts        # Main sequence lifetime and aging progression models
├── StellarModels.ts          # Central calculation pipeline and benchmark generators
├── StellarValidation.ts      # Automated verification suite and sanity assertions
└── index.ts                  # Public module entrypoint
```

---

### 3. Physical Constants & Reference System

All internal physics calculations use standard **SI Units** (kg, meters, seconds, Watts, Kelvin, Joules), while astronomical display formats and inputs cleanly utilize **Solar Reference Units** ($M_\odot, R_\odot, L_\odot, T_{\text{eff},\odot}$):

| Constant | Symbol | Value (SI) | Astronomical Context |
|---|---|---|---|
| Gravitational Constant | $G$ | $6.67430 \times 10^{-11} \text{ m}^3\text{kg}^{-1}\text{s}^{-2}$ | Newtonian gravitation |
| Speed of Light | $c$ | $2.99792458 \times 10^8 \text{ m/s}$ | Mass-energy equivalence |
| Stefan-Boltzmann Constant | $\sigma$ | $5.670374 \times 10^{-8} \text{ W m}^{-2} \text{K}^{-4}$ | Radiative flux |
| Boltzmann Constant | $k_B$ | $1.380649 \times 10^{-23} \text{ J/K}$ | Ideal gas thermodynamics |
| Proton Mass | $m_p$ | $1.672622 \times 10^{-27} \text{ kg}$ | Nuclear particle mass |
| Solar Mass | $M_\odot$ | $1.98847 \times 10^{30} \text{ kg}$ | Reference stellar mass |
| Solar Nominal Radius | $R_\odot$ | $6.957 \times 10^8 \text{ m}$ | Reference stellar radius |
| Solar Nominal Luminosity | $L_\odot$ | $3.828 \times 10^{26} \text{ W}$ | Reference bolometric flux |
| Solar Effective Temperature | $T_{\odot,\text{eff}}$ | $5772 \text{ K} / 5778 \text{ K}$ | Photosphere temperature |
| Solar Age | $t_\odot$ | $4.603 \times 10^9 \text{ yr}$ | Current Sun age |
| Solar Core Temperature | $T_{\odot,\text{core}}$ | $1.57 \times 10^7 \text{ K}$ | Central fusion core |
| Solar Core Density | $\rho_{\odot,\text{core}}$ | $1.62 \times 10^5 \text{ kg/m}^3$ | Central mass density |
| Hydrogen Fusion Efficiency | $\eta$ | $0.00712$ ($0.712\%$) | $4\ ^1\text{H} \to\ ^4\text{He}$ mass defect |

---

### 4. Astrophysical Formulations & Approximations

#### 4.1. Mass-Luminosity Scaling (Main Sequence)
Stars on the Main Sequence obey empirical piecewise mass-luminosity power laws $L \propto M^\alpha$:
- **Low-Mass Convective Regime ($M < 0.43 M_\odot$):**
  $$L/L_\odot = 0.23 \left(\frac{M}{M_\odot}\right)^{2.3}$$
- **Sun-like Intermediate Regime ($0.43 M_\odot \le M < 2.0 M_\odot$):**
  $$L/L_\odot = \left(\frac{M}{M_\odot}\right)^{4.0}$$
- **Massive CNO Regime ($2.0 M_\odot \le M < 20.0 M_\odot$):**
  $$L/L_\odot = 1.5 \left(\frac{M}{M_\odot}\right)^{3.5}$$
- **Hypermassive Radiation-Dominated Regime ($M \ge 20.0 M_\odot$):**
  $$L/L_\odot = 3200 \left(\frac{M}{M_\odot}\right)$$

#### 4.2. Mass-Radius Scaling (Main Sequence)
- **Convective Envelope ($M < 1.0 M_\odot$):**
  $$R/R_\odot = \left(\frac{M}{M_\odot}\right)^{0.80}$$
- **Radiative Envelope ($M \ge 1.0 M_\odot$):**
  $$R/R_\odot = \left(\frac{M}{M_\odot}\right)^{0.57}$$

#### 4.3. Stefan-Boltzmann Effective Temperature
$$T_\text{eff} = T_\odot \left( \frac{L/L_\odot}{(R/R_\odot)^2} \right)^{1/4} = \left( \frac{L}{4\pi R^2 \sigma} \right)^{1/4}$$

#### 4.4. Gravitational & Dynamic Properties
- **Surface Gravity:** $g = \frac{GM}{R^2} \text{ (m/s}^2\text{)}$; $\quad \log g = \log_{10}(g \cdot 100) \text{ (cgs)}$
- **Mean Density:** $\rho = \frac{M}{\frac{4}{3}\pi R^3} \text{ (kg/m}^3\text{)}$
- **Escape Velocity:** $v_\text{esc} = \sqrt{\frac{2GM}{R}} \text{ (m/s)}$
- **Eddington Luminosity Limit:** $L_\text{Edd} = \frac{4\pi G M c}{\kappa}$ where $\kappa = 0.02(1 + X) \text{ m}^2/\text{kg}$

#### 4.5. Nuclear Fusion & Core Physics
- **Core Temperature:** $T_c \approx T_{c,\odot} \cdot \left(\frac{M/M_\odot}{R/R_\odot}\right) \cdot \left(\frac{\mu}{\mu_\odot}\right)$
- **Core Density:** $\rho_c \approx \rho_{c,\odot} \cdot \frac{M/M_\odot}{(R/R_\odot)^3}$
- **Proton-Proton (PP) Chain Rate:** $\epsilon_{pp} \propto \rho X^2 T_6^4$ (dominant for $T_c < 1.8 \times 10^7 \text{ K}$)
- **CNO Cycle Rate:** $\epsilon_{cno} \propto \rho X Z T_6^{17}$ (dominant for $T_c > 1.8 \times 10^7 \text{ K}$)
- **Hydrogen Consumption Rate:** $\dot{M}_H = \frac{L}{\eta c^2} = \frac{L}{0.00712 \cdot c^2} \text{ (kg/s)}$
- **Direct Mass-to-Radiation Loss:** $\dot{M}_\text{rad} = \frac{L}{c^2} \text{ (kg/s)}$

#### 4.6. Main Sequence Lifetime
$$t_\text{MS} \approx 1.0 \times 10^{10} \text{ yr} \times \left(\frac{M/M_\odot}{L/L_\odot}\right)$$
Massive stars are bounded asymptotically at $\tau_\text{min} \approx 3.0 \times 10^6 \text{ yr}$ to account for stellar wind mass-loss limits.

#### 4.7. Chemical Composition & Metallicity
- **Conservation Law:** $X + Y + Z = 1.0$ ($|X+Y+Z - 1.0| \le 10^{-4}$)
- **Ionized Mean Molecular Weight:** $\frac{1}{\mu} = 2X + \frac{3}{4}Y + \frac{1}{2}Z$
- **Iron Metallicity Index:** $[Fe/H] = \log_{10}\left( \frac{Z/X}{(Z/X)_\odot} \right)$

#### 4.8. Spectral & Luminosity Classification
- **Morgan-Keenan Classes:**
  - `O`: $\ge 30,000 \text{ K}$ (Ionized He, deep blue)
  - `B`: $10,000 - 30,000 \text{ K}$ (Neutral He, blue-white)
  - `A`: $7,500 - 10,000 \text{ K}$ (Balmer series, white)
  - `F`: $6,000 - 7,500 \text{ K}$ (Ca II H&K, yellow-white)
  - `G`: $5,200 - 6,000 \text{ K}$ (Solar type, golden yellow; Sun = `G2V`)
  - `K`: $3,700 - 5,200 \text{ K}$ (Neutral metals, orange)
  - `M`: $2,400 - 3,700 \text{ K}$ (TiO bands, red)
  - `L, T, Y`: Substellar cool brown dwarfs ($< 2,400 \text{ K}$)
- **Luminosity Classes:** `0` / `Ia+` (Hypergiant), `Ia`/`Ib` (Supergiants), `II` (Bright giant), `III` (Normal giant), `IV` (Subgiant), `V` (Main sequence dwarf), `VI` (Subdwarf), `VII` (White dwarf).

#### 4.9. Magnitudes & Photometry
- **Bolometric Absolute Magnitude:** $M_\text{bol} = 4.74 - 2.5 \log_{10}(L/L_\odot)$
- **Visual Absolute Magnitude:** $M_V = M_\text{bol} - BC(T_\text{eff})$
- **Distance Modulus:** $m_V = M_V + 5 \log_{10}(d_\text{pc}) - 5$

---

### 5. Automated Validation & Reference Star Benchmarks

The automated validation suite in `src/stellar/StellarValidation.ts` executes **20 automated unit assertions**, verifying exact physical consistency:

| Benchmark Star | Mass ($M_\odot$) | Radius ($R_\odot$) | Luminosity ($L_\odot$) | Temp ($T_\text{eff}$) | Spectral Class | Status |
|---|---|---|---|---|---|---|
| **Sun (Sol)** | $1.00$ | $1.00$ | $1.00$ | $5778 \text{ K}$ | `G2V` | ✅ PASS |
| **Proxima Centauri** | $0.122$ | $0.154$ | $0.0017$ | $3042 \text{ K}$ | `M5V` | ✅ PASS |
| **Sirius A** | $2.063$ | $1.711$ | $25.4$ | $9940 \text{ K}$ | `A0V` | ✅ PASS |
| **Rigel** | $21.0$ | $78.9$ | $120,000$ | $12,100 \text{ K}$ | `B8Ia` | ✅ PASS |
| **Betelgeuse** | $16.5$ | $764.0$ | $126,000$ | $3600 \text{ K}$ | `M2Ia` | ✅ PASS |
| **Sirius B** | $1.018$ | $0.0084$ | $0.056$ | $25,200 \text{ K}$ | `B2VII` ($\log g=8.60$) | ✅ PASS |

**Additional Sanity Checks:**
- Monotonic mass-luminosity scaling across Main Sequence: ✅ PASS
- Monotonic decrease in Main Sequence lifetime with stellar mass: ✅ PASS
- Exact Stefan-Boltzmann temperature inversion: ✅ PASS
- Chemical composition conservation ($X+Y+Z = 1.0$): ✅ PASS
- Bolometric magnitude inversion ($100\times L \implies -5.0 \text{ mag}$): ✅ PASS
- Distance modulus scaling ($10\text{ pc} \to 100\text{ pc} \implies +5.0 \text{ mag}$): ✅ PASS
- Numerical safety against zero, negative mass, and NaN/Infinity: ✅ PASS
- Full Morgan-Keenan $O \to B \to A \to F \to G \to K \to M \to L \to T \to Y$ sequence: ✅ PASS

---

### 6. Architectural Compatibility for Future Phases

The stellar physics module is designed with zero breaking changes for future roadmap phases:

1. **Phase 8 — Star Birth:**
   - Ready for Jeans collapse criterion, protostellar accretion rate, and core deuterium/hydrogen ignition thresholds.
2. **Phase 9 — Star Evolution:**
   - The `calculateStellarStateAtAge(base, age)` and `StellarEvolutionaryState` enums are ready to be expanded with multi-phase evolutionary tracks (subgiant branch, red giant branch, horizontal branch, AGB, thermal pulses).
3. **Phase 10 — Star Death & Remnants:**
   - Supported with Chandrasekhar mass limits ($1.4 M_\odot$), TOV neutron star limits ($2.5 M_\odot$), white dwarf cooling tracks, and compact remnant states.

---

### 7. Performance & Rendering Decoupling

- **Zero per-frame physics recalculation**: Physics models run strictly on-demand or during time step jumps, never inside Three.js `useFrame` render loops.
- **Pure Functions**: Calculations are memoizable and side-effect free.
- **Visual Mapping Layer**: Rendering components consume lightweight `StellarVisualProperties` without accessing heavy physics solvers directly.
