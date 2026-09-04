/**
 * ScientificDataPanel.tsx
 * In-depth Scientific Data Inspector.
 * Displays exact physical equations and quantitative metrics (Mass, Radius, Luminosity,
 * Temperature, Surface Gravity, Density, Escape Velocity, Eddington Ratio, Degeneracy,
 * Compactness, Schwarzschild Radius, and ISCO) across all 4 unit systems.
 */

import React from 'react';
import { useEducationStore } from '../EducationState';
import { BENCHMARK_OBJECTS, getComparisonObjectById } from '../EducationSelectors';
import {
  formatMass,
  formatRadius,
  formatLuminosity,
  formatTemperature,
  formatDensity,
  formatGravity,
  formatVelocity,
  formatTimescale,
} from '../EducationFormatter';

interface ScientificDataPanelProps {
  selectedObjectId?: string;
  onSelectObject?: (id: string) => void;
}

export const ScientificDataPanel: React.FC<ScientificDataPanelProps> = ({
  selectedObjectId = 'sun',
  onSelectObject,
}) => {
  const { unitSystem, detailLevel, openConceptTooltip } = useEducationStore();

  const currentObj = getComparisonObjectById(selectedObjectId) ?? BENCHMARK_OBJECTS[0];

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
      {/* Header & Object Switcher */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 10, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
            SCIENTIFIC PARAMETERS & ASTROPHYSICAL DATA
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-star-white)', marginTop: 2 }}>
            {currentObj.name}
          </div>
        </div>

        {/* Object Quick Switcher */}
        <select
          value={currentObj.id}
          onChange={(e) => onSelectObject?.(e.target.value)}
          style={{
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
          {BENCHMARK_OBJECTS.map((obj) => (
            <option key={obj.id} value={obj.id}>
              {obj.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subtitle / Classification */}
      <div style={{ fontSize: 11, color: 'var(--color-star-gold)', fontFamily: 'var(--font-mono)' }}>
        Classification: {currentObj.type}
      </div>

      {/* Primary Physical Parameters Table */}
      <div style={{
        background: 'rgba(0, 0, 0, 0.4)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, fontFamily: 'var(--font-mono)' }}>
          <thead>
            <tr style={{ background: 'rgba(59, 130, 246, 0.15)', borderBottom: '1px solid rgba(255,255,255,0.08)', color: 'var(--color-star-blue)', textAlign: 'left' }}>
              <th style={{ padding: '6px 10px' }}>Parameter</th>
              <th style={{ padding: '6px 10px' }}>Value ({unitSystem})</th>
              <th style={{ padding: '6px 10px' }}>Equation / Law</th>
            </tr>
          </thead>
          <tbody>
            {/* Mass */}
            {currentObj.massSolar !== undefined && (
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>Mass (M)</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-white)', fontWeight: 600 }}>
                  {formatMass(currentObj.massSolar, unitSystem)}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  <button
                    onClick={() => openConceptTooltip('mass-luminosity')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-star-blue)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    L ∝ M^α
                  </button>
                </td>
              </tr>
            )}

            {/* Radius */}
            {currentObj.radiusSolar !== undefined && (
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>Radius (R)</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-white)', fontWeight: 600 }}>
                  {formatRadius(currentObj.radiusSolar, unitSystem)}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  <button
                    onClick={() => openConceptTooltip('stefan-boltzmann')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-star-blue)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    L = 4πR²σT⁴
                  </button>
                </td>
              </tr>
            )}

            {/* Luminosity */}
            {currentObj.luminositySolar !== undefined && (
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>Luminosity (L)</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-white)', fontWeight: 600 }}>
                  {formatLuminosity(currentObj.luminositySolar, unitSystem)}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  Bolometric Output
                </td>
              </tr>
            )}

            {/* Effective Temperature */}
            {currentObj.temperatureK !== undefined && (
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>Effective Temp (T_eff)</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-gold)', fontWeight: 600 }}>
                  {formatTemperature(currentObj.temperatureK, unitSystem)}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  Planckian Blackbody
                </td>
              </tr>
            )}

            {/* Mean Density */}
            {currentObj.densityKgM3 !== undefined && (
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>Mean Density (ρ)</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-white)' }}>
                  {formatDensity(currentObj.densityKgM3)}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  ρ = M / ((4/3)πR³)
                </td>
              </tr>
            )}

            {/* Surface Gravity */}
            {currentObj.surfaceGravityM_S2 !== undefined && (
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>Surface Gravity (g)</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-white)' }}>
                  {formatGravity(currentObj.surfaceGravityM_S2, unitSystem)}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  g = G·M / R²
                </td>
              </tr>
            )}

            {/* Escape Velocity */}
            {currentObj.escapeVelocityKm_S !== undefined && (
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>Escape Velocity (v_esc)</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-white)' }}>
                  {formatVelocity(currentObj.escapeVelocityKm_S)}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  <button
                    onClick={() => openConceptTooltip('escape-velocity')}
                    style={{ background: 'none', border: 'none', color: 'var(--color-star-blue)', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    v_esc = √(2GM/R)
                  </button>
                </td>
              </tr>
            )}

            {/* Age */}
            {currentObj.ageYears !== undefined && (
              <tr>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-secondary)' }}>Age / Lifetime (t)</td>
                <td style={{ padding: '6px 10px', color: 'var(--color-star-white)' }}>
                  {formatTimescale(currentObj.ageYears, unitSystem)}
                </td>
                <td style={{ padding: '6px 10px', color: 'var(--ui-text-dim)', fontSize: 10 }}>
                  Nuclear Timescale
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Advanced Specialized Object Properties */}
      {currentObj.customProperties && Object.keys(currentObj.customProperties).length > 0 && (
        <div style={{
          background: 'rgba(0, 20, 40, 0.6)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: 6,
          padding: '8px 12px',
          fontSize: 11,
        }}>
          <div style={{ fontSize: 10, color: 'var(--color-star-blue)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 6 }}>
            Specialized Astrophysics Metrics
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontFamily: 'var(--font-mono)' }}>
            {Object.entries(currentObj.customProperties).map(([k, v]) => (
              <div key={k}>
                <span style={{ color: 'var(--ui-text-dim)' }}>{k}: </span>
                <span style={{ color: 'var(--color-star-gold)' }}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detail Level Explanation Notes */}
      {detailLevel === 'ADVANCED' && (
        <div style={{ fontSize: 10, color: 'var(--ui-text-dim)', lineHeight: 1.4, borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 6 }}>
          <em>Note:</em> Parameters reflect validated reduced-order analytical equations from Phases 7–10 (Eddington ratio, Stefan-Boltzmann blackbody law, Chandrasekhar mass-radius softening, and Schwarzschild event horizon metrics).
        </div>
      )}
    </div>
  );
};
