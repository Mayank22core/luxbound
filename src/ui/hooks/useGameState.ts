import { create } from 'zustand';
import { GameState } from '../../constants/GameState';

interface GameStateStore {
  state: GameState;
  score: number;
  level: number;
  playerHealth: number;
  playerMaxHealth: number;
  lightLevel: number;
  isHealing: boolean;
  isDamaging: boolean;
  dungeonSeed: number | null;
  roomCount: number;

  setState: (state: GameState) => void;
  setScore: (score: number) => void;
  addScore: (amount: number) => void;
  setLevel: (level: number) => void;
  setPlayerHealth: (health: number, max: number) => void;
  setLightLevel: (level: number, isHealing: boolean, isDamaging: boolean) => void;
  setDungeonInfo: (seed: number, roomCount: number) => void;
  reset: () => void;
}

const initialState = {
  state: GameState.MENU,
  score: 0,
  level: 1,
  playerHealth: 100,
  playerMaxHealth: 100,
  lightLevel: 0.5,
  isHealing: false,
  isDamaging: false,
  dungeonSeed: null,
  roomCount: 0,
};

export const useGameStore = create<GameStateStore>((set) => ({
  ...initialState,

  setState: (state) => set({ state }),
  setScore: (score) => set({ score }),
  addScore: (amount) => set((s) => ({ score: s.score + amount })),
  setLevel: (level) => set({ level }),
  setPlayerHealth: (health, max) => set({ playerHealth: health, playerMaxHealth: max }),
  setLightLevel: (level, isHealing, isDamaging) =>
    set({ lightLevel: level, isHealing, isDamaging }),
  setDungeonInfo: (seed, roomCount) => set({ dungeonSeed: seed, roomCount }),
  reset: () => set(initialState),
}));
