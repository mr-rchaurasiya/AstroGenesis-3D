/**
 * @file SolarSystemControls.tsx
 * @description Interactive control overlay for Solar System exploration, scale toggles, layer filters, and time acceleration.
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { SOLAR_OBJECT_LIST } from '../solarsystem/solarSystemPresets';

export const SolarSystemControls: React.FC = () => {
  const isSolarSystemMode = useAppStore((s) => s.isSolarSystemMode);
  const selectedBodyId = useAppStore((s) => s.selectedSolarBodyId);
  const selectSolarBody = useAppStore((s) => s.selectSolarBody);
  const exitSolarSystemMode = useAppStore((s) => s.exitSolarSystemMode);

  // Layer toggles
  const showOrbitLines = useAppStore((s) => s.showOrbitLines);
  const toggleOrbitLines = useAppStore((s) => s.toggleOrbitLines);
  const showAsteroidBelt = useAppStore((s) => s.showAsteroidBelt);
  const toggleAsteroidBelt = useAppStore((s) => s.toggleAsteroidBelt);
  const showKuiperBelt = useAppStore((s) => s.showKuiperBelt);
  const toggleKuiperBelt = useAppStore((s) => s.toggleKuiperBelt);
  const showComets = useAppStore((s) => s.showComets);
  const toggleComets = useAppStore((s) => s.toggleComets);
  const showMoons = useAppStore((s) => s.showMoons);
  const toggleMoons = useAppStore((s) => s.toggleMoons);

  // Scale & Time
  const solarScaleMode = useAppStore((s) => s.solarScaleMode);
  const setSolarScaleMode = useAppStore((s) => s.setSolarScaleMode);
  const solarTimeScale = useAppStore((s) => s.solarTimeScale);
  const setSolarTimeScale = useAppStore((s) => s.setSolarTimeScale);
  const isPaused = useAppStore((s) => s.isSolarSimulationPaused);
  const togglePause = useAppStore((s) => s.toggleSolarSimulationPause);

  if (!isSolarSystemMode) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '10px',
        background: 'rgba(8, 14, 30, 0.85)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '16px',
        padding: '12px 20px',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.1)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      {/* Top Row: Navigation, Body Selector & Scale Switch */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Exit Button */}
        <button
          onClick={exitSolarSystemMode}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            borderRadius: '8px',
            color: '#fca5a5',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          ← Galactic Scale
        </button>

        {/* Quick Body Selector */}
        <select
          value={selectedBodyId || ''}
          onChange={(e) => selectSolarBody(e.target.value || null)}
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(56, 189, 248, 0.3)',
            borderRadius: '8px',
            color: '#38bdf8',
            padding: '6px 12px',
            fontSize: '12px',
            fontWeight: 500,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="">Select Object...</option>
          <optgroup label="Central Star">
            <option value="sun">The Sun (Sol)</option>
          </optgroup>
          <optgroup label="Planets">
            {SOLAR_OBJECT_LIST.filter((o) => o.type === 'planet').map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.semiMajorAxisAU?.toFixed(2)} AU)
              </option>
            ))}
          </optgroup>
          <optgroup label="Dwarf Planets">
            {SOLAR_OBJECT_LIST.filter((o) => o.type === 'dwarf_planet').map((d) => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.semiMajorAxisAU?.toFixed(1)} AU)
              </option>
            ))}
          </optgroup>
          <optgroup label="Comets">
            {SOLAR_OBJECT_LIST.filter((o) => o.type === 'comet').map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Scale Mode Switch */}
        <div style={{ display: 'flex', background: 'rgba(15, 23, 42, 0.8)', borderRadius: '8px', padding: '2px', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <button
            onClick={() => setSolarScaleMode('exploration')}
            style={{
              background: solarScaleMode === 'exploration' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: solarScaleMode === 'exploration' ? '#38bdf8' : '#94a3b8',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Exploration Scale
          </button>
          <button
            onClick={() => setSolarScaleMode('scientific')}
            style={{
              background: solarScaleMode === 'scientific' ? 'rgba(56, 189, 248, 0.25)' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              color: solarScaleMode === 'scientific' ? '#38bdf8' : '#94a3b8',
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            True Scientific AU
          </button>
        </div>
      </div>

      {/* Bottom Row: Time Acceleration & Layer Toggles */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '11px', flexWrap: 'wrap', justifyContent: 'center' }}>
        {/* Time Play / Pause */}
        <button
          onClick={togglePause}
          style={{
            background: isPaused ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
            border: `1px solid ${isPaused ? 'rgba(234, 179, 8, 0.5)' : 'rgba(34, 197, 94, 0.5)'}`,
            borderRadius: '6px',
            color: isPaused ? '#fef08a' : '#86efac',
            padding: '3px 8px',
            fontSize: '11px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          {isPaused ? '▶ Resume' : '❚❚ Pause'}
        </button>

        {/* Time Multipliers */}
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8' }}>Speed:</span>
          {[0.1, 1, 10, 60, 365].map((speed) => (
            <button
              key={speed}
              onClick={() => setSolarTimeScale(speed)}
              style={{
                background: solarTimeScale === speed ? 'rgba(56, 189, 248, 0.3)' : 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '4px',
                color: solarTimeScale === speed ? '#38bdf8' : '#cbd5e1',
                padding: '2px 6px',
                fontSize: '10px',
                cursor: 'pointer',
              }}
            >
              {speed === 365 ? '1 yr/s' : speed === 60 ? '2 mo/s' : `${speed} d/s`}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '14px', background: 'rgba(255, 255, 255, 0.15)' }} />

        {/* Layer Visibility Toggles */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={toggleOrbitLines}
            style={{
              background: showOrbitLines ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showOrbitLines ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: showOrbitLines ? '#38bdf8' : '#64748b',
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            Orbits
          </button>
          <button
            onClick={toggleMoons}
            style={{
              background: showMoons ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showMoons ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: showMoons ? '#38bdf8' : '#64748b',
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            Moons
          </button>
          <button
            onClick={toggleAsteroidBelt}
            style={{
              background: showAsteroidBelt ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showAsteroidBelt ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: showAsteroidBelt ? '#38bdf8' : '#64748b',
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            Asteroids
          </button>
          <button
            onClick={toggleKuiperBelt}
            style={{
              background: showKuiperBelt ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showKuiperBelt ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: showKuiperBelt ? '#38bdf8' : '#64748b',
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            Kuiper Belt
          </button>
          <button
            onClick={toggleComets}
            style={{
              background: showComets ? 'rgba(56, 189, 248, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              border: `1px solid ${showComets ? 'rgba(56, 189, 248, 0.4)' : 'rgba(255, 255, 255, 0.1)'}`,
              borderRadius: '6px',
              color: showComets ? '#38bdf8' : '#64748b',
              padding: '2px 8px',
              cursor: 'pointer',
            }}
          >
            Comets
          </button>
        </div>
      </div>
    </div>
  );
};
