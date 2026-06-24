import { useEffect, useRef } from 'react';
import { useGhostStore } from '../hooks/useGhostStore';
import { DEV_CONFIG } from '../../config/dev';
import type { DungeonData } from '../../systems/dungeon/DungeonTypes';
import { TILE_TYPES } from '../../config/dungeon';
import { DUNGEON_CONFIG } from '../../config/dungeon';

interface MapOverlayProps {
  dungeonData: DungeonData | null;
  playerX: number;
  playerZ: number;
  cameraX: number;
  cameraZ: number;
}

export function MapOverlay({ dungeonData, playerX, playerZ, cameraX, cameraZ }: MapOverlayProps) {
  const ghost = useGhostStore();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!DEV_CONFIG.DEV_MODE || !ghost.enabled || !dungeonData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cellSize = DUNGEON_CONFIG.CELL_SIZE;
    const mapScale = 2;
    const width = dungeonData.gridWidth * cellSize * mapScale;
    const height = dungeonData.gridHeight * cellSize * mapScale;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = 'rgba(0,0,0,0.9)';
    ctx.fillRect(0, 0, width, height);

    for (let z = 0; z < dungeonData.gridHeight; z++) {
      for (let x = 0; x < dungeonData.gridWidth; x++) {
        const tile = dungeonData.grid[z][x];
        const px = x * cellSize * mapScale;
        const pz = z * cellSize * mapScale;
        const size = cellSize * mapScale;

        switch (tile) {
          case TILE_TYPES.FLOOR:
            ctx.fillStyle = '#1a3a1a';
            ctx.fillRect(px, pz, size, size);
            break;
          case TILE_TYPES.CORRIDOR:
            ctx.fillStyle = '#3a3a1a';
            ctx.fillRect(px, pz, size, size);
            break;
          case TILE_TYPES.WALL:
            ctx.fillStyle = '#555';
            ctx.fillRect(px, pz, size, size);
            break;
          case TILE_TYPES.DOOR:
            ctx.fillStyle = '#996633';
            ctx.fillRect(px, pz, size, size);
            break;
        }
      }
    }

    if (ghost.showRoomBoundaries) {
      ctx.strokeStyle = 'rgba(123,47,255,0.6)';
      ctx.lineWidth = 1;
      for (const room of dungeonData.rooms) {
        const rx = room.x * cellSize * mapScale;
        const rz = room.z * cellSize * mapScale;
        const rw = room.width * cellSize * mapScale;
        const rh = room.height * cellSize * mapScale;
        ctx.strokeRect(rx, rz, rw, rh);
      }
    }

    ctx.font = 'bold 14px "Courier New", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < dungeonData.rooms.length; i++) {
      const room = dungeonData.rooms[i];
      const rx = (room.x + room.width / 2) * cellSize * mapScale;
      const rz = (room.z + room.height / 2) * cellSize * mapScale;
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(`R${i}`, rx, rz);
    }

    if (ghost.showNavMesh) {
      ctx.strokeStyle = 'rgba(0,255,255,0.3)';
      ctx.lineWidth = 1;
      for (const room of dungeonData.rooms) {
        const cx = room.centerX * cellSize * mapScale;
        const cz = room.centerZ * cellSize * mapScale;
        for (const other of dungeonData.rooms) {
          if (other === room) continue;
          const ox = other.centerX * cellSize * mapScale;
          const oz = other.centerZ * cellSize * mapScale;
          ctx.beginPath();
          ctx.moveTo(cx, cz);
          ctx.lineTo(ox, oz);
          ctx.stroke();
        }
      }
    }

    if (ghost.showSpawnPoints) {
      ctx.fillStyle = '#00ff00';
      ctx.beginPath();
      const sx = dungeonData.playerStart.x * cellSize * mapScale + (cellSize * mapScale) / 2;
      const sz = dungeonData.playerStart.z * cellSize * mapScale + (cellSize * mapScale) / 2;
      ctx.arc(sx, sz, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    const ppx = (playerX / cellSize) * cellSize * mapScale;
    const ppz = (playerZ / cellSize) * cellSize * mapScale;
    const dx = cameraX - playerX;
    const dz = cameraZ - playerZ;
    const angle = Math.atan2(dx, dz);

    ctx.save();
    ctx.translate(ppx, ppz);
    ctx.rotate(-angle + Math.PI);
    ctx.fillStyle = '#ff3333';
    ctx.beginPath();
    ctx.moveTo(0, -8);
    ctx.lineTo(-5, 6);
    ctx.lineTo(5, 6);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    ctx.strokeStyle = '#ff3333';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(ppx, ppz, 10, 0, Math.PI * 2);
    ctx.stroke();
  }, [ghost.enabled, ghost.showRoomBoundaries, ghost.showNavMesh, ghost.showSpawnPoints, dungeonData, playerX, playerZ, cameraX, cameraZ]);

  if (!DEV_CONFIG.DEV_MODE || !ghost.enabled) return null;

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        zIndex: 20,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(0,0,0,0.85)',
          border: '1px solid rgba(123,47,255,0.4)',
          borderRadius: '8px',
          padding: '8px',
        }}
      >
        <div
          style={{
            fontSize: '10px',
            color: '#7b2fff',
            marginBottom: '4px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            fontFamily: '"Courier New", monospace',
          }}
        >
          MAP
        </div>
        <canvas
          ref={canvasRef}
          style={{
            maxWidth: '250px',
            maxHeight: '250px',
            border: '1px solid rgba(123,47,255,0.3)',
          }}
        />
      </div>
    </div>
  );
}
