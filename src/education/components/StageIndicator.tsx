/**
 * StageIndicator.tsx
 * Interactive persistent stellar lifecycle stage indicator.
 * Displays discrete milestone stages with real-time active stage highlights.
 */

import React from 'react';
import { classifyMassRegime } from '../EducationUtils';
import { useEducationStore } from '../EducationState';

interface StageIndicatorProps {
  initialMassSolar?: number;
  currentStageKey?: string;
  onSelectStage?: (stageKey: string) => void;
  orientation?: 'horizontal' | 'vertical';
}

export const StageIndicator: React.FC<StageIndicatorProps> = ({
  initialMassSolar = 1.0,
  currentStageKey = 'MAIN_SEQUENCE',
  onSelectStage,
  orientation = 'horizontal',
}) => {
  const { markStageExplored, openConceptTooltip } = useEducationStore();
  const regime = classifyMassRegime(initialMassSolar);

  const isVertical = orientation === 'vertical';

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: isVertical ? 'column' : 'row',
        alignItems: isVertical ? 'flex-start' : 'center',
        gap: isVertical ? 6 : 4,
        background: 'rgba(2, 10, 22, 0.7)',
        border: '1px solid rgba(100, 160, 220, 0.2)',
        borderRadius: 8,
        padding: '6px 10px',
        fontFamily: 'var(--font-mono)',
        fontSize: 10,
        pointerEvents: 'auto',
      }}
    >
      <div style={{ fontSize: 9.5, color: 'var(--color-star-blue)', fontWeight: 600, marginRight: isVertical ? 0 : 8, marginBottom: isVertical ? 4 : 0 }}>
        LIFECYCLE ({initialMassSolar.toFixed(1)} M☉):
      </div>

      <div
        style={{
          display: 'flex',
          flexDirection: isVertical ? 'column' : 'row',
          alignItems: isVertical ? 'flex-start' : 'center',
          gap: isVertical ? 6 : 8,
          flexWrap: isVertical ? 'nowrap' : 'wrap',
        }}
      >
        {regime.phases.map((phase, idx) => {
          const isActive = phase.stageKey === currentStageKey || phase.id === currentStageKey;
          const isPast = idx < regime.phases.findIndex((p) => p.stageKey === currentStageKey || p.id === currentStageKey);

          return (
            <div key={phase.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => {
                  markStageExplored(phase.stageKey);
                  onSelectStage?.(phase.stageKey);
                  if (phase.stageKey === 'MAIN_SEQUENCE') openConceptTooltip('main-sequence');
                  if (phase.stageKey === 'RED_GIANT') openConceptTooltip('red-giant');
                  if (phase.stageKey === 'CORE_COLLAPSE') openConceptTooltip('core-collapse');
                  if (phase.stageKey === 'POST_HELIUM') openConceptTooltip('white-dwarf');
                }}
                title={`${phase.displayName}: ${phase.description}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: isActive ? 'rgba(59, 130, 246, 0.35)' : isPast ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  border: isActive ? '1px solid var(--color-star-blue)' : '1px solid transparent',
                  borderRadius: 4,
                  padding: '2px 6px',
                  color: isActive ? 'var(--color-star-white)' : isPast ? 'var(--ui-text-secondary)' : 'var(--ui-text-dim)',
                  cursor: 'pointer',
                  fontSize: 9.5,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                }}
              >
                <span style={{ color: isActive ? 'var(--color-star-gold)' : isPast ? 'var(--ui-success)' : 'var(--ui-text-dim)' }}>
                  {isActive ? '◉' : isPast ? '●' : '○'}
                </span>
                <span>{phase.displayName.split(' (')[0]}</span>
              </button>

              {!isVertical && idx < regime.phases.length - 1 && (
                <span style={{ color: 'var(--ui-text-dim)', fontSize: 9 }}>→</span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
