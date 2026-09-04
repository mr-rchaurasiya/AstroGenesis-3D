/**
 * StarfieldSystem.tsx
 * Multi-layer GPU starfield system for Cosmic Evolution Explorer.
 *
 * Implements 4 distinct astrophysical depth populations:
 * - Layer 1 (Nearby): Bright, large, rich IMF colors, distinct parallax
 * - Layer 2 (Intermediate): Moderate brightness, medium parallax, balanced distribution
 * - Layer 3 (Distant): Dim, small, subtle extinction/desaturation
 * - Layer 4 (Deep Background): Microscopic, faint, static cosmic horizon
 *
 * Performance:
 * - Rendered in a single GPU draw call using custom GLSL shaders
 * - 0 React components per star
 * - Full resource disposal via useEffect
 * - Quality-scaled star counts
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useAppStore, type EnvironmentQuality } from '../store/useAppStore';
import {
  randomStarTemperature,
  temperatureToColor,
  desaturateColor,
  applyInterstellarExtinction,
} from '../utils/colorUtils';
import { randomOnSphere, createSeededRNG } from '../utils/mathUtils';

// ── GLSL Shaders ─────────────────────────────────────────────────────────────

const VERT = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  attribute float aTwinkleAmp;
  attribute float aTwinkleSpeed;
  attribute float aTwinkleOffset;
  attribute float aLayer; // 0=Nearby, 1=Mid, 2=Distant, 3=Deep

  varying vec3 vColor;
  varying float vAlpha;
  varying float vLayer;

  uniform float uTime;
  uniform float uStarBrightness;

  void main() {
    vColor = aColor;
    vLayer = aLayer;

    // Subtle desynchronized twinkle: independent amplitude, speed, and phase
    float twinkle = 1.0;
    if (aTwinkleAmp > 0.01) {
      float wave = sin(uTime * aTwinkleSpeed + aTwinkleOffset * 6.28318);
      twinkle = 1.0 - aTwinkleAmp * (0.5 + 0.5 * wave);
    }
    vAlpha = twinkle * uStarBrightness;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    
    // Attenuation based on distance
    gl_PointSize = aSize * (400.0 / -mvPosition.z);
    
    // Point size clamping per layer
    if (aLayer < 0.5) {
      gl_PointSize = clamp(gl_PointSize, 1.2, 12.0); // Nearby
    } else if (aLayer < 1.5) {
      gl_PointSize = clamp(gl_PointSize, 0.8, 7.0);  // Mid
    } else if (aLayer < 2.5) {
      gl_PointSize = clamp(gl_PointSize, 0.5, 4.0);  // Distant
    } else {
      gl_PointSize = clamp(gl_PointSize, 0.3, 2.2);  // Deep background
    }

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAG = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  varying float vLayer;

  void main() {
    vec2 uv = gl_PointCoord - vec2(0.5);
    float dist = length(uv);
    if (dist > 0.5) discard;

    // Gaussian core profile with soft edge glow
    float coreFalloff = exp(-dist * dist * 14.0);
    float haloFalloff = exp(-dist * 6.0) * 0.4;
    float intensity = coreFalloff + haloFalloff;

    // Distant/deep stars have tighter point profiles
    if (vLayer > 1.5) {
      intensity = exp(-dist * dist * 18.0);
    }

    float alpha = intensity * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ── Quality Configurations ───────────────────────────────────────────────────

const QUALITY_COUNTS: Record<EnvironmentQuality, { nearby: number; mid: number; distant: number; deep: number }> = {
  low:    { nearby: 800,  mid: 6000,  distant: 15000, deep: 12000 }, // ~33,800 stars
  medium: { nearby: 1200, mid: 10000, distant: 25000, deep: 20000 }, // ~56,200 stars
  high:   { nearby: 1800, mid: 15000, distant: 38000, deep: 30000 }, // ~84,800 stars
  ultra:  { nearby: 2500, mid: 22000, distant: 55000, deep: 45000 }, // ~124,500 stars
};

export function StarfieldSystem({ seed = 42 }: { seed?: number }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const quality = useAppStore((s) => s.environmentQuality);

  const { geometry, material } = useMemo(() => {
    const rng = createSeededRNG(seed);
    const counts = QUALITY_COUNTS[quality] ?? QUALITY_COUNTS.high;
    const totalCount = counts.nearby + counts.mid + counts.distant + counts.deep;

    const positions = new Float32Array(totalCount * 3);
    const colors = new Float32Array(totalCount * 3);
    const sizes = new Float32Array(totalCount);
    const twinkleAmp = new Float32Array(totalCount);
    const twinkleSpeed = new Float32Array(totalCount);
    const twinkleOffset = new Float32Array(totalCount);
    const layerAttribute = new Float32Array(totalCount);

    let idx = 0;

    // ── Helper to populate a star layer ─────────────────────────────────────
    const addStarLayer = (
      count: number,
      minRadius: number,
      maxRadius: number,
      layerId: number,
      baseSize: number,
      sizeVariance: number,
      desaturation: number,
      twinkleChance: number,
    ) => {
      for (let i = 0; i < count; i++) {
        // Radial distance with natural non-uniform clustering
        const r = minRadius + (maxRadius - minRadius) * Math.pow(rng(), 0.7);
        const pos = randomOnSphere(r, rng);

        positions[idx * 3]     = pos.x;
        positions[idx * 3 + 1] = pos.y;
        positions[idx * 3 + 2] = pos.z;

        // Stellar temperature and color
        const temp = randomStarTemperature(rng);
        let col = temperatureToColor(temp);

        // Apply slight desaturation and distance extinction for deeper layers
        if (desaturation > 0) {
          col = desaturateColor(col, desaturation);
        }
        if (layerId >= 2) {
          col = applyInterstellarExtinction(col, (r - minRadius) / (maxRadius - minRadius));
        }

        colors[idx * 3]     = col.r;
        colors[idx * 3 + 1] = col.g;
        colors[idx * 3 + 2] = col.b;

        // Apparent magnitude distribution: mostly dim, few bright
        const magRand = rng();
        let sizeMultiplier = 1.0;
        if (magRand < 0.70) {
          sizeMultiplier = 0.6 + rng() * 0.4;        // Faint (70%)
        } else if (magRand < 0.95) {
          sizeMultiplier = 1.0 + rng() * 0.8;        // Medium (25%)
        } else {
          sizeMultiplier = 2.0 + rng() * 2.0;        // Rare prominent (5%)
        }

        sizes[idx] = (baseSize + rng() * sizeVariance) * sizeMultiplier;
        layerAttribute[idx] = layerId;

        // Twinkle properties
        if (rng() < twinkleChance) {
          twinkleAmp[idx] = 0.15 + rng() * 0.35;    // Subtle, not harsh
          twinkleSpeed[idx] = 0.8 + rng() * 2.2;     // Desynchronized frequency
          twinkleOffset[idx] = rng();                // Randomized phase
        } else {
          twinkleAmp[idx] = 0.0;
          twinkleSpeed[idx] = 1.0;
          twinkleOffset[idx] = 0.0;
        }

        idx++;
      }
    };

    // Layer 1: Nearby Stars (0 to 250 units)
    addStarLayer(counts.nearby, 30, 250, 0, 1.6, 1.2, 0.0, 0.45);

    // Layer 2: Intermediate Stars (250 to 900 units)
    addStarLayer(counts.mid, 250, 900, 1, 1.1, 0.8, 0.15, 0.30);

    // Layer 3: Distant Stars (900 to 2800 units)
    addStarLayer(counts.distant, 900, 2800, 2, 0.7, 0.5, 0.40, 0.18);

    // Layer 4: Deep Background Stars (2800 to 7500 units)
    addStarLayer(counts.deep, 2800, 7500, 3, 0.45, 0.3, 0.65, 0.08);

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',        new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aColor',          new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('aSize',           new THREE.BufferAttribute(sizes, 1));
    geo.setAttribute('aTwinkleAmp',     new THREE.BufferAttribute(twinkleAmp, 1));
    geo.setAttribute('aTwinkleSpeed',   new THREE.BufferAttribute(twinkleSpeed, 1));
    geo.setAttribute('aTwinkleOffset',  new THREE.BufferAttribute(twinkleOffset, 1));
    geo.setAttribute('aLayer',          new THREE.BufferAttribute(layerAttribute, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uStarBrightness: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: geo, material: mat };
  }, [seed, quality]);

  // Clean GPU memory on unmount or quality transition
  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  // Animate twinkle uniform without React re-renders
  useFrame(({ clock }) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = clock.elapsedTime;
    }
  });

  return (
    <points ref={pointsRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} ref={materialRef} attach="material" />
    </points>
  );
}
