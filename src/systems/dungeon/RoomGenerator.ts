import { DUNGEON_CONFIG } from '../../config/dungeon';
import { randomInt } from '../../core/utils/MathUtils';

interface RawRoom {
  x: number;
  z: number;
  width: number;
  height: number;
  centerX: number;
  centerZ: number;
}

export function generateRooms(): RawRoom[] {
  const rooms: RawRoom[] = [];
  const roomCount = randomInt(DUNGEON_CONFIG.MIN_ROOMS, DUNGEON_CONFIG.MAX_ROOMS);

  for (let attempt = 0; attempt < DUNGEON_CONFIG.MAX_PLACEMENT_ATTEMPTS && rooms.length < roomCount; attempt++) {
    const width = randomInt(DUNGEON_CONFIG.MIN_ROOM_SIZE, DUNGEON_CONFIG.MAX_ROOM_SIZE);
    const height = randomInt(DUNGEON_CONFIG.MIN_ROOM_SIZE, DUNGEON_CONFIG.MAX_ROOM_SIZE);

    const x = randomInt(2, DUNGEON_CONFIG.GRID_SIZE - width - 2);
    const z = randomInt(2, DUNGEON_CONFIG.GRID_SIZE - height - 2);

    const newRoom: RawRoom = {
      x,
      z,
      width,
      height,
      centerX: Math.floor(x + width / 2),
      centerZ: Math.floor(z + height / 2),
    };

    if (!overlapsAny(newRoom, rooms)) {
      rooms.push(newRoom);
    }
  }

  return rooms;
}

function overlapsAny(room: RawRoom, existing: RawRoom[]): boolean {
  const pad = DUNGEON_CONFIG.ROOM_PADDING;
  for (const other of existing) {
    if (
      room.x - pad < other.x + other.width + pad &&
      room.x + room.width + pad > other.x - pad &&
      room.z - pad < other.z + other.height + pad &&
      room.z + room.height + pad > other.z - pad
    ) {
      return true;
    }
  }
  return false;
}
