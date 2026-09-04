/**
 * @file CameraStatus.tsx
 * @description Status indicator for active camera mode, follow target, and navigation coordinates.
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';

export const CameraStatus: React.FC = () => {
  const cameraMode = useAppStore((s) => s.cameraMode);
  const focusTargetId = useAppStore((s) => s.focusTargetId);
  const navigationLevel = useAppStore((s) => s.navigationLevel);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ color: 'var(--ui-text-dim)' }}>Camera:</span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontWeight: 600,
          color: cameraMode === 'FOLLOW' ? '#86efac' : cameraMode === 'TRANSITION' ? '#fde047' : '#38bdf8',
          fontSize: '9.5px',
          textTransform: 'uppercase',
        }}
      >
        {cameraMode}
      </span>
      {focusTargetId && (
        <span style={{ color: '#94a3b8', fontSize: '9.5px' }}>
          [{focusTargetId.toUpperCase()}]
        </span>
      )}
      <span style={{ opacity: 0.5 }}>|</span>
      <span style={{ color: 'var(--color-star-blue)', fontSize: '9.5px', textTransform: 'capitalize' }}>
        {navigationLevel.replace('-', ' ')}
      </span>
    </div>
  );
};
