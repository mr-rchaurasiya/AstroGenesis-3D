/**
 * HRDiagramPanel.tsx
 * Interactive Hertzsprung-Russell (HR) Diagram educational viewer.
 * Plots log(L/L☉) vs log(T_eff) with conventional astronomical reversed temperature axis
 * (Hot Blue on Left → Cool Red on Right), spectral class labels, luminosity bands,
 * and evolutionary tracks from Phase 9.
 */

import React, { useState } from 'react';
import { generateEvolutionTrack } from '../../starevolution/HRDiagramData';
import type { EvolutionTrackPoint } from '../../starevolution/StarEvolutionTypes';
import { useEducationStore } from '../EducationState';
import { BENCHMARK_OBJECTS } from '../EducationSelectors';

export const HRDiagramPanel: React.FC = () => {
  const [selectedMass, setSelectedMass] = useState<number>(1.0);
  const { openConceptTooltip } = useEducationStore();

  const track = generateEvolutionTrack(selectedMass, 0.0, 30);

  // Diagram boundaries:
  // T_eff: 50,000 K (log 4.7) to 2,000 K (log 3.3) -> reversed
  // L/L☉: 10⁻⁵ (log -5) to 10⁶ (log 6)
  const minLogT = 3.3;
  const maxLogT = 4.7;
  const minLogL = -5.0;
  const maxLogL = 6.0;

  const width = 460;
  const height = 300;
  const padding = 40;

  const mapX = (teff: number): number => {
    const logT = Math.log10(Math.max(2000, Math.min(50000, teff)));
    // Reversed: maxLogT -> padding (left), minLogT -> width - padding (right)
    const frac = (maxLogT - logT) / (maxLogT - minLogT);
    return padding + frac * (width - 2 * padding);
  };

  const mapY = (lum: number): number => {
    const logL = Math.log10(Math.max(1e-5, Math.min(1e6, lum)));
    // Normal: maxLogL -> padding (top), minLogL -> height - padding (bottom)
    const frac = (maxLogL - logL) / (maxLogL - minLogL);
    return padding + frac * (height - 2 * padding);
  };

  // Build SVG path for evolutionary track
  const trackPath = track.points
    .map((pt: EvolutionTrackPoint, i: number) => `${i === 0 ? 'M' : 'L'} ${mapX(pt.effectiveTemperatureK).toFixed(1)} ${mapY(pt.luminositySolar).toFixed(1)}`)
    .join(' ');

  const spectralClasses = [
    { label: 'O', teff: 40000, color: '#93c5fd' },
    { label: 'B', teff: 20000, color: '#bfdbfe' },
    { label: 'A', teff: 9000, color: '#e0e7ff' },
    { label: 'F', teff: 7000, color: '#fef3c7' },
    { label: 'G', teff: 5778, color: '#fde047' },
    { label: 'K', teff: 4500, color: '#fdba74' },
    { label: 'M', teff: 3000, color: '#f87171' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        background: 'rgba(2, 10, 22, 0.92)',
        border: '1px solid rgba(100, 160, 220, 0.25)',
        borderRadius: 8,
        padding: '14px 18px',
        color: 'var(--ui-text-primary)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            HERTZSPRUNG-RUSSELL (HR) DIAGRAM
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-star-white)', marginTop: 2 }}>
            Luminosity vs Effective Temperature (Track: {selectedMass.toFixed(1)} M☉)
          </div>
        </div>

        <div style={{ display: 'flex', gap: 4 }}>
          {[0.5, 1.0, 5.0, 15.0].map((m) => (
            <button
              key={m}
              onClick={() => setSelectedMass(m)}
              style={{
                background: selectedMass === m ? 'rgba(59, 130, 246, 0.4)' : 'rgba(255, 255, 255, 0.04)',
                border: selectedMass === m ? '1px solid var(--ui-accent)' : '1px solid transparent',
                borderRadius: 4,
                color: selectedMass === m ? 'var(--color-star-white)' : 'var(--ui-text-dim)',
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                padding: '2px 6px',
                cursor: 'pointer',
              }}
            >
              {m} M☉
            </button>
          ))}
        </div>
      </div>

      {/* SVG HR Diagram Canvas */}
      <div style={{ display: 'flex', justifyContent: 'center', background: 'rgba(0, 5, 12, 0.85)', borderRadius: 6, border: '1px solid rgba(255,255,255,0.06)' }}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ maxWidth: '100%', overflow: 'visible' }}>
          {/* Grid lines */}
          {[-4, -2, 0, 2, 4, 6].map((logL) => (
            <line
              key={logL}
              x1={padding}
              y1={mapY(Math.pow(10, logL))}
              x2={width - padding}
              y2={mapY(Math.pow(10, logL))}
              stroke="rgba(255,255,255,0.06)"
              strokeDasharray="2,2"
            />
          ))}

          {/* Spectral class vertical markers */}
          {spectralClasses.map((sc) => {
            const x = mapX(sc.teff);
            return (
              <g key={sc.label}>
                <line x1={x} y1={padding} x2={x} y2={height - padding} stroke="rgba(255,255,255,0.05)" />
                <text x={x} y={height - padding + 14} fill={sc.color} fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
                  {sc.label}
                </text>
              </g>
            );
          })}

          {/* Main Sequence Band representation */}
          <path
            d={`M ${mapX(35000)} ${mapY(10000)} Q ${mapX(10000)} ${mapY(30)} ${mapX(3000)} ${mapY(0.001)}`}
            fill="none"
            stroke="rgba(59, 130, 246, 0.25)"
            strokeWidth="18"
            strokeLinecap="round"
          />

          {/* Evolutionary Track Line */}
          <path
            d={trackPath}
            fill="none"
            stroke="var(--color-star-gold)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Track Points (ZAMS, Peak RGB, etc) */}
          {track.points.map((pt: EvolutionTrackPoint, i: number) => (
            <circle
              key={i}
              cx={mapX(pt.effectiveTemperatureK)}
              cy={mapY(pt.luminositySolar)}
              r={i === 0 ? 3.5 : i === track.points.length - 1 ? 3.5 : 2}
              fill={i === 0 ? '#60a5fa' : i === track.points.length - 1 ? '#ef4444' : 'var(--color-star-gold)'}
            />
          ))}

          {/* Benchmark Stars overlay (Sun, Sirius B, Betelgeuse) */}
          {BENCHMARK_OBJECTS.filter((o) => o.luminositySolar && o.temperatureK).map((obj) => {
            const bx = mapX(obj.temperatureK!);
            const by = mapY(obj.luminositySolar!);
            return (
              <g key={obj.id}>
                <circle cx={bx} cy={by} r="3" fill="var(--color-star-white)" stroke="rgba(0,0,0,0.8)" strokeWidth="1" />
                <text x={bx + 5} y={by + 3} fill="var(--color-star-white)" fontSize="8.5" fontFamily="var(--font-mono)">
                  {obj.name.split(' (')[0]}
                </text>
              </g>
            );
          })}

          {/* Axis Labels */}
          <text x={width / 2} y={height - 8} fill="var(--ui-text-dim)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle">
            HOT ← Surface Temperature T_eff (K) → COOL
          </text>
          <text x={12} y={height / 2} fill="var(--ui-text-dim)" fontSize="9" fontFamily="var(--font-mono)" textAnchor="middle" transform={`rotate(-90 12 ${height / 2})`}>
            Luminosity L/L☉ (log scale)
          </text>
        </svg>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--ui-text-dim)' }}>
        <span>
          Track: <strong>{track.initialMassSolar.toFixed(1)} M☉</strong> (Age: {(track.points[track.points.length - 1]?.ageYears / 1e6).toFixed(1)} Myr)
        </span>
        <button
          onClick={() => openConceptTooltip('hr-diagram')}
          style={{ background: 'none', border: 'none', color: 'var(--color-star-blue)', cursor: 'pointer', textDecoration: 'underline' }}
        >
          What is the HR Diagram?
        </button>
      </div>
    </div>
  );
};
