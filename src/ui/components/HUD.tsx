import { useGameStore } from '../hooks/useGameState';
import { useGhostStore } from '../hooks/useGhostStore';
import { LIGHT_THRESHOLDS } from '../../constants/LightLevels';
import { isTouchDevice } from '../../services/PlatformManager';

const isTouch = isTouchDevice();

export function HUD() {
  const playerHealth = useGameStore((s) => s.playerHealth);
  const playerMaxHealth = useGameStore((s) => s.playerMaxHealth);
  const lightLevel = useGameStore((s) => s.lightLevel);
  const isHealing = useGameStore((s) => s.isHealing);
  const isDamaging = useGameStore((s) => s.isDamaging);
  const ghostEnabled = useGhostStore((s) => s.enabled);

  const healthPercent = (playerHealth / playerMaxHealth) * 100;

  let lightStatus = 'DARK';
  let lightColor = '#7b2fff';
  if (lightLevel >= LIGHT_THRESHOLDS.BRIGHT) {
    lightStatus = 'BRIGHT';
    lightColor = '#ffaa00';
  } else if (lightLevel >= LIGHT_THRESHOLDS.TWILIGHT) {
    lightStatus = 'TWILIGHT';
    lightColor = '#ff6600';
  } else if (lightLevel >= LIGHT_THRESHOLDS.DARKNESS) {
    lightStatus = 'DIM';
    lightColor = '#6644cc';
  }

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        padding: '16px',
        pointerEvents: 'none',
        fontFamily: '"Courier New", monospace',
        color: '#fff',
        zIndex: 10,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
        }}
      >
        <div>
          <div
            style={{
              fontSize: '12px',
              color: '#aaa',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            VITALITY
          </div>
          <div
            style={{
              width: '200px',
              height: '8px',
              background: 'rgba(0,0,0,0.6)',
              borderRadius: '4px',
              overflow: 'hidden',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            <div
              style={{
                width: `${healthPercent}%`,
                height: '100%',
                background: healthPercent > 50
                  ? 'linear-gradient(90deg, #8b0000, #cc0000)'
                  : healthPercent > 25
                    ? 'linear-gradient(90deg, #cc4400, #ff6600)'
                    : 'linear-gradient(90deg, #ff0000, #ff4444)',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <div
            style={{
              fontSize: '11px',
              color: '#888',
              marginTop: '2px',
            }}
          >
            {Math.round(playerHealth)} / {playerMaxHealth}
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div
            style={{
              fontSize: '12px',
              color: '#aaa',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '2px',
            }}
          >
            EXPOSURE
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: lightColor,
                boxShadow: `0 0 10px ${lightColor}`,
                transition: 'all 0.3s ease',
              }}
            />
            <span
              style={{
                fontSize: '14px',
                fontWeight: 'bold',
                color: lightColor,
                textShadow: `0 0 8px ${lightColor}`,
              }}
            >
              {lightStatus}
            </span>
          </div>
          {(isHealing || isDamaging) && (
            <div
              style={{
                fontSize: '11px',
                marginTop: '4px',
                color: isHealing ? '#7b2fff' : '#ff4400',
                textShadow: `0 0 6px ${isHealing ? '#7b2fff' : '#ff4400'}`,
                animation: 'pulse 1s infinite',
              }}
            >
              {isHealing ? 'REGENERATING' : 'BURNING'}
            </div>
          )}
        </div>
      </div>

      {!isTouch && (
        <div
          style={{
            position: 'absolute',
            bottom: '16px',
            left: '16px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.3)',
          }}
        >
          WASD: {ghostEnabled ? 'Fly' : 'Move'} | {ghostEnabled ? 'Q/E: Up/Down' : 'SHIFT: Sprint'} | Mouse: Look | Scroll: Zoom | SPACE: Toggle Lighting | ESC: Pause
        </div>
      )}

      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          pointerEvents: 'none',
        }}
      >
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '0',
          right: '0',
          height: '2px',
          background: 'rgba(255,255,255,0.5)',
          transform: 'translateY(-50%)',
        }} />
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '0',
          bottom: '0',
          width: '2px',
          background: 'rgba(255,255,255,0.5)',
          transform: 'translateX(-50%)',
        }} />
      </div>
    </div>
  );
}
