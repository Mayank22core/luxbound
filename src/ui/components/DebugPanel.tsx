import { useGhostStore } from '../hooks/useGhostStore';
import { DEV_CONFIG } from '../../config/dev';

export function DebugPanel() {
  const ghost = useGhostStore();

  if (!DEV_CONFIG.DEV_MODE) return null;

  return (
    <div
      style={{
        position: 'absolute',
        top: '80px',
        right: '16px',
        background: 'rgba(0,0,0,0.85)',
        border: '1px solid rgba(123,47,255,0.4)',
        borderRadius: '8px',
        padding: '12px',
        fontFamily: '"Courier New", monospace',
        fontSize: '12px',
        color: '#fff',
        zIndex: 20,
        pointerEvents: 'auto',
        minWidth: '180px',
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
        DEBUG PANEL
      </div>

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          marginBottom: '8px',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={ghost.enabled}
          onChange={ghost.toggle}
          style={{ accentColor: '#7b2fff' }}
        />
        <span style={{ color: ghost.enabled ? '#7b2fff' : '#666' }}>
          Ghost Mode {ghost.enabled ? 'ON' : 'OFF'}
        </span>
      </label>

      {ghost.enabled && (
        <>
          <div style={{ marginBottom: '8px' }}>
            <div style={{ color: '#888', marginBottom: '4px', fontSize: '10px' }}>
              SPEED: {ghost.speed.toFixed(0)}
            </div>
            <input
              type="range"
              min={5}
              max={100}
              value={ghost.speed}
              onChange={(e) => ghost.setSpeed(Number(e.target.value))}
              style={{ width: '100%', accentColor: '#7b2fff' }}
            />
          </div>

          <div style={{ borderTop: '1px solid rgba(123,47,255,0.2)', paddingTop: '8px', marginBottom: '4px' }}>
            <div style={{ color: '#888', fontSize: '10px', marginBottom: '6px' }}>INSPECTION</div>
            
            <Toggle label="Debug Info" checked={ghost.showDebugInfo} onChange={ghost.toggleDebugInfo} />
            <Toggle label="Room Boundaries" checked={ghost.showRoomBoundaries} onChange={ghost.toggleRoomBoundaries} />
            <Toggle label="Nav Mesh" checked={ghost.showNavMesh} onChange={ghost.toggleNavMesh} />
            <Toggle label="Spawn Points" checked={ghost.showSpawnPoints} onChange={ghost.toggleSpawnPoints} />
            <Toggle label="Enemy Paths" checked={ghost.showEnemyPaths} onChange={ghost.toggleEnemyPaths} />
          </div>

          <div
            style={{
              borderTop: '1px solid rgba(123,47,255,0.2)',
              paddingTop: '8px',
              marginTop: '8px',
              fontSize: '10px',
              color: '#666',
              lineHeight: '1.6',
            }}
          >
            <div>WASD = Move</div>
            <div>Q/E = Up/Down</div>
            <div>SHIFT = Sprint</div>
            <div>RMB Drag = Orbit</div>
            <div>MMB Drag = Pan</div>
            <div>Scroll = Zoom</div>
          </div>
        </>
      )}
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        marginBottom: '4px',
        cursor: 'pointer',
        fontSize: '11px',
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ accentColor: '#7b2fff', width: '12px', height: '12px' }}
      />
      <span style={{ color: checked ? '#ccc' : '#666' }}>{label}</span>
    </label>
  );
}
