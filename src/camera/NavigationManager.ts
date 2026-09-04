/**
 * @file NavigationManager.ts
 * @description Hierarchical navigation manager, history stack, and scale transition orchestrator.
 */

import type { NavigationLevel, NavigationNode } from '../store/useAppStore';
import type { NavigationHistoryItem, CameraPresetId } from './CameraTypes';

export class NavigationManager {
  private history: NavigationHistoryItem[] = [];
  private historyIndex = -1;
  private readonly maxHistory = 25;

  /**
   * Push a new location to history.
   */
  public pushHistory(item: NavigationHistoryItem): void {
    // If we're in the middle of history and navigate to a new place, truncate future
    if (this.historyIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.historyIndex + 1);
    }

    // Avoid duplicates of current active item
    const current = this.getCurrent();
    if (current && current.id === item.id) return;

    this.history.push(item);
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    this.historyIndex = this.history.length - 1;
  }

  public canGoBack(): boolean {
    return this.historyIndex > 0;
  }

  public canGoForward(): boolean {
    return this.historyIndex < this.history.length - 1;
  }

  public goBack(): NavigationHistoryItem | null {
    if (!this.canGoBack()) return null;
    this.historyIndex--;
    return this.history[this.historyIndex];
  }

  public goForward(): NavigationHistoryItem | null {
    if (!this.canGoForward()) return null;
    this.historyIndex++;
    return this.history[this.historyIndex];
  }

  public getCurrent(): NavigationHistoryItem | null {
    if (this.historyIndex >= 0 && this.historyIndex < this.history.length) {
      return this.history[this.historyIndex];
    }
    return null;
  }

  /**
   * Generates breadcrumbs hierarchy for a given target ID.
   */
  public static buildBreadcrumbsForTarget(
    targetId: string,
    level: NavigationLevel,
    targetName: string,
    parentBodyId?: string
  ): NavigationNode[] {
    const crumbs: NavigationNode[] = [
      { id: 'universe', label: 'Universe', level: 'universe' },
    ];

    if (level === 'universe') return crumbs;

    if (level === 'galaxy' || targetId === 'milky-way') {
      crumbs.push({ id: 'milky-way', label: 'Milky Way', level: 'galaxy' });
      return crumbs;
    }

    if (level === 'solar-system') {
      crumbs.push({ id: 'milky-way', label: 'Milky Way', level: 'galaxy' });
      crumbs.push({ id: 'solar-system', label: 'Solar System', level: 'solar-system' });
      return crumbs;
    }

    if (level === 'star' || targetId === 'sun') {
      crumbs.push({ id: 'milky-way', label: 'Milky Way', level: 'galaxy' });
      crumbs.push({ id: 'solar-system', label: 'Solar System', level: 'solar-system' });
      crumbs.push({ id: 'sun', label: 'The Sun', level: 'star' });
      return crumbs;
    }

    if (level === 'planet') {
      crumbs.push({ id: 'milky-way', label: 'Milky Way', level: 'galaxy' });
      crumbs.push({ id: 'solar-system', label: 'Solar System', level: 'solar-system' });
      crumbs.push({ id: targetId, label: targetName, level: 'planet' });
      return crumbs;
    }

    if (level === 'moon') {
      crumbs.push({ id: 'milky-way', label: 'Milky Way', level: 'galaxy' });
      crumbs.push({ id: 'solar-system', label: 'Solar System', level: 'solar-system' });
      if (parentBodyId) {
        const parentName = parentBodyId.charAt(0).toUpperCase() + parentBodyId.slice(1);
        crumbs.push({ id: parentBodyId, label: parentName, level: 'planet' });
      }
      crumbs.push({ id: targetId, label: targetName, level: 'moon' });
      return crumbs;
    }

    return crumbs;
  }

  /**
   * Maps a preset ID to the appropriate navigation level.
   */
  public static mapPresetToLevel(presetId: CameraPresetId): NavigationLevel {
    switch (presetId) {
      case 'UNIVERSE_OVERVIEW': return 'universe';
      case 'GALAXY_OVERVIEW': return 'galaxy-cluster';
      case 'MILKY_WAY_OVERVIEW': return 'galaxy';
      case 'SOLAR_SYSTEM_OVERVIEW': return 'solar-system';
      case 'SUN_CLOSEUP': return 'star';
      case 'EARTH_MOON':
      case 'JUPITER_SYSTEM':
      case 'SATURN_SYSTEM':
        return 'planet';
    }
  }
}

export const navigationManager = new NavigationManager();
