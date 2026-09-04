/**
 * StarFormationSystem.tsx
 * Complete 3D composite interactive system for Star Birth and Star Formation.
 * Renders the molecular cloud envelope, collapsing protostars, disks, and jets.
 * Seamlessly integrates with useAppStore, CameraController, and NavigationManager.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import type { StarBirthConfig, StarFormationSystemProperties } from './StarBirthTypes';
import { initializeStarFormationSystem, evolveStarFormationSystem } from './StarFormation';
import { MolecularCloudVisual } from './MolecularCloudVisual';
import { ProtostarVisual } from './ProtostarVisual';
import { useAppStore } from '../store/useAppStore';

interface StarFormationSystemProps {
  config?: StarBirthConfig;
  autoPlay?: boolean;
}

export function StarFormationSystem({
  config,
  autoPlay = true,
}: StarFormationSystemProps) {
  const [system, setSystem] = useState<StarFormationSystemProperties>(() =>
    initializeStarFormationSystem(config)
  );

  const selectedObject = useAppStore((s) => s.selectedObject);
  const setSelectedObject = useAppStore((s) => s.setSelectedObject);
  const timeScale = useAppStore((s) => s.timeScale);
  const isPaused = useAppStore((s) => s.isPaused);

  // Time accumulation in simulation years (1 second real time = 100,000 years base simulation time)
  const simYearsRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    simYearsRef.current = 0;
    lastUpdateRef.current = 0;
  }, [config]);

  // Adaptive physics step: update physics at a reasonable simulation step without per-frame heavy churn
  useFrame((_, delta) => {
    if (isPaused || !autoPlay) return;

    // Time scaling: base 100,000 years per second at timeScale = 1
    const yearsDelta = delta * 1.0e5 * Math.max(0.1, timeScale);
    simYearsRef.current += yearsDelta;

    // Update state when at least 5,000 simulation years have elapsed
    if (simYearsRef.current - lastUpdateRef.current >= 5.0e3) {
      lastUpdateRef.current = simYearsRef.current;
      setSystem((prev) => evolveStarFormationSystem(prev, simYearsRef.current));
    }
  });

  const handleSelectCloud = useCallback(() => {
    setSelectedObject({
      id: system.cloud.id,
      name: system.cloud.name,
      type: 'molecular-cloud',
      position: system.cloud.position,
      data: {
        massSolar: system.cloud.massSolar,
        radiusPc: system.cloud.radiusPc,
        temperatureK: system.cloud.temperatureK,
        state: system.cloud.state,
        freeFallTimeYears: system.cloud.freeFallTimeYears,
        collapseProgress: system.cloud.collapseProgress,
        gasRemainingSolar: system.cloud.gasRemainingSolar,
      },
    });
  }, [system.cloud, setSelectedObject]);

  const handleSelectProtostar = useCallback((protoId: string) => {
    const proto = system.protostars.find((p) => p.id === protoId);
    if (!proto) return;

    setSelectedObject({
      id: proto.id,
      name: proto.name,
      type: 'protostar',
      position: proto.position,
      data: {
        massSolar: proto.massSolar,
        radiusSolar: proto.radiusSolar,
        luminositySolar: proto.luminositySolar,
        effectiveTemperatureK: proto.effectiveTemperatureK,
        coreTemperatureK: proto.coreTemperatureK,
        state: proto.state,
        formationProgress: proto.formationProgress,
        accretionRateSolarPerYear: proto.accretionRateSolarPerYear,
        spectralClass: proto.finalStellarProperties?.fullSpectralDesignation,
      },
    });
  }, [system.protostars, setSelectedObject]);

  return (
    <group name="StarFormationSystem">
      {/* ── 1. Giant Molecular Cloud Envelope ── */}
      <MolecularCloudVisual
        cloud={system.cloud}
        isSelected={selectedObject?.id === system.cloud.id}
        onSelect={handleSelectCloud}
      />

      {/* ── 2. Forming Protostars ── */}
      {system.protostars.map((proto) => (
        <ProtostarVisual
          key={proto.id}
          protostar={proto}
          isSelected={selectedObject?.id === proto.id}
          onSelect={() => handleSelectProtostar(proto.id)}
        />
      ))}
    </group>
  );
}
