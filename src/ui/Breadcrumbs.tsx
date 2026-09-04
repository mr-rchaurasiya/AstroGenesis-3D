/**
 * Breadcrumbs.tsx
 * Hierarchical navigation indicator showing the current location in the universe.
 * Allows clicking ancestor nodes to smoothly navigate the camera back to parent scales.
 */

import { useAppStore } from '../store/useAppStore';

export function Breadcrumbs() {
  const { breadcrumbs, showBreadcrumbs, resetBreadcrumbs, focusObject, navigateToPreset, enterMilkyWayMode, enterSolarSystemMode } = useAppStore();

  if (!showBreadcrumbs || breadcrumbs.length === 0) return null;

  const handleCrumbClick = (id: string, level: string, index: number) => {
    if (index === breadcrumbs.length - 1) return; // Already here

    if (id === 'universe') {
      resetBreadcrumbs();
      navigateToPreset('UNIVERSE_OVERVIEW');
    } else if (id === 'milky-way') {
      enterMilkyWayMode();
    } else if (id === 'solar-system') {
      enterSolarSystemMode('sun');
    } else if (level === 'planet' || level === 'star' || level === 'moon') {
      focusObject(id);
    }
  };

  return (
    <nav
      className="breadcrumbs fade-in"
      aria-label="Navigation breadcrumbs"
    >
      {breadcrumbs.map((crumb, index) => (
        <span key={crumb.id} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {index > 0 && (
            <span className="breadcrumb-sep" aria-hidden="true">›</span>
          )}
          <button
            className={`breadcrumb-item${index === breadcrumbs.length - 1 ? ' active' : ''}`}
            onClick={() => handleCrumbClick(crumb.id, crumb.level, index)}
            style={{
              background: 'none',
              border: 'none',
              cursor: index === breadcrumbs.length - 1 ? 'default' : 'pointer',
              color: 'inherit',
              font: 'inherit',
              padding: 0,
            }}
            aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}
          >
            {crumb.label}
          </button>
        </span>
      ))}
    </nav>
  );
}
