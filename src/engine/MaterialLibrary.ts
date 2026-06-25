import * as THREE from 'three';
import { Logger } from '../core/utils/Logger';

interface DungeonMaterials {
  wall: THREE.MeshStandardMaterial;
  wallVariant: THREE.MeshStandardMaterial;
  floor: THREE.MeshStandardMaterial;
  floorVariant: THREE.MeshStandardMaterial;
  doorFrame: THREE.MeshStandardMaterial;
  pillar: THREE.MeshStandardMaterial;
  ceiling: THREE.MeshStandardMaterial;
  corridor: THREE.MeshStandardMaterial;
}

function createNoiseTexture(width: number, height: number, scale: number): THREE.DataTexture {
  const size = width * height;
  const data = new Uint8Array(4 * size);

  for (let i = 0; i < size; i++) {
    const x = (i % width) / width;
    const y = Math.floor(i / width) / height;

    const n1 = Math.sin(x * scale) * Math.cos(y * scale) * 0.5 + 0.5;
    const n2 = Math.sin(x * scale * 2.1 + 1.3) * Math.cos(y * scale * 1.7 + 0.7) * 0.5 + 0.5;
    const n3 = Math.sin(x * scale * 4.3 + 2.1) * Math.cos(y * scale * 3.9 + 1.1) * 0.5 + 0.5;

    const val = (n1 * 0.5 + n2 * 0.3 + n3 * 0.2) * 255;

    const idx = i * 4;
    data[idx] = val;
    data[idx + 1] = val;
    data[idx + 2] = val;
    data[idx + 3] = 255;
  }

  const texture = new THREE.DataTexture(data, width, height);
  texture.needsUpdate = true;
  return texture;
}

function createBrickNormalMap(width: number, height: number): THREE.DataTexture {
  const data = new Uint8Array(4 * width * height);

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;

      const brickW = 32;
      const brickH = 16;
      const mortarSize = 2;

      const localX = x % brickW;
      const localY = y % brickH;

      const isMortar =
        localX < mortarSize || localX >= brickW - mortarSize ||
        localY < mortarSize || localY >= brickH - mortarSize;

      if (isMortar) {
        data[idx] = 128;
        data[idx + 1] = 128;
        data[idx + 2] = 255;
      } else {
        const edgeX = Math.min(localX - mortarSize, brickW - mortarSize - localX);
        const edgeY = Math.min(localY - mortarSize, brickH - mortarSize - localY);
        const edgeFactor = Math.min(edgeX, edgeY) / 3;

        const nx = 128 + (edgeFactor < 1 ? (localX < brickW / 2 ? -20 : 20) : 0);
        const ny = 128 + (edgeFactor < 1 ? (localY < brickH / 2 ? -20 : 20) : 0);

        data[idx] = Math.max(0, Math.min(255, nx));
        data[idx + 1] = Math.max(0, Math.min(255, ny));
        data[idx + 2] = 230;
      }
      data[idx + 3] = 255;
    }
  }

  const texture = new THREE.DataTexture(data, width, height);
  texture.needsUpdate = true;
  return texture;
}

let materials: DungeonMaterials | null = null;

export function getDungeonMaterials(): DungeonMaterials {
  if (materials) return materials;

  const noiseMap = createNoiseTexture(256, 256, 12);
  const normalMap = createBrickNormalMap(256, 256);

  materials = {
    wall: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x2a2a3e),
      roughness: 0.88,
      metalness: 0.05,
      normalMap,
      normalScale: new THREE.Vector2(0.6, 0.6),
    }),

    wallVariant: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x252538),
      roughness: 0.9,
      metalness: 0.05,
      normalMap,
      normalScale: new THREE.Vector2(0.5, 0.5),
    }),

    floor: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1e1e2e),
      roughness: 0.92,
      metalness: 0.02,
      map: noiseMap,
    }),

    floorVariant: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x1a1a28),
      roughness: 0.95,
      metalness: 0.02,
      map: noiseMap,
    }),

    doorFrame: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x8a6a3a),
      roughness: 0.5,
      metalness: 0.3,
    }),

    pillar: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x333348),
      roughness: 0.8,
      metalness: 0.1,
      normalMap,
      normalScale: new THREE.Vector2(0.4, 0.4),
    }),

    ceiling: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x151520),
      roughness: 0.95,
      metalness: 0.0,
    }),

    corridor: new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x202030),
      roughness: 0.9,
      metalness: 0.03,
      map: noiseMap,
    }),
  };

  Logger.info('Dungeon materials created');
  return materials;
}
