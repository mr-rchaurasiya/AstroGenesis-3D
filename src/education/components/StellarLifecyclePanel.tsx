/**
 * StellarLifecyclePanel.tsx
 * Interactive Stellar Lifecycle Educator.
 * Adapts dynamically to any initial stellar mass (0.08 to 150 M☉), showing
 * continuous progression from Giant Molecular Cloud collapse to terminal remnant.
 */

import React, { useState } from 'react';
import { classifyMassRegime } from '../EducationUtils';
import { formatTimescale } from '../EducationFormatter';
import { useEducationStore } from '../EducationState';

export const StellarLifecyclePanel: React.FC = () => {
  const [selectedInitialMass, setSelectedInitialMass] = useState<number>(1.0);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string>('ms-solar');
  const { markStageExplored } = useEducationStore();

  const regime = classifyMassRegime(selectedInitialMass);
  const activePhase = regime.phases.find((p) => p.id === selectedPhaseId) ?? regime.phases[0];

  const massPresets = [
    { label: '0.2 M☉ (Red Dwarf)', mass: 0.2 },
    { label: '1.0 M☉ (Sun-Like)', mass: 1.0 },
    { label: '15.0 M☉ (Supergiant)', mass: 15.0 },
    { label: '35.0 M☉ (Hypergiant)', mass: 35.0 },
  ];

  const handleSelectPreset = (mass: number) => {
    setSelectedInitialMass(mass);
    const newRegime = classifyMassRegime(mass);
    setSelectedPhaseId(newRegime.phases[0].id);
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        background: 'rgba(2, 10, 22, 0.9)',
        border: '1px solid rgba(100, 160, 220, 0.25)',
        borderRadius: 8,
        padding: '14px 18px',
        color: 'var(--ui-text-primary)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            STELLAR LIFECYCLE EDUCATOR
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-star-white)', marginTop: 2 }}>
            {regime.title}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 9.5, color: 'var(--ui-text-dim)', fontFamily: 'var(--font-mono)' }}>MS LIFETIME</div>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-star-gold)', fontFamily: 'var(--font-mono)' }}>
            {formatTimescale(regime.estimatedMsLifetimeYears)}
          </div>
        </div>
      </div>

      {/* Mass Preset Buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {massPresets.map((preset) => {
          const isSelected = selectedInitialMass === preset.mass;
          return (
            <button
              key={preset.label}
              onClick={() => handleSelectPreset(preset.mass)}
              style={{
                background: isSelected ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.04)',
                border: isSelected ? '1px solid var(--ui-accent)' : '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 4,
                color: isSelected ? 'var(--color-star-white)' : 'var(--ui-text-secondary)',
                fontSize: 10.5,
                fontFamily: 'var(--font-mono)',
                padding: '4px 8px',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              {preset.label}
            </button>
          );
        })}
      </div>

      {/* Evolutionary Pathway Stages Ribbon */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        overflowX: 'auto',
        background: 'rgba(0,0,0,0.35)',
        padding: '8px 10px',
        borderRadius: 6,
        border: '1px solid rgba(255,255,255,0.05)',
      }}>
        {regime.phases.map((phase, idx) => {
          const isCurrent = activePhase.id === phase.id;
          return (
            <React.Fragment key={phase.id}>
              <button
                onClick={() => {
                  setSelectedPhaseId(phase.id);
                  markStageExplored(phase.stageKey);
                }}
                style={{
                  flex: '0 0 auto',
                  background: isCurrent ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.03)',
                  border: isCurrent ? '1px solid var(--color-star-blue)' : '1px solid transparent',
                  borderRadius: 4,
                  padding: '4px 8px',
                  color: isCurrent ? 'var(--color-star-white)' : 'var(--ui-text-dim)',
                  cursor: 'pointer',
                  fontSize: 10,
                  fontFamily: 'var(--font-mono)',
                  textAlign: 'left',
                }}
              >
                <div style={{ fontSize: 8.5, color: isCurrent ? 'var(--color-star-gold)' : 'var(--ui-text-dim)' }}>
                  Stage {idx + 1}
                </div>
                <div style={{ fontWeight: isCurrent ? 600 : 400 }}>
                  {phase.displayName.split(' (')[0]}
                </div>
              </button>
              {idx < regime.phases.length - 1 && (
                <span style={{ color: 'var(--ui-text-dim)', fontSize: 10 }}>→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Active Phase Deep Dive Card */}
      <div style={{
        background: 'rgba(0, 20, 40, 0.7)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: 6,
        padding: '12px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-star-gold)' }}>
            {activePhase.displayName}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ui-text-dim)', fontFamily: 'var(--font-mono)' }}>
            Typical Duration: <strong style={{ color: 'var(--ui-text-primary)' }}>{formatTimescale(activePhase.durationYears)}</strong>
          </div>
        </div>

        <p style={{ color: 'var(--ui-text-secondary)', fontSize: 11.5, marginBottom: 10 }}>
          {activePhase.description}
        </p>

        {/* Phase Physical Parameters Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 10.5, fontFamily: 'var(--font-mono)' }}>
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Energy Source: </span>
            <span style={{ color: 'var(--color-star-white)' }}>{activePhase.primaryEnergySource}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Internal State: </span>
            <span style={{ color: 'var(--color-star-white)' }}>{activePhase.internalState}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Radius Range: </span>
            <span style={{ color: 'var(--color-star-blue)' }}>{activePhase.radiusRange}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Luminosity: </span>
            <span style={{ color: 'var(--color-star-blue)' }}>{activePhase.luminosityRange}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Surface Temp: </span>
            <span style={{ color: 'var(--color-star-gold)' }}>{activePhase.temperatureRange}</span>
          </div>
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Spectral Type: </span>
            <span style={{ color: 'var(--color-star-gold)' }}>{activePhase.spectralTypeRange}</span>
          </div>
        </div>
      </div>

      {/* Terminal Fate Summary Footer */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 11,
      }}>
        <strong style={{ color: 'var(--color-star-blue)' }}>Terminal Fate: </strong>
        <span style={{ color: 'var(--ui-text-secondary)' }}>{regime.terminalFate}</span>
        <div style={{ marginTop: 4, fontSize: 10, color: 'var(--ui-text-dim)' }}>
          Mass-Loss Role: <em>{regime.massLossSignificance}</em>
        </div>
      </div>
    </div>
  );
};
