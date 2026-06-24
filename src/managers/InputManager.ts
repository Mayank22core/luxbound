import { Logger } from '../core/utils/Logger';

export interface InputState {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  ability1: boolean;
  ability2: boolean;
  interact: boolean;
  pause: boolean;
  toggleLight: boolean;
  showMap: boolean;
  mouseX: number;
  mouseY: number;
  mouseDeltaX: number;
  mouseDeltaY: number;
  pointerLocked: boolean;
  touchActive: boolean;
  touchMoveX: number;
  touchMoveY: number;
}

const KEY_MAP: Record<string, keyof InputState> = {
  KeyW: 'forward',
  ArrowUp: 'forward',
  KeyS: 'backward',
  ArrowDown: 'backward',
  KeyA: 'left',
  ArrowLeft: 'left',
  KeyD: 'right',
  ArrowRight: 'right',
  ShiftLeft: 'sprint',
  ShiftRight: 'sprint',
  KeyQ: 'ability1',
  KeyE: 'ability2',
  KeyF: 'interact',
  Escape: 'pause',
  Space: 'toggleLight',
  Tab: 'showMap',
};

function createInitialState(): InputState {
  return {
    forward: false,
    backward: false,
    left: false,
    right: false,
    sprint: false,
    ability1: false,
    ability2: false,
    interact: false,
    pause: false,
    toggleLight: false,
    showMap: false,
    mouseX: 0,
    mouseY: 0,
    mouseDeltaX: 0,
    mouseDeltaY: 0,
    pointerLocked: false,
    touchActive: false,
    touchMoveX: 0,
    touchMoveY: 0,
  };
}

export interface InputManager {
  state: InputState;
  consumeTogglePause(): boolean;
  consumeToggleLight(): boolean;
  consumeMouseDeltas(): { dx: number; dy: number };
  consumeScrollDelta(): number;
  requestPointerLock(canvas: HTMLCanvasElement): void;
  init(): void;
  destroy(): void;
}

export function createInputManager(): InputManager {
  const state = createInitialState();
  let _togglePause = false;
  let _toggleLight = false;
  let _pendingDeltaX = 0;
  let _pendingDeltaY = 0;
  let _pendingScroll = 0;

  function onKeyDown(e: KeyboardEvent): void {
    const action = KEY_MAP[e.code];
    if (action) {
      e.preventDefault();
      if (action === 'pause') {
        state.pause = true;
        _togglePause = true;
        if (document.pointerLockElement) {
          document.exitPointerLock();
        }
      } else if (action === 'toggleLight') {
        _toggleLight = true;
      } else {
        const s = state as unknown as Record<string, boolean>;
        s[action] = true;
      }
    }
  }

  function onKeyUp(e: KeyboardEvent): void {
    const action = KEY_MAP[e.code];
    if (action) {
      e.preventDefault();
      if (action === 'pause') {
        state.pause = false;
      } else {
        const s = state as unknown as Record<string, boolean>;
        s[action] = false;
      }
    }
  }

  function onMouseMove(e: MouseEvent): void {
    state.mouseX = e.clientX;
    state.mouseY = e.clientY;
    if (state.pointerLocked) {
      _pendingDeltaX += e.movementX;
      _pendingDeltaY += e.movementY;
    }
  }

  function onPointerLockChange(): void {
    state.pointerLocked = document.pointerLockElement !== null;
  }

  function onWheel(e: WheelEvent): void {
    e.preventDefault();
    _pendingScroll += e.deltaY;
  }

  function onTouchStart(e: TouchEvent): void {
    state.touchActive = true;
    const touch = e.touches[0];
    if (touch) {
      state.touchMoveX = touch.clientX;
      state.touchMoveY = touch.clientY;
    }
  }

  function onTouchMove(e: TouchEvent): void {
    const touch = e.touches[0];
    if (touch) {
      state.touchMoveX = touch.clientX;
      state.touchMoveY = touch.clientY;
    }
  }

  function onTouchEnd(): void {
    state.touchActive = false;
    state.touchMoveX = 0;
    state.touchMoveY = 0;
  }

  function onContextMenu(e: Event): void {
    e.preventDefault();
  }

  const manager: InputManager = {
    state,

    consumeTogglePause(): boolean {
      if (_togglePause) {
        _togglePause = false;
        return true;
      }
      return false;
    },

    consumeToggleLight(): boolean {
      if (_toggleLight) {
        _toggleLight = false;
        return true;
      }
      return false;
    },

    consumeMouseDeltas(): { dx: number; dy: number } {
      const dx = _pendingDeltaX;
      const dy = _pendingDeltaY;
      _pendingDeltaX = 0;
      _pendingDeltaY = 0;
      return { dx, dy };
    },

    consumeScrollDelta(): number {
      const val = _pendingScroll;
      _pendingScroll = 0;
      return val;
    },

    requestPointerLock(canvas: HTMLCanvasElement): void {
      canvas.requestPointerLock();
    },

    init(): void {
      window.addEventListener('keydown', onKeyDown);
      window.addEventListener('keyup', onKeyUp);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('wheel', onWheel, { passive: false });
      document.addEventListener('pointerlockchange', onPointerLockChange);
      window.addEventListener('touchstart', onTouchStart, { passive: true });
      window.addEventListener('touchmove', onTouchMove, { passive: true });
      window.addEventListener('touchend', onTouchEnd, { passive: true });
      window.addEventListener('contextmenu', onContextMenu);
      Logger.info('InputManager initialized');
    },

    destroy(): void {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('wheel', onWheel);
      document.removeEventListener('pointerlockchange', onPointerLockChange);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('contextmenu', onContextMenu);
      Logger.info('InputManager destroyed');
    },
  };

  return manager;
}
