/**
 * ProjectGuideModal.tsx
 * Comprehensive Project Guide & Interactive Explorer Tour
 * Explains project features, celestial catalogue, Solar System & Earth guide, step-by-step navigation, and educational value.
 */

import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useEducationStore } from '../education/EducationState';

interface Props {
  onClose: () => void;
}

type GuideTab = 'OVERVIEW' | 'SOLAR_SYSTEM' | 'STEPS' | 'EDUCATION' | 'CONTROLS';

export const ProjectGuideModal: React.FC<Props> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<GuideTab>('OVERVIEW');

  const {
    isSolarSystemMode,
    toggleSolarSystemMode,
    isMilkyWayMode,
    toggleMilkyWayMode,
    selectSolarBody,
    focusObject,
  } = useAppStore();

  const {
    toggleEducationPanel,
    setActiveEducationTab,
  } = useEducationStore();

  const handleJumpToSolarSystem = () => {
    if (!isSolarSystemMode) toggleSolarSystemMode();
    onClose();
  };

  const handleJumpToMilkyWay = () => {
    if (!isMilkyWayMode) toggleMilkyWayMode();
    onClose();
  };

  const handleFocusEarth = () => {
    if (!isSolarSystemMode) toggleSolarSystemMode();
    selectSolarBody('earth');
    focusObject('earth');
    onClose();
  };

  const handleFocusSaturn = () => {
    if (!isSolarSystemMode) toggleSolarSystemMode();
    selectSolarBody('saturn');
    focusObject('saturn');
    onClose();
  };

  const handleFocusJupiter = () => {
    if (!isSolarSystemMode) toggleSolarSystemMode();
    selectSolarBody('jupiter');
    focusObject('jupiter');
    onClose();
  };

  const handleFocusSun = () => {
    if (!isSolarSystemMode) toggleSolarSystemMode();
    selectSolarBody('sun');
    focusObject('sun');
    onClose();
  };

  const handleOpenTimeline = () => {
    setActiveEducationTab('TIMELINE');
    toggleEducationPanel();
    onClose();
  };

  const handleOpenHRDiagram = () => {
    setActiveEducationTab('HR');
    toggleEducationPanel();
    onClose();
  };

  const handleOpenLifecycle = () => {
    setActiveEducationTab('LIFECYCLE');
    toggleEducationPanel();
    onClose();
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(2, 6, 18, 0.85)',
        backdropFilter: 'blur(16px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '920px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          backgroundColor: 'rgba(15, 23, 42, 0.96)',
          border: '1px solid rgba(56, 189, 248, 0.4)',
          borderRadius: '14px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85), 0 0 30px rgba(56, 189, 248, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#f8fafc',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Modal Header ────────────────────────────────────────────── */}
        <div
          style={{
            padding: '16px 24px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.15) 0%, transparent 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '26px' }}>🚀</span>
            <div>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.03em' }}>
                COSMIC EVOLUTION EXPLORER — MASTER GUIDE
              </h2>
              <p style={{ margin: 0, fontSize: '12px', color: '#94a3b8' }}>
                Complete Project Overview, Solar System Guide, Celestial Inventory & Controls
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '6px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '16px',
              padding: '6px 12px',
              transition: 'all 0.15s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = '#ffffff')}
            onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
          >
            ✕
          </button>
        </div>

        {/* ── Navigation Tabs ─────────────────────────────────────────── */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            padding: '0 12px',
            overflowX: 'auto',
          }}
        >
          {[
            { id: 'OVERVIEW', label: '🌌 1. Project Overview', desc: 'Kya-Kya Modules Hain' },
            { id: 'SOLAR_SYSTEM', label: '☀️ 2. Solar System & Earth Guide', desc: 'Planets, Moons, Belts & Framing' },
            { id: 'STEPS', label: '🧭 3. Step-by-Step Guide', desc: 'Kaise Dekhein & Teleport' },
            { id: 'EDUCATION', label: '🎓 4. Educational Value', desc: 'Real Physics & Formulas' },
            { id: 'CONTROLS', label: '⌨️ 5. Controls & Shortcuts', desc: 'Zoom & Pan Mouse Keys' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as GuideTab)}
              style={{
                padding: '10px 16px',
                background: 'none',
                border: 'none',
                borderBottom: activeTab === tab.id ? '2px solid #38bdf8' : '2px solid transparent',
                color: activeTab === tab.id ? '#38bdf8' : '#94a3b8',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '12.5px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: '2px',
                whiteSpace: 'nowrap',
              }}
            >
              <span>{tab.label}</span>
              <span style={{ fontSize: '10px', color: activeTab === tab.id ? '#7dd3fc' : '#64748b' }}>
                {tab.desc}
              </span>
            </button>
          ))}
        </div>

        {/* ── Tab Content Body ─────────────────────────────────────────── */}
        <div
          style={{
            padding: '22px 26px',
            overflowY: 'auto',
            flex: 1,
            lineHeight: 1.6,
            fontSize: '13.5px',
          }}
        >
          {/* ── TAB 1: OVERVIEW ── */}
          {activeTab === 'OVERVIEW' && (
            <div>
              <h3 style={{ color: '#7dd3fc', marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
                🌌 Is Project Me Kya-Kya Modules & Features Hain?
              </h3>
              <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
                <strong>Cosmic Evolution Explorer</strong> ek production-grade, scientifically accurate astronomy simulator hai jisme deep cosmic web se lekar atomic stellar physics tak har scale ko seamlessly connect kiya gaya hai:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '6px' }}>
                    1. 🪐 6 Hierarchical Cosmic Scales
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                    Observable Universe (100 Mpc) $\to$ Galaxy Clusters $\to$ Milky Way $\to$ Solar System $\to$ Stars $\to$ Compact Remnants (11.5 km). Seamless zooming without coordinate jitter.
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontWeight: 700, color: '#facc15', marginBottom: '6px' }}>
                    2. ☀️ Full Solar System Engine (Phase 5)
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                    Sun, 8 Planets with GLSL surface shaders & atmospheres, Moons, Asteroid Belt, Kuiper Belt, Dwarf planets, aur Comets with accurate Keplerian orbits.
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontWeight: 700, color: '#f472b6', marginBottom: '6px' }}>
                    3. 🌟 Complete Stellar Lifecycle Physics (Phases 7–10)
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                    <strong>Birth:</strong> Jeans Instability & Protostars.<br />
                    <strong>Evolution:</strong> Main Sequence, Red Giants, AGB.<br />
                    <strong>Death:</strong> Supernovae, Planetary Nebulae, White Dwarfs, Pulsars, & Relativistic Black Holes.
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '14px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <div style={{ fontWeight: 700, color: '#4ade80', marginBottom: '6px' }}>
                    4. 📊 Interactive Educational Suite (Phase 11)
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                    Interactive HR Diagram, 13.8-billion-year Cosmic Timeline, Side-by-Side Comparison Analyzer, Quantitative Scientific Formulas, and Guided Lessons.
                  </div>
                </div>
              </div>

              <div style={{ background: 'rgba(56, 189, 248, 0.1)', border: '1px solid rgba(56, 189, 248, 0.3)', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontWeight: 600, color: '#38bdf8', marginBottom: '4px' }}>⚡ Performance & Production Hardening (Phase 12):</div>
                <div style={{ color: '#cbd5e1', fontSize: '12.5px' }}>
                  Auto-Quality Engine with Anti-Oscillation Hysteresis (3.0s dwell time), 4-tier Distance LOD, Zero-Leak Memory Disposal, and React Error Boundaries for maximum stability.
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 2: SOLAR SYSTEM & EARTH DETAIL GUIDE ── */}
          {activeTab === 'SOLAR_SYSTEM' && (
            <div>
              <h3 style={{ color: '#facc15', marginTop: 0, marginBottom: '12px', fontSize: '16px' }}>
                ☀️ Solar System, Earth, Moons, Belts & Scale Guide
              </h3>

              <p style={{ color: '#cbd5e1', marginBottom: '16px' }}>
                Solar System simulation me hamare saare celestial bodies completely active hain:
              </p>

              {/* Celestial Inventory Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>🌍 Earth (Terra) & The Moon</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                    Authentic oceans, procedural continents, dynamic atmospheric Rayleigh scattering shader, cloud layer rotation, 23.4° axial tilt, aur Moon (Luna) orbiting at 384,400 km.
                  </div>
                  <button
                    onClick={handleFocusEarth}
                    style={{ marginTop: '8px', padding: '4px 10px', fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#7dd3fc', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }}
                  >
                    🌍 Focus On Earth (Terra)
                  </button>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #facc15' }}>
                  <div style={{ fontWeight: 700, color: '#facc15', marginBottom: '4px' }}>🪐 8 Planets & Rings</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                    Mercury, Venus, Earth, Mars, Jupiter (Galilean moons), Saturn with Cassini division rings, Uranus, aur Neptune — sabhi Keplerian elliptical orbits follow karte hain.
                  </div>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    <button
                      onClick={handleFocusSaturn}
                      style={{ padding: '3px 8px', fontSize: '10.5px', background: 'rgba(234, 179, 8, 0.2)', border: '1px solid #eab308', color: '#fef08a', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      🪐 Saturn
                    </button>
                    <button
                      onClick={handleFocusJupiter}
                      style={{ padding: '3px 8px', fontSize: '10.5px', background: 'rgba(234, 179, 8, 0.2)', border: '1px solid #eab308', color: '#fef08a', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      🟠 Jupiter
                    </button>
                    <button
                      onClick={handleFocusSun}
                      style={{ padding: '3px 8px', fontSize: '10.5px', background: 'rgba(239, 68, 68, 0.2)', border: '1px solid #ef4444', color: '#fca5a5', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      ☀️ Sun
                    </button>
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #a855f7' }}>
                  <div style={{ fontWeight: 700, color: '#a855f7', marginBottom: '4px' }}>🪨 Asteroid Belt (2.1 – 3.3 AU)</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                    Mars aur Jupiter ke beech 3,000+ procedural GPU-accelerated rotating asteroids jo inner aur outer solar system ko divide karte hain.
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '12px 14px', borderRadius: '8px', borderLeft: '4px solid #06b6d4' }}>
                  <div style={{ fontWeight: 700, color: '#06b6d4', marginBottom: '4px' }}>❄️ Kuiper Belt & Comets</div>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>
                    Neptune ke bahar (30–52 AU) icy bodies, dwarf planets (Pluto, Ceres, Eris), aur Halley's Comet / Hale-Bopp ke glowing dust/ion tails.
                  </div>
                </div>
              </div>

              {/* Scale & Framing Explanation */}
              <div style={{ background: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', borderRadius: '8px', padding: '14px' }}>
                <div style={{ fontWeight: 700, color: '#facc15', marginBottom: '6px' }}>
                  🔍 Scale & Framing Tip: Earth Dikhane Me Kyun Attention Chahiye?
                </div>
                <div style={{ color: '#e2e8f0', fontSize: '12.5px', lineHeight: 1.5 }}>
                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    <li><strong>46 AU vs 1 AU Scale:</strong> Pluto ka orbit Sun se 46 AU (6 Billion km) door hai, jabki Earth sirf 1 AU (150 Million km) par hai. Agar camera 46 AU door hai, toh choti Earth screen par 1 sub-pixel ban jaati hai.</li>
                    <li><strong>Instant Focus Solution:</strong> Kisi bhi planet ko paas se dekhne ke liye top bar me <strong>`FOCUS`</strong> button dabayein ya keyboard par <strong>`F`</strong> dabayein — camera seedha us planet ke orbital plane par smoothly snap ho jayega.</li>
                    <li><strong>Reset Overview:</strong> Agar camera space me zyada door nikal gaya ho, toh keyboard par <strong>`R`</strong> ya top bar me <strong>`Reset`</strong> dabayein.</li>
                    <li><strong>Orbit Lines & Scale Mode:</strong> Bottom toolbar me <strong>`[Orbits]`</strong>, <strong>`[Moons]`</strong>, <strong>`[Asteroids]`</strong> toggles on/off karein aur <strong>`[Exploration Scale]`</strong> select karein jahan planets visually enhanced size me dikhte hain.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 3: STEP-BY-STEP GUIDE ── */}
          {activeTab === 'STEPS' && (
            <div>
              <h3 style={{ color: '#7dd3fc', marginTop: 0, marginBottom: '14px', fontSize: '16px' }}>
                🧭 Step-by-Step Guide: Kaise Explore Karein?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '12px' }}>1</div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>Universe & Galaxies Exploration</div>
                    <div style={{ color: '#94a3b8', fontSize: '12.5px', marginTop: '2px' }}>
                      Top bar me Morphology Filters (<strong>Spirals</strong>, <strong>Ellipticals</strong>, <strong>Irregulars</strong>) click karein. Preset dropdown se Andromeda (M31) ya Whirlpool (M51) select karke unke spiral arms aur dust clouds inspect karein.
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '12px' }}>2</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>Milky Way Galactic Center Me Enter Karein</div>
                    <div style={{ color: '#94a3b8', fontSize: '12.5px', marginTop: '2px' }}>
                      Top-right me <strong>`Milky Way`</strong> button click karein. Galactic core, bulge, Sagittarius A* region, aur Solar Neighborhood ka 3D layout dekhein.
                    </div>
                    <button
                      onClick={handleJumpToMilkyWay}
                      style={{ marginTop: '6px', padding: '4px 10px', fontSize: '11px', background: 'rgba(0, 229, 255, 0.2)', border: '1px solid #00e5ff', color: '#64ffda', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      🌀 Jump to Milky Way View
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '12px' }}>3</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>Solar System & Earth 3D Simulation Me Jaayein</div>
                    <div style={{ color: '#94a3b8', fontSize: '12.5px', marginTop: '2px' }}>
                      Top-bar me <strong>`☀️ Solar System`</strong> button click karein. Sun, Earth, Mars, Jupiter ke rings, moons, aur Asteroid Belt ko orbit karein.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        onClick={handleJumpToSolarSystem}
                        style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(234, 179, 8, 0.2)', border: '1px solid #eab308', color: '#fef08a', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ☀️ Solar System View
                      </button>
                      <button
                        onClick={handleFocusEarth}
                        style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(56, 189, 248, 0.2)', border: '1px solid #38bdf8', color: '#7dd3fc', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        🌍 Direct Earth Focus
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '12px' }}>4</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>Cosmic Time Explorer & Stellar Lifecycle</div>
                    <div style={{ color: '#94a3b8', fontSize: '12.5px', marginTop: '2px' }}>
                      Top bar me <strong>`⏳ Time`</strong> ya <strong>`🔭 Education`</strong> open karein. 13.8 Billion years ka timeline slider drag karein ya star mass change karke unka birth $\to$ supernova $\to$ black hole evolution simulate karein.
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                      <button
                        onClick={handleOpenTimeline}
                        style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(59, 130, 246, 0.2)', border: '1px solid #3b82f6', color: '#93c5fd', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        ⏳ Open Cosmic Timeline
                      </button>
                      <button
                        onClick={handleOpenLifecycle}
                        style={{ padding: '4px 10px', fontSize: '11px', background: 'rgba(244, 114, 182, 0.2)', border: '1px solid #f472b6', color: '#fbcfe8', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        🌟 Open Stellar Lifecycle
                      </button>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
                  <div style={{ background: '#0284c7', color: '#fff', borderRadius: '50%', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '12px' }}>5</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#f8fafc' }}>Hertzsprung-Russell (HR) Diagram & Scientific Inspector</div>
                    <div style={{ color: '#94a3b8', fontSize: '12.5px', marginTop: '2px' }}>
                      <strong>`📊 HR`</strong> button click karke temperature vs luminosity graph me stars ke evolutionary tracks (Main Sequence, Giants, White Dwarfs) dekhein.
                    </div>
                    <button
                      onClick={handleOpenHRDiagram}
                      style={{ marginTop: '6px', padding: '4px 10px', fontSize: '11px', background: 'rgba(168, 85, 247, 0.2)', border: '1px solid #a855f7', color: '#e9d5ff', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      📊 Open HR Diagram
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 4: EDUCATIONAL VALUE ── */}
          {activeTab === 'EDUCATION' && (
            <div>
              <h3 style={{ color: '#7dd3fc', marginTop: 0, marginBottom: '14px', fontSize: '16px' }}>
                🎓 Educational Point of View Se Yeh Kyun Important Hai?
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #38bdf8' }}>
                  <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '4px' }}>
                    1. 100% Real Physics & Astronomy Formulas (Zero Fake Data)
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                    Yeh platform astronomy students aur educators ke liye design kiya gaya hai:
                    <ul style={{ margin: '6px 0 0 0', paddingLeft: '18px', color: '#cbd5e1' }}>
                      <li><strong>Stefan-Boltzmann Law:</strong> $L = 4\pi R^2 \sigma T^4$ exact stellar luminosity & temperature calculations.</li>
                      <li><strong>Schwarzschild Radius:</strong> $r_s = 2GM/c^2$ for Black Hole event horizons.</li>
                      <li><strong>Chandrasekhar Limit:</strong> $1.44 M_\odot$ White Dwarf electron degeneracy stability boundary.</li>
                      <li><strong>Kepler's Third Law:</strong> $T^2 \propto a^3$ accurate orbital periods of planets and moons.</li>
                    </ul>
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #facc15' }}>
                  <div style={{ fontWeight: 700, color: '#facc15', marginBottom: '4px' }}>
                    2. True Cosmic Scale Comprehension
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                    Textbooks me 3D scale visualize karna mushkil hota hai. Yahan persistent <strong>Scale Indicator</strong> camera ke saath zoom hone par 11.5 km (Neutron star radius) se 100 Mpc (Universe Observable Horizon) tak ka intuitive comparison deta hai.
                  </div>
                </div>

                <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '8px', borderLeft: '4px solid #4ade80' }}>
                  <div style={{ fontWeight: 700, color: '#4ade80', marginBottom: '4px' }}>
                    3. Interactive Guided Lessons & Comparative Analytics
                  </div>
                  <div style={{ color: '#94a3b8', fontSize: '12.5px' }}>
                    <strong>Compare Tool</strong> se user kisi bhi do astronomical objects (e.g. Earth vs Jupiter, Sun vs Betelgeuse, Neutron Star vs Black Hole) ko mass, radius, surface gravity, aur temperature ke normalized visual bars ke saath compare kar sakta hai.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB 5: CONTROLS & SHORTCUTS ── */}
          {activeTab === 'CONTROLS' && (
            <div>
              <h3 style={{ color: '#7dd3fc', marginTop: 0, marginBottom: '14px', fontSize: '16px' }}>
                ⌨️ Navigation Controls, Mouse Gestures & Shortcuts
              </h3>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '18px' }}>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>Left Click + Drag</span>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Orbit & Rotate 3D View Around Center</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>Right Click OR Middle Click + Drag</span>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Pan & Slide Screen View in Any Direction</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>Mouse Wheel</span>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Zoom To Cursor (Mouse-Centric Zoom)</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>Double Click Anywhere</span>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Smoothly Re-Center Screen on Cursor Point</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>F Key / FOCUS Button</span>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Instantly Snap Camera to Selected Planet/Object</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>R / ESC Key</span>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Reset Camera View / Free Flight Mode</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>W / A / S / D / Q / E</span>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Fly & Strafe Camera in 3D Space</div>
                </div>
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '10px 14px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <span style={{ fontFamily: 'monospace', color: '#38bdf8', fontWeight: 700 }}>SPACE Key</span>
                  <div style={{ color: '#94a3b8', fontSize: '12px' }}>Pause / Resume Planetary & Cosmic Time</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Modal Footer ────────────────────────────────────────────── */}
        <div
          style={{
            padding: '12px 24px',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'rgba(0, 0, 0, 0.35)',
          }}
        >
          <div style={{ fontSize: '12px', color: '#64748b' }}>
            Cosmic Evolution Explorer · 12 Validated Phases · Production Ready
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '8px 20px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '13px',
              transition: 'background-color 0.2s',
            }}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0369a1')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#0284c7')}
          >
            Got It, Start Exploring! 🚀
          </button>
        </div>
      </div>
    </div>
  );
};
