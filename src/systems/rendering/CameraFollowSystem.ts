import type { System } from '../../core/ecs';
import type { InputManager } from '../../managers/InputManager';
import type { Engine } from '../../engine/Engine';
import { useGhostStore } from '../../ui/hooks/useGhostStore';
import { useGameStore } from '../../ui/hooks/useGameState';
import { useTouchInput } from '../../ui/hooks/useTouchInput';
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

        const touch = useTouchInput.getState();
        if (touch.active) {
          const { dx: touchDx, dy: touchDy } = touch.consumeCameraDelta();
          if (touchDx !== 0 || touchDy !== 0) {
            engine.camera.orbit(touchDx, touchDy, dt);
          }
          const pinchScale = touch.consumePinchScale();
          if (pinchScale !== 1) {
            const zoomDelta = (1 - pinchScale) * 500;
            engine.camera.zoom(zoomDelta);
          }
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
