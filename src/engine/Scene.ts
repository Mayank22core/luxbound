import * as THREE from 'three';
import { Logger } from '../core/utils/Logger';

export function createScene(): THREE.Scene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0d0d15);
  scene.fog = new THREE.FogExp2(0x0d0d15, 0.03);

  Logger.info('Scene created');
  return scene;
}

export function addGroundPlane(scene: THREE.Scene): THREE.Mesh {
  const geometry = new THREE.PlaneGeometry(100, 100);
  const material = new THREE.MeshStandardMaterial({
    color: 0x2a2a3e,
    roughness: 0.85,
    metalness: 0.1,
  });

  const ground = new THREE.Mesh(geometry, material);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = 0;
  ground.receiveShadow = true;
  scene.add(ground);

  const grid = new THREE.GridHelper(100, 50, 0x333355, 0x222244);
  grid.position.y = 0.01;
  scene.add(grid);

  return ground;
}
