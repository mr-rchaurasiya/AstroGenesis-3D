/**
 * CosmicTimeControls.tsx
 * Time acceleration, epoch jumping, and playback controls for Cosmic Time Explorer.
 * Completely synchronized with the existing SimulationClock in useAppStore.
 */

import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { COSMIC_EPOCHS } from '../EducationConstants';

interface CosmicTimeControlsProps {
  currentCosmicYears: number;
  onJumpToEpoch: (years: number) => void;
}

export const CosmicTimeControls: React.FC<CosmicTimeControlsProps> = ({
  currentCosmicYears,
  onJumpToEpoch,
}) => {
  const isPaused = useAppStore((s) => s.isPaused);
  const togglePause = useAppStore((s) => s.togglePause);
  const timeScale = useAppStore((s) => s.timeScale);
  const setTimeScale = useAppStore((s) => s.setTimeScale);

  const speedPresets = [
    { label: '0.1×', value: 0.1 },
    { label: '1×', value: 1 },
    { label: '10×', value: 10 },
    { label: '100×', value: 100 },
    { label: '1k×', value: 1000 },
    { label: '100k×', value: 100000 },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        background: 'rgba(2, 10, 22, 0.85)',
        border: '1px solid rgba(100, 160, 220, 0.2)',
        borderRadius: 8,
        padding: '10px 14px',
        color: 'var(--ui-text-primary)',
        fontFamily: 'var(--font-ui)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={togglePause}
            style={{
              background: isPaused ? 'rgba(59, 130, 246, 0.4)' : 'rgba(239, 68, 68, 0.3)',
              border: isPaused ? '1px solid var(--ui-accent)' : '1px solid var(--ui-danger)',
              borderRadius: 4,
              color: 'var(--color-star-white)',
              cursor: 'pointer',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            {isPaused ? '▶ RESUME' : '⏸ PAUSE'}
          </button>

          <span style={{ fontSize: 11, color: 'var(--ui-text-secondary)' }}>
            Speed: <strong style={{ color: 'var(--color-star-gold)', fontFamily: 'var(--font-mono)' }}>{timeScale}×</strong>
          </span>
        </div>

        {/* Speed multiplier buttons */}
        <div style={{ display: 'flex', gap: 4 }}>
          {speedPresets.map((sp) => (
            <button
              key={sp.label}
              onClick={() => setTimeScale(sp.value)}
              style={{
                background: timeScale === sp.value ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.05)',
                border: timeScale === sp.value ? '1px solid var(--ui-accent)' : '1px solid transparent',
                borderRadius: 4,
                color: timeScale === sp.value ? 'var(--color-star-blue)' : 'var(--ui-text-dim)',
                cursor: 'pointer',
                padding: '2px 6px',
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
              }}
            >
              {sp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Epoch Jump Presets Quick Select */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap', marginTop: 4 }}>
        <span style={{ fontSize: 10, color: 'var(--ui-text-dim)', fontFamily: 'var(--font-mono)' }}>JUMP:</span>
        {COSMIC_EPOCHS.slice(0, 7).map((epoch) => {
          const isSelected = Math.abs(currentCosmicYears - epoch.timeFromBigBangYears) < 1e7;
          return (
            <button
              key={epoch.id}
              onClick={() => onJumpToEpoch(epoch.timeFromBigBangYears)}
              title={`${epoch.name} (${epoch.displayTime})`}
              style={{
                background: isSelected ? 'rgba(251, 191, 36, 0.25)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid var(--color-star-gold)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                color: isSelected ? 'var(--color-star-gold)' : 'var(--ui-text-secondary)',
                cursor: 'pointer',
                padding: '2px 8px',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                transition: 'all 0.15s ease',
              }}
            >
              {epoch.name.split(' (')[0].split(' &')[0]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
