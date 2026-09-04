/**
 * UnitToggle.tsx
 * Unit system selector component.
 * Allows instant toggling between Solar Units, SI (Metric), Astronomical, and Human-Friendly formats.
 */

import React from 'react';
import { useEducationStore } from '../EducationState';
import type { UnitSystem } from '../EducationTypes';

export const UnitToggle: React.FC = () => {
  const { unitSystem, setUnitSystem } = useEducationStore();

  const units: { id: UnitSystem; label: string; tooltip: string }[] = [
    { id: 'SOLAR', label: 'Solar (M☉, R☉, L☉)', tooltip: 'Relative to the Sun (M☉, R☉, L☉)' },
    { id: 'SI', label: 'SI (kg, m, W)', tooltip: 'International System of Units (kg, m, Watts, Joules)' },
    { id: 'ASTRONOMICAL', label: 'Astro (AU, pc, ly)', tooltip: 'Astronomical distances and Solar masses' },
    { id: 'HUMAN', label: 'Human (Earth, °C)', tooltip: 'Earth equivalents and intuitive human comparisons' },
  ];

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 3,
        background: 'rgba(1, 10, 20, 0.8)',
        border: '1px solid var(--ui-border)',
        borderRadius: 16,
        padding: '2px 4px',
        pointerEvents: 'auto',
      }}
    >
      <span style={{ fontSize: 9.5, color: 'var(--ui-text-dim)', paddingLeft: 4, fontFamily: 'var(--font-mono)' }}>
        UNITS:
      </span>
      {units.map((u) => (
        <button
          key={u.id}
          onClick={() => setUnitSystem(u.id)}
          title={u.tooltip}
          style={{
            background: unitSystem === u.id ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
            border: unitSystem === u.id ? '1px solid rgba(59, 130, 246, 0.6)' : '1px solid transparent',
            borderRadius: 12,
            color: unitSystem === u.id ? 'var(--color-star-blue)' : 'var(--ui-text-dim)',
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            padding: '2px 6px',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {u.label.split(' ')[0]}
        </button>
      ))}
    </div>
  );
};
