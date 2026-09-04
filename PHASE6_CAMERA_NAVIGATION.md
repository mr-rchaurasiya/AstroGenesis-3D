# Phase 6 — Camera & Navigation: Architecture & Validation Documentation

## 1. Overview
Phase 6 introduces an intelligent, scale-aware camera controller and hierarchical navigation system for **Cosmic Evolution Explorer**. The camera can smoothly traverse vast cosmic distances from the cosmological cosmic web down to individual orbiting planetary moons and moving comets with critical damping, scale-dependent zoom speeds, and adaptive clipping planes.

---

## 2. Architecture & File Structure

```
src/
├── camera/
│   ├── CameraTypes.ts         # Strongly typed camera modes, presets, history & transition models
│   ├── CameraUtils.ts         # Live body world coordinate resolver, framing distance & dynamic clipping
│   ├── CameraPresets.ts       # Standard viewpoints across all astronomical scales
│   ├── CameraTransitions.ts   # Critical damping curves, smoothstep trajectory solvers & easing
│   ├── CameraController.tsx   # R3F OrbitControls wrapper, keyboard listener, moving target tracker
│   ├── NavigationManager.ts   # Hierarchy builder, history stack & level router
│   └── CameraManager.ts       # Module entry point
├── store/
│   └── useAppStore.ts         # Global camera mode, target tracking, preset & history state
└── ui/
    ├── CameraControls.tsx     # Top bar HUD controls for presets, history traversal & focus/follow
    ├── CameraStatus.tsx       # Bottom bar HUD status indicator (Mode, Target, Level)
    ├── Breadcrumbs.tsx        # Interactive hierarchical navigation trail
    └── HUD.tsx                # HUD coordinator mounting camera overlays
```

---

## 3. Core Capabilities Implemented

### 🎥 1. Camera Modes
- **`FREE`**: Unconstrained interactive Orbit, Pan, and Zoom around the current scene focus.
- **`FOCUS`**: Smoothly locks the look-at target to the selected celestial body or galaxy.
- **`FOLLOW`**: Real-time live world-coordinate tracking of moving planetary bodies, synchronous moons, and comets, maintaining relative orbital angle as they revolve and rotate over simulation time (even during $365\times$ time acceleration).
- **`TRANSITION`**: Cinematic critically damped interpolation from current camera pose to target framing position without sudden teleportation.

### 🔍 2. Scale-Aware Zoom & Dynamic Clipping
- **Logarithmic Zoom Speed Modulation**: Zoom multiplier dynamically scales from $0.2\times$ when inspecting close moon surfaces (distance $< 2.0$) up to $1.8\times$ when navigating deep galaxy filaments ($> 1000$ units).
- **Adaptive Clipping Planes**:
  - `Moon` / Close planetary scale ($< 5$ units): `near: 0.05`, `far: 5,000`
  - `Planet` scale ($< 50$ units): `near: 0.1`, `far: 15,000`
  - `Solar System` scale ($< 800$ units): `near: 0.2`, `far: 25,000`
  - `Galaxy` scale ($< 3000$ units): `near: 1.0`, `far: 45,000`
  - `Universe` scale: `near: 2.0`, `far: 80,000`
- Prevents Z-fighting while maintaining depth precision.

### 🎯 3. Smart Object Framing & Focus
- `calculateFramingDistance(radius, fov, multiplier)`: Dynamically calculates optimal framing distance based on object bounding radius, rings, and field of view, ensuring celestial bodies are neither clipped nor lost in the distance.
- `resolveLiveTargetInfo(id, simulationTimeDays, scaleMode)`: Resolves exact 3D Cartesian coordinates for Sun, 8 planets, 14 major moons, 5 dwarf planets, comets, Milky Way regions, and galaxies.

### ⌨️ 4. Keyboard Navigation & Shortcuts
- `W` / `S`: Smooth Zoom In / Out
- `A` / `D`: Smooth Orbit Yaw Left / Right
- `Q` / `E`: Smooth Orbit Pitch Up / Down
- `R`: Reset Camera Orientation and Distance
- `F`: Focus selected celestial body / galaxy
- `ESC`: Exit focus/follow mode to `FREE` camera
- `HOME`: Navigate to Universe Overview

### 📍 5. Navigation Hierarchy, History & Breadcrumbs
- **Hierarchy**: Universe $\to$ Galaxy Population $\to$ Milky Way $\to$ Solar System $\to$ Planet $\to$ Moon.
- **Interactive Breadcrumbs**: Clicking any ancestor node smoothly navigates the camera to that level.
- **Navigation History Stack**: `canGoBack`, `canGoForward`, `navigateBack()`, `navigateForward()` for browser-like exploration.

---

## 4. Validation Results

| Test Suite | Command | Result |
|---|---|---|
| **Linter** | `npm run lint` (`oxlint`) | **PASS** (0 errors, 0 warnings across 79 files) |
| **TypeScript** | `npx tsc -b` | **PASS** (0 type errors, strict compliance) |
| **Production Build** | `npm run build` | **PASS** (Vite bundle built in 1.76s) |
| **Regression Audit** | Phases 1–5 Systems | **PASS** (All starfields, nebulae, galaxies, Milky Way, Sun, planets, moons, rings, asteroids, Kuiper belt, comets, time simulation, scale modes, and info panels functional) |
