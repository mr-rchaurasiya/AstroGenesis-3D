/**
 * ComparisonPanel.tsx
 * Side-by-side Comparative Object Analyzer.
 * Allows comparing two celestial objects with normalized visual property bars
 * (Mass, Radius, Luminosity, Temperature, Density, Surface Gravity, Escape Velocity, Age).
 */

import React from 'react';
import { useEducationStore } from '../EducationState';
import { BENCHMARK_OBJECTS, getComparisonObjectById } from '../EducationSelectors';
import { buildComparisonRows } from '../EducationUtils';

export const ComparisonPanel: React.FC = () => {
  const {
    comparisonObjectAId,
    comparisonObjectBId,
    setComparisonObjects,
    unitSystem,
  } = useEducationStore();

  const objA = getComparisonObjectById(comparisonObjectAId ?? 'sun') ?? BENCHMARK_OBJECTS[0];
  const objB = getComparisonObjectById(comparisonObjectBId ?? 'sirius-b') ?? BENCHMARK_OBJECTS[4];

  const comparisonRows = buildComparisonRows(objA, objB, unitSystem);

  const presets = [
    { label: 'Sun vs Sirius B (Star vs WD)', idA: 'sun', idB: 'sirius-b' },
    { label: 'Sirius B vs Crab Pulsar (WD vs NS)', idA: 'sirius-b', idB: 'crab-pulsar' },
    { label: 'Crab Pulsar vs Cygnus X-1 (NS vs BH)', idA: 'crab-pulsar', idB: 'cygnus-x1' },
    { label: 'Sun vs Betelgeuse (Dwarf vs Giant)', idA: 'sun', idB: 'betelgeuse' },
    { label: 'Earth vs Jupiter (Terrestrial vs Gas)', idA: 'earth', idB: 'jupiter' },
  ];

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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            CELESTIAL OBJECT COMPARISON
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-star-white)', marginTop: 2 }}>
            {objA.name} <span style={{ color: 'var(--ui-text-dim)' }}>vs</span> {objB.name}
          </div>
        </div>
      </div>

      {/* Preset Comparison Buttons */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {presets.map((p) => (
          <button
            key={p.label}
            onClick={() => setComparisonObjects(p.idA, p.idB)}
            style={{
              background: objA.id === p.idA && objB.id === p.idB ? 'rgba(59, 130, 246, 0.35)' : 'rgba(255, 255, 255, 0.04)',
              border: objA.id === p.idA && objB.id === p.idB ? '1px solid var(--ui-accent)' : '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: 4,
              color: objA.id === p.idA && objB.id === p.idB ? 'var(--color-star-white)' : 'var(--ui-text-secondary)',
              fontSize: 10,
              fontFamily: 'var(--font-mono)',
              padding: '3px 8px',
              cursor: 'pointer',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Selectors for Custom Object A & B */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 2 }}>
        <div>
          <label style={{ fontSize: 10, color: 'var(--color-star-blue)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
            OBJECT A (Primary)
          </label>
          <select
            value={objA.id}
            onChange={(e) => setComparisonObjects(e.target.value, objB.id)}
            style={{
              width: '100%',
              background: 'rgba(0, 20, 40, 0.8)',
              border: '1px solid var(--ui-border)',
              borderRadius: 4,
              color: 'var(--color-star-blue)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            {BENCHMARK_OBJECTS.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ fontSize: 10, color: 'var(--color-star-gold)', display: 'block', marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
            OBJECT B (Comparison)
          </label>
          <select
            value={objB.id}
            onChange={(e) => setComparisonObjects(objA.id, e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(0, 20, 40, 0.8)',
              border: '1px solid var(--ui-border)',
              borderRadius: 4,
              color: 'var(--color-star-gold)',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              padding: '4px 8px',
              cursor: 'pointer',
            }}
          >
            {BENCHMARK_OBJECTS.map((o) => (
              <option key={o.id} value={o.id}>{o.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Comparison Rows Table */}
      <div style={{
        background: 'rgba(0,0,0,0.4)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'rgba(59, 130, 246, 0.15)', borderBottom: '1px solid rgba(255,255,255,0.08)', textAlign: 'left' }}>
              <th style={{ padding: '6px 10px', color: 'var(--ui-text-dim)' }}>Property</th>
              <th style={{ padding: '6px 10px', color: 'var(--color-star-blue)' }}>{objA.name.split(' (')[0]}</th>
              <th style={{ padding: '6px 10px', color: 'var(--color-star-gold)' }}>{objB.name.split(' (')[0]}</th>
              <th style={{ padding: '6px 10px', color: 'var(--ui-text-dim)' }}>Ratio / Difference</th>
            </tr>
          </thead>
          <tbody>
            {comparisonRows.map((row) => (
              <tr key={row.propertyKey} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>{row.displayName}</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-blue)', fontWeight: 600 }}>{row.formattedA}</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-gold)', fontWeight: 600 }}>{row.formattedB}</td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  {row.ratioDescription ?? '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
