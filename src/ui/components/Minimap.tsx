import { useEffect, useRef } from 'react';
import type { DungeonData } from '../../systems/dungeon/DungeonTypes';
import { DUNGEON_CONFIG } from '../../config/dungeon';

interface MinimapProps {
  dungeonData: DungeonData | null;
  playerX: number;
  playerZ: number;
  currentRoom: number;
}

const MAP_SIZE = 140;
const CELL_PX = MAP_SIZE / 50;

export function Minimap({ dungeonData, playerX, playerZ, currentRoom }: MinimapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const exploredRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    if (currentRoom >= 0) {
      exploredRef.current.add(currentRoom);
    }
  }, [currentRoom]);

  useEffect(() => {
    if (!dungeonData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = MAP_SIZE;
    canvas.height = MAP_SIZE;

    ctx.fillStyle = 'rgba(0,0,0,0.8)';
    ctx.fillRect(0, 0, MAP_SIZE, MAP_SIZE);

    const cell = DUNGEON_CONFIG.CELL_SIZE;
    const explored = exploredRef.current;

    for (let z = 0; z < dungeonData.gridHeight; z++) {
      for (let x = 0; x < dungeonData.gridWidth; x++) {
        const tile = dungeonData.grid[z][x];
        const roomIdx = dungeonData.roomGrid[z][x];
        const px = x * CELL_PX;
        const pz = z * CELL_PX;

        if (tile === 0) {
          continue;
        }

        if (roomIdx >= 0 && !explored.has(roomIdx)) {
          continue;
        }

        switch (tile) {
          case 1:
            ctx.fillStyle = roomIdx >= 0 ? 'rgba(60,60,80,0.6)' : 'rgba(50,50,65,0.5)';
            break;
          case 2:
            ctx.fillStyle = 'rgba(50,50,65,0.5)';
            break;
          case 3:
            ctx.fillStyle = 'rgba(80,80,100,0.4)';
            break;
          case 4:
            ctx.fillStyle = 'rgba(140,100,60,0.7)';
            break;
          default:
            ctx.fillStyle = 'rgba(40,40,55,0.3)';
        }
        ctx.fillRect(px, pz, CELL_PX + 0.5, CELL_PX + 0.5);
      }
    }

    const playerMapX = (playerX / cell) * CELL_PX;
    const playerMapZ = (playerZ / cell) * CELL_PX;

    ctx.beginPath();
    ctx.arc(playerMapX, playerMapZ, 3, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4444';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.6)';
    ctx.lineWidth = 1;
    ctx.stroke();
  }, [dungeonData, playerX, playerZ, currentRoom]);

  if (!dungeonData) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '12px',
        left: '12px',
        zIndex: 12,
        pointerEvents: 'none',
      }}
    >
      <canvas
        ref={canvasRef}
        style={{
          width: `${MAP_SIZE}px`,
          height: `${MAP_SIZE}px`,
          borderRadius: '6px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      />
    </div>
  );
}
