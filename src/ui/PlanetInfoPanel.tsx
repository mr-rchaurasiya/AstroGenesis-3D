/**
 * @file PlanetInfoPanel.tsx
 * @description Scientific information HUD panel for selected Solar System bodies.
 */

import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { getSolarBodyById } from '../solarsystem/solarSystemPresets';
import type { CelestialBody, CometTrajectory } from '../solarsystem/SolarSystemTypes';

export const PlanetInfoPanel: React.FC = () => {
  const selectedBodyId = useAppStore((s) => s.selectedSolarBodyId);
  const selectSolarBody = useAppStore((s) => s.selectSolarBody);
  const simulationTimeDays = useAppStore((s) => s.solarSimulationTimeDays);

  if (!selectedBodyId) return null;

  const item = getSolarBodyById(selectedBodyId);
  if (!item) return null;

  const isCelestial = 'radiusKm' in item;
  const celestial = isCelestial ? (item as CelestialBody) : null;
  const comet = !isCelestial ? (item as CometTrajectory) : null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '80px',
        right: '24px',
        width: '360px',
        maxHeight: 'calc(100vh - 120px)',
        overflowY: 'auto',
        background: 'rgba(8, 14, 30, 0.88)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(56, 189, 248, 0.25)',
        borderRadius: '12px',
        padding: '20px',
        color: '#f8fafc',
        fontFamily: "'Inter', sans-serif",
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6), 0 0 20px rgba(56, 189, 248, 0.1)',
        zIndex: 50,
        pointerEvents: 'auto',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
        <div>
          <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.1em', color: '#38bdf8', fontWeight: 600 }}>
            {celestial ? (celestial.planetClass || celestial.type).replace('-', ' ').toUpperCase() : 'COMET'}
          </div>
          <h2 style={{ margin: '2px 0 0 0', fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
            {celestial ? celestial.name : comet?.name}
          </h2>
        </div>
        <button
          onClick={() => selectSolarBody(null)}
          style={{
            background: 'transparent',
            border: 'none',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '18px',
            lineHeight: 1,
            padding: '4px',
          }}
          title="Close panel"
        >
          ✕
        </button>
      </div>

      {/* Description */}
      <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '16px', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', paddingBottom: '12px' }}>
        {celestial?.description || (comet ? `${comet.name} is a periodic comet with an orbital eccentricity of ${comet.eccentricity}.` : '')}
      </div>

      {/* Scientific Metrics Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
        {/* Orbital Parameters */}
        <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '11px', textTransform: 'uppercase', marginTop: '4px', letterSpacing: '0.05em' }}>
          Orbital Parameters
        </div>

        {celestial && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Semi-Major Axis:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.orbit.semiMajorAxisAU > 0 ? `${celestial.orbit.semiMajorAxisAU.toFixed(3)} AU` : '0 AU (Barycenter)'}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Orbital Period:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.orbit.orbitalPeriodDays >= 365.25
                  ? `${(celestial.orbit.orbitalPeriodDays / 365.25).toFixed(2)} Earth Years`
                  : `${celestial.orbit.orbitalPeriodDays.toFixed(1)} Days`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Eccentricity:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.orbit.eccentricity.toFixed(4)}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Inclination:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.orbit.inclinationDeg.toFixed(2)}°
              </span>
            </div>
          </>
        )}

        {comet && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Semi-Major Axis:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{comet.semiMajorAxisAU.toFixed(2)} AU</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Orbital Period:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{comet.periodYears.toFixed(1)} Years</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Perihelion / Aphelion:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>{comet.perihelionAU} / {comet.aphelionAU} AU</span>
            </div>
          </>
        )}

        {/* Physical Characteristics */}
        {celestial && (
          <>
            <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '11px', textTransform: 'uppercase', marginTop: '10px', letterSpacing: '0.05em' }}>
              Physical Characteristics
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Mean Radius:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.radiusKm.toLocaleString()} km
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Mass:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.massKg.toExponential(3)} kg
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Surface Gravity:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.surfaceGravityMs2.toFixed(2)} m/s² ({(celestial.surfaceGravityMs2 / 9.807).toFixed(2)} g)
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Rotation Period:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {Math.abs(celestial.rotationPeriodHours) >= 24
                  ? `${(celestial.rotationPeriodHours / 24).toFixed(2)} Days ${celestial.rotationPeriodHours < 0 ? '(Retrograde)' : ''}`
                  : `${celestial.rotationPeriodHours.toFixed(2)} Hours`}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Axial Tilt:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.axialTiltDeg.toFixed(1)}°
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Surface Temperature:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.surfaceTemperatureK} K ({(celestial.surfaceTemperatureK - 273.15).toFixed(0)} °C)
              </span>
            </div>
          </>
        )}

        {/* Atmosphere Info */}
        {celestial?.atmosphere && (
          <>
            <div style={{ fontWeight: 600, color: '#38bdf8', fontSize: '11px', textTransform: 'uppercase', marginTop: '10px', letterSpacing: '0.05em' }}>
              Atmosphere
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Surface Pressure:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500 }}>
                {celestial.atmosphere.surfacePressureBar} bar
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255, 255, 255, 0.04)', paddingBottom: '4px' }}>
              <span style={{ color: '#94a3b8' }}>Composition:</span>
              <span style={{ color: '#f1f5f9', fontWeight: 500, textAlign: 'right', maxWidth: '180px' }}>
                {celestial.atmosphere.composition}
              </span>
            </div>
          </>
        )}

        {/* Simulation Time Tracker */}
        <div style={{ marginTop: '12px', padding: '8px 10px', background: 'rgba(56, 189, 248, 0.06)', borderRadius: '6px', fontSize: '11px', color: '#94a3b8' }}>
          Simulation Day: <span style={{ color: '#38bdf8', fontWeight: 600 }}>{simulationTimeDays.toFixed(1)}</span> (Year {(simulationTimeDays / 365.25).toFixed(2)})
        </div>
      </div>
    </div>
  );
};
