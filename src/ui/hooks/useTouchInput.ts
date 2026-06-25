import { create } from 'zustand';

interface TouchInputState {
  joystickX: number;
  joystickY: number;
  sprinting: boolean;
  active: boolean;

  setJoystick(x: number, y: number): void;
  setSprinting(sprinting: boolean): void;
  setActive(active: boolean): void;
}

export const useTouchInput = create<TouchInputState>((set) => ({
  joystickX: 0,
  joystickY: 0,
  sprinting: false,
  active: false,

  setJoystick: (x, y) => set({ joystickX: x, joystickY: y }),
  setSprinting: (sprinting) => set({ sprinting }),
  setActive: (active) => set({ active }),
}));
