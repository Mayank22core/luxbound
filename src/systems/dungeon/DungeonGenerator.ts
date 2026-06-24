import { DUNGEON_CONFIG, TILE_TYPES } from '../../config/dungeon';
import { Logger } from '../../core/utils/Logger';
import type { DungeonData, Room } from './DungeonTypes';
import { generateRooms } from './RoomGenerator';
import { getThemeForRoom } from './RoomThemes';

const TILE = TILE_TYPES;

export function generateDungeon(_seed?: number): DungeonData {
  const gridW = DUNGEON_CONFIG.GRID_SIZE;
  const gridH = DUNGEON_CONFIG.GRID_SIZE;
  const grid: number[][] = Array.from({ length: gridH }, () => new Array(gridW).fill(TILE.EMPTY));
  const roomGrid: number[][] = Array.from({ length: gridH }, () => new Array(gridW).fill(-1));

  const rawRooms = generateRooms();

  const rooms: Room[] = rawRooms.map((r, i) => ({
    ...r,
    themeId: getThemeForRoom(i, rawRooms.length).id,
    roomIndex: i,
    doors: [],
  }));

  for (let ri = 0; ri < rooms.length; ri++) {
    const room = rooms[ri];
    for (let z = room.z; z < room.z + room.height; z++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (z >= 0 && z < gridH && x >= 0 && x < gridW) {
          grid[z][x] = TILE.FLOOR;
          roomGrid[z][x] = ri;
        }
      }
    }
  }

  const allEdges: Array<{ from: number; to: number; distance: number }> = [];
  for (let i = 0; i < rooms.length; i++) {
    for (let j = i + 1; j < rooms.length; j++) {
      const dx = rooms[i].centerX - rooms[j].centerX;
      const dz = rooms[i].centerZ - rooms[j].centerZ;
      allEdges.push({ from: i, to: j, distance: Math.sqrt(dx * dx + dz * dz) });
    }
  }
  allEdges.sort((a, b) => a.distance - b.distance);

  const parent = Array.from({ length: rooms.length }, (_, i) => i);
  const rank = new Array<number>(rooms.length).fill(0);
  function find(x: number): number {
    if (parent[x] !== x) parent[x] = find(parent[x]);
    return parent[x];
  }
  function union(a: number, b: number): boolean {
    const ra = find(a);
    const rb = find(b);
    if (ra === rb) return false;
    if (rank[ra] < rank[rb]) parent[ra] = rb;
    else if (rank[ra] > rank[rb]) parent[rb] = ra;
    else { parent[rb] = ra; rank[ra]++; }
    return true;
  }

  const mst: typeof allEdges = [];
  for (const edge of allEdges) {
    if (union(edge.from, edge.to)) {
      mst.push(edge);
      if (mst.length === rooms.length - 1) break;
    }
  }

  const mstSet = new Set(mst.map((e) => `${e.from}-${e.to}`));
  const candidates = allEdges.filter((e) => !mstSet.has(`${e.from}-${e.to}`) && !mstSet.has(`${e.to}-${e.from}`));
  const extraEdges = candidates.slice(0, DUNGEON_CONFIG.MST_EXTRA_EDGES);
  const edges = [...mst, ...extraEdges];

  const corridors: Array<{ x: number; z: number }> = [];
  const doors: Array<{ x: number; z: number; wall: string; themeId: string }> = [];

  for (const edge of edges) {
    const from = rooms[edge.from];
    const to = rooms[edge.to];

    const doorX1 = from.centerX;
    const doorZ1 = from.centerZ;
    const doorX2 = to.centerX;
    const doorZ2 = to.centerZ;

    let cx = doorX1;
    let cz = doorZ1;

    while (cx !== doorX2 || cz !== doorZ2) {
      if (cx !== doorX2) {
        cx += cx < doorX2 ? 1 : -1;
      } else if (cz !== doorZ2) {
        cz += cz < doorZ2 ? 1 : -1;
      }

      if (cz >= 0 && cz < gridH && cx >= 0 && cx < gridW) {
        const val = grid[cz][cx];
        if (val === TILE.EMPTY) {
          grid[cz][cx] = TILE.CORRIDOR;
          corridors.push({ x: cx, z: cz });
        } else if (val === TILE.FLOOR && roomGrid[cz][cx] !== -1) {
          const roomId = roomGrid[cz][cx];
          if (roomId !== edge.from && roomId !== edge.to) {
            continue;
          }
        }
      }
    }

    const findWallDoor = (room: Room, targetX: number, targetZ: number): { x: number; z: number; wall: string } | null => {
      const dx = targetX - room.centerX;
      const dz = targetZ - room.centerZ;

      if (Math.abs(dx) > Math.abs(dz)) {
        const wallX = dx > 0 ? room.x + room.width : room.x - 1;
        const wallZ = room.centerZ;
        if (wallX >= 0 && wallX < gridW && wallZ >= 0 && wallZ < gridH) {
          return { x: wallX, z: wallZ, wall: dx > 0 ? 'east' : 'west' };
        }
      } else {
        const wallX = room.centerX;
        const wallZ = dz > 0 ? room.z + room.height : room.z - 1;
        if (wallX >= 0 && wallX < gridW && wallZ >= 0 && wallZ < gridH) {
          return { x: wallX, z: wallZ, wall: dz > 0 ? 'south' : 'north' };
        }
      }
      return null;
    };

    const doorA = findWallDoor(from, to.centerX, to.centerZ);
    const doorB = findWallDoor(to, from.centerX, from.centerZ);

    if (doorA) {
      grid[doorA.z][doorA.x] = TILE.DOOR;
      doors.push({ x: doorA.x, z: doorA.z, wall: doorA.wall, themeId: from.themeId });
      from.doors.push({ x: doorA.x, z: doorA.z, wall: doorA.wall as 'north' | 'south' | 'east' | 'west' });
    }
    if (doorB) {
      grid[doorB.z][doorB.x] = TILE.DOOR;
      doors.push({ x: doorB.x, z: doorB.z, wall: doorB.wall, themeId: to.themeId });
      to.doors.push({ x: doorB.x, z: doorB.z, wall: doorB.wall as 'north' | 'south' | 'east' | 'west' });
    }
  }

  for (let z = 0; z < gridH; z++) {
    for (let x = 0; x < gridW; x++) {
      if (grid[z][x] === TILE.EMPTY) {
        const neighbors = [
          { dx: 1, dz: 0 },
          { dx: -1, dz: 0 },
          { dx: 0, dz: 1 },
          { dx: 0, dz: -1 },
        ];
        for (const { dx, dz } of neighbors) {
          const nx = x + dx;
          const nz = z + dz;
          if (nx >= 0 && nx < gridW && nz >= 0 && nz < gridH) {
            const neighbor = grid[nz][nx];
            if (neighbor === TILE.FLOOR || neighbor === TILE.CORRIDOR || neighbor === TILE.DOOR) {
              grid[z][x] = TILE.WALL;
              break;
            }
          }
        }
      }
    }
  }

  const firstRoom = rooms[0];
  const playerStart = {
    x: firstRoom ? firstRoom.centerX : Math.floor(gridW / 2),
    z: firstRoom ? firstRoom.centerZ : Math.floor(gridH / 2),
  };

  const data: DungeonData = {
    grid,
    roomGrid,
    rooms,
    corridors,
    doors,
    playerStart,
    gridWidth: gridW,
    gridHeight: gridH,
  };

  Logger.info(`Dungeon generated: ${rooms.length} rooms, ${doors.length} doors, ${corridors.length} corridor tiles`);
  return data;
}
