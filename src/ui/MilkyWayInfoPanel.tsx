/**
 * MilkyWayInfoPanel.tsx
 * Scientific information overlay for the Milky Way Galaxy and its subregions.
 * Provides physical metrics, morphological breakdown, and interactive region focusing.
 */

import { useAppStore } from '../store/useAppStore';
import { MILKY_WAY_REGIONS } from '../milkyway/MilkyWayConfig';

export function MilkyWayInfoPanel() {
  const isMilkyWayMode = useAppStore((s) => s.isMilkyWayMode);
  const selectedRegion = useAppStore((s) => s.selectedMilkyWayRegion);
  const setSelectedMilkyWayRegion = useAppStore((s) => s.setSelectedMilkyWayRegion);
  const showMilkyWayArms = useAppStore((s) => s.showMilkyWayArms);
  const toggleMilkyWayArms = useAppStore((s) => s.toggleMilkyWayArms);
  const showSolarAnchor = useAppStore((s) => s.showSolarNeighborhoodAnchor);
  const toggleSolarNeighborhoodAnchor = useAppStore((s) => s.toggleSolarNeighborhoodAnchor);
  const exitMilkyWayMode = useAppStore((s) => s.exitMilkyWayMode);

  if (!isMilkyWayMode) return null;

  const currentRegionInfo = MILKY_WAY_REGIONS.find((r) => r.id === selectedRegion);

  return (
    <aside
      className="glass-panel fade-in"
      style={{
        position: 'absolute',
        top: 64,
        left: 24,
        width: 320,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        padding: 16,
        zIndex: 30,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      aria-label="Milky Way Scientific Information"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          borderBottom: '1px solid var(--ui-border)',
          paddingBottom: 10,
        }}
      >
        <div>
          <div
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              color: 'var(--ui-accent)',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
            }}
          >
            Specialized Galaxy · SBbc Barred Spiral
          </div>
          <h2
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--color-star-white)',
              marginTop: 2,
            }}
          >
            Milky Way Galaxy
          </h2>
        </div>
        <button
          onClick={exitMilkyWayMode}
          className="hud-btn"
          style={{ padding: '2px 8px', fontSize: 10 }}
          title="Exit Milky Way Mode to Universe View"
        >
          Exit
        </button>
      </div>

      {/* ── Core Physical Parameters ────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 6,
          fontFamily: 'var(--font-mono)',
          fontSize: 10,
        }}
      >
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 4 }}>
          <span style={{ color: 'var(--ui-muted)', fontSize: 9 }}>Diameter</span>
          <div style={{ color: 'var(--color-star-white)', fontWeight: 600 }}>~100,000 ly (30 kpc)</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 4 }}>
          <span style={{ color: 'var(--ui-muted)', fontSize: 9 }}>Total Mass</span>
          <div style={{ color: 'var(--color-star-white)', fontWeight: 600 }}>~1.15 × 10¹² M☉</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 4 }}>
          <span style={{ color: 'var(--ui-muted)', fontSize: 9 }}>Stellar Count</span>
          <div style={{ color: 'var(--color-star-white)', fontWeight: 600 }}>~100–400 Billion</div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.03)', padding: '6px 8px', borderRadius: 4 }}>
          <span style={{ color: 'var(--ui-muted)', fontSize: 9 }}>Solar Distance (R₀)</span>
          <div style={{ color: 'var(--ui-warning)', fontWeight: 600 }}>~8.0 kpc (26,000 ly)</div>
        </div>
      </div>

      {/* ── Region Navigation Selector ───────────────────────────── */}
      <div>
        <div
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            color: 'var(--ui-muted)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: 6,
          }}
        >
          Galactic Regions & Arms
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {MILKY_WAY_REGIONS.map((r) => {
            const isSelected = selectedRegion === r.id;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedMilkyWayRegion(r.id)}
                className={`hud-btn ${isSelected ? 'active' : ''}`}
                style={{
                  fontSize: 9.5,
                  padding: '3px 7px',
                  borderColor: isSelected ? 'var(--ui-accent)' : undefined,
                  background: isSelected ? 'rgba(0, 229, 255, 0.15)' : undefined,
                }}
              >
                {r.name.split(' (')[0]}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Selected Region Detailed Breakdown ───────────────────── */}
      {currentRegionInfo && (
        <div
          style={{
            background: 'rgba(0, 229, 255, 0.05)',
            border: '1px solid rgba(0, 229, 255, 0.25)',
            borderRadius: 6,
            padding: 10,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700, color: 'var(--color-star-white)' }}>
              {currentRegionInfo.name}
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ui-accent)' }}>
              {currentRegionInfo.galactocentricRadiusKpc} kpc
            </span>
          </div>

          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 10.5, color: 'rgba(255,255,255,0.85)', lineHeight: 1.45, margin: 0 }}>
            {currentRegionInfo.description}
          </p>

          <div style={{ display: 'flex', gap: 10, marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: 9 }}>
            <div>
              <span style={{ color: 'var(--ui-muted)' }}>Population: </span>
              <span style={{ color: 'var(--color-star-white)', textTransform: 'capitalize' }}>
                {currentRegionInfo.stellarPopulationType}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--ui-muted)' }}>Activity: </span>
              <span style={{ color: currentRegionInfo.starFormationActivity === 'active' ? '#69f0ae' : '#ffb74d', textTransform: 'capitalize' }}>
                {currentRegionInfo.starFormationActivity}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ── Layer Toggles ────────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          gap: 6,
          borderTop: '1px solid var(--ui-border)',
          paddingTop: 8,
        }}
      >
        <button
          onClick={toggleMilkyWayArms}
          className={`hud-btn ${showMilkyWayArms ? 'active' : ''}`}
          style={{ flex: 1, fontSize: 9.5, padding: '4px 6px' }}
        >
          {showMilkyWayArms ? '✓ Arm Guides' : 'Arm Guides'}
        </button>
        <button
          onClick={toggleSolarNeighborhoodAnchor}
          className={`hud-btn ${showSolarAnchor ? 'active' : ''}`}
          style={{ flex: 1, fontSize: 9.5, padding: '4px 6px' }}
        >
          {showSolarAnchor ? '✓ Solar Anchor' : 'Solar Anchor'}
        </button>
      </div>

      {/* ── Scientific Disclaimer ────────────────────────────────── */}
      <div
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 8.5,
          color: 'var(--ui-muted)',
          lineHeight: 1.35,
          borderTop: '1px solid rgba(255,255,255,0.06)',
          paddingTop: 6,
        }}
      >
        * Educational scientific approximation. Galactic parameters and arm positions are observationally inspired models.
      </div>
    </aside>
  );
}
