# 🌌 AstroGenesis 3D — Cosmic Evolution Explorer

> A production-ready, interactive, scientifically accurate 3D Universe Simulation & Stellar Physics Engine built with **React 19**, **Three.js**, **@react-three/fiber**, **TypeScript**, and **GLSL Shaders**.

---

## 🌟 Key Highlights

- 🪐 **6 Hierarchical Cosmic Scales:** Deep Universe (100 Mpc) $\to$ Galaxy Clusters $\to$ Milky Way $\to$ Solar System $\to$ Stars $\to$ Compact Remnants (11.5 km).
- ☀️ **Keplerian Solar System:** Central Sun, 8 planets with custom procedural surface shaders and Rayleigh atmospheric scattering, moons, 3,000+ asteroid belt, Kuiper belt, and dynamic comets with anti-sunward solar-wind dust tails.
- 🌟 **Complete Stellar Physics & Lifecycle:** Protostars, Jeans instability, Main Sequence, Red Giants, AGB, Type Ia/II Supernovae, Planetary Nebulae, White Dwarfs, Pulsars with relativistic jets, and Schwarzschild Black Holes with accretion disks and Doppler beaming.
- 📊 **Interactive Educational Suite:** Hertzsprung-Russell (HR) Diagram with evolutionary tracks, 13.8-billion-year Cosmic Timeline Scrubber, Side-by-Side Object Comparison Analyzer, and Quantitative Scientific Parameter Inspector.
- ⚡ **Performance & Production Hardening:** Adaptive Auto-Quality Engine with Exponential Moving Average (EMA) FPS smoothing ($\alpha = 0.05$) and anti-oscillation hysteresis (3.0s dwell time), 4-tier camera distance LOD, recursive GPU memory cleanup, and React Error Boundaries with WebGL fallback.

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 + Vite 8 |
| **Language** | TypeScript (Strict mode) |
| **3D Rendering** | Three.js + @react-three/fiber + @react-three/drei |
| **Post-Processing** | @react-three/postprocessing (Bloom, Vignette) |
| **State Management** | Zustand |
| **Shaders** | Custom inline GLSL (Surface noise, atmospheres, accretion physics) |
| **Quality & Tests** | Custom deterministic validation test suite (189/189 assertions passing) |

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- npm, yarn, or pnpm

### Installation

```bash
# Clone the repository
git clone https://github.com/mr-rchaurasiya/AstroGenesis-3D.git

# Enter project directory
cd AstroGenesis-3D

# Install dependencies
npm install

# Start development server
npm run dev
```

Open your browser at `http://localhost:5173`.

### Production Build & Validation

```bash
# Run linter
npm run lint

# Run TypeScript typechecks
npx tsc -b

# Run master regression test suite (189/189 tests)
npx tsx test_runner.ts

# Generate production bundle
npm run build
```

---

## 🎮 Navigation Controls & Shortcuts

| Action | Control |
|---|---|
| **Orbit & Rotate View** | Left Click + Drag |
| **Pan / Slide Screen** | Right Click OR Middle Click (Wheel) + Drag |
| **Zoom to Cursor** | Mouse Wheel (Mouse-Centric Zoom) |
| **Re-Center on Cursor** | Double Click Anywhere |
| **Fly & Strafe in Space** | `W` / `A` / `S` / `D` / `Q` / `E` |
| **Pause / Resume Time** | `SPACE` |
| **Focus Selected Object** | `F` Key / `FOCUS` button |
| **Reset Camera View** | `R` / `ESC` Key / `Reset` button |
| **Perspective Presets** | `1` – `6` Keys |
| **Performance Monitor** | `⚡ Perf` button (Top HUD) |
| **Master Project Guide** | `🚀 PROJECT GUIDE & TOUR` (Top-Left) |

---

## 📜 Roadmap & Verification

All 12 roadmap phases are complete and fully validated:

- [x] **Phase 1:** Foundation & Architecture
- [x] **Phase 2:** Universe Environment & Cosmic Web
- [x] **Phase 3:** Interactive Galaxy Populations
- [x] **Phase 4:** Specialized Milky Way System
- [x] **Phase 5:** Solar System Simulation
- [x] **Phase 6:** Camera, Navigation & Target Tracking
- [x] **Phase 7:** Stellar Physics Engine
- [x] **Phase 8:** Star Birth & Protostars
- [x] **Phase 9:** Stellar Evolution Engine
- [x] **Phase 10:** Star Death & Compact Remnants
- [x] **Phase 11:** Educational UI & Cosmic Time Explorer
- [x] **Phase 12:** Performance, Polish & Production Hardening

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).
