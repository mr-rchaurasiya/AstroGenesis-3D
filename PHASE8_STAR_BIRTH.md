# PHASE 8 — STAR BIRTH & FORMATION ENGINE
## Cosmic Evolution Explorer — Scientific Architecture & Technical Specification

---

### 1. Executive Summary & Purpose

Phase 8 establishes a physically motivated, modular, and interactive **Star Birth / Star Formation Engine** in `src/starbirth/`.
The engine simulates the complete physical sequence of stellar birth from diffuse cold molecular gas to stable core hydrogen ignition on the Zero-Age Main Sequence (ZAMS):

$$\begin{aligned}
\text{Giant Molecular Cloud} &\longrightarrow \text{Gravitational Collapse} \longrightarrow \text{Dense Core Fragmentation} \\
&\longrightarrow \text{Protostar (Class 0/I)} \longrightarrow \text{Accretion Disk + Bipolar Jets} \\
&\longrightarrow \text{T Tauri / Pre-Main-Sequence} \longrightarrow \text{Kelvin-Helmholtz Contraction} \\
&\longrightarrow \text{Core Temperature Rise} \longrightarrow \text{Hydrogen Ignition} \longrightarrow \text{ZAMS Star}
\end{aligned}$$

The engine directly builds upon the **Phase 7 Stellar Physics Engine**, providing seamless handoff to Phase 7 `StellarProperties` upon hydrogen ignition without duplicate physical logic.

---

### 2. Architecture & File Structure

```
src/starbirth/
├── StarBirthConstants.ts       # Central molecular cloud, ignition, and accretion constants
├── StarBirthTypes.ts           # Strongly typed data models for clouds, protostars, disks, jets
├── MolecularCloud.ts           # Density conversions, free-fall time, Jeans mass/length, virial stability
├── CloudCollapse.ts            # Dynamic contraction kinematics and deterministic fragmentation
├── AccretionModel.ts           # Shu collapse mass accretion rates and accretion shock luminosity
├── DiskModel.ts                # Protoplanetary circumstellar disk geometry and photoevaporative dissipation
├── JetsModel.ts                # Magnetocentrifugal bipolar Herbig-Haro outflows and mass loss
├── Protostar.ts                # Kelvin-Helmholtz contraction, core thermodynamics, and ignition state machine
├── StarFormation.ts            # Complex coordinator, gas conservation tracking, IMF sampling, PMS tracks
├── StarBirthVisuals.ts         # Decoupled visual property and shader parameter mappings
├── MolecularCloudVisual.tsx    # 3D procedural gas particle envelope component
├── AccretionDiskVisual.tsx     # 3D rotating circumstellar dust disk component
├── ProtostellarJetsVisual.tsx  # 3D bipolar collimated jet plume component
├── ProtostarVisual.tsx         # 3D protostar photosphere, corona, and lighting component
├── StarFormationSystem.tsx     # Composite interactive star formation system component
├── StarBirthValidation.ts      # Automated verification suite with 15 physical assertions
└── index.ts                    # Public module entrypoint
```

---

### 3. Scientific Formulations & Physical Approximations

#### 3.1. Molecular Cloud Thermodynamics & Density
- **Mean Molecular Mass:** $\mu_{\text{mol}} = 2.38$ atomic mass units ($m_p = \mu_{\text{mol}} \cdot m_u$).
- **Number Density Conversion:**
  $$n_{\text{H}_2} = \frac{\rho}{\mu_{\text{mol}} \cdot m_u \cdot 10^6} \text{ (cm}^{-3}\text{)}$$
- **Gravitational Free-Fall Timescale:**
  $$t_{\text{ff}} = \sqrt{\frac{3\pi}{32 G \rho}}$$

#### 3.2. Jeans Instability & Virial Equilibrium
- **Isothermal Sound Speed:**
  $$c_s = \sqrt{\frac{\gamma k_B T}{\mu_{\text{mol}} m_u}}$$
- **Jeans Length:**
  $$\lambda_J = c_s \sqrt{\frac{\pi}{G \rho}}$$
- **Jeans Mass:**
  $$M_J = \frac{4\pi}{3} \rho \left(\frac{\lambda_J}{2}\right)^3 = \frac{\pi}{6} \rho \lambda_J^3$$
- **Virial Stability Parameter:**
  $$\alpha_{\text{vir}} = \frac{5 \sigma_v^2 R}{G M}$$
  ($\alpha_{\text{vir}} < 1.0 \implies \text{gravitational collapse is inevitable}$).

#### 3.3. Mass Accretion & Accretion Luminosity
- **Time-Dependent Accretion Rate:**
  $$\dot{M}(t) = \frac{M_{\text{target}}}{\tau_{\text{acc}}} \exp\left(-\frac{t}{\tau_{\text{acc}}}\right)$$
  where $\tau_{\text{acc}} \approx 2.0 \times 10^5 \text{ yr} \cdot (M / M_\odot)^{0.4}$.
- **Accretion Shock Luminosity:**
  $$L_{\text{acc}} = \frac{G M \dot{M}}{R}$$
- **Total Protostellar Luminosity:**
  $$L_{\text{total}} = L_{\text{internal}} + L_{\text{acc}}$$

#### 3.4. Circumstellar Disks & Bipolar Outflows
- **Disk Temperature Profile:**
  $$T(r) = T_{\text{in}} \left(\frac{r}{R_{\text{in}}}\right)^{-3/4}$$
- **Bipolar Jet Launch Velocity:**
  $$v_{\text{jet}} \approx v_{\text{esc}} = \sqrt{\frac{2 G M}{R}} \sim 100 - 400 \text{ km/s}$$
- **Jet Mass Loss Rate:**
  $$\dot{M}_{\text{jet}} = 0.10 \cdot \dot{M}_{\text{acc}}$$

#### 3.5. Kelvin-Helmholtz Contraction & Core Thermodynamics
- **Kelvin-Helmholtz Timescale:**
  $$t_{\text{KH}} = \frac{G M^2}{R L}$$
- **Virial Core Temperature Growth:**
  $$T_c(t) \approx 1.57 \times 10^7 \text{ K} \cdot \left(\frac{M(t)/M_\odot}{R(t)/R_\odot}\right)$$
- **Core Mass Density Growth:**
  $$\rho_c(t) \approx 1.62 \times 10^5 \text{ kg/m}^3 \cdot \left(\frac{M(t)/M_\odot}{(R(t)/R_\odot)^3}\right)$$

#### 3.6. Rotational Breakup Limit
- **Breakup Angular Velocity:**
  $$\Omega_{\text{breakup}} = \sqrt{\frac{G M}{R^3}}$$
- The engine enforces $\Omega(t) \le 0.85 \cdot \Omega_{\text{breakup}}$ to prevent unphysical rotational disruption.

#### 3.7. Hydrogen Burning Ignition Threshold
- **Ignition Condition:** $T_c \ge 1.0 \times 10^7 \text{ K}$ and $M \ge 0.075 M_\odot$.
- **Transition:** Protostar enters `HYDROGEN_IGNITION` and settles onto the `ZERO_AGE_MAIN_SEQUENCE` (ZAMS).
- **Substellar / Brown Dwarf Cutoff:** Objects with $M < 0.075 M_\odot$ never reach $10^7\text{ K}$; they halt contraction via electron degeneracy pressure and are classified as `BROWN_DWARF`.

#### 3.8. Gas Mass Conservation
The formation complex enforces exact mass conservation at all times:
$$M_{\text{initial}} = M_{\text{gas,remaining}} + M_{\text{stars,formed}} + M_{\text{outflow,ejected}}$$

---

### 4. Automated Validation Suite Results

The validation suite in `src/starbirth/StarBirthValidation.ts` verifies 15 automated physical assertions:

| Test Case | Description | Result |
|---|---|---|
| **1. Cloud Density & Free-Fall Time** | GMC mass density, molecular $n_{\text{H}_2}$, and $t_{\text{ff}} \sim 1-10\text{ Myr}$ | ✅ PASS |
| **2. Jeans Instability** | Sound speed $c_s \sim 300\text{ m/s}$, $\lambda_J$, and $M_J$ | ✅ PASS |
| **3. Virial Stability Parameter** | $\alpha_{\text{vir}} < 1.0$ for dense cores vs $\alpha_{\text{vir}} > 1.0$ for unbound clouds | ✅ PASS |
| **4. Cloud Collapse Dynamics** | Smooth radius contraction and density increase | ✅ PASS |
| **5. Accretion Rate Decay** | Exponential decline following self-similar collapse | ✅ PASS |
| **6. Accretion Shock Luminosity** | $L_{\text{acc}} = G M \dot{M} / R$ scaling | ✅ PASS |
| **7. Kelvin-Helmholtz Timescale** | Solar $t_{\text{KH}} \approx 30\text{ Myr}$ | ✅ PASS |
| **8. Contraction & Core Heating** | Radius shrinks, $T_c$ and $\rho_c$ rise following virial scaling | ✅ PASS |
| **9. Sun-like Hydrogen Ignition** | $1 M_\odot$ reaches $T_c > 10^7\text{K}$, state transitions to ZAMS with `G`-type classification | ✅ PASS |
| **10. Brown Dwarf Cutoff** | $0.04 M_\odot$ object never ignites; classifies as `BROWN_DWARF` | ✅ PASS |
| **11. Massive Star Formation** | $15 M_\odot$ accretes rapidly, reaches $T_c = 46\text{M K}$, $L = 6845 L_\odot$ | ✅ PASS |
| **12. Rotational Breakup Safety** | Angular velocity strictly bounded by $\Omega_{\text{breakup}}$ | ✅ PASS |
| **13. Disk & Jet Coupling** | Jet velocity scales with $v_{\text{esc}}$, disk dissipates over time | ✅ PASS |
| **14. Gas Mass Conservation** | $M_{\text{initial}} \equiv M_{\text{gas}} + M_{\text{stars}} + M_{\text{outflow}}$ within $0.01 M_\odot$ | ✅ PASS |
| **15. PMS API & Kroupa IMF** | Pre-Main-Sequence state derivation and 3-part power law IMF sampling | ✅ PASS |

---

### 5. Architectural Compatibility with Phase 9 & 10

1. **Phase 9 — Star Evolution:**
   - The Zero-Age Main Sequence handoff provides full `StellarProperties` (`massSolar`, `radiusSolar`, `luminositySolar`, `effectiveTemperatureK`, `coreTemperatureK`, `composition`, `spectralClass`, `lifetimeYears`) ready to enter main sequence and post-main-sequence evolution tracks.
2. **Phase 10 — Star Death & Remnants:**
   - Initial stellar mass $M_{\text{ZAMS}}$ established in Phase 8 directly determines the stellar fate (white dwarf vs neutron star vs black hole) according to the Chandrasekhar and TOV limits.
