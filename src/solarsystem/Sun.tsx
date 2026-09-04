/**
 * Sun.tsx
 * Central solar body and primary illumination source for the Solar System.
 * Renders convective photosphere with dynamic granulation, corona glow, and point-light emission.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN_DATA } from './SolarSystemConfig';
import { SunVertexShader, SunFragmentShader } from '../shaders/SunShader';
import type { ScaleMode } from './SolarSystemTypes';

interface SunProps {
  scaleMode?: ScaleMode;
  isSelected?: boolean;
  onSelect?: () => void;
}

export function Sun({
  scaleMode = 'exploration',
  isSelected = false,
  onSelect,
}: SunProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.ShaderMaterial>(null);

  const radius = scaleMode === 'exploration'
    ? SUN_DATA.visualRadiusExploration
    : SUN_DATA.visualRadiusScientific;

  const sunMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SunVertexShader,
      fragmentShader: SunFragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColorCore: { value: new THREE.Color('#fff0b3') },
        uColorEdge: { value: new THREE.Color('#ff8c1a') },
      },
      transparent: false,
    });
  }, []);

  useEffect(() => {
    return () => {
      sunMaterial.dispose();
    };
  }, [sunMaterial]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (matRef.current) {
      matRef.current.uniforms.uTime.value = time;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = time * 0.02;
    }
  });

  return (
    <group name="SunSystem">
      {/* ── 1. Central Photospheric Sphere ── */}
      <mesh
        ref={meshRef}
        material={sunMaterial}
        onClick={(e) => {
          e.stopPropagation();
          onSelect?.();
        }}
      >
        <sphereGeometry args={[radius, 48, 48]} />
      </mesh>

      {/* ── 2. Primary Solar Point Light Illumination ── */}
      <pointLight
        color="#fffaf0"
        intensity={3.2}
        distance={600}
        decay={1.2}
      />

      {/* ── 3. Outer Coronal Glow Sprite ── */}
      <mesh scale={[radius * 2.6, radius * 2.6, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          color="#ffaa33"
          transparent
          opacity={0.35}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ── 4. Selection Highlight Indicator ── */}
      {isSelected && (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[radius * 1.35, radius * 1.45, 48]} />
          <meshBasicMaterial color="#64ffda" transparent opacity={0.8} side={THREE.DoubleSide} />
        </mesh>
      )}
    </group>
  );
}
