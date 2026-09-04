/**
 * ConceptTooltip.tsx
 * Floating, non-blocking contextual educational tooltip.
 * Displays concise concept explanations, equations, variables, and links.
 */

import React from 'react';
import { useEducationStore } from '../EducationState';
import { getConceptById } from '../EducationSelectors';

export const ConceptTooltip: React.FC = () => {
  const { activeTooltipConceptId, tooltipPosition, closeConceptTooltip, openConceptTooltip } = useEducationStore();

  if (!activeTooltipConceptId) return null;

  const concept = getConceptById(activeTooltipConceptId);
  if (!concept) return null;

  const style: React.CSSProperties = {
    position: 'fixed',
    top: tooltipPosition ? Math.min(window.innerHeight - 300, tooltipPosition.y + 12) : '20%',
    left: tooltipPosition ? Math.min(window.innerWidth - 380, tooltipPosition.x + 12) : '50%',
    width: 360,
    maxWidth: '90vw',
    background: 'rgba(2, 12, 28, 0.95)',
    border: '1px solid rgba(59, 130, 246, 0.4)',
    borderRadius: 8,
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.8), 0 0 15px rgba(59, 130, 246, 0.2)',
    backdropFilter: 'blur(16px)',
    padding: '12px 16px',
    color: 'var(--ui-text-primary)',
    fontFamily: 'var(--font-ui)',
    fontSize: 12,
    lineHeight: 1.4,
    zIndex: 1000,
    pointerEvents: 'auto',
  };

  return (
    <div style={style} role="dialog" aria-label={`Concept: ${concept.title}`}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
        <span style={{ fontSize: 10, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
          {concept.category.replace(/_/g, ' ')}
        </span>
        <button
          onClick={closeConceptTooltip}
          title="Close tooltip"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ui-text-dim)',
            cursor: 'pointer',
            fontSize: 14,
            padding: '0 4px',
          }}
        >
          ✕
        </button>
      </div>

      <div style={{ fontWeight: 600, fontSize: 13.5, color: 'var(--color-star-white)', marginBottom: 4 }}>
        {concept.title}
      </div>

      <p style={{ color: 'var(--ui-text-secondary)', marginBottom: 8, fontSize: 11.5 }}>
        {concept.shortExplanation}
      </p>

      {concept.keyEquation && (
        <div style={{
          background: 'rgba(0, 20, 40, 0.6)',
          border: '1px solid rgba(100, 160, 220, 0.2)',
          borderRadius: 4,
          padding: '6px 10px',
          marginBottom: 8,
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          color: 'var(--color-star-gold)',
        }}>
          <div style={{ fontSize: 9.5, color: 'var(--ui-text-dim)', textTransform: 'uppercase', marginBottom: 2 }}>
            {concept.keyEquation.title}
          </div>
          <div>{concept.keyEquation.text}</div>
        </div>
      )}

      <div style={{ fontSize: 10.5, color: 'var(--ui-text-dim)', marginBottom: 8 }}>
        <strong style={{ color: 'var(--ui-text-secondary)' }}>Significance: </strong>
        {concept.importance}
      </div>

      {concept.relatedTopicIds.length > 0 && (
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 6, display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center' }}>
          <span style={{ fontSize: 9.5, color: 'var(--ui-text-dim)' }}>Related:</span>
          {concept.relatedTopicIds.map((relId) => {
            const relConcept = getConceptById(relId);
            return (
              <button
                key={relId}
                onClick={() => openConceptTooltip(relId)}
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  border: '1px solid rgba(59, 130, 246, 0.3)',
                  borderRadius: 10,
                  color: 'var(--color-star-blue)',
                  fontSize: 9.5,
                  padding: '1px 6px',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                {relConcept?.title ?? relId}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
