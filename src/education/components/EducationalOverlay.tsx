/**
 * EducationalOverlay.tsx
 * Floating, non-intrusive Educational HUD Overlay.
 * Displays current object name, stage, cosmic epoch, and key astrophysical facts.
 */

import React from 'react';
import { useEducationStore } from '../EducationState';
import { useAppStore } from '../../store/useAppStore';
import { ScaleIndicator } from './ScaleIndicator';
import { getComparisonObjectById } from '../EducationSelectors';

export const EducationalOverlay: React.FC = () => {
  const { showEducationalOverlay, toggleEducationPanel } = useEducationStore();
  const selectedObject = useAppStore((s) => s.selectedObject);
  const selectedSolarBodyId = useAppStore((s) => s.selectedSolarBodyId);
  const selectedGalaxy = useAppStore((s) => s.selectedGalaxy);

  if (!showEducationalOverlay) return null;

  const targetId = selectedSolarBodyId ?? selectedGalaxy?.id ?? selectedObject?.id ?? 'sun';
  const objectData = getComparisonObjectById(targetId) ?? {
    name: selectedObject?.name ?? (selectedSolarBodyId ? selectedSolarBodyId.toUpperCase() : 'The Sun (Sol)'),
    type: selectedObject?.type ?? 'Main Sequence Star (G2V)',
  };

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 48,
        left: 20,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
        zIndex: 20,
      }}
    >
      {/* Current Scale Bar */}
      <ScaleIndicator />

      {/* Floating Target Object Card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: 'rgba(1, 10, 24, 0.85)',
          border: '1px solid rgba(100, 160, 220, 0.25)',
          borderRadius: 8,
          padding: '6px 12px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          pointerEvents: 'auto',
        }}
      >
        <div>
          <div style={{ fontSize: 8.5, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: 'var(--font-mono)' }}>
            TARGET FOCUS
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-star-white)' }}>
            {objectData.name}
          </div>
        </div>

        <button
          onClick={toggleEducationPanel}
          title="Open Educational Discovery Explorer"
          style={{
            background: 'rgba(59, 130, 246, 0.25)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: 6,
            color: 'var(--color-star-blue)',
            cursor: 'pointer',
            padding: '4px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            fontWeight: 600,
            transition: 'all 0.15s ease',
          }}
        >
          🎓 Explore
        </button>
      </div>
    </div>
  );
};
