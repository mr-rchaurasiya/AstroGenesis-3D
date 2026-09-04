/**
 * Planet.tsx
 * Complete 3D planetary body component.
 * Manages Keplerian orbital motion, axial tilt, planetary rotation,
 * surface shader, atmospheric scattering, clouds, rings, and orbiting moons.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CelestialBody, ScaleMode } from './SolarSystemTypes';
import { computeKeplerianPosition, computePlanetaryRotation } from './KeplerianOrbit';
import { PlanetVertexShader, PlanetFragmentShader } from '../shaders/PlanetSurfaceShader';
import { AtmosphereVertexShader, AtmosphereFragmentShader } from '../shaders/AtmosphereShader';
import { SaturnRing } from './SaturnRing';
import { Moon } from './Moon';
import { OrbitLine } from './OrbitLine';
import { useAppStore } from '../store/useAppStore';

interface PlanetProps {
  planet: CelestialBody;
  simulationTimeDays?: number;
  scaleMode?: ScaleMode;
  showOrbitLine?: boolean;
  selectedBodyId?: string | null;
  onSelect?: (body: CelestialBody) => void;
}

export function Planet({
  planet,
  simulationTimeDays,
  scaleMode = 'exploration',
  showOrbitLine = true,
  selectedBodyId,
  onSelect,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const planetMeshRef = useRef<THREE.Mesh>(null);
  const cloudsMeshRef = useRef<THREE.Mesh>(null);
  const surfaceMatRef = useRef<THREE.ShaderMaterial>(null);

  const isSelected = selectedBodyId === planet.id;

  const radius = scaleMode === 'exploration'
    ? planet.visualRadiusExploration
    : planet.visualRadiusScientific;

  // Shader ID mapping
  const shaderIndex = useMemo(() => {
    switch (planet.surfaceShaderId) {
      case 'mercury': return 0;
      case 'venus': return 1;
      case 'earth': return 2;
      case 'mars': return 3;
      case 'jupiter': return 4;
      case 'saturn': return 5;
      case 'uranus': return 6;
      case 'neptune': return 7;
      default: return 8;
    }
  }, [planet.surfaceShaderId]);

  // Surface Shader Material
  const surfaceMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: PlanetVertexShader,
      fragmentShader: PlanetFragmentShader,
      uniforms: {
        uShaderId: { value: shaderIndex },
        uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(planet.colorProfile) },
      },
    });
  }, [shaderIndex, planet.colorProfile]);

  // Atmosphere Shader Material
  const atmosphereMaterial = useMemo(() => {
    if (!planet.atmosphere?.hasAtmosphere) return null;
    return new THREE.ShaderMaterial({
      vertexShader: AtmosphereVertexShader,
      fragmentShader: AtmosphereFragmentShader,
      uniforms: {
        uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
        uAtmosphereColor: { value: new THREE.Color(...planet.atmosphere.scatteringColor) },
        uOpacity: { value: planet.atmosphere.opacity },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      depthWrite: false,
    });
  }, [planet.atmosphere]);

  // Clean GPU resources on unmount
  useEffect(() => {
    return () => {
      surfaceMaterial.dispose();
      atmosphereMaterial?.dispose();
    };
  }, [surfaceMaterial, atmosphereMaterial]);

  // Update position & rotation every frame
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    const simDays = simulationTimeDays ?? useAppStore.getState().solarSimulationTimeDays;

    // 1. Keplerian orbital motion
    const [px, py, pz] = computeKeplerianPosition(planet.orbit, simDays, scaleMode);
    if (groupRef.current) {
      groupRef.current.position.set(px, py, pz);
    }

    // 2. Axial rotation
    if (planetMeshRef.current && planet.rotationPeriodHours !== 0) {
      const rotAngle = (simDays * 24.0 / planet.rotationPeriodHours) * Math.PI * 2;
      const euler = computePlanetaryRotation(planet.axialTiltDeg, rotAngle);
      planetMeshRef.current.rotation.copy(euler);
    }

    // 3. Earth independent cloud rotation
    if (cloudsMeshRef.current && planet.id === 'earth') {
      const cloudAngle = (simDays * 24.0 / 22.5) * Math.PI * 2;
      cloudsMeshRef.current.rotation.y = cloudAngle;
    }

    if (surfaceMatRef.current) {
      surfaceMatRef.current.uniforms.uTime.value = time;
    }
  });

  return (
    <>
      {/* ── 1. Orbital Path Line ── */}
      <OrbitLine
        orbit={planet.orbit}
        scaleMode={scaleMode}
        color={isSelected ? '#64ffda' : '#38bdf8'}
        opacity={isSelected ? 0.65 : 0.22}
        visible={showOrbitLine}
      />

      {/* ── 2. Planet Group (Positioned along orbit) ── */}
      <group ref={groupRef}>
        {/* Planet Surface Body */}
        <mesh
          ref={planetMeshRef}
          material={surfaceMaterial}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(planet);
          }}
        >
          <sphereGeometry args={[radius, 36, 36]} />

          {/* Earth Cloud Layer */}
          {planet.atmosphere?.hasClouds && planet.id === 'earth' && (
            <mesh ref={cloudsMeshRef}>
              <sphereGeometry args={[radius * 1.018, 32, 32]} />
              <meshStandardMaterial
                color="#ffffff"
                transparent
                opacity={0.35}
                roughness={0.9}
              />
            </mesh>
          )}

          {/* Planetary Rings */}
          {planet.rings && (
            <SaturnRing rings={planet.rings} planetRadius={radius} />
          )}
        </mesh>

        {/* Atmospheric Limb Shell */}
        {atmosphereMaterial && (
          <mesh material={atmosphereMaterial}>
            <sphereGeometry args={[radius * 1.08, 32, 32]} />
          </mesh>
        )}

        {/* Selection Reticle Ring */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[radius * 1.35, radius * 1.5, 48]} />
            <meshBasicMaterial color="#64ffda" transparent opacity={0.85} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* ── 3. Children Moon Systems ── */}
        {planet.majorMoons?.map((moon) => (
          <Moon
            key={moon.id}
            moon={moon}
            simulationTimeDays={simulationTimeDays}
            scaleMode={scaleMode}
            isSelected={selectedBodyId === moon.id}
            onSelect={() => onSelect?.(moon)}
          />
        ))}
      </group>
    </>
  );
}
