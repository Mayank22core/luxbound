import { useGhostStore } from '../hooks/useGhostStore';
import { useGameStore } from '../hooks/useGameState';
import { DEV_CONFIG } from '../../config/dev';

interface DebugInfoProps {
  playerX: number;
  playerZ: number;
  cameraX: number;
  cameraY: number;
  cameraZ: number;
  currentRoom: number;
  luxValue: number;
  fps: number;
}

export function DebugInfo({
  playerX,
  playerZ,
  cameraX,
  cameraY,
  cameraZ,
  currentRoom,
  luxValue,
  fps,
}: DebugInfoProps) {
  const ghost = useGhostStore();
  const dungeonSeed = useGameStore((s) => s.dungeonSeed);
  const roomCount = useGameStore((s) => s.roomCount);

  if (!DEV_CONFIG.DEV_MODE || !ghost.enabled || !ghost.showDebugInfo) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        left: '16px',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(123,47,255,0.4)',
        borderRadius: '8px',
        padding: '12px',
        fontFamily: '"Courier New", monospace',
        fontSize: '11px',
        color: '#fff',
        zIndex: 20,
        pointerEvents: 'none',
        minWidth: '200px',
      }}
    >
      <div
        style={{
          fontSize: '10px',
          color: '#7b2fff',
          marginBottom: '8px',
          textTransform: 'uppercase',
          letterSpacing: '2px',
          borderBottom: '1px solid rgba(123,47,255,0.3)',
          paddingBottom: '4px',
        }}
      >
        DEBUG INFO
      </div>

      <InfoRow label="FPS" value={fps.toFixed(0)} />
      <InfoRow label="Seed" value={dungeonSeed?.toString() ?? 'N/A'} />
      <InfoRow label="Rooms" value={roomCount.toString()} />
      <InfoRow label="Room" value={currentRoom >= 0 ? `R${currentRoom}` : 'Corridor'} />
      <InfoRow label="Player X" value={playerX.toFixed(1)} />
      <InfoRow label="Player Z" value={playerZ.toFixed(1)} />
      <InfoRow label="Cam X" value={cameraX.toFixed(1)} />
      <InfoRow label="Cam Y" value={cameraY.toFixed(1)} />
      <InfoRow label="Cam Z" value={cameraZ.toFixed(1)} />
      <InfoRow label="Lux" value={luxValue.toFixed(2)} />
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
      <span style={{ color: '#888' }}>{label}:</span>
      <span style={{ color: '#ccc' }}>{value}</span>
    </div>
  );
}
