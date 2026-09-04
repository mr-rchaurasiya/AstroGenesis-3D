/**
 * @file CometSystem.tsx
 * @description Dynamic cometary objects with Keplerian orbits and solar-wind anti-sunward dust tails.
 */

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { CometTrajectory, ScaleMode, OrbitalElements } from './SolarSystemTypes';
import { COMETS_DATA } from './SolarSystemConfig';
import { computeKeplerianPosition } from './KeplerianOrbit';
import { useAppStore } from '../store/useAppStore';

interface CometSystemProps {
  comets?: CometTrajectory[];
  scaleMode?: ScaleMode;
  simulationTimeDays?: number;
  onSelect?: (id: string) => void;
  selectedId?: string | null;
}

interface SingleCometProps {
  config: CometTrajectory;
  scaleMode: ScaleMode;
  simulationTimeDays?: number;
  onSelect?: (id: string) => void;
  isSelected?: boolean;
}

const SingleComet: React.FC<SingleCometProps> = ({
  config,
  scaleMode,
  simulationTimeDays,
  onSelect,
  isSelected = false,
}) => {
  const cometGroupRef = useRef<THREE.Group>(null);
  const tailMeshRef = useRef<THREE.Mesh>(null);
  const tailMaterialRef = useRef<THREE.ShaderMaterial>(null);

  // Custom Comet Tail Shader
  const tailShader = useMemo(() => {
    return new THREE.ShaderMaterial({
      uniforms: {
        uSunProximity: { value: 0.0 },
        uColor: { value: new THREE.Color(...config.tailColor) },
        uTime: { value: 0.0 },
      },
      vertexShader: `
        varying vec2 vUv;
        varying vec3 vPosition;
        void main() {
          vUv = uv;
          vPosition = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform float uSunProximity;
        uniform vec3 uColor;
        uniform float uTime;
        varying vec2 vUv;
        varying vec3 vPosition;

        void main() {
          // Fade along length of tail (vUv.y from 0 to 1)
          float lengthFade = pow(1.0 - vUv.y, 1.8);
          // Fade across width
          float widthFade = 1.0 - abs(vUv.x - 0.5) * 2.0;
          widthFade = clamp(widthFade, 0.0, 1.0);

          float alpha = lengthFade * widthFade * uSunProximity * 0.85;
          if (alpha < 0.01) discard;

          vec3 finalColor = mix(uColor, vec3(1.0, 1.0, 1.0), (1.0 - vUv.y) * 0.6);
          gl_FragColor = vec4(finalColor, alpha);
        }
      `,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.DoubleSide,
    });
  }, [config.tailColor]);

  const orbitElements: OrbitalElements = useMemo(() => ({
    semiMajorAxisAU: config.semiMajorAxisAU,
    eccentricity: config.eccentricity,
    inclinationDeg: config.inclinationDeg,
    orbitalPeriodDays: config.periodYears * 365.25,
  }), [config]);

  useFrame((_, delta) => {
    if (!cometGroupRef.current) return;

    const simDays = simulationTimeDays ?? useAppStore.getState().solarSimulationTimeDays;

    // Calculate current position in space
    const [px, py, pz] = computeKeplerianPosition(orbitElements, simDays, scaleMode);
    const pos = new THREE.Vector3(px, py, pz);
    cometGroupRef.current.position.copy(pos);

    // Distance from Sun (0, 0, 0)
    const distToSun = pos.length();
    
    // Tail points directly away from the Sun
    if (distToSun > 0.001) {
      const sunDir = pos.clone().normalize();
      
      // Orient tail mesh along sunDir
      if (tailMeshRef.current) {
        tailMeshRef.current.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), sunDir);
        
        // Solar activity: close to sun = longer and brighter tail
        const proximity = Math.max(0.0, Math.min(1.0, (120.0 - distToSun) / 100.0));
        
        if (tailMaterialRef.current) {
          tailMaterialRef.current.uniforms.uSunProximity.value = proximity;
          tailMaterialRef.current.uniforms.uTime.value += delta;
        }

        // Scale tail length based on proximity
        const tailLength = Math.max(2.0, proximity * 25.0);
        const tailWidth = Math.max(0.5, proximity * 4.0);
        tailMeshRef.current.scale.set(tailWidth, tailLength, tailWidth);
      }
    }
  });

  return (
    <group
      ref={cometGroupRef}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.(config.id);
      }}
    >
      {/* Comet Nucleus (Icy/Rocky Body) */}
      <mesh>
        <sphereGeometry args={[scaleMode === 'exploration' ? 0.35 : 0.1, 16, 16]} />
        <meshStandardMaterial
          color="#e2e8f0"
          roughness={0.9}
          metalness={0.1}
          emissive={isSelected ? '#38bdf8' : '#000000'}
          emissiveIntensity={isSelected ? 0.6 : 0.0}
        />
      </mesh>

      {/* Coma / Glow */}
      <mesh>
        <sphereGeometry args={[scaleMode === 'exploration' ? 0.8 : 0.3, 16, 16]} />
        <meshBasicMaterial
          color="#93c5fd"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Ion/Dust Tail (Cone/Cylinder pointing away from Sun) */}
      <mesh
        ref={tailMeshRef}
        material={tailShader}
        position={[0, 0, 0]}
      >
        <cylinderGeometry args={[1.5, 0.1, 1.0, 16, 1, true]} />
      </mesh>
    </group>
  );
};

export const CometSystem: React.FC<CometSystemProps> = ({
  comets = COMETS_DATA,
  scaleMode = 'exploration',
  simulationTimeDays = 0,
  onSelect,
  selectedId,
}) => {
  return (
    <group name="CometSystem">
      {comets.map((comet) => (
        <SingleComet
          key={comet.id}
          config={comet}
          scaleMode={scaleMode}
          simulationTimeDays={simulationTimeDays}
          onSelect={onSelect}
          isSelected={selectedId === comet.id}
        />
      ))}
    </group>
  );
};
