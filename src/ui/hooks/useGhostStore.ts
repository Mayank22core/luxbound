import { create } from 'zustand';

interface GhostStore {
  enabled: boolean;
  speed: number;
  showDebugInfo: boolean;
  showRoomBoundaries: boolean;
  showNavMesh: boolean;
  showSpawnPoints: boolean;
  showEnemyPaths: boolean;

  toggle: () => void;
  setEnabled: (enabled: boolean) => void;
  setSpeed: (speed: number) => void;
  toggleDebugInfo: () => void;
  toggleRoomBoundaries: () => void;
  toggleNavMesh: () => void;
  toggleSpawnPoints: () => void;
  toggleEnemyPaths: () => void;
}

export const useGhostStore = create<GhostStore>((set) => ({
  enabled: false,
  speed: 25,
  showDebugInfo: true,
  showRoomBoundaries: false,
  showNavMesh: false,
  showSpawnPoints: false,
  showEnemyPaths: false,

  toggle: () => set((s) => ({ enabled: !s.enabled })),
  setEnabled: (enabled) => set({ enabled }),
  setSpeed: (speed) => set({ speed }),
  toggleDebugInfo: () => set((s) => ({ showDebugInfo: !s.showDebugInfo })),
  toggleRoomBoundaries: () => set((s) => ({ showRoomBoundaries: !s.showRoomBoundaries })),
  toggleNavMesh: () => set((s) => ({ showNavMesh: !s.showNavMesh })),
  toggleSpawnPoints: () => set((s) => ({ showSpawnPoints: !s.showSpawnPoints })),
  toggleEnemyPaths: () => set((s) => ({ showEnemyPaths: !s.showEnemyPaths })),
}));
