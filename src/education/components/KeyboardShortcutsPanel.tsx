/**
 * KeyboardShortcutsPanel.tsx
 * Keyboard shortcuts reference modal dialog.
 * Exposes existing navigation controls (W/S, A/D, Q/E, R, F, ESC, HOME, Space).
 */

import React from 'react';
import { useEducationStore } from '../EducationState';

export const KeyboardShortcutsPanel: React.FC = () => {
  const { showShortcutsModal, toggleShortcutsModal } = useEducationStore();

  if (!showShortcutsModal) return null;

  const shortcuts = [
    { key: 'W / S', desc: 'Zoom Camera In / Out' },
    { key: 'A / D', desc: 'Orbit Yaw Left / Right' },
    { key: 'Q / E', desc: 'Orbit Pitch Up / Down' },
    { key: 'R', desc: 'Reset Camera View' },
    { key: 'F', desc: 'Frame / Focus Selected Object' },
    { key: 'ESC', desc: 'Exit Focus / Return to Free Camera' },
    { key: 'HOME', desc: 'Reset to Universe Overview' },
    { key: 'SPACE', desc: 'Play / Pause Simulation Clock' },
  ];

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 4, 10, 0.85)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        pointerEvents: 'auto',
      }}
      role="dialog"
      aria-label="Keyboard Shortcuts"
    >
      <div
        style={{
          width: 440,
          maxWidth: '90vw',
          background: 'rgba(2, 12, 28, 0.96)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: 12,
          padding: '18px 22px',
          color: 'var(--ui-text-primary)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.9)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 15, color: 'var(--color-star-white)', margin: 0 }}>
            ⌨️ Keyboard Navigation Shortcuts
          </h2>
          <button
            onClick={toggleShortcutsModal}
            style={{ background: 'none', border: 'none', color: 'var(--ui-text-dim)', fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5, fontFamily: 'var(--font-mono)' }}>
          <tbody>
            {shortcuts.map((s) => (
              <tr key={s.key} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <td style={{ padding: '8px 4px', width: 90 }}>
                  <span
                    style={{
                      background: 'rgba(59, 130, 246, 0.2)',
                      border: '1px solid rgba(59, 130, 246, 0.4)',
                      borderRadius: 4,
                      padding: '2px 6px',
                      color: 'var(--color-star-blue)',
                      fontWeight: 600,
                    }}
                  >
                    {s.key}
                  </span>
                </td>
                <td style={{ padding: '8px 4px', color: 'var(--ui-text-secondary)', fontFamily: 'var(--font-ui)' }}>
                  {s.desc}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button
            onClick={toggleShortcutsModal}
            style={{
              background: 'rgba(59, 130, 246, 0.3)',
              border: '1px solid var(--ui-accent)',
              borderRadius: 6,
              color: 'var(--color-star-white)',
              padding: '5px 14px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};
