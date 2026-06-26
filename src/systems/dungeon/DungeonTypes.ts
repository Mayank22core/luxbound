export interface Room {
  x: number;
  z: number;
  width: number;
  height: number;
  centerX: number;
  centerZ: number;
  themeId: string;
  roomIndex: number;
  doors: Array<{ x: number; z: number; wall: 'north' | 'south' | 'east' | 'west' }>;
}

export interface DungeonData {
  grid: number[][];
  roomGrid: number[][];
  rooms: Room[];
  corridors: Array<{ x: number; z: number }>;
  doors: Array<{ x: number; z: number; wall: string; themeId: string }>;
  playerStart: { x: number; z: number };
  gridWidth: number;
  gridHeight: number;
}
