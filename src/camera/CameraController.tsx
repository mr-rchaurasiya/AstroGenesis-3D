/**
 * @file CameraController.tsx
 * @description Advanced R3F camera controller supporting Orbit, Pan, Zoom, Smooth Transitions,
 * Live Moving Target Tracking (Planets/Moons/Comets), Scale-Aware Damping, Dynamic Clipping, and Keyboard Shortcuts.
 */

import React, { useRef, useEffect, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib';
import * as THREE from 'three';
import { useAppStore } from '../store/useAppStore';
import {
  resolveLiveTargetInfo,
  calculateAdaptiveClippingPlanes,
  calculateScaleAwareZoomSpeed,
} from './CameraUtils';
import {
  smoothDampVector3,
  calculateDynamicTransitionDuration,
} from './CameraTransitions';
import { CAMERA_PRESETS } from './CameraPresets';
import type { CameraTransitionRequest } from './CameraTypes';

export const CameraController: React.FC = () => {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  // Zustand Store state
  const cameraMode = useAppStore((s) => s.cameraMode);
  const setCameraMode = useAppStore((s) => s.setCameraMode);
  const focusTargetId = useAppStore((s) => s.focusTargetId);
  const navigationLevel = useAppStore((s) => s.navigationLevel);
  const selectedSolarBodyId = useAppStore((s) => s.selectedSolarBodyId);
  const selectedGalaxyId = useAppStore((s) => s.selectedGalaxyId);
  const solarScaleMode = useAppStore((s) => s.solarScaleMode);
  const isSolarSystemMode = useAppStore((s) => s.isSolarSystemMode);
  const isMilkyWayMode = useAppStore((s) => s.isMilkyWayMode);
  const pendingCameraPreset = useAppStore((s) => s.pendingCameraPreset);
  const clearPendingCameraPreset = useAppStore((s) => s.clearPendingCameraPreset);
  const resetCameraRequested = useAppStore((s) => s.resetCameraRequested);
  const clearResetCameraRequest = useAppStore((s) => s.clearResetCameraRequest);
  const focusObject = useAppStore((s) => s.focusObject);
  const exitFocus = useAppStore((s) => s.exitFocus);

  // Transition state ref (zero per-frame react re-renders)
  const transitionRef = useRef<CameraTransitionRequest | null>(null);
  const velocityPosRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const velocityTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Target smoothing for FOLLOW mode
  const currentFollowTargetRef = useRef<THREE.Vector3>(new THREE.Vector3());
  const followVelocityRef = useRef<THREE.Vector3>(new THREE.Vector3());

  // Keyboard navigation state
  const keysPressed = useRef<Record<string, boolean>>({});

  // Initialize OrbitControls manually for total low-level authority
  useEffect(() => {
    const controls = new OrbitControlsImpl(camera, gl.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = true;
    controls.enableZoom = false; // Custom cursor-centric zoom handles wheel events
    controls.enableRotate = true;
    // Prevent polar singularity / gimbal flip which causes NaN view matrices
    controls.minPolarAngle = 0.05;
    controls.maxPolarAngle = Math.PI - 0.05;
    controls.mouseButtons = {
      LEFT: THREE.MOUSE.ROTATE,
      MIDDLE: THREE.MOUSE.PAN,
      RIGHT: THREE.MOUSE.PAN,
    };
    controls.minDistance = 0.5;
    controls.maxDistance = 80000;
    controls.rotateSpeed = 0.5;
    controls.panSpeed = 0.8;

    const handleStart = () => {
      transitionRef.current = null;
      if (useAppStore.getState().cameraMode === 'TRANSITION') {
        useAppStore.getState().setCameraMode('FREE');
      }
    };
    controls.addEventListener('start', handleStart);
    controlsRef.current = controls;

    return () => {
      controls.removeEventListener('start', handleStart);
      controls.dispose();
      controlsRef.current = null;
    };
  }, [camera, gl.domElement]);

  // Cursor-Centric (Zoom-to-Mouse-Pointer) Wheel Event Handler
  useEffect(() => {
    const domElement = gl.domElement;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const controls = controlsRef.current;
      if (!controls) return;

      // If camera was transitioning, release to free mode
      if (useAppStore.getState().cameraMode === 'TRANSITION') {
        transitionRef.current = null;
        useAppStore.getState().setCameraMode('FREE');
      }

      const rect = domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      // Determine scale-aware zoom speed
      const cam = camera as THREE.PerspectiveCamera;
      const currentDist = cam.position.distanceTo(controls.target);
      if (isNaN(currentDist) || currentDist <= 0.01) return;

      const zoomIntensity = Math.min(0.002, Math.max(0.0008, 0.0012 * (1 + Math.log10(Math.max(1, currentDist)) * 0.1)));
      const zoomFactor = Math.exp(e.deltaY * zoomIntensity);

      const newDist = currentDist * zoomFactor;

      // Enforce bounds
      if (newDist < controls.minDistance || newDist > controls.maxDistance) {
        return;
      }

      // Cast ray from mouse NDC through camera
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cam);
      const ray = raycaster.ray;

      // Create plane perpendicular to camera viewing direction passing through controls.target
      const camForward = new THREE.Vector3().subVectors(controls.target, cam.position).normalize();
      if (camForward.lengthSq() < 0.001) return;

      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camForward, controls.target);
      const intersection = new THREE.Vector3();
      const hit = ray.intersectPlane(plane, intersection);

      if (hit && !isNaN(intersection.x) && !isNaN(intersection.y) && !isNaN(intersection.z)) {
        const distFromTarget = intersection.distanceTo(controls.target);
        // Only apply pivot offset if intersection is within reasonable distance
        if (distFromTarget < currentDist * 3.0) {
          const pivot = intersection;
          const newCamPos = pivot.clone().add(cam.position.clone().sub(pivot).multiplyScalar(zoomFactor));
          const newTarget = pivot.clone().add(controls.target.clone().sub(pivot).multiplyScalar(zoomFactor));

          if (!isNaN(newCamPos.x) && !isNaN(newTarget.x)) {
            cam.position.copy(newCamPos);
            controls.target.copy(newTarget);
            return;
          }
        }
      }

      // Fallback: standard camera forward zoom
      const newCamPos = controls.target.clone().add(
        cam.position.clone().sub(controls.target).multiplyScalar(zoomFactor)
      );
      if (!isNaN(newCamPos.x)) {
        cam.position.copy(newCamPos);
      }
    };

    domElement.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      domElement.removeEventListener('wheel', handleWheel);
    };
  }, [camera, gl.domElement]);

  // Start a smooth camera transition
  const startTransition = useCallback((
    targetPos: [number, number, number],
    targetLookAt: [number, number, number],
    targetId?: string,
    followAfter = true
  ) => {
    if (!controlsRef.current) return;

    const startPos: [number, number, number] = [camera.position.x, camera.position.y, camera.position.z];
    const startTarget: [number, number, number] = [
      controlsRef.current.target.x,
      controlsRef.current.target.y,
      controlsRef.current.target.z,
    ];

    const dist = new THREE.Vector3(...startPos).distanceTo(new THREE.Vector3(...targetPos));
    const duration = calculateDynamicTransitionDuration(dist);

    transitionRef.current = {
      startPos,
      endPos: targetPos,
      startTarget,
      endTarget: targetLookAt,
      duration,
      startTime: performance.now() / 1000,
      targetId,
      followAfterArrival: followAfter,
    };

    velocityPosRef.current.set(0, 0, 0);
    velocityTargetRef.current.set(0, 0, 0);
    setCameraMode('TRANSITION');
  }, [camera, setCameraMode]);

  // Handle Focus on target ID change
  useEffect(() => {
    if (!focusTargetId) return;

    const currentSimDays = useAppStore.getState().solarSimulationTimeDays;
    const targetInfo = resolveLiveTargetInfo(focusTargetId, currentSimDays, solarScaleMode);
    if (!targetInfo) return;

    const targetVec = new THREE.Vector3(...targetInfo.position);
    // Position camera offset obliquely from the object
    const offsetDir = new THREE.Vector3(0.5, 0.35, 0.8).normalize();
    const cameraPos = targetVec.clone().add(offsetDir.multiplyScalar(targetInfo.framingDistance));

    startTransition(
      [cameraPos.x, cameraPos.y, cameraPos.z],
      [targetVec.x, targetVec.y, targetVec.z],
      focusTargetId,
      true
    );
  }, [focusTargetId, solarScaleMode, startTransition]);

  // Handle Preset navigation
  useEffect(() => {
    if (!pendingCameraPreset) return;
    const preset = CAMERA_PRESETS[pendingCameraPreset];
    if (preset) {
      if (preset.associatedBodyId) {
        focusObject(preset.associatedBodyId);
      } else {
        startTransition(preset.position, preset.target, undefined, false);
      }
    }
    clearPendingCameraPreset();
  }, [pendingCameraPreset, clearPendingCameraPreset, startTransition, focusObject]);

  // Handle Camera Reset request
  useEffect(() => {
    if (!resetCameraRequested) return;

    if (isSolarSystemMode) {
      startTransition([0, 60, 95], [0, 0, 0], undefined, false);
    } else if (isMilkyWayMode) {
      startTransition([0, 45, 75], [0, 0, 0], undefined, false);
    } else {
      startTransition([0, 0, 140], [0, 0, 0], undefined, false);
    }

    exitFocus();
    clearResetCameraRequest();
  }, [resetCameraRequested, isSolarSystemMode, isMilkyWayMode, exitFocus, clearResetCameraRequest, startTransition]);

  // Keyboard Event Listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore key events when user is typing in input or select elements
      const activeTag = document.activeElement?.tagName.toLowerCase();
      if (activeTag === 'input' || activeTag === 'select' || activeTag === 'textarea') {
        return;
      }

      keysPressed.current[e.key.toUpperCase()] = true;
      keysPressed.current[e.code] = true;

      // Single-action shortcut keys
      if (e.key === 'r' || e.key === 'R') {
        useAppStore.getState().resetCamera();
      } else if (e.key === 'f' || e.key === 'F') {
        const selected = selectedSolarBodyId || selectedGalaxyId;
        if (selected) {
          useAppStore.getState().focusObject(selected);
        }
      } else if (e.key === 'Escape') {
        useAppStore.getState().exitFocus();
      } else if (e.key === 'Home') {
        useAppStore.getState().navigateToPreset('UNIVERSE_OVERVIEW');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toUpperCase()] = false;
      keysPressed.current[e.code] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedSolarBodyId, selectedGalaxyId]);

  // Double-Click to Focus or Re-Center at Cursor
  useEffect(() => {
    const handleDoubleClick = (e: MouseEvent) => {
      const selected = useAppStore.getState().selectedSolarBodyId || useAppStore.getState().selectedGalaxyId;
      if (selected) {
        useAppStore.getState().focusObject(selected);
        return;
      }

      // If no object selected, smoothly re-center the screen on the double-clicked cursor point
      const controls = controlsRef.current;
      if (!controls) return;

      const rect = gl.domElement.getBoundingClientRect();
      const ndcX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const cam = camera as THREE.PerspectiveCamera;
      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), cam);

      const camForward = new THREE.Vector3().subVectors(controls.target, cam.position).normalize();
      const plane = new THREE.Plane().setFromNormalAndCoplanarPoint(camForward, controls.target);
      const intersection = new THREE.Vector3();

      if (raycaster.ray.intersectPlane(plane, intersection)) {
        const offset = intersection.clone().sub(controls.target);
        const newCameraPos = cam.position.clone().add(offset);
        const newTargetPos = intersection;

        startTransition(
          [newCameraPos.x, newCameraPos.y, newCameraPos.z],
          [newTargetPos.x, newTargetPos.y, newTargetPos.z],
          undefined,
          false
        );
      }
    };

    gl.domElement.addEventListener('dblclick', handleDoubleClick);
    return () => {
      gl.domElement.removeEventListener('dblclick', handleDoubleClick);
    };
  }, [camera, gl.domElement, startTransition]);

  // Frame update loop
  useFrame((state, delta) => {
    const controls = controlsRef.current;
    if (!controls) return;

    const frameCamera = state.camera as THREE.PerspectiveCamera;
    const safeDelta = Math.min(0.1, Math.max(0.001, delta));
    const now = performance.now() / 1000;

    // Safety recovery: Ensure camera position and target never stay NaN
    if (isNaN(frameCamera.position.x) || isNaN(frameCamera.position.y) || isNaN(frameCamera.position.z)) {
      frameCamera.position.set(0, 60, 95);
    }
    if (isNaN(controls.target.x) || isNaN(controls.target.y) || isNaN(controls.target.z)) {
      controls.target.set(0, 0, 0);
    }

    const simTimeDays = useAppStore.getState().solarSimulationTimeDays;

    // ── 1. TRANSITION MODE ──────────────────────────────────────────────────
    if (cameraMode === 'TRANSITION' && transitionRef.current) {
      const tr = transitionRef.current;
      const elapsed = now - tr.startTime;
      const tNorm = Math.min(1.0, elapsed / tr.duration);

      // If transition has a live moving target, keep updating destination
      if (tr.targetId) {
        const liveInfo = resolveLiveTargetInfo(tr.targetId, simTimeDays, solarScaleMode);
        if (liveInfo) {
          tr.endTarget = liveInfo.position;
        }
      }

      const targetLookAt = new THREE.Vector3(...tr.endTarget);
      const targetPos = new THREE.Vector3(...tr.endPos);

      // Smoothly damp camera position and target
      const newPos = smoothDampVector3(
        frameCamera.position,
        targetPos,
        velocityPosRef.current,
        0.3,
        1500,
        safeDelta
      );
      const newTarget = smoothDampVector3(
        controls.target,
        targetLookAt,
        velocityTargetRef.current,
        0.3,
        1500,
        safeDelta
      );

      if (!isNaN(newPos.x) && !isNaN(newTarget.x)) {
        frameCamera.position.copy(newPos);
        controls.target.copy(newTarget);
      }

      // Arrival condition
      if (tNorm >= 1.0 || (frameCamera.position.distanceTo(targetPos) < 0.2 && controls.target.distanceTo(targetLookAt) < 0.2)) {
        frameCamera.position.copy(targetPos);
        controls.target.copy(targetLookAt);
        transitionRef.current = null;

        if (tr.followAfterArrival && tr.targetId) {
          setCameraMode('FOLLOW');
          currentFollowTargetRef.current.copy(targetLookAt);
          followVelocityRef.current.set(0, 0, 0);
        } else {
          setCameraMode('FREE');
        }
      }
    }

    // ── 2. FOLLOW / FOCUS MODE (Moving target tracking) ─────────────────────
    else if ((cameraMode === 'FOLLOW' || cameraMode === 'FOCUS') && focusTargetId) {
      const liveInfo = resolveLiveTargetInfo(focusTargetId, simTimeDays, solarScaleMode);
      if (liveInfo) {
        const targetWorldPos = new THREE.Vector3(...liveInfo.position);
        
        // Calculate offset delta between previous target position and new target position
        const targetDelta = targetWorldPos.clone().sub(controls.target);

        // Move camera position along with target to maintain relative orbit angle
        frameCamera.position.add(targetDelta);

        // Smoothly update controls target
        controls.target.copy(targetWorldPos);
      }
    }

    // ── 3. CONTINUOUS KEYBOARD NAVIGATION ───────────────────────────────────
    const keys = keysPressed.current;
    if (keys['W'] || keys['KeyW']) {
      // Zoom in
      const dir = controls.target.clone().sub(frameCamera.position).normalize();
      const speed = Math.max(0.5, frameCamera.position.distanceTo(controls.target) * 1.5 * safeDelta);
      if (frameCamera.position.distanceTo(controls.target) > controls.minDistance + 0.5) {
        frameCamera.position.add(dir.multiplyScalar(speed));
      }
    }
    if (keys['S'] || keys['KeyS']) {
      // Zoom out
      const dir = frameCamera.position.clone().sub(controls.target).normalize();
      const speed = Math.max(0.5, frameCamera.position.distanceTo(controls.target) * 1.5 * safeDelta);
      frameCamera.position.add(dir.multiplyScalar(speed));
    }
    if (keys['A'] || keys['KeyA'] || keys['ArrowLeft']) {
      // Orbit yaw left
      const offset = frameCamera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), safeDelta * 1.2);
      frameCamera.position.copy(controls.target.clone().add(offset));
    }
    if (keys['D'] || keys['KeyD'] || keys['ArrowRight']) {
      // Orbit yaw right
      const offset = frameCamera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), -safeDelta * 1.2);
      frameCamera.position.copy(controls.target.clone().add(offset));
    }
    if (keys['Q'] || keys['KeyQ'] || keys['ArrowUp']) {
      // Orbit pitch up
      const offset = frameCamera.position.clone().sub(controls.target);
      let right = new THREE.Vector3().crossVectors(offset, new THREE.Vector3(0, 1, 0));
      if (right.lengthSq() < 0.0001) {
        right = new THREE.Vector3(1, 0, 0);
      } else {
        right.normalize();
      }
      offset.applyAxisAngle(right, -safeDelta * 0.8);
      frameCamera.position.copy(controls.target.clone().add(offset));
    }
    if (keys['E'] || keys['KeyE'] || keys['ArrowDown']) {
      // Orbit pitch down
      const offset = frameCamera.position.clone().sub(controls.target);
      let right = new THREE.Vector3().crossVectors(offset, new THREE.Vector3(0, 1, 0));
      if (right.lengthSq() < 0.0001) {
        right = new THREE.Vector3(1, 0, 0);
      } else {
        right.normalize();
      }
      offset.applyAxisAngle(right, safeDelta * 0.8);
      frameCamera.position.copy(controls.target.clone().add(offset));
    }

    // ── 4. SCALE-AWARE CONTROLS & DYNAMIC CLIPPING ─────────────────────────
    const currentDistance = frameCamera.position.distanceTo(controls.target);
    controls.zoomSpeed = calculateScaleAwareZoomSpeed(currentDistance);

    // Adaptive clipping planes based on camera distance
    const { near, far } = calculateAdaptiveClippingPlanes(currentDistance, navigationLevel);
    if (frameCamera && (Math.abs(frameCamera.near - near) > 0.01 || Math.abs(frameCamera.far - far) > 100)) {
      frameCamera.near = near;
      frameCamera.far = far;
      frameCamera.updateProjectionMatrix();
    }

    // Update orbit controls
    controls.update();
  });

  return null;
};
