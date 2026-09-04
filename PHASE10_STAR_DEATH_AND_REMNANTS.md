# PHASE 10 — STAR DEATH & STELLAR REMNANTS

## COSMIC EVOLUTION EXPLORER

### 1. Overview & Architectural Scope
Phase 10 implements a deterministic, physically motivated educational **Stellar Death & Compact Remnants Engine** in `src/stardeath/`. The engine consumes the final `POST_HELIUM` handoff state from Phase 9 and models envelope loss, planetary nebulae, core collapse, supernovae, and final remnant cooling/spin-down across the three classical compact object endpoints:
1. **White Dwarf** ($M_{\text{core}} < M_{\text{Ch}} \approx 1.44 M_\odot$).
2. **Neutron Star / Pulsar** ($1.44 M_\odot \le M_{\text{remnant}} \le M_{\text{TOV}} \approx 2.17 - 3.0 M_\odot$).
3. **Stellar-Mass Black Hole** ($M_{\text{remnant}} > M_{\text{TOV}}$).

---

### 2. State Machine & Death Pathways
The death state machine supports:

```text
LOW / INTERMEDIATE MASS (M_0 ≲ 8 M_☉)
POST_HELIUM → AGB → ENVELOPE_EJECTION → PLANETARY_NEBULA → WHITE_DWARF_FORMATION → WHITE_DWARF

MASSIVE STARS (8 ≲ M_0 ≲ 25 M_☉)
POST_HELIUM → CORE_COLLAPSE → SUPERNOVA → NEUTRON_STAR_FORMATION → NEUTRON_STAR / PULSAR

HYPERMASSIVE STARS (M_0 ≳ 25 M_☉)
POST_HELIUM → CORE_COLLAPSE → SUPERNOVA / DIRECT COLLAPSE → BLACK_HOLE_FORMATION → BLACK_HOLE
```

---

### 3. Physical Models & Equations

#### A. Planetary Nebula & Envelope Detachment
- **Expansion Dynamics**:
  $$R_{\text{nebula}}(t) = R_0 + v_{\text{exp}} \cdot t \quad (v_{\text{exp}} \approx 25\text{ km/s})$$
- **Gas Dilution**:
  $$n(t) \propto M_{\text{env}} / R(t)^{2.5} \quad (\sim 10^5 \to 0.1\text{ cm}^{-3})$$
- **Visibility Window**: $\sim 50,000\text{ years}$ before complete interstellar dispersion.

#### B. White Dwarf Remnant
- **Chandrasekhar Limit**: $M_{\text{Ch}} = 1.44 M_\odot$.
- **Electron Degeneracy Mass-Radius Relation**:
  $$R_{\text{WD}}(M) \approx 0.0126 R_\odot \left(\frac{M}{M_{\text{Ch}}}\right)^{-1/3} \sqrt{1 - \left(\frac{M}{M_{\text{Ch}}}\right)^{4/3}}$$
  Demonstrates relativistic degeneracy softening ($M \uparrow \implies R \downarrow$).
- **Mestel Thermal Cooling**:
  $$L(t) \propto M \cdot t^{-1.15}, \quad T_{\text{eff}}(t) \propto t^{-0.22}$$
  Initial birth temperature $T \approx 120,000\text{ K} \to 3,000\text{ K}$ over $10^{10}\text{ yr}$.
- **Mean Core Density**: $\rho_{\text{WD}} \approx 10^8 - 10^9\text{ kg/m}^3$ ($1\text{ ton/cm}^3$).

#### C. Core Collapse & Supernova
- **Core Implosion**: $R_{\text{core}}$ collapses from $1500\text{ km} \to 12\text{ km}$, $\rho_c \to 3\times 10^{17}\text{ kg/m}^3$, $v_{\text{infall}} \to 70,000\text{ km/s} \approx 0.23 c$.
- **Kinetic Energy**: $E_{\text{SN}} = 1\text{ foe} = 10^{44}\text{ J}$.
- **Ejecta Shockwave Velocity**: $v_{\text{ej}} = \sqrt{2 E / M_{\text{ej}}} \approx 3,000 - 15,000\text{ km/s}$.
- **Radioactive Decay Light Curve**:
  Rise to peak ($t_{\text{rise}} \approx 18\text{ d}$, $L_{\text{peak}} \sim 10^9 - 10^{10} L_\odot$) followed by radioactive exponential tail ($^{56}\text{Ni} \to \,^{56}\text{Co} \to \,^{56}\text{Fe}$).

#### D. Neutron Star & Pulsar
- **Dimensions**: $R \approx 11.5\text{ km} = 1.652\times 10^{-5} R_\odot$.
- **Nuclear Saturation Density**: $\rho \sim 3\times 10^{17}\text{ kg/m}^3$.
- **Relativistic Compactness**: $\Xi = \frac{G M}{R c^2} \approx 0.185 \in (0, 0.5)$.
- **Surface Escape Velocity**: $v_{\text{esc}} \approx 182,000\text{ km/s} \approx 0.608 c < c$.
- **Magnetic Dipole Spin-Down**:
  $$\dot{P} = \frac{8\pi^2 B^2 R^6}{3 I c^3 P}, \quad P(t) = \sqrt{P_0^2 + 2 P \dot{P} t}$$

#### E. Stellar Black Hole
- **Schwarzschild Radius**:
  $$r_s = \frac{2 G M}{c^2} \approx 2.953\text{ km} / M_\odot$$
- **Photon Sphere**: $r_{\text{ph}} = 1.5 r_s$.
- **ISCO (Innermost Stable Circular Orbit)**: $r_{\text{isco}} = 3.0 r_s$.
- **Event Horizon**: Completely non-luminous ($T_{\text{Hawking}} \approx 6.17\times 10^{-8} (M_\odot / M)\text{ K} \approx 0\text{ K}$).
- **Accretion Disk**: Radiative efficiency $\eta \approx 0.08$, peak inner temperature $T_{\text{disk}} \sim 10^6 - 10^7\text{ K}$ (X-ray emission).

---

### 4. Mass Conservation
Throughout all pathways, mass is strictly conserved within numerical tolerance:
$$M_{\text{initial}} \equiv M_{\text{remnant}} + M_{\text{ejected}}$$

---

### 5. 3D Visual System
- [`PlanetaryNebulaVisual.tsx`](file:///d:/imagegenerator/universe/src/stardeath/PlanetaryNebulaVisual.tsx): Multi-shell expanding ionized envelope ([O III] emerald cyan + H-alpha red torus) with central hot white dwarf point light.
- [`SupernovaVisual.tsx`](file:///d:/imagegenerator/universe/src/stardeath/SupernovaVisual.tsx): High-velocity expanding shockwave sphere, radioactive turbulent filaments, and intense radiant light.
- [`WhiteDwarfVisual.tsx`](file:///d:/imagegenerator/universe/src/stardeath/WhiteDwarfVisual.tsx): Compact blue-white photosphere with intense coronal halo and cooling thermal shift.
- [`NeutronStarVisual.tsx`](file:///d:/imagegenerator/universe/src/stardeath/NeutronStarVisual.tsx): Ultra-compact core with rotating relativistic twin pulsar beam emission cones and magnetic dipole field torus.
- [`BlackHoleVisual.tsx`](file:///d:/imagegenerator/universe/src/stardeath/BlackHoleVisual.tsx): Dark event horizon sphere, gravitational lensing photon ring halo, and Keplerian accretion disk.
- [`StellarDeathSystem.tsx`](file:///d:/imagegenerator/universe/src/stardeath/StellarDeathSystem.tsx): Interactive composite system integrating selection into `useAppStore` and smooth physics stepping via accelerated simulation time.

---

### 6. Validation Suite Summary
- **Phase 7 Stellar Physics**: 20 / 20 Tests Passed (100%)
- **Phase 8 Star Birth**: 15 / 15 Tests Passed (100%)
- **Phase 9 Star Evolution**: 28 / 28 Tests Passed (100%)
- **Phase 10 Star Death**: 43 / 43 Tests Passed (100%)
- **Total Validated Suite**: 106 / 106 Tests Passed (100% Zero Regressions)
- **Linter (oxlint)**: 0 Errors, 0 Warnings
- **TypeScript (`npx tsc -b`)**: 0 Errors
- **Production Build (`npm run build`)**: Success
