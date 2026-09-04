/**
 * Performance & Diagnostics Monitor Overlay
 * Phase 12 - Performance, Polish & Production Hardening
 */

import React, { useState, useEffect } from 'react';
import { globalQualityManager } from '../performance/QualityManager';
import { globalMemoryManager } from '../performance/MemoryManager';
import type { QualityLevel, EffectiveQuality } from '../performance/PerformanceTypes';

interface Props {
  onClose: () => void;
}

export const PerformanceMonitorOverlay: React.FC<Props> = ({ onClose }) => {
  const [mode, setMode] = useState<QualityLevel>(globalQualityManager.getMode());
  const [effective, setEffective] = useState<EffectiveQuality>(globalQualityManager.getEffectiveQuality());
  const [fps, setFps] = useState<number>(Math.round(globalQualityManager.getSmoothedFps()));

  useEffect(() => {
    const unsub = globalQualityManager.subscribe((newMode, newEff) => {
      setMode(newMode);
      setEffective(newEff);
    });

    const interval = setInterval(() => {
      setFps(Math.round(globalQualityManager.getSmoothedFps()));
    }, 500);

    return () => {
      unsub();
      clearInterval(interval);
    };
  }, []);

  const handleModeSelect = (newMode: QualityLevel) => {
    globalQualityManager.setMode(newMode);
    setMode(newMode);
    setEffective(globalQualityManager.getEffectiveQuality());
  };

  const memStats = globalMemoryManager.getStats();

  return (
    <div style={{
      position: 'fixed',
      bottom: '70px',
      right: '20px',
      width: '280px',
      backgroundColor: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(12px)',
      border: '1px solid rgba(56, 189, 248, 0.3)',
      borderRadius: '8px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6)',
      padding: '12px 16px',
      color: '#f8fafc',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '12px',
      zIndex: 9999,
      userSelect: 'none',
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
        paddingBottom: '6px',
        marginBottom: '10px',
      }}>
        <div style={{ fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>⚡</span>
          <span>PERFORMANCE MONITOR</span>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '14px',
            padding: '0 4px',
          }}
          title="Close Monitor"
        >
          ✕
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '12px' }}>
        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '6px 8px', borderRadius: '4px' }}>
          <div style={{ color: '#64748b', fontSize: '10px' }}>SMOOTHED FPS</div>
          <div style={{ fontSize: '16px', fontWeight: 700, color: fps >= 50 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171' }}>
            {fps}
          </div>
        </div>

        <div style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '6px 8px', borderRadius: '4px' }}>
          <div style={{ color: '#64748b', fontSize: '10px' }}>EFFECTIVE TIER</div>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#38bdf8' }}>
            {effective}
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '10px' }}>
        <div style={{ color: '#94a3b8', fontSize: '11px', marginBottom: '4px' }}>Quality Mode:</div>
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {(['AUTO', 'LOW', 'MEDIUM', 'HIGH', 'ULTRA'] as QualityLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleModeSelect(lvl)}
              style={{
                flex: 1,
                minWidth: '45px',
                padding: '3px 0',
                fontSize: '10px',
                fontWeight: mode === lvl ? 700 : 400,
                backgroundColor: mode === lvl ? '#0284c7' : 'rgba(255, 255, 255, 0.05)',
                color: mode === lvl ? '#ffffff' : '#94a3b8',
                border: '1px solid',
                borderColor: mode === lvl ? '#38bdf8' : 'rgba(255, 255, 255, 0.1)',
                borderRadius: '3px',
                cursor: 'pointer',
              }}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '10px', color: '#64748b', borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '6px' }}>
        <div>Geometries Disposed: <span style={{ color: '#cbd5e1' }}>{memStats.geometriesDisposed}</span></div>
        <div>Materials Disposed: <span style={{ color: '#cbd5e1' }}>{memStats.materialsDisposed}</span></div>
      </div>
    </div>
  );
};
