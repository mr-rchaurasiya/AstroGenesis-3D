/**
 * @file CameraTransitions.ts
 * @description Smooth cinematic camera interpolation, damping curves, and transition trajectory solvers.
 */

import * as THREE from 'three';

export function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function smoothDampVector3(
  current: THREE.Vector3,
  target: THREE.Vector3,
  currentVelocity: THREE.Vector3,
  smoothTime: number,
  maxSpeed: number,
  deltaTime: number
): THREE.Vector3 {
  // Critical damping algorithm
  const safeSmoothTime = Math.max(0.0001, smoothTime);
  const omega = 2.0 / safeSmoothTime;
  const x = omega * deltaTime;
  const exp = 1.0 / (1.0 + x + 0.48 * x * x + 0.235 * x * x * x);

  const change = current.clone().sub(target);
  const originalTo = target.clone();

  // Clamp maximum speed
  const maxChange = maxSpeed * safeSmoothTime;
  const changeLength = change.length();
  if (changeLength > maxChange) {
    change.multiplyScalar(maxChange / changeLength);
  }

  const clampedTarget = current.clone().sub(change);
  const temp = currentVelocity.clone().add(change.multiplyScalar(omega)).multiplyScalar(deltaTime);
  
  currentVelocity.sub(temp.clone().multiplyScalar(omega)).multiplyScalar(exp);
  
  const output = clampedTarget.clone().add(change.add(temp).multiplyScalar(exp));

  // Prevent overshooting
  if (originalTo.clone().sub(current).dot(output.clone().sub(originalTo)) > 0) {
    output.copy(originalTo);
    currentVelocity.set(0, 0, 0);
  }

  return output;
}

/**
 * Calculates a dynamic transition duration in seconds based on Euclidean distance.
 */
export function calculateDynamicTransitionDuration(distance: number): number {
  if (distance < 5.0) return 0.8;
  if (distance < 50.0) return 1.2;
  if (distance < 500.0) return 1.6;
  if (distance < 3000.0) return 2.0;
  return 2.4; // Max duration capped at 2.4s for snappy responsive UX
}
