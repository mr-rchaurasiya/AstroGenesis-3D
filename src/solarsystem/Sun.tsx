/**
 * Sun.tsx
 * Central solar body and primary illumination source for the Solar System.
 * Renders convective photosphere with dynamic granulation, corona glow, and point-light emission.
 */

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SUN_DATA } from './SolarSystemConfig';
import {
  SunVertexShader,
  SunFragmentShader,
  SunCoronaVertexShader,
  SunCoronaFragmentShader,
} from '../shaders/SunShader';
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

  // 3D Spherical Corona Materials (Inner & Outer Atmosphere Glow)
  const innerCoronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SunCoronaVertexShader,
      fragmentShader: SunCoronaFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#ffa834') },
        uOpacity: { value: 0.7 },
        uPower: { value: 2.2 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, []);

  const outerCoronaMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      vertexShader: SunCoronaVertexShader,
      fragmentShader: SunCoronaFragmentShader,
      uniforms: {
        uColor: { value: new THREE.Color('#ff6a00') },
        uOpacity: { value: 0.4 },
        uPower: { value: 3.5 },
      },
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      side: THREE.FrontSide,
    });
  }, []);

  useEffect(() => {
    return () => {
      sunMaterial.dispose();
      innerCoronaMaterial.dispose();
      outerCoronaMaterial.dispose();
    };
  }, [sunMaterial, innerCoronaMaterial, outerCoronaMaterial]);

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

      {/* ── 3. 3D Volumetric Coronal Glow Spheres (360° Spherical Aura) ── */}
      <mesh material={innerCoronaMaterial}>
        <sphereGeometry args={[radius * 1.15, 32, 32]} />
      </mesh>
      <mesh material={outerCoronaMaterial}>
        <sphereGeometry args={[radius * 1.38, 32, 32]} />
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
