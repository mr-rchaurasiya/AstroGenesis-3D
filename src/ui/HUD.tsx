/**
 * HUD.tsx
 * Heads-up display overlay. Contains the top bar, breadcrumbs,
 * controls hint, camera controls, and bottom status bar.
 * Phase 1-6: Universe, Galaxies, Milky Way, Solar System, Camera & Navigation.
 */

import { useState } from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { GalaxyInfoPanel } from './GalaxyInfoPanel';
import { MilkyWayInfoPanel } from './MilkyWayInfoPanel';
import { PlanetInfoPanel } from './PlanetInfoPanel';
import { SolarSystemControls } from './SolarSystemControls';
import { CameraControls } from './CameraControls';
import { CameraStatus } from './CameraStatus';
import { PerformanceMonitorOverlay } from './PerformanceMonitorOverlay';
import { ProjectGuideModal } from './ProjectGuideModal';
import { useAppStore, type GalaxyFilterType } from '../store/useAppStore';
import { GALAXY_PRESETS } from '../galaxy/galaxyPresets';
import {
  EducationalOverlay,
  EducationPanel,
  ConceptTooltip,
  HelpPanel,
  KeyboardShortcutsPanel,
  AboutPanel,
  useEducationStore,
} from '../education';

export function HUD() {
  const {
    navigationLevel,
    timeScale,
    isPaused,
    togglePause,
    setTimeScale,
    showEnvironmentSettings,
    toggleEnvironmentSettings,
    environmentQuality,
    setEnvironmentQuality,
    showNebulae,
    toggleNebulae,
    showCosmicDust,
    toggleCosmicDust,
    showDistantGalaxies,
    toggleDistantGalaxies,
    showCosmicWeb,
    toggleCosmicWeb,
    showGalaxySystem,
    toggleGalaxySystem,
    galaxyMorphologyFilter,
    setGalaxyMorphologyFilter,
    selectedGalaxy,
    setSelectedGalaxy,
    isMilkyWayMode,
    toggleMilkyWayMode,
    isSolarSystemMode,
    toggleSolarSystemMode,
  } = useAppStore();

  const [showPerfMonitor, setShowPerfMonitor] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const {
    toggleEducationPanel,
    showEducationPanel,
    setActiveEducationTab,
    toggleHelpModal,
    toggleShortcutsModal,
    toggleAboutModal,
  } = useEducationStore();

  const levelLabel: Record<string, string> = {
    'universe':      'Universe View',
    'galaxy-cluster':'Galaxy Cluster',
    'galaxy':        'Galaxy View',
    'solar-system':  'Solar System',
    'star':          'Star',
    'planet':        'Planet',
    'moon':          'Moon',
  };

  const starCountLabel: Record<string, string> = {
    low: '~34,000',
    medium: '~56,000',
    high: '~85,000',
    ultra: '~125,000',
  };

  const filters: { id: GalaxyFilterType; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: '🌌' },
    { id: 'spiral', label: 'Spirals', icon: '🌀' },
    { id: 'elliptical', label: 'Ellipticals', icon: '🟡' },
    { id: 'irregular', label: 'Irregulars', icon: '✨' },
    { id: 'dwarf', label: 'Dwarfs', icon: '⚪' },
  ];

  return (
    <div className="ui-overlay" role="complementary" aria-label="HUD overlay">
      {/* ── Floating Persistent Master Project Guide Button ────────── */}
      <button
        onClick={() => setShowGuideModal(true)}
        title="Open Master Project Guide & Interactive Tour (Project Me Kya Hai & Kaise Dekhein)"
        style={{
          position: 'fixed',
          top: '60px',
          left: '24px',
          zIndex: 40,
          pointerEvents: 'auto',
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.9) 0%, rgba(59, 130, 246, 0.95) 100%)',
          border: '1px solid #38bdf8',
          borderRadius: '20px',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '6px 14px',
          fontFamily: 'var(--font-ui)',
          fontSize: '11.5px',
          fontWeight: 700,
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          boxShadow: '0 4px 20px rgba(56, 189, 248, 0.45)',
          letterSpacing: '0.04em',
          transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'scale(1.04)';
          e.currentTarget.style.boxShadow = '0 6px 25px rgba(56, 189, 248, 0.6)';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 20px rgba(56, 189, 248, 0.45)';
        }}
      >
        <span>🚀</span>
        <span>PROJECT GUIDE & TOUR</span>
      </button>

      {/* ── Top Bar ──────────────────────────────────────────────── */}
      <header className="hud-top">
        <div className="hud-title">
          Cosmic Evolution Explorer
          <span>/ {isSolarSystemMode ? 'Solar System (Sol)' : selectedGalaxy ? selectedGalaxy.catalogName : (levelLabel[navigationLevel] ?? navigationLevel)}</span>
        </div>

        {/* ── Camera Controls Bar (Phase 6) ─────────────────────────── */}
        <CameraControls />

        {/* ── Educational Quick Explorer Buttons (Phase 11) ────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, pointerEvents: 'auto' }}>
          <button
            onClick={toggleEducationPanel}
            title="Toggle Cosmic Education & Science Drawer"
            style={{
              background: showEducationPanel ? 'rgba(59,130,246,0.35)' : 'rgba(1,10,20,0.85)',
              border: `1px solid ${showEducationPanel ? 'var(--color-star-blue)' : 'var(--ui-border)'}`,
              borderRadius: 4,
              color: showEducationPanel ? 'var(--color-star-white)' : 'var(--color-star-blue)',
              cursor: 'pointer',
              padding: '3px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              transition: 'all 0.15s ease',
            }}
          >
            <span>🔭</span>
            <span>Education</span>
          </button>

          <button
            onClick={() => setActiveEducationTab('TIMELINE')}
            title="Open Cosmic Time Explorer"
            style={{
              background: 'rgba(1,10,20,0.85)',
              border: '1px solid var(--ui-border)',
              borderRadius: 4,
              color: 'var(--color-star-gold)',
              cursor: 'pointer',
              padding: '3px 6px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          >
            ⏳ Time
          </button>

          <button
            onClick={() => setActiveEducationTab('HR')}
            title="Open Hertzsprung-Russell Diagram"
            style={{
              background: 'rgba(1,10,20,0.85)',
              border: '1px solid var(--ui-border)',
              borderRadius: 4,
              color: 'var(--ui-text-secondary)',
              cursor: 'pointer',
              padding: '3px 6px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
            }}
          >
            📊 HR
          </button>
        </div>

        {/* ── Morphology Filter Quick Bar (Phase 3) ────────────────── */}
        {!isSolarSystemMode && !isMilkyWayMode && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: 'rgba(1, 10, 20, 0.75)',
              border: '1px solid var(--ui-border)',
              borderRadius: 20,
              padding: '2px 6px',
              pointerEvents: 'auto',
            }}
          >
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setGalaxyMorphologyFilter(f.id)}
                title={`Filter galaxies by ${f.label}`}
                style={{
                  background: galaxyMorphologyFilter === f.id ? 'rgba(59,130,246,0.3)' : 'transparent',
                  border: galaxyMorphologyFilter === f.id ? '1px solid rgba(59,130,246,0.6)' : '1px solid transparent',
                  borderRadius: 14,
                  color: galaxyMorphologyFilter === f.id ? 'var(--color-star-blue)' : 'var(--ui-text-dim)',
                  cursor: 'pointer',
                  padding: '2px 8px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 9.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{f.icon}</span>
                <span>{f.label}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, pointerEvents: 'auto' }}>
          {/* Preset Galaxy Quick Switcher (when in universe mode) */}
          {!isSolarSystemMode && !isMilkyWayMode && (
            <select
              value={selectedGalaxy?.id ?? ''}
              onChange={(e) => {
                const found = GALAXY_PRESETS.find((p) => p.id === e.target.value);
                setSelectedGalaxy(found ?? null);
              }}
              title="Inspect Curated Galaxy Presets"
              style={{
                background: 'rgba(1,10,20,0.85)',
                border: '1px solid var(--ui-border)',
                borderRadius: 4,
                color: 'var(--color-star-blue)',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                padding: '3px 8px',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="">-- Inspect Preset --</option>
              {GALAXY_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.catalogName}
                </option>
              ))}
            </select>
          )}

          {/* Milky Way Mode Toggle Button (Phase 4) */}
          {!isSolarSystemMode && (
            <button
              onClick={toggleMilkyWayMode}
              title={isMilkyWayMode ? 'Exit to Universe View' : 'Enter Specialized Milky Way Mode'}
              aria-label="Toggle Milky Way Mode"
              style={{
                background: isMilkyWayMode ? 'rgba(0,229,255,0.25)' : 'rgba(1,10,20,0.85)',
                border: `1px solid ${isMilkyWayMode ? 'var(--ui-accent)' : 'var(--ui-border)'}`,
                borderRadius: 4,
                color: isMilkyWayMode ? '#64ffda' : 'var(--ui-accent)',
                cursor: 'pointer',
                padding: '4px 10px',
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                transition: 'all 0.15s ease',
              }}
            >
              <span>🌀</span>
              <span>{isMilkyWayMode ? 'Milky Way: ON' : 'Milky Way'}</span>
            </button>
          )}

          {/* Solar System Mode Toggle Button (Phase 5) */}
          <button
            onClick={toggleSolarSystemMode}
            title={isSolarSystemMode ? 'Exit to Galactic Scale' : 'Enter Detailed Solar System Simulation'}
            aria-label="Toggle Solar System Mode"
            style={{
              background: isSolarSystemMode ? 'rgba(234,179,8,0.25)' : 'rgba(1,10,20,0.85)',
              border: `1px solid ${isSolarSystemMode ? 'rgba(234,179,8,0.8)' : 'rgba(234,179,8,0.4)'}`,
              borderRadius: 4,
              color: isSolarSystemMode ? '#fef08a' : '#facc15',
              cursor: 'pointer',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <span>☀️</span>
            <span>{isSolarSystemMode ? 'Solar System: ON' : 'Solar System'}</span>
          </button>

          {/* Environment settings button */}
          <button
            onClick={toggleEnvironmentSettings}
            title="Configure Universe Environment Layers & Quality"
            aria-label="Toggle Environment Settings"
            style={{
              background: showEnvironmentSettings ? 'rgba(59,130,246,0.3)' : 'rgba(1,10,20,0.85)',
              border: `1px solid ${showEnvironmentSettings ? 'rgba(59,130,246,0.7)' : 'var(--ui-border)'}`,
              borderRadius: 4,
              color: showEnvironmentSettings ? 'var(--color-star-blue)' : 'var(--ui-text-secondary)',
              cursor: 'pointer',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              transition: 'all 0.15s ease',
            }}
          >
            <span>🌌</span>
            <span>Environment</span>
            <span style={{ opacity: 0.6, fontSize: 9 }}>[{environmentQuality.toUpperCase()}]</span>
          </button>

          {/* Time controls (Galactic/Universe scale) */}
          {!isSolarSystemMode && (
            <TimeControls
              timeScale={timeScale}
              isPaused={isPaused}
              onTogglePause={togglePause}
              onSetTimeScale={setTimeScale}
            />
          )}

          {/* Help & Guide button */}
          <button
            onClick={toggleHelpModal}
            title="Open User Guide & Controls"
            style={{
              background: 'rgba(1,10,20,0.85)',
              border: '1px solid var(--ui-border)',
              borderRadius: 4,
              color: 'var(--ui-text-dim)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            ❓
          </button>

          {/* Shortcuts button */}
          <button
            onClick={toggleShortcutsModal}
            title="Open Keyboard Shortcuts Reference"
            style={{
              background: 'rgba(1,10,20,0.85)',
              border: '1px solid var(--ui-border)',
              borderRadius: 4,
              color: 'var(--ui-text-dim)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            ⌨️
          </button>

          {/* Master Project Guide Button */}
          <button
            onClick={() => setShowGuideModal(true)}
            title="Open Master Project Guide & Interactive Tour"
            style={{
              background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.4) 0%, rgba(59, 130, 246, 0.5) 100%)',
              border: '1px solid rgba(56, 189, 248, 0.8)',
              borderRadius: 4,
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px 10px',
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 0 12px rgba(56, 189, 248, 0.4)',
              transition: 'all 0.15s ease',
            }}
          >
            <span>🚀</span>
            <span>Master Guide</span>
          </button>

          {/* Performance Monitor dialog button */}
          <button
            onClick={() => setShowPerfMonitor((prev) => !prev)}
            title="Toggle Performance & Diagnostics Monitor"
            style={{
              background: showPerfMonitor ? 'rgba(56,189,248,0.3)' : 'rgba(1,10,20,0.85)',
              border: `1px solid ${showPerfMonitor ? 'rgba(56,189,248,0.8)' : 'var(--ui-border)'}`,
              borderRadius: 4,
              color: showPerfMonitor ? '#38bdf8' : 'var(--ui-text-dim)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            ⚡
          </button>

          {/* About dialog button */}
          <button
            onClick={toggleAboutModal}
            title="About Cosmic Evolution Explorer"
            style={{
              background: 'rgba(1,10,20,0.85)',
              border: '1px solid var(--ui-border)',
              borderRadius: 4,
              color: 'var(--ui-text-dim)',
              cursor: 'pointer',
              padding: '4px 8px',
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
            }}
          >
            ℹ️
          </button>

          <div className="phase-badge" style={{ color: '#38bdf8', borderColor: 'rgba(56,189,248,0.4)' }}>
            Phase 12 · Performance & Polish
          </div>
        </div>
      </header>

      {/* ── Master Project Guide Modal ─────────────────────────────── */}
      {showGuideModal && (
        <ProjectGuideModal onClose={() => setShowGuideModal(false)} />
      )}

      {/* ── Performance Monitor Overlay ───────────────────────────── */}
      {showPerfMonitor && (
        <PerformanceMonitorOverlay onClose={() => setShowPerfMonitor(false)} />
      )}

      {/* ── Environment Settings Panel (Dropdown) ────────────────── */}
      {showEnvironmentSettings && (
        <aside
          className="glass-panel fade-in"
          style={{
            position: 'absolute',
            top: 58,
            right: 24,
            width: 270,
            padding: 16,
            zIndex: 30,
            pointerEvents: 'auto',
          }}
          aria-label="Environment Layers and Quality Controls"
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--color-star-blue)' }}>
              Subsystems & Quality
            </span>
            <button
              onClick={toggleEnvironmentSettings}
              style={{ background: 'none', border: 'none', color: 'var(--ui-text-dim)', cursor: 'pointer', fontSize: 12 }}
            >
              ✕
            </button>
          </div>

          {/* Quality switcher */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ui-text-dim)', marginBottom: 6, textTransform: 'uppercase' }}>
              Quality Preset (LOD & Star Count)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
              {(['low', 'medium', 'high', 'ultra'] as const).map((q) => (
                <button
                  key={q}
                  onClick={() => setEnvironmentQuality(q)}
                  style={{
                    background: environmentQuality === q ? 'rgba(59,130,246,0.3)' : 'rgba(100,160,220,0.06)',
                    border: `1px solid ${environmentQuality === q ? 'rgba(59,130,246,0.7)' : 'rgba(100,160,220,0.15)'}`,
                    borderRadius: 3,
                    color: environmentQuality === q ? 'var(--color-star-blue)' : 'var(--ui-text-dim)',
                    padding: '3px 0',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 9,
                    textTransform: 'uppercase',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Layer toggles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ui-text-dim)', marginBottom: 2, textTransform: 'uppercase' }}>
              Active Visual Layers
            </div>

            <LayerToggle label="Galaxy System (Phase 3)" active={showGalaxySystem} onToggle={toggleGalaxySystem} icon="🌀" />
            <LayerToggle label="Nebula Clouds" active={showNebulae} onToggle={toggleNebulae} icon="☁️" />
            <LayerToggle label="Cosmic Dust" active={showCosmicDust} onToggle={toggleCosmicDust} icon="✨" />
            <LayerToggle label="Distant Galaxies" active={showDistantGalaxies} onToggle={toggleDistantGalaxies} icon="🌌" />
            <LayerToggle label="Cosmic Web Filaments" active={showCosmicWeb} onToggle={toggleCosmicWeb} icon="🕸️" />
          </div>
        </aside>
      )}

      {/* ── Solar System Interactive Controls & Info Panel (Phase 5) ── */}
      {isSolarSystemMode && (
        <>
          <SolarSystemControls />
          <PlanetInfoPanel />
        </>
      )}

      {/* ── Scientific Milky Way Information Panel (Phase 4) ────────── */}
      {!isSolarSystemMode && isMilkyWayMode && <MilkyWayInfoPanel />}

      {/* ── Scientific Galaxy Information Panel (Phase 3) ────────── */}
      {!isSolarSystemMode && !isMilkyWayMode && <GalaxyInfoPanel />}

      {/* ── Breadcrumbs ───────────────────────────────────────────── */}
      <Breadcrumbs />

      {/* ── Phase 11 Educational Overlay & Systems ────────────────── */}
      <EducationalOverlay />
      <EducationPanel />
      <ConceptTooltip />
      <HelpPanel />
      <KeyboardShortcutsPanel />
      <AboutPanel />

      {/* ── Controls Hint (bottom-right) ─────────────────────────── */}
      <aside className="controls-hint" aria-label="Keyboard and mouse controls">
        <div className="hint-item">
          <span className="hint-key">Click</span>
          <span>Select Object</span>
        </div>
        <div className="hint-item">
          <span className="hint-key">2x Click / F</span>
          <span>Focus & Follow</span>
        </div>
        <div className="hint-item">
          <span className="hint-key">W / S</span>
          <span>Zoom In / Out</span>
        </div>
        <div className="hint-item">
          <span className="hint-key">A / D / Q / E</span>
          <span>Orbit Yaw & Pitch</span>
        </div>
        <div className="hint-item">
          <span className="hint-key">R / ESC</span>
          <span>Reset / Free Mode</span>
        </div>
      </aside>

      {/* ── Bottom Status Bar ─────────────────────────────────────── */}
      <footer className="hud-bottom">
        <div className="status-item">
          <CameraStatus />
        </div>
        <div className="status-item">
          <span>Quality: {environmentQuality.toUpperCase()} ({starCountLabel[environmentQuality]} stars)</span>
        </div>
        <div className="status-item" style={{ marginLeft: 'auto', color: '#38bdf8' }}>
          <span>Phase 12 · Performance, Polish & Production Hardening</span>
        </div>
      </footer>
    </div>
  );
}

// ── Layer Toggle Component ───────────────────────────────────────────────────

function LayerToggle({
  label,
  active,
  onToggle,
  icon,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  icon: string;
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '5px 8px',
        borderRadius: 4,
        background: active ? 'rgba(59,130,246,0.1)' : 'rgba(0,4,8,0.4)',
        border: `1px solid ${active ? 'rgba(59,130,246,0.35)' : 'rgba(100,160,220,0.1)'}`,
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all 0.15s ease',
      }}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: active ? 'var(--ui-text-primary)' : 'var(--ui-text-dim)' }}>
        <span>{icon}</span>
        <span style={{ fontFamily: 'var(--font-ui)' }}>{label}</span>
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          padding: '2px 5px',
          borderRadius: 3,
          background: active ? 'rgba(34,211,238,0.2)' : 'rgba(100,160,220,0.1)',
          color: active ? 'var(--ui-success)' : 'var(--ui-text-dim)',
          fontWeight: 700,
        }}
      >
        {active ? 'ON' : 'OFF'}
      </span>
    </div>
  );
}

// ── Time Controls ─────────────────────────────────────────────────────────────

interface TimeControlsProps {
  timeScale: number;
  isPaused: boolean;
  onTogglePause: () => void;
  onSetTimeScale: (s: number) => void;
}

function TimeControls({ timeScale, isPaused, onTogglePause, onSetTimeScale }: TimeControlsProps) {
  const presets = [1, 100, 1e4, 1e6, 1e8];

  const formatScale = (s: number) => {
    if (s < 1000) return `${s}×`;
    if (s < 1e6) return `${(s / 1000).toFixed(0)}K×`;
    if (s < 1e9) return `${(s / 1e6).toFixed(0)}M×`;
    return `${(s / 1e9).toFixed(0)}G×`;
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
      }}
    >
      <button
        onClick={onTogglePause}
        title={isPaused ? 'Resume simulation' : 'Pause simulation'}
        aria-label={isPaused ? 'Resume simulation' : 'Pause simulation'}
        style={{
          background: 'rgba(59,130,246,0.15)',
          border: '1px solid rgba(59,130,246,0.35)',
          borderRadius: 4,
          color: 'var(--color-star-blue)',
          cursor: 'pointer',
          padding: '3px 8px',
          fontFamily: 'inherit',
          fontSize: 11,
          transition: 'background 0.15s',
        }}
      >
        {isPaused ? '▶' : '⏸'}
      </button>

      {presets.map((p) => (
        <button
          key={p}
          onClick={() => onSetTimeScale(p)}
          title={`Set time scale to ${formatScale(p)}`}
          style={{
            background: timeScale === p
              ? 'rgba(59,130,246,0.3)'
              : 'rgba(59,130,246,0.08)',
            border: `1px solid ${timeScale === p ? 'rgba(59,130,246,0.6)' : 'rgba(59,130,246,0.2)'}`,
            borderRadius: 3,
            color: timeScale === p ? 'var(--color-star-blue)' : 'var(--ui-text-dim)',
            cursor: 'pointer',
            padding: '2px 6px',
            fontFamily: 'inherit',
            fontSize: 10,
            letterSpacing: '0.04em',
            transition: 'all 0.15s',
          }}
        >
          {formatScale(p)}
        </button>
      ))}
    </div>
  );
}
