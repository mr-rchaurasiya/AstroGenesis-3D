/**
 * HelpPanel.tsx
 * Help and user guide modal dialog explaining camera navigation, time controls,
 * educational modes, scale traversal, and scientific panels.
 */

import React from 'react';
import { useEducationStore } from '../EducationState';

export const HelpPanel: React.FC = () => {
  const { showHelpModal, toggleHelpModal } = useEducationStore();

  if (!showHelpModal) return null;

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
      aria-label="Cosmic Explorer Help & User Guide"
    >
      <div
        style={{
          width: 580,
          maxWidth: '92vw',
          maxHeight: '85vh',
          background: 'rgba(2, 12, 28, 0.96)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: 12,
          padding: '20px 24px',
          color: 'var(--ui-text-primary)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          overflowY: 'auto',
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.9), 0 0 24px rgba(59, 130, 246, 0.2)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, color: 'var(--color-star-white)', margin: 0 }}>
            🔭 Cosmic Evolution Explorer — User Guide
          </h2>
          <button
            onClick={toggleHelpModal}
            style={{ background: 'none', border: 'none', color: 'var(--ui-text-dim)', fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, color: 'var(--ui-text-secondary)', lineHeight: 1.5 }}>
          <div>
            <h3 style={{ fontSize: 13, color: 'var(--color-star-blue)', margin: '0 0 4px 0' }}>
              1. Multi-Scale Navigation
            </h3>
            <p style={{ margin: 0 }}>
              Use the <strong>Breadcrumbs bar</strong> at the top left to seamlessly traverse between hierarchical levels:
              Universe → Galaxy Cluster → Galaxy → Solar System → Star → Planet → Moon.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 13, color: 'var(--color-star-blue)', margin: '0 0 4px 0' }}>
              2. Camera Controls
            </h3>
            <p style={{ margin: 0 }}>
              • <strong>Left Click + Drag:</strong> Orbit and rotate view.<br />
              • <strong>Right Click + Drag:</strong> Pan camera translation.<br />
              • <strong>Scroll Wheel:</strong> Zoom in and out with adaptive speed scaling.<br />
              • <strong>Double Click on Object:</strong> Smoothly frame and lock camera focus.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 13, color: 'var(--color-star-blue)', margin: '0 0 4px 0' }}>
              3. Cosmic Time Explorer & Simulation Clock
            </h3>
            <p style={{ margin: 0 }}>
              Open the <strong>Timeline</strong> tab to scrub across 13.8 billion years of cosmic history from the Big Bang to the Degenerate Era. Use the play/pause and time-multiplier buttons to accelerate orbital dynamics.
            </p>
          </div>

          <div>
            <h3 style={{ fontSize: 13, color: 'var(--color-star-blue)', margin: '0 0 4px 0' }}>
              4. Educational Panels & Concept Tooltips
            </h3>
            <p style={{ margin: 0 }}>
              • <strong>Learn Mode:</strong> Guided interactive astrophysical lessons.<br />
              • <strong>Scientific Data:</strong> Exact quantitative equations, densities, and event horizon metrics.<br />
              • <strong>Compare:</strong> Side-by-side comparative object analyzer.<br />
              • <strong>HR Diagram:</strong> Interactive Hertzsprung-Russell temperature-luminosity diagnostic plot.<br />
              • <strong>Tooltips:</strong> Click any underlined scientific term for concise pop-up definitions.
            </p>
          </div>
        </div>

        <div style={{ marginTop: 18, textAlign: 'right' }}>
          <button
            onClick={toggleHelpModal}
            style={{
              background: 'rgba(59, 130, 246, 0.3)',
              border: '1px solid var(--ui-accent)',
              borderRadius: 6,
              color: 'var(--color-star-white)',
              padding: '6px 16px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              cursor: 'pointer',
            }}
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
