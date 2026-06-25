import * as THREE from 'three';
import { Logger } from '../core/utils/Logger';

export interface LightingController {
  ambient: THREE.AmbientLight;
  directional: THREE.DirectionalLight;
  point: THREE.PointLight;
  setDevBright(): void;
  setNormalLighting(): void;
  setLightLevel(level: number): void;
  updateScene(scene: THREE.Scene): void;
}

export function createBasicLighting(scene: THREE.Scene): LightingController {
  const ambient = new THREE.AmbientLight(0x221133, 0.3);
  scene.add(ambient);

  const directional = new THREE.DirectionalLight(0xffeedd, 0.6);
  directional.position.set(10, 15, 10);
  directional.castShadow = true;
  directional.shadow.mapSize.width = 2048;
  directional.shadow.mapSize.height = 2048;
  directional.shadow.camera.near = 0.5;
  directional.shadow.camera.far = 50;
  directional.shadow.camera.left = -20;
  directional.shadow.camera.right = 20;
  directional.shadow.camera.top = 20;
  directional.shadow.camera.bottom = -20;
  scene.add(directional);

  const pointLight = new THREE.PointLight(0x4400ff, 1, 20);
  pointLight.position.set(0, 3, 0);
  scene.add(pointLight);

  const DARK = { ambient: 0.3, directional: 0.6, point: 1.0, pointColor: 0x4400ff, bg: 0x0d0d15 };
  const BRIGHT = { ambient: 0.8, directional: 1.4, point: 0.3, pointColor: 0xffeedd, bg: 0x1a1a2e };

  let devBright = false;
  let boundScene: THREE.Scene | null = null;

  function applyLighting(dark: boolean): void {
    if (devBright) {
      ambient.intensity = 1.5;
      directional.intensity = 2.5;
      directional.position.set(10, 25, 10);
      directional.shadow.camera.left = -80;
      directional.shadow.camera.right = 80;
      directional.shadow.camera.top = 80;
      directional.shadow.camera.bottom = -80;
      directional.shadow.camera.far = 200;
      directional.shadow.mapSize.width = 4096;
      directional.shadow.mapSize.height = 4096;
      pointLight.intensity = 0;
      if (boundScene) {
        boundScene.background = new THREE.Color(0x2a2a4e);
        boundScene.fog = null;
      }
      return;
    }
    const cfg = dark ? DARK : BRIGHT;
    ambient.intensity = cfg.ambient;
    directional.intensity = cfg.directional;
    pointLight.intensity = cfg.point;
    pointLight.color.setHex(cfg.pointColor);
    if (boundScene) {
      boundScene.background = new THREE.Color(cfg.bg);
    }
  }

  function lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  function lerpColor(a: number, b: number, t: number): number {
    const ar = (a >> 16) & 0xff;
    const ag = (a >> 8) & 0xff;
    const ab = a & 0xff;
    const br = (b >> 16) & 0xff;
    const bg = (b >> 8) & 0xff;
    const bb = b & 0xff;
    const rr = Math.round(lerp(ar, br, t));
    const rg = Math.round(lerp(ag, bg, t));
    const rb = Math.round(lerp(ab, bb, t));
    return (rr << 16) | (rg << 8) | rb;
  }

  const controller: LightingController = {
    ambient,
    directional,
    point: pointLight,

    setDevBright(): void {
      devBright = true;
      applyLighting(true);
    },

    setNormalLighting(): void {
      devBright = false;
      applyLighting(true);
    },

    setLightLevel(level: number): void {
      if (devBright) return;
      const t = Math.max(0, Math.min(1, level));
      ambient.intensity = lerp(DARK.ambient, BRIGHT.ambient, t);
      directional.intensity = lerp(DARK.directional, BRIGHT.directional, t);
      pointLight.intensity = lerp(DARK.point, BRIGHT.point, t);
      const color = lerpColor(DARK.pointColor, BRIGHT.pointColor, t);
      pointLight.color.setHex(color);
      if (boundScene) {
        const bgColor = lerpColor(DARK.bg, BRIGHT.bg, t);
        boundScene.background = new THREE.Color(bgColor);
      }
    },

    updateScene(scene: THREE.Scene): void {
      boundScene = scene;
      applyLighting(isDark);
    },
  };

  Logger.info('Basic lighting created');
  return controller;
}
