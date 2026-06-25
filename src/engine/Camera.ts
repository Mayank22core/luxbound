import * as THREE from 'three';
import { GAME_CONFIG } from '../config/game';
import { lerp, clamp } from '../core/utils/MathUtils';
import { Logger } from '../core/utils/Logger';

export interface CameraController {
  camera: THREE.PerspectiveCamera;
  target: THREE.Vector3;
  follow(target: { x: number; y: number; z: number }, dt: number): void;
  orbit(mouseDeltaX: number, mouseDeltaY: number, dt: number): void;
  zoom(delta: number): void;
  shake(intensity: number, duration: number): void;
  updateShake(dt: number): void;
}

const _lookAtVec = new THREE.Vector3();

export function createCamera(initialAspect?: number): CameraController {
  const camera = new THREE.PerspectiveCamera(
    60,
    initialAspect ?? (window.innerWidth / window.innerHeight),
    0.1,
    GAME_CONFIG.RENDER_DISTANCE
  );

  const state: {
    currentX: number;
    currentZ: number;
    yaw: number;
    pitch: number;
    distance: number;
    targetDistance: number;
    minDistance: number;
    maxDistance: number;
    shakeIntensity: number;
    shakeDuration: number;
    shakeTimer: number;
  } = {
    currentX: 0,
    currentZ: GAME_CONFIG.CAMERA_OFFSET_Z,
    yaw: 0,
    pitch: 0.5,
    distance: 8,
    targetDistance: 8,
    minDistance: 3,
    maxDistance: 10,
    shakeIntensity: 0,
    shakeDuration: 0,
    shakeTimer: 0,
  };

  camera.position.set(0, 6, 10);
  _lookAtVec.set(0, 0, 0);
  camera.lookAt(_lookAtVec);

  Logger.info('Camera created');

  return {
    camera,
    target: new THREE.Vector3(),

    follow(target: { x: number; y: number; z: number }, dt: number): void {
      const t = 1 - Math.pow(0.001, dt);
      state.distance = lerp(state.distance, state.targetDistance, t * 2);

      const offsetX = Math.sin(state.yaw) * state.distance * Math.cos(state.pitch);
      const offsetY = state.distance * Math.sin(state.pitch);
      const offsetZ = Math.cos(state.yaw) * state.distance * Math.cos(state.pitch);

      const desiredX = target.x - offsetX;
      const desiredY = target.y + offsetY;
      const desiredZ = target.z - offsetZ;

      state.currentX = lerp(state.currentX, desiredX, t);
      state.currentZ = lerp(state.currentZ, desiredZ, t);

      camera.position.x = state.currentX;
      camera.position.y = lerp(camera.position.y, desiredY, t);
      camera.position.z = state.currentZ;

      _lookAtVec.set(target.x, target.y + 1, target.z);
      camera.lookAt(_lookAtVec);
    },

    orbit(mouseDeltaX: number, mouseDeltaY: number, _dt: number): void {
      const sensitivity = 0.0012;
      state.yaw -= mouseDeltaX * sensitivity;
      state.pitch = clamp(state.pitch + mouseDeltaY * sensitivity, 0.1, 1.4);
    },

    zoom(delta: number): void {
      state.targetDistance = clamp(
        state.targetDistance + delta * 0.8,
        state.minDistance,
        state.maxDistance
      );
    },

    shake(intensity: number, duration: number): void {
      state.shakeIntensity = intensity;
      state.shakeDuration = duration;
      state.shakeTimer = 0;
    },

    updateShake(dt: number): void {
      if (state.shakeTimer >= state.shakeDuration) return;

      state.shakeTimer += dt;
      const progress = state.shakeTimer / state.shakeDuration;
      const decay = 1 - progress;

      const offsetX = (Math.random() - 0.5) * 2 * state.shakeIntensity * decay;
      const offsetY = (Math.random() - 0.5) * 2 * state.shakeIntensity * decay;

      camera.position.x += offsetX;
      camera.position.y += offsetY;
    },
  };
}

export function resizeCamera(
  cameraCtrl: CameraController,
  aspect: number
): void {
  cameraCtrl.camera.aspect = aspect;
  cameraCtrl.camera.updateProjectionMatrix();
}
