import * as THREE from 'three';
import { DUNGEON_CONFIG } from '../config/dungeon';
import { getDungeonMaterials } from './MaterialLibrary';

const cell = DUNGEON_CONFIG.CELL_SIZE;
const wallH = DUNGEON_CONFIG.WALL_HEIGHT;

export function createFloorTile(x: number, z: number, variant: boolean): THREE.Mesh {
  const mats = getDungeonMaterials();
  const geo = new THREE.BoxGeometry(cell, 0.2, cell);
  const mesh = new THREE.Mesh(geo, variant ? mats.floorVariant : mats.floor);
  mesh.position.set(x * cell, DUNGEON_CONFIG.FLOOR_Y - 0.1, z * cell);
  mesh.receiveShadow = true;
  return mesh;
}

export function createWallTile(x: number, z: number): THREE.Mesh {
  const mats = getDungeonMaterials();
  const geo = new THREE.BoxGeometry(cell, wallH, cell);
  const mesh = new THREE.Mesh(geo, mats.wall);
  mesh.position.set(x * cell, wallH / 2, z * cell);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createCorridorFloor(x: number, z: number): THREE.Mesh {
  const mats = getDungeonMaterials();
  const geo = new THREE.BoxGeometry(cell, 0.15, cell);
  const mesh = new THREE.Mesh(geo, mats.corridor);
  mesh.position.set(x * cell, DUNGEON_CONFIG.FLOOR_Y - 0.1, z * cell);
  mesh.receiveShadow = true;
  return mesh;
}

export function createDoorFrame(x: number, z: number, rotation: number): THREE.Group {
  const mats = getDungeonMaterials();
  const group = new THREE.Group();

  const frameWidth = cell * 2;
  const frameHeight = wallH * 0.85;
  const frameDepth = cell;

  const leftPost = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, frameHeight, frameDepth),
    mats.doorFrame
  );
  leftPost.position.set(-frameWidth / 2, frameHeight / 2, 0);
  leftPost.castShadow = true;

  const rightPost = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, frameHeight, frameDepth),
    mats.doorFrame
  );
  rightPost.position.set(frameWidth / 2, frameHeight / 2, 0);
  rightPost.castShadow = true;

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth + 0.6, 0.4, frameDepth),
    mats.doorFrame
  );
  lintel.position.set(0, frameHeight + 0.2, 0);
  lintel.castShadow = true;

  const archCurve = new THREE.Mesh(
    new THREE.TorusGeometry(frameWidth / 2, 0.15, 8, 12, Math.PI),
    mats.doorFrame
  );
  archCurve.position.set(0, frameHeight + 0.2, 0);
  archCurve.rotation.z = Math.PI;
  archCurve.rotation.x = Math.PI / 2;
  archCurve.castShadow = true;

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(frameWidth + 0.6, 0.12, frameDepth),
    mats.doorFrame
  );
  floor.position.set(0, 0.06, 0);

  group.add(leftPost, rightPost, lintel, archCurve, floor);

  group.position.set(x * cell, DUNGEON_CONFIG.FLOOR_Y, z * cell);
  group.rotation.y = rotation;

  return group;
}

export function createPillar(x: number, z: number): THREE.Mesh {
  const mats = getDungeonMaterials();
  const geo = new THREE.CylinderGeometry(0.25, 0.3, wallH + 0.5, 8);
  const mesh = new THREE.Mesh(geo, mats.pillar);
  mesh.position.set(x * cell, (wallH + 0.5) / 2, z * cell);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

export function createTorch(x: number, z: number, facingZ: number): THREE.Group {
  const group = new THREE.Group();

  const sconce = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.3, 0.15),
    new THREE.MeshStandardMaterial({
      color: 0x5a4a3a,
      roughness: 0.6,
      metalness: 0.5,
    })
  );
  sconce.position.set(0, wallH * 0.6, 0);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    new THREE.MeshStandardMaterial({
      color: 0xff6600,
      emissive: 0xff4400,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    })
  );
  flame.position.set(0, wallH * 0.65, 0);

  const light = new THREE.PointLight(0xff6622, 2.5, 10, 1.5);
  light.position.set(0, wallH * 0.7, 0);
  light.castShadow = false;

  group.add(sconce, flame, light);
  group.position.set(x * cell, DUNGEON_CONFIG.FLOOR_Y, z * cell);

  if (facingZ !== 0) {
    group.rotation.y = facingZ > 0 ? 0 : Math.PI;
  } else {
    group.rotation.y = Math.PI / 2;
  }

  return group;
}

const _geos: Record<string, THREE.BufferGeometry> = {};

export function getSharedGeometry(key: string, factory: () => THREE.BufferGeometry): THREE.BufferGeometry {
  if (!_geos[key]) {
    _geos[key] = factory();
  }
  return _geos[key];
}
