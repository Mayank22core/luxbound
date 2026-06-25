import { useRef, useCallback, useEffect } from 'react';
import { useTouchInput } from '../hooks/useTouchInput';

const JOYSTICK_SIZE = 120;
const JOYSTICK_THUMB = 50;
const DEAD_ZONE = 0.15;
const MAX_OFFSET = (JOYSTICK_SIZE - JOYSTICK_THUMB) / 2;

export function MobileControls() {
  const setJoystick = useTouchInput((s) => s.setJoystick);
  const setSprinting = useTouchInput((s) => s.setSprinting);
  const setCameraDelta = useTouchInput((s) => s.setCameraDelta);
  const setPinchScale = useTouchInput((s) => s.setPinchScale);

  const joystickRef = useRef<HTMLDivElement>(null);
  const joystickTouchId = useRef<number | null>(null);
  const joystickBase = useRef({ x: 0, y: 0 });

  const cameraTouchIds = useRef<number[]>([]);
  const lastPinchDist = useRef(0);
  const lastCameraPos = useRef({ x: 0, y: 0 });

  const handleJoystickStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const touch = e.changedTouches[0];
    if (!touch || joystickTouchId.current !== null) return;

    joystickTouchId.current = touch.identifier;
    const rect = joystickRef.current!.getBoundingClientRect();
    joystickBase.current = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };
    setJoystick(0, 0);
  }, [setJoystick]);

  const handleJoystickMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === joystickTouchId.current) {
        const dx = touch.clientX - joystickBase.current.x;
        const dy = touch.clientY - joystickBase.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const clampedDist = Math.min(dist, MAX_OFFSET);
        const angle = Math.atan2(dy, dx);
        const nx = (Math.cos(angle) * clampedDist) / MAX_OFFSET;
        const ny = (Math.sin(angle) * clampedDist) / MAX_OFFSET;

        if (Math.abs(nx) < DEAD_ZONE && Math.abs(ny) < DEAD_ZONE) {
          setJoystick(0, 0);
        } else {
          const mag = Math.sqrt(nx * nx + ny * ny);
          const clampedMag = Math.min(mag, 1);
          setJoystick(
            (nx / mag) * clampedMag,
            (ny / mag) * clampedMag
          );
        }
        break;
      }
    }
  }, [setJoystick]);

  const handleJoystickEnd = useCallback((e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === joystickTouchId.current) {
        joystickTouchId.current = null;
        setJoystick(0, 0);
        break;
      }
    }
  }, [setJoystick]);

  useEffect(() => {
    function onTouchStart(e: globalThis.TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        if (t.identifier === joystickTouchId.current) continue;

        if (cameraTouchIds.current.length === 0) {
          cameraTouchIds.current = [t.identifier];
          lastCameraPos.current = { x: t.clientX, y: t.clientY };
        } else if (cameraTouchIds.current.length === 1) {
          cameraTouchIds.current.push(t.identifier);
          const t1x = lastCameraPos.current.x;
          const t1y = lastCameraPos.current.y;
          lastPinchDist.current = Math.hypot(
            t.clientX - t1x,
            t.clientY - t1y
          );
          lastCameraPos.current = {
            x: (t1x + t.clientX) / 2,
            y: (t1y + t.clientY) / 2,
          };
        }
      }
    }

    function onTouchMove(e: globalThis.TouchEvent) {
      if (cameraTouchIds.current.length === 0) return;
      e.preventDefault();

      const touches = Array.from(e.touches);

      if (cameraTouchIds.current.length === 2) {
        const t1 = touches.find((t) => t.identifier === cameraTouchIds.current[0]);
        const t2 = touches.find((t) => t.identifier === cameraTouchIds.current[1]);
        if (t1 && t2) {
          const dist = Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY);
          if (lastPinchDist.current > 0) {
            const scale = dist / lastPinchDist.current;
            setPinchScale(scale);
          }
          lastPinchDist.current = dist;

          const midX = (t1.clientX + t2.clientX) / 2;
          const midY = (t1.clientY + t2.clientY) / 2;
          const dx = midX - lastCameraPos.current.x;
          const dy = midY - lastCameraPos.current.y;
          setCameraDelta(dx * 0.005, dy * 0.005);
          lastCameraPos.current = { x: midX, y: midY };
        }
      } else if (cameraTouchIds.current.length === 1) {
        const t = touches.find((t) => t.identifier === cameraTouchIds.current[0]);
        if (t) {
          const dx = t.clientX - lastCameraPos.current.x;
          const dy = t.clientY - lastCameraPos.current.y;
          setCameraDelta(dx * 0.005, dy * 0.005);
          lastCameraPos.current = { x: t.clientX, y: t.clientY };
        }
      }
    }

    function onTouchEnd(e: globalThis.TouchEvent) {
      const ended = Array.from(e.changedTouches).map((t) => t.identifier);
      cameraTouchIds.current = cameraTouchIds.current.filter(
        (id) => !ended.includes(id)
      );
      if (cameraTouchIds.current.length < 2) {
        lastPinchDist.current = 0;
      }
      if (cameraTouchIds.current.length === 1) {
        const touches = Array.from(e.touches);
        const remaining = touches.find(
          (t) => t.identifier === cameraTouchIds.current[0]
        );
        if (remaining) {
          lastCameraPos.current = { x: remaining.clientX, y: remaining.clientY };
        }
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: false });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onTouchEnd, { passive: false });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [setCameraDelta, setPinchScale]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40%',
        pointerEvents: 'none',
        zIndex: 15,
      }}
    >
      <div
        ref={joystickRef}
        onTouchStart={handleJoystickStart}
        onTouchMove={handleJoystickMove}
        onTouchEnd={handleJoystickEnd}
        style={{
          position: 'absolute',
          bottom: '40px',
          left: '40px',
          width: `${JOYSTICK_SIZE}px`,
          height: `${JOYSTICK_SIZE}px`,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)',
          border: '2px solid rgba(255,255,255,0.25)',
          pointerEvents: 'auto',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <JoystickThumb />
      </div>

      <div
        onTouchStart={(e) => {
          e.stopPropagation();
          setSprinting(true);
        }}
        onTouchEnd={(e) => {
          e.stopPropagation();
          setSprinting(false);
        }}
        style={{
          position: 'absolute',
          bottom: '40px',
          right: '40px',
          width: '80px',
          height: '80px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.15)',
          border: '2px solid rgba(255,255,255,0.3)',
          pointerEvents: 'auto',
          touchAction: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: '"Courier New", monospace',
          fontSize: '11px',
          color: 'rgba(255,255,255,0.6)',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          userSelect: 'none',
        }}
      >
        Sprint
      </div>
    </div>
  );
}

function JoystickThumb() {
  const joystickX = useTouchInput((s) => s.joystickX);
  const joystickY = useTouchInput((s) => s.joystickY);

  const offsetX = joystickX * MAX_OFFSET;
  const offsetY = joystickY * MAX_OFFSET;

  return (
    <div
      style={{
        width: `${JOYSTICK_THUMB}px`,
        height: `${JOYSTICK_THUMB}px`,
        borderRadius: '50%',
        background: 'rgba(255,255,255,0.35)',
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        transition: joystickX === 0 && joystickY === 0 ? 'transform 0.1s ease-out' : 'none',
        pointerEvents: 'none',
      }}
    />
  );
}
