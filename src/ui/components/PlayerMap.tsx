import { useEffect, useRef } from 'react';
import type { DungeonData } from '../../systems/dungeon/DungeonTypes';
import { TILE_TYPES, DUNGEON_CONFIG } from '../../config/dungeon';

interface PlayerMapProps {
  visible: boolean;
  dungeonData: DungeonData | null;
  playerX: number;
  playerZ: number;
}

export function PlayerMap({ visible, dungeonData, playerX, playerZ }: PlayerMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!visible || !dungeonData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cell = DUNGEON_CONFIG.CELL_SIZE;
    const scale = 2;
    const w = dungeonData.gridWidth * cell * scale;
    const h = dungeonData.gridHeight * cell * scale;

    canvas.width = w;
    canvas.height = h;

    ctx.fillStyle = 'rgba(0,0,0,0.0)';
    ctx.fillRect(0, 0, w, h);

    for (let z = 0; z < dungeonData.gridHeight; z++) {
      for (let x = 0; x < dungeonData.gridWidth; x++) {
        const tile = dungeonData.grid[z][x];
        const px = x * cell * scale;
        const pz = z * cell * scale;
        const sz = cell * scale;

        switch (tile) {
          case TILE_TYPES.FLOOR:
            ctx.fillStyle = 'rgba(60,60,80,0.7)';
            ctx.fillRect(px, pz, sz, sz);
            break;
          case TILE_TYPES.CORRIDOR:
            ctx.fillStyle = 'rgba(50,50,65,0.6)';
            ctx.fillRect(px, pz, sz, sz);
            break;
          case TILE_TYPES.WALL:
            ctx.fillStyle = 'rgba(80,80,100,0.5)';
            ctx.fillRect(px, pz, sz, sz);
            break;
          case TILE_TYPES.DOOR:
            ctx.fillStyle = 'rgba(140,100,60,0.8)';
            ctx.fillRect(px, pz, sz, sz);
            break;
        }
      }
    }

    const ppx = (playerX / cell) * cell * scale;
    const ppz = (playerZ / cell) * cell * scale;

    ctx.save();
    ctx.beginPath();
    ctx.arc(ppx, ppz, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,80,80,0.9)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(ppx, ppz, 20, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,80,80,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }, [visible, dungeonData, playerX, playerZ]);

  if (!visible || !dungeonData) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 30,
        pointerEvents: 'none',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(255,255,255,0.15)',
        borderRadius: '12px',
        padding: '16px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: 'rgba(255,255,255,0.4)',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          fontFamily: '"Courier New", monospace',
          marginBottom: '8px',
          textAlign: 'center',
        }}
      >
        Dungeon Map
      </div>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          maxWidth: '400px',
          maxHeight: '400px',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '4px',
        }}
      />
      <div
        style={{
          fontSize: '9px',
          color: 'rgba(255,255,255,0.3)',
          textAlign: 'center',
          marginTop: '6px',
          fontFamily: '"Courier New", monospace',
        }}
      >
        Hold TAB to view
      </div>
    </div>
  );
}
