import * as THREE from 'three';
import { Logger } from '../core/utils/Logger';

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d15);
  scene.fog = new THREE.FogExp2(0x0d0d15, 0.03);

  Logger.info('Scene created');
  return scene;
}
