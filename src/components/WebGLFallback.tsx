/**
 * WebGL Fallback Component
 * Phase 12 - Performance, Polish & Production Hardening
 */

import React from 'react';

export const WebGLFallback: React.FC = () => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      width: '100vw',
      backgroundColor: '#05070c',
      color: '#e2e8f0',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem',
      textAlign: 'center',
      boxSizing: 'border-box',
    }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🪐</div>
      <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#38bdf8', marginBottom: '0.75rem' }}>
        3D Rendering Could Not Be Initialized
      </h1>
      <div style={{
        maxWidth: '520px',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '8px',
        padding: '1.5rem',
        textAlign: 'left',
        fontSize: '0.9rem',
        color: '#94a3b8',
        lineHeight: 1.6,
        marginBottom: '1.5rem',
      }}>
        <p style={{ margin: '0 0 0.75rem 0', fontWeight: 600, color: '#f8fafc' }}>
          Possible causes:
        </p>
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          <li>Hardware acceleration is disabled in your browser settings</li>
          <li>Your graphics drivers or GPU do not meet WebGL requirements</li>
          <li>Browser compatibility or memory restriction issues</li>
        </ul>
      </div>
      <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
        Please enable hardware acceleration in browser settings or try another modern browser.
      </p>
    </div>
  );
};
