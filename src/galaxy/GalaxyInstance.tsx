/**
 * GalaxyInstance.tsx
 * High-fidelity 3D procedural galaxy renderer.
 * Renders stellar populations (core, bulge, disk, arms, halo) and dust absorption lanes
 * using dedicated GPU BufferGeometry and ShaderMaterial instances.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { GalaxyData } from './GalaxyTypes';
import { generateGalaxyGeometry } from './GalaxyGenerator';
import { GalaxyVertexShader, GalaxyFragmentShader } from '../shaders/GalaxyShader';
import { GalaxyDustVertexShader, GalaxyDustFragmentShader } from '../shaders/GalaxyDustShader';
import { GalaxyCoreVertexShader, GalaxyCoreFragmentShader } from '../shaders/GalaxyCoreShader';
import { useAppStore } from '../store/useAppStore';

interface GalaxyInstanceProps {
  galaxy: GalaxyData;
  isSelected?: boolean;
  particleScale?: number;
  onSelect?: (galaxy: GalaxyData) => void;
}

export function GalaxyInstance({
  galaxy,
  isSelected = false,
  particleScale = 1.0,
  onSelect,
}: GalaxyInstanceProps) {
  const groupRef = useRef<THREE.Group>(null);
  const starMatRef = useRef<THREE.ShaderMaterial>(null);
  const dustMatRef = useRef<THREE.ShaderMaterial>(null);
  const isPaused = useAppStore((s) => s.isPaused);
  const timeScale = useAppStore((s) => s.timeScale);

  // Generate GPU Buffers deterministically
  const data = useMemo(() => {
    return generateGalaxyGeometry(galaxy.parameters, particleScale);
  }, [galaxy.parameters, particleScale]);

  // Build Star BufferGeometry & Material
  const { starGeometry, starMaterial } = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',     new THREE.BufferAttribute(data.positions, 3));
    geo.setAttribute('aColor',       new THREE.BufferAttribute(data.colors, 3));
    geo.setAttribute('aSize',        new THREE.BufferAttribute(data.sizes, 1));
    geo.setAttribute('aOpacity',     new THREE.BufferAttribute(data.opacities, 1));
    geo.setAttribute('aType',        new THREE.BufferAttribute(data.types, 1));
    geo.setAttribute('aOrbitalDist', new THREE.BufferAttribute(data.orbitalDistances, 1));
    geo.setAttribute('aAngle',       new THREE.BufferAttribute(data.angles, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: GalaxyVertexShader,
      fragmentShader: GalaxyFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRotationSpeed: { value: galaxy.parameters.rotationSpeed },
        uBrightness: { value: isSelected ? 1.35 : 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { starGeometry: geo, starMaterial: mat };
  }, [data, galaxy.parameters.rotationSpeed, isSelected]);

  // Build Dust BufferGeometry & Material (if present)
  const dustResources = useMemo(() => {
    if (!data.dustPositions || data.dustPositions.length === 0) return null;

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',     new THREE.BufferAttribute(data.dustPositions, 3));
    geo.setAttribute('aColor',       new THREE.BufferAttribute(data.dustColors!, 3));
    geo.setAttribute('aSize',        new THREE.BufferAttribute(data.dustSizes!, 1));
    geo.setAttribute('aOpacity',     new THREE.BufferAttribute(data.dustOpacities!, 1));
    geo.setAttribute('aOrbitalDist', new THREE.BufferAttribute(data.orbitalDistances.subarray(0, data.dustPositions.length / 3), 1));
    geo.setAttribute('aAngle',       new THREE.BufferAttribute(data.angles.subarray(0, data.dustPositions.length / 3), 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: GalaxyDustVertexShader,
      fragmentShader: GalaxyDustFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRotationSpeed: { value: galaxy.parameters.rotationSpeed },
        uAbsorptionFactor: { value: 1.0 },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending,
    });

    return { dustGeometry: geo, dustMaterial: mat };
  }, [data, galaxy.parameters.rotationSpeed]);

  // Build Core Glow Mesh
  const coreMesh = useMemo(() => {
    const geo = new THREE.SphereGeometry(data.coreRadius, 16, 16);
    const mat = new THREE.ShaderMaterial({
      vertexShader: GalaxyCoreVertexShader,
      fragmentShader: GalaxyCoreFragmentShader,
      uniforms: {
        uCoreColor: { value: new THREE.Color(...data.coreColor) },
        uCoreIntensity: { value: data.coreIntensity * (isSelected ? 1.5 : 1.0) },
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
    });
    return { coreGeometry: geo, coreMaterial: mat };
  }, [data.coreRadius, data.coreColor, data.coreIntensity, isSelected]);

  // Memory Disposal Lifecycle
  useEffect(() => {
    return () => {
      starGeometry.dispose();
      starMaterial.dispose();
      coreMesh.coreGeometry.dispose();
      coreMesh.coreMaterial.dispose();
      if (dustResources) {
        dustResources.dustGeometry.dispose();
        dustResources.dustMaterial.dispose();
      }
    };
  }, [starGeometry, starMaterial, coreMesh, dustResources]);

  // Animation loop
  useFrame(({ clock }) => {
    const elapsed = clock.elapsedTime * (isPaused ? 0 : Math.min(10, timeScale));
    if (starMatRef.current) {
      starMatRef.current.uniforms.uTime.value = elapsed;
    }
    if (dustMatRef.current) {
      dustMatRef.current.uniforms.uTime.value = elapsed;
    }
  });

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    if (onSelect) onSelect(galaxy);
  };

  return (
    <group
      ref={groupRef}
      position={galaxy.position}
      rotation={galaxy.rotation}
      scale={galaxy.scale}
      onClick={handleClick}
    >
      {/* ── 1. Galaxy Stars (Points) ─────────────────────────────── */}
      <points>
        <primitive object={starGeometry} attach="geometry" />
        <primitive object={starMaterial} ref={starMatRef} attach="material" />
      </points>

      {/* ── 2. Interstellar Dust Absorption Lanes ───────────────── */}
      {dustResources && (
        <points>
          <primitive object={dustResources.dustGeometry} attach="geometry" />
          <primitive object={dustResources.dustMaterial} ref={dustMatRef} attach="material" />
        </points>
      )}

      {/* ── 3. Central Galactic Core Glow ────────────────────────── */}
      <mesh>
        <primitive object={coreMesh.coreGeometry} attach="geometry" />
        <primitive object={coreMesh.coreMaterial} attach="material" />
      </mesh>
    </group>
  );
}
