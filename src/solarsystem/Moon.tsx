/**
 * Moon.tsx
 * Hierarchical orbiting moon component.
 * Rotates synchronously around its own axis while revolving around the parent planet.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CelestialBody, ScaleMode } from './SolarSystemTypes';
import { computeKeplerianPosition } from './KeplerianOrbit';
import { PlanetVertexShader, PlanetFragmentShader } from '../shaders/PlanetSurfaceShader';
import { useAppStore } from '../store/useAppStore';

interface MoonProps {
  moon: CelestialBody;
  simulationTimeDays?: number;
  scaleMode?: ScaleMode;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function Moon({
  moon,
  simulationTimeDays,
  scaleMode = 'exploration',
  isSelected = false,
  onSelect,
}: MoonProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const radius = scaleMode === 'exploration'
    ? moon.visualRadiusExploration
    : moon.visualRadiusScientific;

  // Shader ID mapping
  const shaderIndex = useMemo(() => {
    switch (moon.surfaceShaderId) {
      case 'moon': return 8;
      case 'io': return 9;
      case 'europa': return 10;
      case 'titan': return 11;
      case 'rocky': return 8;
      default: return 8;
    }
  }, [moon.surfaceShaderId]);

  const moonMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: PlanetVertexShader,
      fragmentShader: PlanetFragmentShader,
      uniforms: {
        uShaderId: { value: shaderIndex },
        uSunPosition: { value: new THREE.Vector3(0, 0, 0) },
        uTime: { value: 0 },
        uBaseColor: { value: new THREE.Color(moon.colorProfile) },
      },
    });
  }, [shaderIndex, moon.colorProfile]);

  useEffect(() => {
    return () => {
      moonMaterial.dispose();
    };
  }, [moonMaterial]);

  useFrame(() => {
    const simDays = simulationTimeDays ?? useAppStore.getState().solarSimulationTimeDays;

    // Relative Keplerian position around parent planet
    const [lx, ly, lz] = computeKeplerianPosition(moon.orbit, simDays, scaleMode);
    if (groupRef.current) {
      groupRef.current.position.set(lx, ly, lz);
    }

    // Synchronous / sidereal rotation
    if (meshRef.current && moon.rotationPeriodHours !== 0) {
      const rotAngle = (simDays * 24.0 / moon.rotationPeriodHours) * Math.PI * 2;
      meshRef.current.rotation.y = rotAngle;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        material={moonMaterial}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <sphereGeometry args={[radius, 24, 24]} />
      </mesh>

      {/* ── Selection Ring ── */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.4, radius * 1.55, 32]} />
          <meshBasicMaterial color="#64ffda" transparent opacity={0.85} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
