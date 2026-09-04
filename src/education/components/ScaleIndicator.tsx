/**
 * ScaleIndicator.tsx
 * Persistent, responsive cosmic scale indicator bar.
 * Synchronizes with camera distance and displays human/astronomical scale benchmarks.
 */

import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { findScaleBenchmark } from '../EducationUtils';
import { ASTRONOMICAL_UNIT_M, KILOPARSEC_M } from '../EducationConstants';

export const ScaleIndicator: React.FC = () => {
  const cameraDistance = useAppStore((s) => s.cameraDistance);
  const navigationLevel = useAppStore((s) => s.navigationLevel);
  const isSolarSystemMode = useAppStore((s) => s.isSolarSystemMode);
  const isMilkyWayMode = useAppStore((s) => s.isMilkyWayMode);

  // Map 3D scene units to approximate physical distance based on navigation context
  let approxPhysicalMeters: number;
  if (isSolarSystemMode) {
    // Solar scene: 1 unit ~ 0.1 AU
    approxPhysicalMeters = Math.max(1e6, cameraDistance * 0.1 * ASTRONOMICAL_UNIT_M);
  } else if (isMilkyWayMode) {
    // Milky Way scene: 1 unit ~ 50 pc
    approxPhysicalMeters = Math.max(1e15, cameraDistance * 50 * 3.086e16);
  } else if (navigationLevel === 'universe') {
    // Universe scene: 1 unit ~ 10 kpc
    approxPhysicalMeters = Math.max(1e19, cameraDistance * 10 * KILOPARSEC_M);
  } else {
    approxPhysicalMeters = Math.max(1e8, cameraDistance * 1e9);
  }

  const benchmark = findScaleBenchmark(approxPhysicalMeters);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'flex-start',
        background: 'rgba(1, 10, 24, 0.75)',
        border: '1px solid rgba(100, 160, 220, 0.25)',
        borderRadius: 6,
        padding: '4px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        color: 'var(--ui-text-primary)',
        pointerEvents: 'auto',
        backdropFilter: 'blur(8px)',
      }}
      title={`Current Observation Scale: ${benchmark.representativeObject}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%' }}>
        <span style={{ color: 'var(--color-star-blue)', fontWeight: 600 }}>SCALE:</span>
        <span style={{ color: 'var(--color-star-gold)' }}>{benchmark.label}</span>
      </div>

      {/* Visual scale ruler bar */}
      <div style={{ display: 'flex', alignItems: 'center', width: 140, margin: '3px 0' }}>
        <div style={{ width: 2, height: 6, background: 'var(--color-star-blue)' }} />
        <div style={{ flex: 1, height: 1.5, background: 'linear-gradient(90deg, var(--color-star-blue), var(--color-star-gold))' }} />
        <div style={{ width: 2, height: 6, background: 'var(--color-star-gold)' }} />
      </div>

      <div style={{ fontSize: 8.5, color: 'var(--ui-text-dim)', whiteSpace: 'nowrap' }}>
        {benchmark.representativeObject}
      </div>
    </div>
  );
};
