import type { System } from '../../core/ecs';
import type { InputManager } from '../../managers/InputManager';
import type { Engine } from '../../engine/Engine';
import { useGhostStore } from '../../ui/hooks/useGhostStore';
import { useGameStore } from '../../ui/hooks/useGameState';
import { GameState } from '../../constants/GameState';

export function createCameraFollowSystem(
  input: InputManager,
  engine: Engine
): System {
  return {
    name: 'CameraFollowSystem',
    priority: 90,

    update(dt: number, world): void {
      if (useGhostStore.getState().enabled) return;
      if (useGameStore.getState().state !== GameState.PLAYING) return;

      const entities = world.query('transform', 'player');
      if (entities.length === 0) return;

      const entityId = entities[0];
      const transform = world.getComponent<{ position: { x: number; y: number; z: number } }>(
        entityId,
        'transform'
      );

      if (transform) {
        const { dx: mouseDx, dy: mouseDy } = input.consumeMouseDeltas();
        if (mouseDx !== 0 || mouseDy !== 0) {
          engine.camera.orbit(mouseDx, mouseDy, dt);
        }

        const scrollDelta = input.consumeScrollDelta();
        if (scrollDelta !== 0) {
          engine.camera.zoom(scrollDelta);
        }
        engine.camera.follow(transform.position, dt);
      }
    },
  };
}
