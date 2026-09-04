/**
 * LoadingScreen.tsx
 * Fullscreen loading overlay shown while assets initialize.
 * Animates progress bar and fades out when complete.
 */

import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';

export function LoadingScreen() {
  const { isLoading, loadingProgress, setLoading, setLoadingProgress } = useAppStore();
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    if (!isLoading) return;

    // Simulate asset loading progress
    let progress = 0;
    const steps = [
      { target: 20,  delay: 100,  label: 'Initializing WebGL...' },
      { target: 45,  delay: 200,  label: 'Loading shaders...' },
      { target: 65,  delay: 150,  label: 'Generating starfield...' },
      { target: 85,  delay: 200,  label: 'Calibrating universe...' },
      { target: 100, delay: 300,  label: 'Ready.' },
    ];

    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx >= steps.length) {
        clearInterval(interval);
        setFadeOut(true);
        setTimeout(() => setLoading(false), 500);
        return;
      }

      const step = steps[stepIdx];
      progress = step.target;
      setLoadingProgress(progress);
      stepIdx++;
    }, steps[stepIdx]?.delay ?? 200);

    return () => clearInterval(interval);
  }, [isLoading, setLoading, setLoadingProgress]);

  if (!isLoading && !fadeOut) return null;

  return (
    <div
      className={`loading-screen${fadeOut ? ' fade-out' : ''}`}
      role="status"
      aria-live="polite"
      aria-label="Loading Cosmic Evolution Explorer"
    >
      {/* Cosmic logo mark */}
      <div style={{
        width: 64,
        height: 64,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(59,130,246,0.05) 60%, transparent 100%)',
        border: '1px solid rgba(59,130,246,0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 8,
        animation: 'pulse-dot 2s ease-in-out infinite',
      }}>
        <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
          <circle cx="16" cy="16" r="8" stroke="rgba(147,197,253,0.9)" strokeWidth="1.5" />
          <circle cx="16" cy="16" r="14" stroke="rgba(147,197,253,0.2)" strokeWidth="0.75" strokeDasharray="2 3" />
          <circle cx="16" cy="7" r="1.5" fill="rgba(251,191,36,0.9)" />
          <circle cx="25" cy="16" r="1" fill="rgba(147,197,253,0.7)" />
          <circle cx="10" cy="22" r="0.75" fill="rgba(147,197,253,0.5)" />
        </svg>
      </div>

      <div className="loading-title">Cosmic Evolution Explorer</div>
      <div className="loading-subtitle">Educational Universe Simulator</div>

      <div className="loading-bar-track" role="progressbar" aria-valuenow={loadingProgress} aria-valuemin={0} aria-valuemax={100}>
        <div
          className="loading-bar-fill"
          style={{ width: `${loadingProgress}%` }}
        />
      </div>

      <div className="loading-subtitle" style={{ marginTop: 4 }}>
        {loadingProgress < 100 ? `${loadingProgress}%` : 'Launching...'}
      </div>
    </div>
  );
}
