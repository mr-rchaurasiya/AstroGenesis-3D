/**
 * ProgressIndicator.tsx
 * Educational learning progress tracker component.
 * Displays user exploration milestones, lesson completion, and comparison counts.
 */

import React from 'react';
import { useEducationStore } from '../EducationState';
import { EDUCATIONAL_CONCEPTS } from '../EducationContent';
import { EDUCATIONAL_LESSONS } from '../EducationTopics';

export const ProgressIndicator: React.FC = () => {
  const { progress, resetProgress } = useEducationStore();

  const totalConcepts = EDUCATIONAL_CONCEPTS.length;
  const viewedCount = progress.viewedTopicIds.length;
  const conceptPercent = Math.min(100, Math.round((viewedCount / totalConcepts) * 100));

  const totalLessons = EDUCATIONAL_LESSONS.length;
  const completedLessonsCount = progress.completedLessonIds.length;
  const lessonPercent = Math.min(100, Math.round((completedLessonsCount / totalLessons) * 100));

  return (
    <div
      style={{
        background: 'rgba(2, 12, 28, 0.85)',
        border: '1px solid rgba(100, 160, 220, 0.25)',
        borderRadius: 8,
        padding: '12px 14px',
        color: 'var(--ui-text-primary)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--color-star-white)' }}>
          🎓 Learning Progress
        </span>
        <button
          onClick={resetProgress}
          title="Reset local learning progress"
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--ui-text-dim)',
            fontSize: 10,
            cursor: 'pointer',
            textDecoration: 'underline',
            fontFamily: 'var(--font-mono)',
          }}
        >
          Reset
        </button>
      </div>

      {/* Concepts Explored Progress Bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: 'var(--ui-text-secondary)' }}>
          <span>Astrophysical Concepts Explored:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-star-blue)' }}>
            {viewedCount} / {totalConcepts} ({conceptPercent}%)
          </span>
        </div>
        <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${conceptPercent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Guided Lessons Completed Progress Bar */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, marginBottom: 4, color: 'var(--ui-text-secondary)' }}>
          <span>Guided Lessons Completed:</span>
          <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-star-gold)' }}>
            {completedLessonsCount} / {totalLessons} ({lessonPercent}%)
          </span>
        </div>
        <div style={{ width: '100%', height: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
          <div style={{ width: `${lessonPercent}%`, height: '100%', background: 'linear-gradient(90deg, #fbbf24, #f59e0b)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 12 }}>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 9.5, color: 'var(--ui-text-dim)' }}>Stages Explored</div>
          <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-star-white)' }}>
            {progress.exploredStageKeys.length}
          </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '6px 8px', borderRadius: 4, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 9.5, color: 'var(--ui-text-dim)' }}>Comparisons Run</div>
          <div style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-mono)', color: 'var(--color-star-white)' }}>
            {progress.comparisonsCount}
          </div>
        </div>
      </div>
    </div>
  );
};
