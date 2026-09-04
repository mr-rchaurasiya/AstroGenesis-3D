/**
 * GalaxyInfoPanel.tsx
 * Scientific information overlay for the currently selected galaxy.
 * Displays physical estimates, morphological metrics, and cluster relationships.
 */

import { useAppStore } from '../store/useAppStore';

export function GalaxyInfoPanel() {
  const selectedGalaxy = useAppStore((s) => s.selectedGalaxy);
  const clearSelectedGalaxy = useAppStore((s) => s.clearSelectedGalaxy);

  if (!selectedGalaxy) return null;

  const p = selectedGalaxy.parameters;

  const formatSci = (n: number) => {
    if (n >= 1e12) return `${(n / 1e12).toFixed(2)} × 10¹²`;
    if (n >= 1e9) return `${(n / 1e9).toFixed(2)} × 10⁹`;
    if (n >= 1e6) return `${(n / 1e6).toFixed(2)} × 10⁶`;
    return n.toLocaleString();
  };

  const morphologyLabels: Record<string, string> = {
    'spiral': 'Grand Spiral Galaxy',
    'barred-spiral': 'Barred Spiral Galaxy',
    'elliptical': 'Spheroidal Elliptical Galaxy',
    'irregular': 'Asymmetric Irregular Galaxy',
    'dwarf-spheroidal': 'Dwarf Spheroidal Galaxy',
    'dwarf-irregular': 'Dwarf Irregular Galaxy',
  };

  return (
    <aside
      className="glass-panel fade-in"
      style={{
        position: 'absolute',
        top: 64,
        left: 24,
        width: 310,
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        padding: 16,
        zIndex: 25,
        pointerEvents: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
      }}
      aria-label="Galaxy Scientific Information"
    >
      {/* ── Header ──────────────────────────────────────────────── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--ui-border)', paddingBottom: 10 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ui-success)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            {selectedGalaxy.id} · {selectedGalaxy.subtype}
          </div>
          <h2 style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 700, color: 'var(--color-star-white)', marginTop: 2 }}>
            {selectedGalaxy.catalogName}
          </h2>
          <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--color-star-blue)', marginTop: 1 }}>
            {morphologyLabels[selectedGalaxy.morphology]}
          </div>
        </div>
        <button
          onClick={clearSelectedGalaxy}
          title="Deselect galaxy"
          aria-label="Close information panel"
          style={{
            background: 'rgba(100,160,220,0.1)',
            border: '1px solid var(--ui-border)',
            borderRadius: 3,
            color: 'var(--ui-text-dim)',
            cursor: 'pointer',
            padding: '2px 6px',
            fontSize: 10,
          }}
        >
          ✕
        </button>
      </div>

      {/* ── Primary Astrophysical Estimates ───────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ui-text-dim)', textTransform: 'uppercase' }}>
          Astrophysical Estimates (Representative)
        </div>

        <InfoRow label="Estimated Mass" value={`${formatSci(p.massSolar)} M☉`} />
        <InfoRow label="Estimated Radius" value={`${p.radiusKpc.toFixed(1)} kpc (${(p.radiusKpc * 3262).toLocaleString()} ly)`} />
        <InfoRow label="Est. Stellar Count" value={`${formatSci(p.starCountEstimate)} stars`} />
        <InfoRow label="Est. Luminosity" value={`${formatSci(p.luminositySolar)} L☉`} />
        {selectedGalaxy.clusterName && (
          <InfoRow label="Cluster Member" value={selectedGalaxy.clusterName} highlight />
        )}
      </div>

      {/* ── Structural & Morphological Metrics ────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, borderTop: '1px solid var(--ui-border)', paddingTop: 10 }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--ui-text-dim)', textTransform: 'uppercase' }}>
          Morphology & Kinematics
        </div>

        {p.armCount > 0 && <InfoRow label="Spiral Arms" value={`${p.armCount} Major Arms`} />}
        {p.barLengthRatio > 0 && <InfoRow label="Stellar Bar" value={`${(p.barLengthRatio * 100).toFixed(0)}% radius`} />}
        {p.ellipticity > 0 && <InfoRow label="Ellipticity" value={`E${(p.ellipticity * 10).toFixed(0)} (ε = ${p.ellipticity.toFixed(2)})`} />}
        <InfoRow label="Bulge Fraction" value={`${(p.bulgeRatio * 100).toFixed(0)}%`} />
        <InfoRow label="Viewing Inclination" value={`${((p.inclination * 180) / Math.PI).toFixed(1)}°`} />
        <InfoRow label="Rotation Speed" value={`${p.rotationSpeed.toFixed(2)}× relative`} />
        <InfoRow label="Procedural Seed" value={`#${p.seed}`} />
      </div>

      {/* ── Specialized Milky Way Mode Entry Button ──────────────── */}
      {(selectedGalaxy.id === 'GAL-002' || selectedGalaxy.catalogName.includes('Milky Way')) && (
        <button
          onClick={() => {
            useAppStore.getState().enterMilkyWayMode();
          }}
          className="hud-btn active"
          style={{
            background: 'rgba(0, 229, 255, 0.2)',
            borderColor: 'var(--ui-accent)',
            color: '#64ffda',
            padding: '7px 10px',
            fontSize: 10.5,
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            width: '100%',
          }}
        >
          <span>🌀</span>
          <span>Explore Milky Way Structure →</span>
        </button>
      )}

      {/* ── Scientific Disclaimer Notice ──────────────────────────── */}
      <div
        style={{
          background: 'rgba(59,130,246,0.06)',
          border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 4,
          padding: '6px 8px',
          fontFamily: 'var(--font-mono)',
          fontSize: 8.5,
          color: 'var(--ui-text-dim)',
          lineHeight: 1.4,
        }}
      >
        <span style={{ color: 'var(--color-star-blue)', fontWeight: 700 }}>SYNTHETIC MODEL: </span>
        All parameters are deterministic procedural approximations based on density-wave & Sérsic astrophysical profiles.
      </div>
    </aside>
  );
}

function InfoRow({ label, value, highlight = false }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 10 }}>
      <span style={{ color: 'var(--ui-text-secondary)', fontFamily: 'var(--font-ui)' }}>{label}</span>
      <span style={{ color: highlight ? 'var(--ui-success)' : 'var(--ui-text-primary)', fontFamily: 'var(--font-mono)', fontWeight: 500 }}>
        {value}
      </span>
    </div>
  );
}
