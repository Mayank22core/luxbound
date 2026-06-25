import { create } from 'zustand';
import { GameState } from '../../constants/GameState';

interface GameStateStore {
  state: GameState;
  playerHealth: number;
  playerMaxHealth: number;
  lightLevel: number;
  isHealing: boolean;
  isDamaging: boolean;
  dungeonSeed: number | null;
  roomCount: number;

  setState: (state: GameState) => void;
  setPlayerHealth: (health: number, max: number) => void;
  setLightLevel: (level: number, isHealing: boolean, isDamaging: boolean) => void;
  setDungeonInfo: (seed: number, roomCount: number) => void;
}

const initialState = {
  state: GameState.MENU,
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
  setPlayerHealth: (health, max) => set({ playerHealth: health, playerMaxHealth: max }),
  setLightLevel: (level, isHealing, isDamaging) =>
    set({ lightLevel: level, isHealing, isDamaging }),
  setDungeonInfo: (seed, roomCount) => set({ dungeonSeed: seed, roomCount }),
}));
