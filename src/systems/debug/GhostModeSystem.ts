import type { System, World } from '../../core/ecs';
import type { TransformData } from '../../core/types/game';
import type { InputManager } from '../../managers/InputManager';
import type { Engine } from '../../engine/Engine';
import { DEV_CONFIG } from '../../config/dev';
import { useGhostStore } from '../../ui/hooks/useGhostStore';
import * as THREE from 'three';

const _right = new THREE.Vector3();
const _up = new THREE.Vector3(0, 1, 0);
const _dir = new THREE.Vector3();

export function createGhostModeSystem(
  input: InputManager,
  engine: Engine
): System {
  let rightMouseDown = false;
  let middleMouseDown = false;
  let panX = 0;
  let panY = 0;
  let yaw = 0;
  let pitch = 0.5;
  let wasEnabled = false;
  let savedDistance = 12;
  const ghostPos = new THREE.Vector3();
  const savedCamPos = new THREE.Vector3();

  function onMouseDown(e: MouseEvent): void {
    if (e.button === 2) rightMouseDown = true;
    if (e.button === 1) middleMouseDown = true;
  }

  function onMouseUp(e: MouseEvent): void {
    if (e.button === 2) rightMouseDown = false;
    if (e.button === 1) middleMouseDown = false;
  }

  function onMouseMove(e: MouseEvent): void {
    if (rightMouseDown) {
      yaw -= e.movementX * 0.003;
      pitch = Math.max(0.1, Math.min(1.4, pitch + e.movementY * 0.003));
    }
    if (middleMouseDown) {
      panX = e.movementX;
      panY = e.movementY;
    } else {
      panX = 0;
      panY = 0;
    }
  }

  function onContextMenu(e: Event): void {
    e.preventDefault();
  }

  window.addEventListener('mousedown', onMouseDown);
  window.addEventListener('mouseup', onMouseUp);
  window.addEventListener('mousemove', onMouseMove);
  window.addEventListener('contextmenu', onContextMenu);

  return {
    name: 'GhostModeSystem',
    priority: 95,

    update(dt: number, world: World): void {
      const ghost = useGhostStore.getState();

      if (!ghost.enabled) {
        if (wasEnabled) {
          wasEnabled = false;
          engine.lighting.setNormalLighting();
          engine.scene.fog = new THREE.Fog(0x0d0d15, 5, 50);
        }
        return;
      }

      if (!wasEnabled) {
        wasEnabled = true;
        engine.lighting.setDevBright();
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }

        const entities = world.query('transform', 'player');
        if (entities.length > 0) {
          const t = world.getComponent<TransformData>(entities[0], 'transform');
          if (t) {
            ghostPos.copy(t.position);
            savedCamPos.copy(engine.camera.camera.position);
          }
        }

        yaw = 0;
        pitch = 0.5;
        savedDistance = 12;

        ghostPos.y += 1;
        const offsetX = Math.sin(yaw) * savedDistance * Math.cos(pitch);
        const offsetY = Math.sin(pitch) * savedDistance;
        const offsetZ = Math.cos(yaw) * savedDistance * Math.cos(pitch);
        engine.camera.camera.position.set(
          ghostPos.x + offsetX,
          ghostPos.y + offsetY,
          ghostPos.z + offsetZ
        );
        engine.camera.camera.lookAt(ghostPos.x, ghostPos.y, ghostPos.z);
      }

      input.consumeMouseDeltas();

      const speed = ghost.speed * (input.state.sprint ? DEV_CONFIG.GHOST_SPRINT_MULTIPLIER : 1);

      _dir.subVectors(ghostPos, engine.camera.camera.position).normalize();

      const camForward = new THREE.Vector3();
      camForward.copy(_dir);
      camForward.y = 0;
      camForward.normalize();

      _right.crossVectors(camForward, _up).normalize();

      let inputX = 0;
      let inputZ = 0;
      let inputY = 0;

      if (input.state.forward) inputZ += 1;
      if (input.state.backward) inputZ -= 1;
      if (input.state.left) inputX -= 1;
      if (input.state.right) inputX += 1;

      if (input.state.ability1) inputY += 1;
      if (input.state.ability2) inputY -= 1;

      const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
      if (len > 0) {
        inputX /= len;
        inputZ /= len;
      }

      const worldMoveX = camForward.x * inputZ + _right.x * inputX;
      const worldMoveZ = camForward.z * inputZ + _right.z * inputX;

      ghostPos.x += worldMoveX * speed * dt;
      ghostPos.z += worldMoveZ * speed * dt;
      ghostPos.y += inputY * speed * dt;

      if (middleMouseDown) {
        const panSpeed = 0.03;
        ghostPos.x -= (_right.x * panX) * panSpeed * savedDistance;
        ghostPos.z -= (_right.z * panX) * panSpeed * savedDistance;
        ghostPos.y += panY * panSpeed * savedDistance;
        panX = 0;
        panY = 0;
      }

      const scrollDelta = input.consumeScrollDelta();
      if (scrollDelta !== 0) {
        savedDistance = Math.max(
          DEV_CONFIG.GHOST_MIN_ZOOM,
          Math.min(DEV_CONFIG.GHOST_MAX_ZOOM, savedDistance + scrollDelta * 0.02)
        );
      }

      const offsetX = Math.sin(yaw) * savedDistance * Math.cos(pitch);
      const offsetY = Math.sin(pitch) * savedDistance;
      const offsetZ = Math.cos(yaw) * savedDistance * Math.cos(pitch);

      engine.camera.camera.position.set(
        ghostPos.x + offsetX,
        ghostPos.y + offsetY,
        ghostPos.z + offsetZ
      );
      engine.camera.camera.lookAt(ghostPos.x, ghostPos.y, ghostPos.z);

      engine.scene.fog = new THREE.Fog(0x1a1a2e, DEV_CONFIG.GHOST_FOG_NEAR, DEV_CONFIG.GHOST_FOG_FAR);
    },

    destroy(): void {
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('contextmenu', onContextMenu);
    },
  };
}
