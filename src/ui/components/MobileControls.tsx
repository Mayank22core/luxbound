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

  const cameraTouchId = useRef<number | null>(null);
  const pinchTouchId = useRef<number | null>(null);
  const lastCameraPos = useRef({ x: 0, y: 0 });
  const lastPinchDist = useRef(0);

  useEffect(() => {
    function isInsideJoystick(x: number, y: number): boolean {
      const el = joystickRef.current;
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    }

    function isInsideSprint(x: number, y: number): boolean {
      const el = document.querySelector('[data-sprint]');
      if (!el) return false;
      const rect = el.getBoundingClientRect();
      return (
        x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom
      );
    }

    function onTouchStart(e: globalThis.TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];
        const x = t.clientX;
        const y = t.clientY;

        if (isInsideJoystick(x, y)) {
          if (joystickTouchId.current === null) {
            joystickTouchId.current = t.identifier;
            const el = joystickRef.current!;
            const rect = el.getBoundingClientRect();
            joystickBase.current = {
              x: rect.left + rect.width / 2,
              y: rect.top + rect.height / 2,
            };
            setJoystick(0, 0);
          }
          continue;
        }

        if (isInsideSprint(x, y)) {
          setSprinting(true);
          continue;
        }

        if (cameraTouchId.current === null && pinchTouchId.current === null) {
          cameraTouchId.current = t.identifier;
          lastCameraPos.current = { x, y };
        } else if (cameraTouchId.current !== null && pinchTouchId.current === null) {
          pinchTouchId.current = t.identifier;
          lastPinchDist.current = Math.hypot(
            x - lastCameraPos.current.x,
            y - lastCameraPos.current.y
          );
        }
      }
    }

    function onTouchMove(e: globalThis.TouchEvent) {
      const touches = Array.from(e.touches);

      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.identifier === joystickTouchId.current) {
          const dx = t.clientX - joystickBase.current.x;
          const dy = t.clientY - joystickBase.current.y;
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
            setJoystick((nx / mag) * clampedMag, (ny / mag) * clampedMag);
          }
          continue;
        }

        if (cameraTouchId.current !== null && pinchTouchId.current !== null) {
          const t1 = touches.find((tt) => tt.identifier === cameraTouchId.current);
          const t2 = touches.find((tt) => tt.identifier === pinchTouchId.current);
          if (t1 && t2) {
            const dist = Math.hypot(
              t2.clientX - t1.clientX,
              t2.clientY - t1.clientY
            );
            if (lastPinchDist.current > 0) {
              setPinchScale(dist / lastPinchDist.current);
            }
            lastPinchDist.current = dist;

            const midX = (t1.clientX + t2.clientX) / 2;
            const midY = (t1.clientY + t2.clientY) / 2;
            setCameraDelta(
              (midX - lastCameraPos.current.x) * 0.006,
              (midY - lastCameraPos.current.y) * 0.006
            );
            lastCameraPos.current = { x: midX, y: midY };
          }
        } else if (cameraTouchId.current !== null) {
          if (t.identifier === cameraTouchId.current) {
            setCameraDelta(
              (t.clientX - lastCameraPos.current.x) * 0.006,
              (t.clientY - lastCameraPos.current.y) * 0.006
            );
            lastCameraPos.current = { x: t.clientX, y: t.clientY };
          }
        }
      }
    }

    function onTouchEnd(e: globalThis.TouchEvent) {
      for (let i = 0; i < e.changedTouches.length; i++) {
        const t = e.changedTouches[i];

        if (t.identifier === joystickTouchId.current) {
          joystickTouchId.current = null;
          setJoystick(0, 0);
          continue;
        }

        if (isInsideSprint(t.clientX, t.clientY)) {
          setSprinting(false);
          continue;
        }

        if (t.identifier === pinchTouchId.current) {
          pinchTouchId.current = null;
          lastPinchDist.current = 0;
        }
        if (t.identifier === cameraTouchId.current) {
          if (pinchTouchId.current !== null) {
            cameraTouchId.current = pinchTouchId.current;
            pinchTouchId.current = null;
            lastPinchDist.current = 0;
            const remaining = Array.from(e.touches).find(
              (tt) => tt.identifier === cameraTouchId.current
            );
            if (remaining) {
              lastCameraPos.current = {
                x: remaining.clientX,
                y: remaining.clientY,
              };
            }
          } else {
            cameraTouchId.current = null;
          }
        }
      }

      const stillTouching = new Set(Array.from(e.touches).map((tt) => tt.identifier));
      if (joystickTouchId.current !== null && !stillTouching.has(joystickTouchId.current)) {
        joystickTouchId.current = null;
        setJoystick(0, 0);
      }
      if (cameraTouchId.current !== null && !stillTouching.has(cameraTouchId.current)) {
        cameraTouchId.current = null;
      }
      if (pinchTouchId.current !== null && !stillTouching.has(pinchTouchId.current)) {
        pinchTouchId.current = null;
        lastPinchDist.current = 0;
      }
    }

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });
    document.addEventListener('touchcancel', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
      document.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [setCameraDelta, setPinchScale, setJoystick, setSprinting]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 5,
          touchAction: 'none',
        }}
      />

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
          data-sprint="true"
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
    </>
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
        transition:
          joystickX === 0 && joystickY === 0
            ? 'transform 0.1s ease-out'
            : 'none',
        pointerEvents: 'none',
      }}
    />
  );
}
