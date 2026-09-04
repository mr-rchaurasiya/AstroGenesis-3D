/**
 * EducationPanel.tsx
 * Primary Educational Discovery & Cosmic Explorer Drawer.
 * Multi-tabbed dockable modal housing Guided Lessons, Cosmic Timeline,
 * Stellar Lifecycle Educator, Scientific Data Inspector, Comparison Mode,
 * HR Diagram, and Learning Progress.
 */

import React from 'react';
import { useEducationStore, type EducationTab } from '../EducationState';
import type { DetailLevel } from '../EducationTypes';
import { CosmicTimeline } from './CosmicTimeline';
import { StellarLifecyclePanel } from './StellarLifecyclePanel';
import { ScientificDataPanel } from './ScientificDataPanel';
import { ComparisonPanel } from './ComparisonPanel';
import { HRDiagramPanel } from './HRDiagramPanel';
import { ProgressIndicator } from './ProgressIndicator';
import { UnitToggle } from './UnitToggle';
import { EDUCATIONAL_LESSONS } from '../EducationTopics';

export const EducationPanel: React.FC = () => {
  const {
    showEducationPanel,
    toggleEducationPanel,
    activeEducationTab,
    setActiveEducationTab,
    selectedLessonId,
    activeLessonStepIndex,
    startLesson,
    nextLessonStep,
    prevLessonStep,
    exitLesson,
    markLessonCompleted,
    detailLevel,
    setDetailLevel,
  } = useEducationStore();

  if (!showEducationPanel) return null;

  const tabs: { id: EducationTab; label: string; icon: string }[] = [
    { id: 'LEARN', label: 'Lessons', icon: '📖' },
    { id: 'TIMELINE', label: 'Timeline', icon: '⏳' },
    { id: 'LIFECYCLE', label: 'Lifecycle', icon: '✨' },
    { id: 'SCIENTIFIC', label: 'Scientific Data', icon: '🔬' },
    { id: 'COMPARE', label: 'Compare', icon: '⚖️' },
    { id: 'HR', label: 'HR Diagram', icon: '📊' },
    { id: 'HELP', label: 'Progress', icon: '🎓' },
  ];

  const currentLesson = EDUCATIONAL_LESSONS.find((l) => l.id === selectedLessonId);
  const currentStep = currentLesson?.steps[activeLessonStepIndex] ?? currentLesson?.steps[0];

  return (
    <div
      style={{
        position: 'fixed',
        top: 60,
        right: 20,
        width: 540,
        maxWidth: '92vw',
        maxHeight: 'calc(100vh - 110px)',
        background: 'rgba(2, 10, 24, 0.94)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        borderRadius: 12,
        boxShadow: '0 16px 48px rgba(0, 0, 0, 0.85), 0 0 20px rgba(59, 130, 246, 0.15)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        pointerEvents: 'auto',
        overflow: 'hidden',
      }}
      role="dialog"
      aria-label="Educational Astronomy Discovery Explorer"
    >
      {/* Top Header & Tab Navigation Bar */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(0, 5, 15, 0.8)',
        padding: '10px 14px 4px 14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🔭</span>
            <span style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-star-white)', fontFamily: 'var(--font-ui)' }}>
              Cosmic Education Explorer
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {/* Unit System Switcher */}
            <UnitToggle />

            {/* Detail Level Selector */}
            <select
              value={detailLevel}
              onChange={(e) => setDetailLevel(e.target.value as DetailLevel)}
              style={{
                background: 'rgba(0, 20, 40, 0.8)',
                border: '1px solid var(--ui-border)',
                borderRadius: 4,
                color: 'var(--ui-text-secondary)',
                fontFamily: 'var(--font-mono)',
                fontSize: 9.5,
                padding: '2px 6px',
                cursor: 'pointer',
              }}
            >
              <option value="BEGINNER">Beginner</option>
              <option value="INTERMEDIATE">Intermediate</option>
              <option value="ADVANCED">Advanced</option>
            </select>

            {/* Close Button */}
            <button
              onClick={toggleEducationPanel}
              title="Close education panel"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--ui-text-dim)',
                fontSize: 16,
                cursor: 'pointer',
                padding: '0 4px',
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Tab Buttons */}
        <div style={{ display: 'flex', gap: 2, overflowX: 'auto' }}>
          {tabs.map((tab) => {
            const isActive = activeEducationTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveEducationTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  background: isActive ? 'rgba(59, 130, 246, 0.3)' : 'transparent',
                  border: 'none',
                  borderBottom: isActive ? '2px solid var(--color-star-blue)' : '2px solid transparent',
                  padding: '6px 10px',
                  color: isActive ? 'var(--color-star-white)' : 'var(--ui-text-dim)',
                  cursor: 'pointer',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10.5,
                  fontWeight: isActive ? 600 : 400,
                  transition: 'all 0.15s ease',
                  whiteSpace: 'nowrap',
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Tab Content Body (Scrollable) */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 14 }}>
        {/* 1. Guided Lessons Tab */}
        {activeEducationTab === 'LEARN' && (
          <div>
            {!selectedLessonId ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 11, color: 'var(--ui-text-secondary)', marginBottom: 4 }}>
                  Select an interactive guided lesson to explore core cosmological and astrophysical concepts:
                </div>
                {EDUCATIONAL_LESSONS.map((lesson) => (
                  <div
                    key={lesson.id}
                    onClick={() => startLesson(lesson.id)}
                    style={{
                      background: 'rgba(0, 20, 40, 0.6)',
                      border: '1px solid rgba(100, 160, 220, 0.2)',
                      borderRadius: 8,
                      padding: '12px 14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-star-gold)' }}>
                        {lesson.title}
                      </div>
                      <span style={{ fontSize: 9.5, fontFamily: 'var(--font-mono)', background: 'rgba(59, 130, 246, 0.2)', padding: '2px 6px', borderRadius: 4, color: 'var(--color-star-blue)' }}>
                        {lesson.difficulty}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--ui-text-dim)', marginBottom: 6 }}>
                      {lesson.subtitle}
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: 'var(--ui-text-secondary)', lineHeight: 1.4 }}>
                      {lesson.summary}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              /* Active Guided Lesson Viewer */
              currentLesson && currentStep && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={exitLesson}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--color-star-blue)',
                        cursor: 'pointer',
                        fontSize: 11,
                        fontFamily: 'var(--font-mono)',
                      }}
                    >
                      ← Back to Lessons
                    </button>
                    <span style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--ui-text-dim)' }}>
                      Step {activeLessonStepIndex + 1} of {currentLesson.steps.length}
                    </span>
                  </div>

                  <div style={{ background: 'rgba(0, 20, 40, 0.7)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: 8, padding: '14px 16px' }}>
                    <div style={{ fontSize: 10, color: 'var(--color-star-blue)', textTransform: 'uppercase', letterSpacing: 1, fontWeight: 600 }}>
                      {currentLesson.title}
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-star-white)', margin: '4px 0 8px 0' }}>
                      {currentStep.title}
                    </div>
                    <p style={{ color: 'var(--ui-text-secondary)', fontSize: 12, lineHeight: 1.5, marginBottom: 12 }}>
                      {currentStep.description}
                    </p>

                    <div style={{ background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: 4, borderLeft: '3px solid var(--color-star-gold)', marginBottom: 12 }}>
                      <div style={{ fontSize: 10, color: 'var(--color-star-gold)', fontWeight: 600, textTransform: 'uppercase' }}>Key Takeaway</div>
                      <div style={{ fontSize: 11.5, color: 'var(--ui-text-primary)' }}>{currentStep.keyTakeaway}</div>
                    </div>

                    {currentStep.equationOrFact && (
                      <div style={{ fontSize: 10.5, fontFamily: 'var(--font-mono)', color: 'var(--color-star-blue)' }}>
                        ℹ️ {currentStep.equationOrFact}
                      </div>
                    )}
                  </div>

                  {/* Navigation Step Buttons */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                      onClick={prevLessonStep}
                      disabled={activeLessonStepIndex === 0}
                      style={{
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: 4,
                        color: activeLessonStepIndex === 0 ? 'var(--ui-text-dim)' : 'var(--ui-text-secondary)',
                        padding: '6px 12px',
                        cursor: activeLessonStepIndex === 0 ? 'not-allowed' : 'pointer',
                        fontFamily: 'var(--font-mono)',
                        fontSize: 11,
                      }}
                    >
                      ← Previous
                    </button>

                    {activeLessonStepIndex < currentLesson.steps.length - 1 ? (
                      <button
                        onClick={nextLessonStep}
                        style={{
                          background: 'rgba(59, 130, 246, 0.3)',
                          border: '1px solid var(--ui-accent)',
                          borderRadius: 4,
                          color: 'var(--color-star-white)',
                          padding: '6px 14px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        Next Step →
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          markLessonCompleted(currentLesson.id);
                          exitLesson();
                        }}
                        style={{
                          background: 'rgba(34, 197, 94, 0.3)',
                          border: '1px solid rgba(34, 197, 94, 0.6)',
                          borderRadius: 4,
                          color: '#4ade80',
                          padding: '6px 14px',
                          cursor: 'pointer',
                          fontFamily: 'var(--font-mono)',
                          fontSize: 11,
                          fontWeight: 600,
                        }}
                      >
                        ✓ Complete Lesson
                      </button>
                    )}
                  </div>
                </div>
              )
            )}
          </div>
        )}

        {/* 2. Cosmic Timeline Tab */}
        {activeEducationTab === 'TIMELINE' && <CosmicTimeline />}

        {/* 3. Stellar Lifecycle Tab */}
        {activeEducationTab === 'LIFECYCLE' && <StellarLifecyclePanel />}

        {/* 4. Scientific Parameters Tab */}
        {activeEducationTab === 'SCIENTIFIC' && <ScientificDataPanel />}

        {/* 5. Object Comparison Tab */}
        {activeEducationTab === 'COMPARE' && <ComparisonPanel />}

        {/* 6. HR Diagram Tab */}
        {activeEducationTab === 'HR' && <HRDiagramPanel />}

        {/* 7. Progress & Help Tab */}
        {activeEducationTab === 'HELP' && <ProgressIndicator />}
      </div>
    </div>
  );
};
