/**
 * @file CameraControls.tsx
 * @description Compact HUD camera control bar for zoom, presets, history traversal, and mode switching.
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { PRESET_LIST } from '../camera/CameraPresets';
import type { CameraPresetId } from '../camera/CameraTypes';

export const CameraControls: React.FC = () => {
  const cameraMode = useAppStore((s) => s.cameraMode);
  const setCameraMode = useAppStore((s) => s.setCameraMode);
  const focusTargetId = useAppStore((s) => s.focusTargetId);
  const exitFocus = useAppStore((s) => s.exitFocus);
  const resetCamera = useAppStore((s) => s.resetCamera);
  const navigateToPreset = useAppStore((s) => s.navigateToPreset);
  const canGoBack = useAppStore((s) => s.canGoBack);
  const canGoForward = useAppStore((s) => s.canGoForward);
  const navigateBack = useAppStore((s) => s.navigateBack);
  const navigateForward = useAppStore((s) => s.navigateForward);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        background: 'rgba(1, 10, 20, 0.85)',
        border: '1px solid var(--ui-border)',
        borderRadius: '20px',
        padding: '3px 8px',
        pointerEvents: 'auto',
      }}
      aria-label="Camera Controls"
    >
      {/* History Navigation Back / Forward */}
      <button
        onClick={navigateBack}
        disabled={!canGoBack}
        title="Navigate to previous location in history"
        style={{
          background: canGoBack ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: canGoBack ? '#38bdf8' : '#475569',
          padding: '2px 7px',
          fontSize: '10px',
          cursor: canGoBack ? 'pointer' : 'default',
          transition: 'all 0.15s',
        }}
      >
        ◀
      </button>
      <button
        onClick={navigateForward}
        disabled={!canGoForward}
        title="Navigate to next location in history"
        style={{
          background: canGoForward ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          color: canGoForward ? '#38bdf8' : '#475569',
          padding: '2px 7px',
          fontSize: '10px',
          cursor: canGoForward ? 'pointer' : 'default',
          transition: 'all 0.15s',
        }}
      >
        ▶
      </button>

      <div style={{ width: '1px', height: '12px', background: 'rgba(255, 255, 255, 0.15)', margin: '0 2px' }} />

      {/* Preset Quick Dropdown */}
      <select
        onChange={(e) => {
          if (e.target.value) {
            navigateToPreset(e.target.value as CameraPresetId);
            e.target.value = '';
          }
        }}
        defaultValue=""
        title="Jump to Camera Preset"
        style={{
          background: 'rgba(15, 23, 42, 0.9)',
          border: '1px solid rgba(56, 189, 248, 0.3)',
          borderRadius: '12px',
          color: '#38bdf8',
          fontFamily: 'var(--font-mono)',
          fontSize: '9.5px',
          padding: '2px 6px',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        <option value="" disabled>Presets...</option>
        {PRESET_LIST.map((preset) => (
          <option key={preset.id} value={preset.id}>
            {preset.name}
          </option>
        ))}
      </select>

      {/* Focus / Follow / Free Mode Toggle */}
      {focusTargetId ? (
        <button
          onClick={() => {
            if (cameraMode === 'FOLLOW') {
              setCameraMode('FREE');
            } else {
              setCameraMode('FOLLOW');
            }
          }}
          title={cameraMode === 'FOLLOW' ? 'Switch to Free Camera' : 'Lock & Follow Target'}
          style={{
            background: cameraMode === 'FOLLOW' ? 'rgba(34, 197, 94, 0.25)' : 'rgba(59, 130, 246, 0.2)',
            border: `1px solid ${cameraMode === 'FOLLOW' ? 'rgba(34, 197, 94, 0.6)' : 'rgba(59, 130, 246, 0.4)'}`,
            borderRadius: '12px',
            color: cameraMode === 'FOLLOW' ? '#86efac' : '#38bdf8',
            padding: '2px 8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9.5px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          {cameraMode === 'FOLLOW' ? '🔒 FOLLOWING' : '👁 FOCUS'}
        </button>
      ) : null}

      {focusTargetId ? (
        <button
          onClick={exitFocus}
          title="Exit Focus Mode (ESC)"
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.35)',
            borderRadius: '12px',
            color: '#fca5a5',
            padding: '2px 6px',
            fontFamily: 'var(--font-mono)',
            fontSize: '9px',
            cursor: 'pointer',
          }}
        >
          ✕ Free
        </button>
      ) : null}

      {/* Reset Camera Button */}
      <button
        onClick={resetCamera}
        title="Reset Camera Orientation & Distance (R)"
        style={{
          background: 'rgba(255, 255, 255, 0.06)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          color: '#cbd5e1',
          padding: '2px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: '9.5px',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        ⟲ Reset
      </button>
    </div>
  );
};
