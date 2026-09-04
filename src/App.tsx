/**
 * App.tsx
 * Root application component.
 * Sets up the R3F Canvas, post-processing, scene composition, and UI overlays.
 * React handles UI; Three.js handles all high-frequency 3D rendering.
 *
 * Phase 1-12: Universe, Galaxies, Milky Way, Solar System, Camera & Navigation, Stellar Engine, Education, Performance.
 */

import { Suspense, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { AdaptiveDpr, PerformanceMonitor } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';

import { UniverseScene } from './scenes/UniverseScene';
import { CameraController } from './camera/CameraController';
import { HUD } from './ui/HUD';
import { LoadingScreen } from './ui/LoadingScreen';
import { ErrorBoundary } from './components/ErrorBoundary';
import { WebGLFallback } from './components/WebGLFallback';
import { isWebGLAvailable } from './utils/webglUtils';
import { useAppStore } from './store/useAppStore';

export default function App() {
  const { isLoading } = useAppStore();
  const [webGLSupported] = useState<boolean>(() => isWebGLAvailable());

  if (!webGLSupported) {
    return <WebGLFallback />;
  }

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}>
      {/* ── 3D Canvas ──────────────────────────────────────────────── */}
      <div className="canvas-container">
        <ErrorBoundary fallbackTitle="3D Canvas Initialization Error">
          <Canvas
            camera={{
              fov: 60,
              near: 0.1,
              far: 45000,
              position: [0, 0, 140],
            }}
            gl={{
              antialias: true,
              powerPreference: 'high-performance',
              alpha: false,
            }}
            scene={{ background: null }}
            dpr={[1, 2]}
            style={{ background: '#000408' }}
            aria-label="3D Universe Simulator"
          >
            {/* Adaptive device pixel ratio for performance */}
            <AdaptiveDpr pixelated />

            {/* Performance monitor — degrades DPR if FPS drops */}
            <PerformanceMonitor
              onDecline={() => { /* Dynamic LOD adjustment */ }}
            />

            {/* ── Scene ─────────────────────────────────────────────── */}
            <Suspense fallback={null}>
              <UniverseScene />
            </Suspense>

            {/* ── Phase 6 Intelligent Camera & Navigation Controller ── */}
            <CameraController />

            {/* ── Post-processing ───────────────────────────────────── */}
            <EffectComposer>
              {/* Bloom: subtle glow on bright star cores and emission nebulae */}
              <Bloom
                intensity={0.35}
                luminanceThreshold={0.65}
                luminanceSmoothing={0.85}
                mipmapBlur
                blendFunction={BlendFunction.ADD}
              />

              {/* Vignette: darkens screen edges for deep immersive depth */}
              <Vignette
                offset={0.32}
                darkness={0.7}
                eskil={false}
                blendFunction={BlendFunction.NORMAL}
              />
            </EffectComposer>
          </Canvas>
        </ErrorBoundary>
      </div>

      {/* ── UI Layer ───────────────────────────────────────────────── */}
      {!isLoading && (
        <ErrorBoundary fallbackTitle="UI Interface Error">
          <HUD />
        </ErrorBoundary>
      )}

      {/* ── Loading Screen ─────────────────────────────────────────── */}
      <LoadingScreen />
    </div>
  );
}
