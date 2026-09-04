/**
 * CosmicWeb.tsx
 * Subtle representation of large-scale cosmic filaments and void boundaries.
 * Renders faint strands connecting deep cluster nodes without artificial glowing gridlines.
 *
 * Performance:
 * - Single draw call via THREE.LineSegments with low-opacity vertex colors
 * - Memory disposal on unmount
 */

import { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useAppStore, type EnvironmentQuality } from '../store/useAppStore';
import { createSeededRNG, randomOnSphere, sampleCatmullRom3D } from '../utils/mathUtils';

const NODE_COUNTS: Record<EnvironmentQuality, { nodes: number; filamentsPerNode: number }> = {
  low: { nodes: 40, filamentsPerNode: 2 },
  medium: { nodes: 70, filamentsPerNode: 3 },
  high: { nodes: 110, filamentsPerNode: 4 },
  ultra: { nodes: 160, filamentsPerNode: 4 },
};

export function CosmicWeb({ seed = 333 }: { seed?: number }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const quality = useAppStore((s) => s.environmentQuality);
  const isVisible = useAppStore((s) => s.showCosmicWeb);

  const { geometry, material } = useMemo(() => {
    const config = NODE_COUNTS[quality] ?? NODE_COUNTS.high;
    const rng = createSeededRNG(seed);

    // 1. Generate primary cosmic cluster attractor nodes in deep horizon (3500–6500 radius)
    const nodes: THREE.Vector3[] = [];
    for (let i = 0; i < config.nodes; i++) {
      const r = 3500 + rng() * 3000;
      nodes.push(randomOnSphere(r, rng));
    }

    // 2. Build organic curved filaments between nearest neighbor nodes
    const filamentPoints: number[] = [];
    const filamentColors: number[] = [];

    const webColor = new THREE.Color(0.20, 0.28, 0.45); // Extremely subtle deep indigo-cyan
    const nodeColor = new THREE.Color(0.35, 0.45, 0.65); // Slightly brighter cluster node

    const samplesPerCurve = 6;

    for (let i = 0; i < nodes.length; i++) {
      const source = nodes[i];

      // Find k nearest neighbors
      const neighbors = nodes
        .map((target, idx) => ({ idx, dist: source.distanceTo(target) }))
        .filter((item) => item.idx !== i && item.dist > 500 && item.dist < 3200)
        .sort((a, b) => a.dist - b.dist)
        .slice(0, config.filamentsPerNode);

      for (const neighbor of neighbors) {
        if (neighbor.idx < i) continue; // Avoid duplicate bidirectional lines
        const target = nodes[neighbor.idx];

        // Intermediate control points with natural gravitational sagging/displacement
        const midPoint = new THREE.Vector3().lerpVectors(source, target, 0.5);
        const perp = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).normalize();
        midPoint.addScaledVector(perp, neighbor.dist * 0.15);

        const ctrlPoints = [source, source, midPoint, target, target];

        // Sample curve segments
        let prevPoint = source;
        for (let s = 1; s <= samplesPerCurve; s++) {
          const t = s / samplesPerCurve;
          const currPoint = sampleCatmullRom3D(ctrlPoints, t);

          // Add line segment (prevPoint -> currPoint)
          filamentPoints.push(prevPoint.x, prevPoint.y, prevPoint.z);
          filamentPoints.push(currPoint.x, currPoint.y, currPoint.z);

          // Color with subtle density gradient (brighter at node ends, fainter at middle)
          const midDist = Math.abs(t - 0.5) * 2.0;
          const segmentCol = new THREE.Color().lerpColors(webColor, nodeColor, midDist);

          filamentColors.push(segmentCol.r, segmentCol.g, segmentCol.b);
          filamentColors.push(segmentCol.r, segmentCol.g, segmentCol.b);

          prevPoint = currPoint;
        }
      }
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(filamentPoints, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(filamentColors, 3));

    const mat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      opacity: 0.12, // Extremely subtle so it doesn't overpower the sky
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    return { geometry: geo, material: mat };
  }, [seed, quality]);

  useEffect(() => {
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  if (!isVisible) return null;

  return (
    <lineSegments ref={lineRef}>
      <primitive object={geometry} attach="geometry" />
      <primitive object={material} attach="material" />
    </lineSegments>
  );
}
