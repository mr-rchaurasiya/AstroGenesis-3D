/**
 * CosmicTimeline.tsx
 * Interactive Logarithmic Cosmic Timeline component.
 * Spans from Big Bang (t=0) through Structure Formation, the Stelliferous Era,
 * and into the Degenerate & Black Hole Eras. Synchronized with SimulationClock.
 */

import React, { useState } from 'react';
import { COSMIC_EPOCHS, UNIVERSE_AGE_YEARS } from '../EducationConstants';
import { findCosmicEpochForTime } from '../EducationUtils';
import { CosmicTimeControls } from './CosmicTimeControls';
import { formatTimescale } from '../EducationFormatter';

export const CosmicTimeline: React.FC = () => {
  const [currentCosmicYears, setCurrentCosmicYears] = useState<number>(UNIVERSE_AGE_YEARS);
  const currentEpoch = findCosmicEpochForTime(currentCosmicYears);

  // Logarithmic position mapping (0 to 1 scale)
  // Maps 0 yr -> 0.0, 13.8 Gyr -> 0.70, 10^14 yr -> 0.88, 10^40 yr -> 1.0
  const getLogPosition = (years: number): number => {
    if (years <= 0) return 0;
    const logVal = Math.log10(years);
    // min log = log10(1000 yr) = 3, max log = log10(10^40 yr) = 40
    const clamped = Math.max(3, Math.min(40, logVal));
    return (clamped - 3) / (40 - 3);
  };

  const getYearsFromLogPosition = (pos: number): number => {
    const logVal = 3 + pos * (40 - 3);
    return Math.pow(10, logVal);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const frac = parseFloat(e.target.value);
    const yrs = getYearsFromLogPosition(frac);
    setCurrentCosmicYears(yrs);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'rgba(2, 10, 22, 0.92)',
        border: '1px solid rgba(100, 160, 220, 0.25)',
        borderRadius: 8,
        padding: '14px 18px',
        color: 'var(--ui-text-primary)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
      }}
    >
      {/* Header & Active Epoch */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            COSMIC TIME EXPLORER (13.8 BILLION YEARS)
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-star-white)', marginTop: 2 }}>
            {currentEpoch.name}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9.5, color: 'var(--ui-text-dim)', fontFamily: 'var(--font-mono)' }}>COSMIC TIME</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-star-gold)', fontFamily: 'var(--font-mono)' }}>
            {formatTimescale(currentCosmicYears)}
          </div>
        </div>
      </div>

      {/* Epoch Description Box */}
      <div style={{
        background: 'rgba(0, 20, 40, 0.6)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 11.5,
        lineHeight: 1.4,
        color: 'var(--ui-text-secondary)',
      }}>
        <p style={{ margin: 0, marginBottom: 4 }}>
          {currentEpoch.description}
        </p>
        <div style={{ fontSize: 10, color: 'var(--color-star-blue)', fontFamily: 'var(--font-mono)' }}>
          ★ Key Phenomenon: <strong>{currentEpoch.keyPhenomenon}</strong>
          {currentEpoch.redshift !== undefined && (
            <span style={{ marginLeft: 12, color: 'var(--color-star-gold)' }}>
              Redshift: z ≈ {currentEpoch.redshift === Infinity ? '∞' : currentEpoch.redshift}
            </span>
          )}
        </div>
      </div>

      {/* Interactive Timeline Scrubber */}
      <div style={{ margin: '8px 0' }}>
        <input
          type="range"
          min="0"
          max="1"
          step="0.001"
          value={getLogPosition(currentCosmicYears)}
          onChange={handleSliderChange}
          style={{
            width: '100%',
            cursor: 'pointer',
            accentColor: 'var(--color-star-blue)',
          }}
          aria-label="Cosmic Timeline Slider"
        />

        {/* Milestone Marks along the track */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 9, fontFamily: 'var(--font-mono)', color: 'var(--ui-text-dim)', marginTop: 4 }}>
          <span>Big Bang (0)</span>
          <span>1st Stars (100 Myr)</span>
          <span>Milky Way (4 Gyr)</span>
          <span style={{ color: 'var(--color-star-gold)', fontWeight: 600 }}>Now (13.8 Gyr)</span>
          <span>Red Giant (+5 Gyr)</span>
          <span>Degenerate (10¹⁴ yr)</span>
        </div>
      </div>

      {/* Timeline Epoch Cards Horizontal Strip */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 6,
      }}>
        {COSMIC_EPOCHS.map((epoch) => {
          const isCurrent = currentEpoch.id === epoch.id;
          return (
            <div
              key={epoch.id}
              onClick={() => setCurrentCosmicYears(epoch.timeFromBigBangYears)}
              style={{
                flex: '0 0 160px',
                background: isCurrent ? 'rgba(59, 130, 246, 0.25)' : 'rgba(0, 0, 0, 0.4)',
                border: isCurrent ? '1px solid var(--color-star-blue)' : '1px solid rgba(255,255,255,0.06)',
                borderRadius: 6,
                padding: '6px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ fontSize: 9, color: isCurrent ? 'var(--color-star-gold)' : 'var(--ui-text-dim)', fontFamily: 'var(--font-mono)' }}>
                {epoch.displayTime}
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: isCurrent ? 'var(--color-star-white)' : 'var(--ui-text-secondary)', marginTop: 2 }}>
                {epoch.name.split(' (')[0]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Time Controls */}
      <CosmicTimeControls
        currentCosmicYears={currentCosmicYears}
        onJumpToEpoch={(yrs) => setCurrentCosmicYears(yrs)}
      />
    </div>
  );
};
