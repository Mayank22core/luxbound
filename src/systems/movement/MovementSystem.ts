import type { System, World } from '../../core/ecs';
import type { TransformData, VelocityData } from '../../core/types/game';
import type { InputManager } from '../../managers/InputManager';
import type { Engine } from '../../engine/Engine';
import { GAME_CONFIG } from '../../config/game';
import { useGhostStore } from '../../ui/hooks/useGhostStore';
import { useGameStore } from '../../ui/hooks/useGameState';
import { useTouchInput } from '../../ui/hooks/useTouchInput';
import { GameState } from '../../constants/GameState';
import * as THREE from 'three';

const _forward = new THREE.Vector3();
const _right = new THREE.Vector3();

export function createMovementSystem(
  input: InputManager,
  engine: Engine,
  colliders?: THREE.Box3[]
): System {
  const tempBox = new THREE.Box3();
  const playerSize = new THREE.Vector3(0.6, 1.2, 0.6);

  return {
    name: 'MovementSystem',
    priority: 10,

    update(dt: number, world: World): void {
      const ghost = useGhostStore.getState();
      if (ghost.enabled) return;

      const gs = useGameStore.getState();
      if (gs.state !== GameState.PLAYING) return;

      const entities = world.query('transform', 'velocity', 'player');

      const cam = engine.camera.camera;
      cam.getWorldDirection(_forward);
      _forward.y = 0;
      _forward.normalize();

      _right.crossVectors(_forward, new THREE.Vector3(0, 1, 0)).normalize();

      for (const entityId of entities) {
        const transform = world.getComponent<TransformData>(entityId, 'transform');
        const velocity = world.getComponent<VelocityData>(entityId, 'velocity');

        if (!transform || !velocity) continue;

        let inputX = 0;
        let inputZ = 0;

        if (input.state.forward) inputZ += 1;
        if (input.state.backward) inputZ -= 1;
        if (input.state.left) inputX -= 1;
        if (input.state.right) inputX += 1;

        const touch = useTouchInput.getState();
        if (touch.active) {
          inputX += touch.joystickX;
          inputZ -= touch.joystickY;
        }

        const len = Math.sqrt(inputX * inputX + inputZ * inputZ);
        if (len > 0) {
          inputX /= len;
          inputZ /= len;
        }

        const sprinting = input.state.sprint || touch.sprinting;
        const speed = sprinting
          ? velocity.maxSpeed * GAME_CONFIG.PLAYER_SPRINT_MULTIPLIER
          : velocity.maxSpeed;

        const worldMoveX = _forward.x * inputZ + _right.x * inputX;
        const worldMoveZ = _forward.z * inputZ + _right.z * inputX;

        const newX = transform.position.x + worldMoveX * speed * dt;
        const newZ = transform.position.z + worldMoveZ * speed * dt;

        if (colliders && colliders.length > 0) {
          const testMin = new THREE.Vector3(
            newX - playerSize.x / 2,
            transform.position.y - playerSize.y / 2,
            newZ - playerSize.z / 2
          );
          const testMax = new THREE.Vector3(
            newX + playerSize.x / 2,
            transform.position.y + playerSize.y / 2,
            newZ + playerSize.z / 2
          );
          tempBox.min.copy(testMin);
          tempBox.max.copy(testMax);

          let blocked = false;
          for (const collider of colliders) {
            if (tempBox.intersectsBox(collider)) {
              blocked = true;
              break;
            }
          }

          if (!blocked) {
            transform.position.x = newX;
            transform.position.z = newZ;
          } else {
            const testX = new THREE.Vector3(
              newX - playerSize.x / 2,
              transform.position.y - playerSize.y / 2,
              transform.position.z - playerSize.z / 2
            );
            const testXMax = new THREE.Vector3(
              newX + playerSize.x / 2,
              transform.position.y + playerSize.y / 2,
              transform.position.z + playerSize.z / 2
            );
            tempBox.min.copy(testX);
            tempBox.max.copy(testXMax);
            let xBlocked = false;
            for (const collider of colliders) {
              if (tempBox.intersectsBox(collider)) {
                xBlocked = true;
                break;
              }
            }
            if (!xBlocked) {
              transform.position.x = newX;
            }

            const testZ = new THREE.Vector3(
              transform.position.x - playerSize.x / 2,
              transform.position.y - playerSize.y / 2,
              newZ - playerSize.z / 2
            );
            const testZMax = new THREE.Vector3(
              transform.position.x + playerSize.x / 2,
              transform.position.y + playerSize.y / 2,
              newZ + playerSize.z / 2
            );
            tempBox.min.copy(testZ);
            tempBox.max.copy(testZMax);
            let zBlocked = false;
            for (const collider of colliders) {
              if (tempBox.intersectsBox(collider)) {
                zBlocked = true;
                break;
              }
            }
            if (!zBlocked) {
              transform.position.z = newZ;
            }
          }
        } else {
          transform.position.x = newX;
          transform.position.z = newZ;
        }

        transform.position.y = 0.5;

        if (len > 0) {
          transform.rotation.y = Math.atan2(worldMoveX, worldMoveZ);
        }
      }
    },
  };
}
