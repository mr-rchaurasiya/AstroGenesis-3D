/**
 * ObjectInfoPanel.tsx
 * Contextual celestial object inspector panel.
 * Displays clean scientific parameters, classification, and quick actions
 * (Learn More, Scientific Data, Compare, Focus) with no fake values.
 */

import React from 'react';
import { useEducationStore } from '../EducationState';
import { getComparisonObjectById } from '../EducationSelectors';
import { useAppStore } from '../../store/useAppStore';
import {
  formatMass,
  formatRadius,
  formatLuminosity,
  formatTemperature,
} from '../EducationFormatter';

export const ObjectInfoPanel: React.FC = () => {
  const selectedObject = useAppStore((s) => s.selectedObject);
  const selectedSolarBodyId = useAppStore((s) => s.selectedSolarBodyId);
  const selectedGalaxy = useAppStore((s) => s.selectedGalaxy);
  const focusObject = useAppStore((s) => s.focusObject);

  const {
    unitSystem,
    setActiveEducationTab,
    setEducationMode,
    setComparisonObjects,
    markObjectExplored,
  } = useEducationStore();

  // Resolve object details
  const targetId = selectedSolarBodyId ?? selectedGalaxy?.id ?? selectedObject?.id ?? 'sun';
  const objectData = getComparisonObjectById(targetId) ?? {
    id: targetId,
    name: selectedObject?.name ?? (selectedSolarBodyId ? selectedSolarBodyId.toUpperCase() : 'Selected Celestial Body'),
    type: selectedObject?.type ?? 'Astronomical Body',
  };

  const handleLearnMore = () => {
    markObjectExplored(targetId);
    setEducationMode('LEARN');
    setActiveEducationTab('LEARN');
  };

  const handleScientificData = () => {
    markObjectExplored(targetId);
    setEducationMode('SCIENTIFIC');
    setActiveEducationTab('SCIENTIFIC');
  };

  const handleCompare = () => {
    markObjectExplored(targetId);
    setComparisonObjects(targetId, 'sun');
    setEducationMode('COMPARE');
    setActiveEducationTab('COMPARE');
  };

  const handleFocus = () => {
    focusObject(targetId);
  };

  return (
    <div
      style={{
        background: 'rgba(2, 10, 24, 0.92)',
        border: '1px solid rgba(100, 160, 220, 0.25)',
        borderRadius: 8,
        padding: '12px 16px',
        color: 'var(--ui-text-primary)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
        width: 300,
        boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(12px)',
        pointerEvents: 'auto',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: 9.5, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 600 }}>
            TARGET OBJECT
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-star-white)' }}>
            {objectData.name}
          </div>
        </div>
      </div>

      <div style={{ fontSize: 10.5, color: 'var(--color-star-gold)', fontFamily: 'var(--font-mono)', marginBottom: 8 }}>
        {objectData.type}
      </div>

      {/* Property metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 10.5, fontFamily: 'var(--font-mono)', marginBottom: 10 }}>
        {objectData.massSolar !== undefined && (
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Mass: </span>
            <span style={{ color: 'var(--color-star-white)' }}>{formatMass(objectData.massSolar, unitSystem)}</span>
          </div>
        )}
        {objectData.radiusSolar !== undefined && (
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Radius: </span>
            <span style={{ color: 'var(--color-star-white)' }}>{formatRadius(objectData.radiusSolar, unitSystem)}</span>
          </div>
        )}
        {objectData.luminositySolar !== undefined && (
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Lum: </span>
            <span style={{ color: 'var(--color-star-white)' }}>{formatLuminosity(objectData.luminositySolar, unitSystem)}</span>
          </div>
        )}
        {objectData.temperatureK !== undefined && (
          <div>
            <span style={{ color: 'var(--ui-text-dim)' }}>Temp: </span>
            <span style={{ color: 'var(--color-star-gold)' }}>{formatTemperature(objectData.temperatureK, unitSystem)}</span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 8 }}>
        <button
          onClick={handleLearnMore}
          style={{
            background: 'rgba(59, 130, 246, 0.25)',
            border: '1px solid rgba(59, 130, 246, 0.5)',
            borderRadius: 4,
            color: 'var(--color-star-blue)',
            cursor: 'pointer',
            padding: '4px 6px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}
        >
          📖 Learn More
        </button>

        <button
          onClick={handleScientificData}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 4,
            color: 'var(--ui-text-secondary)',
            cursor: 'pointer',
            padding: '4px 6px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}
        >
          🔬 Scientific Data
        </button>

        <button
          onClick={handleCompare}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: 4,
            color: 'var(--ui-text-secondary)',
            cursor: 'pointer',
            padding: '4px 6px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}
        >
          ⚖️ Compare
        </button>

        <button
          onClick={handleFocus}
          style={{
            background: 'rgba(251, 191, 36, 0.2)',
            border: '1px solid rgba(251, 191, 36, 0.4)',
            borderRadius: 4,
            color: 'var(--color-star-gold)',
            cursor: 'pointer',
            padding: '4px 6px',
            fontSize: 10,
            fontFamily: 'var(--font-mono)',
          }}
        >
          🎯 Focus View
        </button>
      </div>
    </div>
  );
};
