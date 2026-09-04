/**
 * GalaxySystem.tsx
 * Top-level master component for the Galaxy System (Phase 3).
 * Manages galaxy population lifecycle, morphological filtering, quality scaling,
 * and individual interactive galaxy rendering.
 */

import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { generateGalaxyPopulation } from './GalaxyPopulation';
import { GalaxyInstance } from './GalaxyInstance';
import { GalaxySelector } from './GalaxySelector';
import type { GalaxyData } from './GalaxyTypes';
import { GALAXY_QUALITY_SETTINGS } from './GalaxyConfig';

export function GalaxySystem() {
  const quality = useAppStore((s) => s.environmentQuality);
  const showGalaxies = useAppStore((s) => s.showGalaxySystem);
  const morphologyFilter = useAppStore((s) => s.galaxyMorphologyFilter);
  const selectedGalaxyId = useAppStore((s) => s.selectedGalaxyId);
  const setSelectedGalaxy = useAppStore((s) => s.setSelectedGalaxy);

  // Generate population once per seed/quality
  const population = useMemo(() => {
    const qualityConfig = GALAXY_QUALITY_SETTINGS[quality] ?? GALAXY_QUALITY_SETTINGS.high;
    return generateGalaxyPopulation(789123, qualityConfig.starCountMultiplier);
  }, [quality]);

  // Filter population by morphology
  const visibleGalaxies = useMemo(() => {
    if (!showGalaxies) return [];
    if (morphologyFilter === 'all') return population.galaxies;

    return population.galaxies.filter((g) => {
      if (morphologyFilter === 'spiral') {
        return g.morphology === 'spiral' || g.morphology === 'barred-spiral';
      }
      if (morphologyFilter === 'elliptical') {
        return g.morphology === 'elliptical';
      }
      if (morphologyFilter === 'irregular') {
        return g.morphology === 'irregular';
      }
      if (morphologyFilter === 'dwarf') {
        return g.morphology === 'dwarf-spheroidal' || g.morphology === 'dwarf-irregular';
      }
      return true;
    });
  }, [population.galaxies, showGalaxies, morphologyFilter]);

  const selectedGalaxy = useMemo(() => {
    return population.galaxies.find((g) => g.id === selectedGalaxyId) ?? null;
  }, [population.galaxies, selectedGalaxyId]);

  const handleSelect = (galaxy: GalaxyData) => {
    setSelectedGalaxy(galaxy);
  };

  if (!showGalaxies) return null;

  const qualityConfig = GALAXY_QUALITY_SETTINGS[quality] ?? GALAXY_QUALITY_SETTINGS.high;

  return (
    <group name="GalaxySystem">
      {/* ── 1. Individual 3D Galaxies ────────────────────────────── */}
      {visibleGalaxies.map((galaxy) => (
        <GalaxyInstance
          key={galaxy.id}
          galaxy={galaxy}
          isSelected={galaxy.id === selectedGalaxyId}
          particleScale={qualityConfig.starCountMultiplier}
          onSelect={handleSelect}
        />
      ))}

      {/* ── 2. Selection Targeting Reticle & Visual Indicator ────── */}
      <GalaxySelector selectedGalaxy={selectedGalaxy} />
    </group>
  );
}
