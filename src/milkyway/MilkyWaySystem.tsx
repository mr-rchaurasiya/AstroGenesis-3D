/**
 * MilkyWaySystem.tsx
 * Master specialized 3D visualization system for the Milky Way Galaxy.
 * Coordinates stellar populations, dust lanes, galactic bulge glow,
 * globular clusters, and the Solar Neighborhood anchor.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { MilkyWayModel, MilkyWayRegionId } from './MilkyWayTypes';
import { generateMilkyWayGeometry } from './MilkyWayGenerator';
import {
  MilkyWayVertexShader,
  MilkyWayFragmentShader,
} from '../shaders/MilkyWayShader';
import {
  MilkyWayDustVertexShader,
  MilkyWayDustFragmentShader,
} from '../shaders/MilkyWayDustShader';
import {
  MilkyWayCoreVertexShader,
  MilkyWayCoreFragmentShader,
} from '../shaders/MilkyWayCoreShader';
import { SolarNeighborhood } from './SolarNeighborhood';
import { GalacticNeighborhood } from './GalacticNeighborhood';
import { useAppStore } from '../store/useAppStore';
import { MILKY_WAY_QUALITY_SETTINGS } from './MilkyWayConfig';

interface MilkyWaySystemProps {
  model: MilkyWayModel;
  visible?: boolean;
  onSelectSolarAnchor?: () => void;
  onSelectRegion?: (regionId: MilkyWayRegionId) => void;
}

export function MilkyWaySystem({
  model,
  visible = true,
  onSelectSolarAnchor,
  onSelectRegion,
}: MilkyWaySystemProps) {
  const groupRef = useRef<THREE.Group>(null);
  const starMatRef = useRef<THREE.ShaderMaterial>(null);
  const dustMatRef = useRef<THREE.ShaderMaterial>(null);

  const isPaused = useAppStore((s) => s.isPaused);
  const timeScale = useAppStore((s) => s.timeScale);
  const quality = useAppStore((s) => s.environmentQuality);
  const selectedRegion = useAppStore((s) => s.selectedMilkyWayRegion);
  const showSolarAnchor = useAppStore((s) => s.showSolarNeighborhoodAnchor);
  const showGalacticArms = useAppStore((s) => s.showMilkyWayArms);

  const qualityConfig = MILKY_WAY_QUALITY_SETTINGS[quality] || MILKY_WAY_QUALITY_SETTINGS.high;

  // Particle scale factor from quality setting
  const particleScale = qualityConfig.starCount / 45000.0;

  // Generate GPU Buffers deterministically
  const data = useMemo(() => {
    return generateMilkyWayGeometry(
      model.parameters,
      model.globularClusters,
      particleScale
    );
  }, [model.parameters, model.globularClusters, particleScale]);

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
      vertexShader: MilkyWayVertexShader,
      fragmentShader: MilkyWayFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRotationSpeed: { value: model.parameters.rotationSpeed },
        uBrightness: { value: 1.25 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { starGeometry: geo, starMaterial: mat };
  }, [data, model.parameters.rotationSpeed]);

  // Build Dust BufferGeometry & Material
  const { dustGeometry, dustMaterial } = useMemo(() => {
    if (!qualityConfig.enableDust || data.dustPositions.length === 0) {
      return { dustGeometry: null, dustMaterial: null };
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(data.dustPositions, 3));
    geo.setAttribute('aColor',   new THREE.BufferAttribute(data.dustColors, 3));
    geo.setAttribute('aSize',    new THREE.BufferAttribute(data.dustSizes, 1));
    geo.setAttribute('aOpacity', new THREE.BufferAttribute(data.dustOpacities, 1));

    const mat = new THREE.ShaderMaterial({
      vertexShader: MilkyWayDustVertexShader,
      fragmentShader: MilkyWayDustFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uRotationSpeed: { value: model.parameters.rotationSpeed },
      },
      transparent: true,
      blending: THREE.NormalBlending,
      depthWrite: false,
    });

    return { dustGeometry: geo, dustMaterial: mat };
  }, [data, qualityConfig.enableDust, model.parameters.rotationSpeed]);

  // Build Central Bulge Core Glow Material
  const coreMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: MilkyWayCoreVertexShader,
      fragmentShader: MilkyWayCoreFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color(...data.coreColor) },
        uIntensity: { value: data.coreIntensity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.BackSide,
    });
  }, [data.coreColor, data.coreIntensity]);

  // Resource Disposal on unmount or geometry rebuild
  useEffect(() => {
    return () => {
      starGeometry.dispose();
      starMaterial.dispose();
      dustGeometry?.dispose();
      dustMaterial?.dispose();
      coreMaterial.dispose();
    };
  }, [starGeometry, starMaterial, dustGeometry, dustMaterial, coreMaterial]);

  // GPU Animation Loop
  useFrame((state, delta) => {
    const activeDelta = isPaused ? 0 : delta * timeScale;
    const time = state.clock.getElapsedTime() * timeScale;

    if (starMatRef.current) {
      starMatRef.current.uniforms.uTime.value = time;
    }
    if (dustMatRef.current) {
      dustMatRef.current.uniforms.uTime.value = time;
    }

    // Gentle global orientation wobble
    if (groupRef.current) {
      groupRef.current.rotation.y += activeDelta * 0.0004;
    }
  });

  if (!visible) return null;

  return (
    <group
      ref={groupRef}
      position={model.position}
      rotation={model.rotation}
      scale={model.scale}
    >
      {/* ── 1. Milky Way Stellar Population ── */}
      <points
        geometry={starGeometry}
        material={starMaterial}
        ref={(p) => {
          if (p) starMatRef.current = p.material as THREE.ShaderMaterial;
        }}
      />

      {/* ── 2. Interstellar Absorption Dust Lanes ── */}
      {dustGeometry && dustMaterial && (
        <points
          geometry={dustGeometry}
          material={dustMaterial}
          ref={(p) => {
            if (p) dustMatRef.current = p.material as THREE.ShaderMaterial;
          }}
        />
      )}

      {/* ── 3. Central Core Bulge Glow ── */}
      <mesh material={coreMaterial}>
        <sphereGeometry args={[data.coreRadius, 24, 24]} />
      </mesh>

      {/* ── 4. Solar Neighborhood Anchor (Sun / Sol Position at ~8.0 kpc) ── */}
      <SolarNeighborhood
        anchor={model.solarAnchor}
        visible={showSolarAnchor}
        isFocused={selectedRegion === 'solar-neighborhood'}
        onSelect={onSelectSolarAnchor}
      />

      {/* ── 5. Galactic Neighborhood Structural Guides & Region Markers ── */}
      <GalacticNeighborhood
        sceneRadius={model.parameters.sceneRadius}
        visible={showGalacticArms}
        selectedRegionId={selectedRegion}
        onSelectRegion={onSelectRegion}
      />
    </group>
  );
}
