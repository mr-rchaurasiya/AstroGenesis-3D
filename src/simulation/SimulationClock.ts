/**
 * SimulationClock.ts
 * Centralized astrophysical simulation clock.
 * Manages simulation time (in Earth days), time scale acceleration, and date formatting.
 */

export class SimulationClock {
  private elapsedDays: number;
  private timeScale: number;
  private isPaused: boolean;

  constructor(initialDays = 0, initialTimeScale = 1) {
    this.elapsedDays = initialDays;
    this.timeScale = initialTimeScale;
    this.isPaused = false;
  }

  /**
   * Advances the simulation clock by real-time seconds (deltaSeconds).
   * 1 real-time second at timeScale=1 equals 1 Earth day of orbital motion.
   */
  public advance(deltaSeconds: number): number {
    if (this.isPaused) return this.elapsedDays;

    const daysAdvanced = deltaSeconds * this.timeScale;
    this.elapsedDays += daysAdvanced;
    return this.elapsedDays;
  }

  public getDays(): number {
    return this.elapsedDays;
  }

  public setDays(days: number): void {
    this.elapsedDays = days;
  }

  public getTimeScale(): number {
    return this.timeScale;
  }

  public setTimeScale(scale: number): void {
    this.timeScale = Math.max(0, scale);
  }

  public pause(): void {
    this.isPaused = true;
  }

  public resume(): void {
    this.isPaused = false;
  }

  public togglePause(): boolean {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  public getIsPaused(): boolean {
    return this.isPaused;
  }
}

/**
 * Formats elapsed simulation days into human-readable astronomical duration.
 */
export function formatSimulationTime(days: number): string {
  if (days < 30) {
    return `Day ${days.toFixed(1)}`;
  }
  if (days < 365.25) {
    const months = days / 30.44;
    return `${months.toFixed(1)} Months (${days.toFixed(0)} Days)`;
  }
  const years = days / 365.256;
  if (years < 1000) {
    return `${years.toFixed(2)} Years`;
  }
  if (years < 1e6) {
    return `${(years / 1e3).toFixed(1)}k Years`;
  }
  return `${(years / 1e6).toFixed(2)}M Years`;
}
