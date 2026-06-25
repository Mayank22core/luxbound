import * as THREE from 'three';
import type { World, System } from '../core/ecs';
import { createWorld } from '../core/ecs';
import { Logger } from '../core/utils/Logger';
import { GAME_CONFIG } from '../config/game';
import { createRenderer, resizeRenderer } from './Renderer';
import { createScene } from './Scene';
import { createCamera, resizeCamera, type CameraController } from './Camera';
import { createBasicLighting, type LightingController } from './Lighting';

export interface Engine {
  world: World;
  scene: THREE.Scene;
  renderer: THREE.WebGLRenderer;
  camera: CameraController;
  lighting: LightingController;
  systems: System[];
  isRunning: boolean;
  addSystem(system: System): void;
  removeSystem(name: string): void;
  start(): void;
  stop(): void;
  destroy(): void;
}

export function createEngine(canvas: HTMLCanvasElement): Engine {
  const world = createWorld();
  const scene = createScene();
  const renderer = createRenderer(canvas);
  const initVP = getViewportSize();
  const camera = createCamera(initVP.width / initVP.height);

  const lighting = createBasicLighting(scene);
  lighting.updateScene(scene);

  const systems: System[] = [];
  let animFrameId: number | null = null;
  let lastTime = 0;
  let accumulator = 0;

  const engine: Engine = {
    world,
    scene,
    renderer,
    camera,
    lighting,
    systems,
    isRunning: false,

    addSystem(system: System): void {
      systems.push(system);
      systems.sort((a, b) => a.priority - b.priority);
      Logger.debug(`System added: ${system.name} (priority: ${system.priority})`);
      if (system.init) {
        system.init(world);
      }
    },

    removeSystem(name: string): void {
      const idx = systems.findIndex((s) => s.name === name);
      if (idx >= 0) {
        const sys = systems[idx];
        if (sys.destroy) sys.destroy();
        systems.splice(idx, 1);
        Logger.debug(`System removed: ${name}`);
      }
    },

    start(): void {
      if (engine.isRunning) return;
      engine.isRunning = true;
      lastTime = performance.now();
      Logger.info('Engine started');
      loop(performance.now());
    },

    stop(): void {
      if (animFrameId !== null) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
      engine.isRunning = false;
      Logger.info('Engine stopped');
    },

    destroy(): void {
      engine.stop();
      systems.forEach((s) => {
        if (s.destroy) s.destroy();
      });
      systems.length = 0;
      renderer.dispose();
      Logger.info('Engine destroyed');
    },
  };

  function loop(now: number): void {
    if (!engine.isRunning) return;

    const rawDt = (now - lastTime) / 1000;
    const dt = Math.min(rawDt, 0.1);
    lastTime = now;

    accumulator += dt;
    let steps = 0;

    while (accumulator >= GAME_CONFIG.FIXED_TIMESTEP && steps < GAME_CONFIG.MAX_FRAME_SKIP) {
      for (const system of systems) {
        system.update(GAME_CONFIG.FIXED_TIMESTEP, world);
      }
      accumulator -= GAME_CONFIG.FIXED_TIMESTEP;
      steps++;
    }

    camera.updateShake(dt);
    renderer.render(scene, camera.camera);

    animFrameId = requestAnimationFrame(loop);
  }

  function getViewportSize(): { width: number; height: number } {
    const vvp = window.visualViewport;
    if (vvp) {
      return { width: vvp.width, height: vvp.height };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }

  function onResize(): void {
    const { width, height } = getViewportSize();
    resizeRenderer(renderer, width, height);
    resizeCamera(camera, width / height);
  }

  window.addEventListener('resize', onResize);
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', onResize);
  }

  Logger.info('Engine created');
  return engine;
}
