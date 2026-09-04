# PHASE 9 — STELLAR EVOLUTION ENGINE

## COSMIC EVOLUTION EXPLORER

### 1. Overview & Architectural Scope
Phase 9 implements a deterministic, physically motivated educational **Stellar Evolution Engine** in `src/starevolution/`. The engine evolves stars across their full lifespans from Zero-Age Main Sequence (ZAMS) up to the Post-Helium / AGB handoff endpoint (preparing the exact state required for Phase 10 Remnants without crossing the scientific boundary into supernova or degenerate endpoints).

---

### 2. Evolutionary Stages
The engine models continuous transitions across standard astrophysical phases:

```text
ZERO_AGE_MAIN_SEQUENCE (ZAMS, τ = 0.0)
       ↓
MAIN_SEQUENCE (0.0 < τ < 0.95, core H burning)
       ↓
HYDROGEN_DEPLETION (0.95 ≤ τ ≤ 1.0, core H exhaustion)
       ↓
SUBGIANT (inert He core contraction, H shell burning)
       ↓
RED_GIANT / SUPERGIANT (convective Hayashi track, envelope expansion, core density surge)
       ↓
HELIUM_IGNITION (T_core ~ 10⁸ K, helium flash / non-degenerate ignition)
       ↓
HELIUM_BURNING (triple-alpha fusion, Horizontal Branch / Red Clump / Blue Loop)
       ↓
ASYMPTOTIC_GIANT_BRANCH (double shell burning, C/O core growth, superwinds)
       ↓
POST_HELIUM (handoff boundary for Phase 10)
```

---

### 3. Mass-Dependent Evolutionary Regimes
1. **Very Low Mass ($M < 0.35 M_\odot$, Fully Convective Red Dwarfs)**:
   - Lifetime $\tau_{\text{MS}} > 500\text{ Gyr}$ (exceeding current age of universe).
   - Entire star is convective ($X_{\text{core}} \approx X_{\text{surface}}$), evolving uniformly and slowly without entering giant phases on normal timelines.
2. **Solar-Like Stars ($0.8 \le M \le 1.5 M_\odot$, Sun Analogs)**:
   - Radiative core, convective envelope.
   - $\tau_{\text{MS}} \approx 10\text{ Gyr}$.
   - Subgiant expansion $\to$ Red Giant tip ($L \sim 2000 L_\odot, R \sim 150-200 R_\odot, T_{\text{eff}} \sim 3100-3500\text{ K}$) $\to$ Helium ignition at $T_c \sim 10^8\text{ K}$ $\to$ Red Clump / Horizontal Branch $\to$ AGB.
3. **Intermediate-Mass Stars ($1.5 < M < 8.0 M_\odot$)**:
   - Convective core, radiative envelope.
   - Faster evolution ($\tau_{\text{MS}} \sim 10^8 - 10^9\text{ yr}$).
   - Non-degenerate helium ignition and Blue Loop excursion.
4. **Massive Stars ($M \ge 8.0 M_\odot$, Supergiants)**:
   - Short lifespans ($\tau_{\text{MS}} \sim 3 - 30\text{ Myr}$).
   - Supergiant envelope expansion ($R > 250 - 1000 R_\odot$, $L > 10^4 - 10^5 L_\odot$).
   - Strong radiation-driven stellar wind mass loss (de Jager scaling).

---

### 4. Core Composition & Thermodynamic Models
- **Core Hydrogen Depletion**:
  $$X_{\text{core}}(\tau) = X_0 \cdot (1 - \tau^{1.2})$$
- **Core Helium Accumulation**:
  $$Y_{\text{core}}(\tau) = Y_0 + (X_0 - X_{\text{core}}(\tau))$$
- **Triple-Alpha Helium Burning**:
  $$3\,^4\text{He} \to \,^{12}\text{C} + \gamma, \quad ^{12}\text{C}(\alpha,\gamma)\,^{16}\text{O}$$
  Tracks $Y_{\text{core}} \to 0$ and accumulation of Carbon-Oxygen core ($X_{\text{C+O}} \to 1.0$).
- **Core Thermodynamics**:
  Tracks central temperature $T_{\text{core}}$ and mass density $\rho_{\text{core}}$ from Virial theorem and gravitational contraction throughout all evolutionary stages.

---

### 5. Mass Loss & Conservation
- **Stellar Winds**:
  - Reimers' empirical formula for Giants/AGB: $\dot{M} = \eta \times 4\times 10^{-13} \frac{L R}{M} \, [M_\odot/\text{yr}]$
  - de Jager radiative wind scaling for Massive Supergiants: $\dot{M} \propto L^{1.4}$
- **Mass Conservation**:
  $$M_{\text{initial}} \equiv M_{\text{current}} + M_{\text{ejected}}$$
  Verified to within numerical tolerance ($< 10^{-4} M_\odot$).

---

### 6. Hertzsprung-Russell Diagram Tracks
`generateEvolutionTrack(initialMassSolar, metallicityFeH, sampleCount)` generates continuous, chronologically ordered, finite HR track points with:
- Age ($\text{yr}$)
- Luminosity ($L_\odot$)
- Effective Temperature ($T_{\text{eff}}$ in $\text{K}$)
- Stellar Radius ($R_\odot$)
- Visual Magnitude ($M_V$)
- Morgan-Keenan spectral type & luminosity class
- True photosphere hex color

---

### 7. Phase 8 & Phase 10 Handoffs
- **Phase 8 $\to$ Phase 9 Handoff**:
  Phase 9 directly consumes the `ZERO_AGE_MAIN_SEQUENCE` state output by Phase 8 protostellar collapse and Phase 7 stellar physics baseline.
- **Phase 9 $\to$ Phase 10 Boundary**:
  Phase 9 stops strictly at `POST_HELIUM` without simulating supernovae or degenerate remnants, exposing all structural properties (core mass, current mass, C/O composition, density, envelope mass, mass loss history) for Phase 10 Remnants.

---

### 8. Validation Suite Summary
- **Phase 7 Stellar Physics**: 20 / 20 Tests Passed (100%)
- **Phase 8 Star Birth**: 15 / 15 Tests Passed (100%)
- **Phase 9 Star Evolution**: 28 / 28 Tests Passed (100%)
- **Total Validated Suite**: 63 / 63 Tests Passed (100% Zero Regressions)
- **Linter (oxlint)**: 0 Errors, 0 Warnings
- **TypeScript (`npx tsc -b`)**: 0 Errors
- **Production Build (`npm run build`)**: Success
