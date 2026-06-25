import { create } from 'zustand';

interface TouchInputState {
  joystickX: number;
  joystickY: number;
  sprinting: boolean;
  cameraDeltaX: number;
  cameraDeltaY: number;
  pinchScale: number;
  active: boolean;

  setJoystick(x: number, y: number): void;
  setSprinting(sprinting: boolean): void;
  setCameraDelta(dx: number, dy: number): void;
  setPinchScale(scale: number): void;
  setActive(active: boolean): void;
  consumeCameraDelta(): { dx: number; dy: number };
  consumePinchScale(): number;
}

export const useTouchInput = create<TouchInputState>((set, get) => ({
  joystickX: 0,
  joystickY: 0,
  sprinting: false,
  cameraDeltaX: 0,
  cameraDeltaY: 0,
  pinchScale: 1,
  active: false,

  setJoystick: (x, y) => set({ joystickX: x, joystickY: y }),
  setSprinting: (sprinting) => set({ sprinting }),
  setCameraDelta: (dx, dy) => set((s) => ({
    cameraDeltaX: s.cameraDeltaX + dx,
    cameraDeltaY: s.cameraDeltaY + dy,
  })),
  setPinchScale: (scale) => set({ pinchScale: scale }),
  setActive: (active) => set({ active }),

  consumeCameraDelta: () => {
    const s = get();
    const dx = s.cameraDeltaX;
    const dy = s.cameraDeltaY;
    set({ cameraDeltaX: 0, cameraDeltaY: 0 });
    return { dx, dy };
  },

  consumePinchScale: () => {
    const s = get();
    const scale = s.pinchScale;
    set({ pinchScale: 1 });
    return scale;
  },
}));
