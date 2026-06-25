import * as THREE from 'three';
import { DUNGEON_CONFIG, TILE_TYPES } from '../../config/dungeon';
import { Logger } from '../../core/utils/Logger';
import type { DungeonData } from './DungeonTypes';
import { ROOM_THEMES } from './RoomThemes';
import { getPropsForTheme, placeProps } from './ThemedProps';

const TILE = TILE_TYPES;
const cell = DUNGEON_CONFIG.CELL_SIZE;
const wallH = DUNGEON_CONFIG.WALL_HEIGHT;

export interface DungeonMeshGroup {
  group: THREE.Group;
  colliders: THREE.Box3[];
  dispose(): void;
}

const themeMaterials = new Map<string, {
  floor: THREE.MeshStandardMaterial;
  wall: THREE.MeshStandardMaterial;
  ceiling: THREE.MeshStandardMaterial;
  doorFrame: THREE.MeshStandardMaterial;
}>();

function getThemeMats(themeId: string) {
  if (themeMaterials.has(themeId)) return themeMaterials.get(themeId)!;
  const theme = ROOM_THEMES[themeId];
  if (!theme) return null;
  const mats = {
    floor: new THREE.MeshStandardMaterial({ color: theme.floorColor, roughness: 0.9, metalness: 0.05 }),
    wall: new THREE.MeshStandardMaterial({ color: theme.wallColor, roughness: 0.85, metalness: 0.05 }),
    ceiling: new THREE.MeshStandardMaterial({ color: theme.ceilingColor, roughness: 0.95, metalness: 0 }),
    doorFrame: new THREE.MeshStandardMaterial({ color: theme.doorFrameColor, roughness: 0.5, metalness: 0.3 }),
  };
  themeMaterials.set(themeId, mats);
  return mats;
}

const corridorFloorMat = new THREE.MeshStandardMaterial({ color: 0x202030, roughness: 0.9, metalness: 0.03 });
const corridorWallMat = new THREE.MeshStandardMaterial({ color: 0x2a2a3e, roughness: 0.88, metalness: 0.05 });

function createFloorMesh(x: number, z: number, mat: THREE.Material): THREE.Mesh {
  const geo = new THREE.BoxGeometry(cell, 0.2, cell);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x * cell, DUNGEON_CONFIG.FLOOR_Y - 0.1, z * cell);
  mesh.receiveShadow = true;
  return mesh;
}

function createWallMesh(x: number, z: number, mat: THREE.Material): THREE.Mesh {
  const geo = new THREE.BoxGeometry(cell, wallH, cell);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x * cell, wallH / 2, z * cell);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function createCeilingMesh(x: number, z: number, mat: THREE.Material): THREE.Mesh {
  const geo = new THREE.BoxGeometry(cell, 0.15, cell);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x * cell, wallH, z * cell);
  return mesh;
}

function createDoorFrameMesh(x: number, z: number, wall: string, themeId: string): THREE.Group {
  const mats = getThemeMats(themeId);
  const theme = ROOM_THEMES[themeId];
  const group = new THREE.Group();

  const fw = cell * theme.doorFrameWidth;
  const fh = wallH * 0.85;
  const fd = cell;

  const leftPost = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, fh, fd),
    mats?.doorFrame ?? corridorWallMat
  );
  leftPost.position.set(-fw / 2, fh / 2, 0);
  leftPost.castShadow = true;

  const rightPost = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, fh, fd),
    mats?.doorFrame ?? corridorWallMat
  );
  rightPost.position.set(fw / 2, fh / 2, 0);
  rightPost.castShadow = true;

  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(fw + 0.5, 0.3, fd),
    mats?.doorFrame ?? corridorWallMat
  );
  lintel.position.set(0, fh + 0.15, 0);
  lintel.castShadow = true;

  group.add(leftPost, rightPost, lintel);

  if (theme.hasArch) {
    const arch = new THREE.Mesh(
      new THREE.TorusGeometry(fw / 2, 0.1, 8, 12, Math.PI),
      mats?.doorFrame ?? corridorWallMat
    );
    arch.position.set(0, fh + 0.15, 0);
    arch.rotation.z = Math.PI;
    arch.rotation.x = Math.PI / 2;
    arch.castShadow = true;
    group.add(arch);
  }

  if (theme.hasBars) {
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.03, 0.03, fh, 6),
        new THREE.MeshStandardMaterial({ color: 0x5a5a5a, roughness: 0.4, metalness: 0.7 })
      );
      bar.position.set(-fw / 3 + (i * fw / 3), fh / 2, 0);
      bar.castShadow = true;
      group.add(bar);
    }
  }

  group.position.set(x * cell, DUNGEON_CONFIG.FLOOR_Y, z * cell);

  if (wall === 'east' || wall === 'west') {
    group.rotation.y = Math.PI / 2;
  }

  return group;
}

function createRoomTorch(x: number, z: number, themeId: string): THREE.Group {
  const theme = ROOM_THEMES[themeId];
  const group = new THREE.Group();

  const sconce = new THREE.Mesh(
    new THREE.BoxGeometry(0.15, 0.3, 0.15),
    new THREE.MeshStandardMaterial({ color: 0x5a4a3a, roughness: 0.6, metalness: 0.5 })
  );
  sconce.position.set(0, wallH * 0.6, 0);

  const flame = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 6, 6),
    new THREE.MeshStandardMaterial({
      color: theme.torchColor,
      emissive: theme.torchColor,
      emissiveIntensity: 2.0,
      roughness: 0.2,
    })
  );
  flame.position.set(0, wallH * 0.65, 0);

  const light = new THREE.PointLight(theme.torchColor, theme.torchIntensity, 12, 1.5);
  light.position.set(0, wallH * 0.7, 0);
  light.castShadow = false;

  group.add(sconce, flame, light);
  group.position.set(x * cell, DUNGEON_CONFIG.FLOOR_Y, z * cell);

  return group;
}

export function renderDungeon(data: DungeonData): DungeonMeshGroup {
  const group = new THREE.Group();
  const colliders: THREE.Box3[] = [];

  const floorGroup = new THREE.Group();
  const wallGroup = new THREE.Group();
  const ceilingGroup = new THREE.Group();
  const doorGroup = new THREE.Group();

  const counts = { floors: 0, walls: 0, doors: 0, corridors: 0, props: 0 };

  const roomMeshGroups: THREE.Group[] = [];

  for (let ri = 0; ri < data.rooms.length; ri++) {
    const room = data.rooms[ri];
    const mats = getThemeMats(room.themeId);
    if (!mats) continue;

    const roomGroup = new THREE.Group();
    const propGroupForRoom = new THREE.Group();
    const lightGroupForRoom = new THREE.Group();

    for (let z = room.z; z < room.z + room.height; z++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (z >= 0 && z < data.gridHeight && x >= 0 && x < data.gridWidth) {
          const tile = data.grid[z][x];
          if (tile === TILE.FLOOR) {
            roomGroup.add(createFloorMesh(x, z, mats.floor));
            roomGroup.add(createCeilingMesh(x, z, mats.ceiling));
            counts.floors++;
          }
        }
      }
    }

    for (let z = room.z - 1; z <= room.z + room.height; z++) {
      for (let x = room.x - 1; x <= room.x + room.width; x++) {
        if (z >= 0 && z < data.gridHeight && x >= 0 && x < data.gridWidth) {
          if (data.grid[z][x] === TILE.WALL) {
            const wallMesh = createWallMesh(x, z, mats.wall);
            roomGroup.add(wallMesh);
            colliders.push(new THREE.Box3().setFromObject(wallMesh));
            counts.walls++;
          }
        }
      }
    }

    const props = getPropsForTheme(room.themeId);
    placeProps(props, room.centerX * cell, room.centerZ * cell, propGroupForRoom);
    counts.props += props.length;

    for (let x = room.x; x < room.x + room.width; x += DUNGEON_CONFIG.TORCH_SPACING) {
      if (data.grid[room.z - 1]?.[x] === TILE.WALL) {
        lightGroupForRoom.add(createRoomTorch(x, room.z - 1, room.themeId));
      }
      if (data.grid[room.z + room.height]?.[x] === TILE.WALL) {
        lightGroupForRoom.add(createRoomTorch(x, room.z + room.height, room.themeId));
      }
    }
    for (let z = room.z; z < room.z + room.height; z += DUNGEON_CONFIG.TORCH_SPACING) {
      if (data.grid[z]?.[room.x - 1] === TILE.WALL) {
        lightGroupForRoom.add(createRoomTorch(room.x - 1, z, room.themeId));
      }
      if (data.grid[z]?.[room.x + room.width] === TILE.WALL) {
        lightGroupForRoom.add(createRoomTorch(room.x + room.width, z, room.themeId));
      }
    }

    roomGroup.add(propGroupForRoom);
    roomGroup.add(lightGroupForRoom);
    roomMeshGroups.push(roomGroup);
  }

  for (const roomMesh of roomMeshGroups) {
    floorGroup.add(roomMesh);
  }

  for (const door of data.doors) {
    const frame = createDoorFrameMesh(door.x, door.z, door.wall, door.themeId);
    doorGroup.add(frame);
    counts.doors++;
  }

  for (let z = 0; z < data.gridHeight; z++) {
    for (let x = 0; x < data.gridWidth; x++) {
      const tile = data.grid[z][x];

      if (tile === TILE.CORRIDOR) {
        floorGroup.add(createFloorMesh(x, z, corridorFloorMat));
        ceilingGroup.add(createCeilingMesh(x, z, corridorWallMat));
        counts.corridors++;
      } else if (tile === TILE.DOOR) {
        floorGroup.add(createFloorMesh(x, z, corridorFloorMat));
        ceilingGroup.add(createCeilingMesh(x, z, corridorWallMat));
      } else if (tile === TILE.WALL) {
        let inRoom = false;
        for (const room of data.rooms) {
          if (x >= room.x - 1 && x <= room.x + room.width && z >= room.z - 1 && z <= room.z + room.height) {
            inRoom = true;
            break;
          }
        }
        if (!inRoom) {
          const wallMesh = createWallMesh(x, z, corridorWallMat);
          wallGroup.add(wallMesh);
          colliders.push(new THREE.Box3().setFromObject(wallMesh));
          counts.walls++;
        }
      }
    }
  }

  group.add(floorGroup);
  group.add(wallGroup);
  group.add(ceilingGroup);
  group.add(doorGroup);

  Logger.info(`Dungeon rendered: ${counts.floors} floors, ${counts.corridors} corridors, ${counts.walls} walls, ${counts.doors} doors, ${counts.props} props`);

  return {
    group,
    colliders,
    dispose(): void {
      group.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose();
        }
      });
      while (group.children.length > 0) {
        group.remove(group.children[0]);
      }
    },
  };
}
