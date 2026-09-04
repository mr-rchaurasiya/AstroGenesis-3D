/**
 * AboutPanel.tsx
 * About dialog providing project overview, scientific architecture attribution,
 * and pedagogical references for Cosmic Evolution Explorer.
 */

import React from 'react';
import { useEducationStore } from '../EducationState';

export const AboutPanel: React.FC = () => {
  const { showAboutModal, toggleAboutModal } = useEducationStore();

  if (!showAboutModal) return null;

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
      aria-label="About Cosmic Evolution Explorer"
    >
      <div
        style={{
          width: 500,
          maxWidth: '92vw',
          background: 'rgba(2, 12, 28, 0.96)',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: 12,
          padding: '20px 24px',
          color: 'var(--ui-text-primary)',
          fontFamily: 'var(--font-ui)',
          fontSize: 12,
          boxShadow: '0 16px 48px rgba(0, 0, 0, 0.9)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h2 style={{ fontSize: 16, color: 'var(--color-star-white)', margin: 0 }}>
            🌌 About Cosmic Evolution Explorer
          </h2>
          <button
            onClick={toggleAboutModal}
            style={{ background: 'none', border: 'none', color: 'var(--ui-text-dim)', fontSize: 18, cursor: 'pointer' }}
          >
            ✕
          </button>
        </div>

        <div style={{ color: 'var(--ui-text-secondary)', lineHeight: 1.5, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ margin: 0 }}>
            <strong>Cosmic Evolution Explorer</strong> is an interactive educational universe visualization platform
            combining rigorous reduced-order astrophysics with high-performance real-time 3D GPU graphics.
          </p>

          <div style={{ background: 'rgba(0, 20, 40, 0.6)', padding: '10px 12px', borderRadius: 6, border: '1px solid rgba(100, 160, 220, 0.2)' }}>
            <div style={{ color: 'var(--color-star-blue)', fontWeight: 600, fontSize: 11, marginBottom: 4, fontFamily: 'var(--font-mono)' }}>
              Astrophysical Modeling Foundation
            </div>
            <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11 }}>
              <li><strong>Stellar Physics:</strong> Stefan-Boltzmann, Eddington limit, and Morgan-Keenan spectral classification.</li>
              <li><strong>Star Birth:</strong> Isothermal Jeans instability, accretion decay, and Kelvin-Helmholtz ignition.</li>
              <li><strong>Stellar Evolution:</strong> Core hydrogen/helium kinetics, Reimers mass loss, and HR diagram tracks.</li>
              <li><strong>Remnants & Relativistic Physics:</strong> Chandrasekhar limit, Mestel cooling, TOV limit, and Schwarzschild geometry.</li>
            </ul>
          </div>

          <p style={{ margin: 0, fontSize: 11, color: 'var(--ui-text-dim)' }}>
            Designed for astronomy students, educators, and science enthusiasts worldwide.
          </p>
        </div>

        <div style={{ marginTop: 16, textAlign: 'right' }}>
          <button
            onClick={toggleAboutModal}
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
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
