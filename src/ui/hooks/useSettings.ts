import { create } from 'zustand';

interface SettingsStore {
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  graphicsQuality: 'low' | 'medium' | 'high';
  showFPS: boolean;
  touchControlsEnabled: boolean;

  setMasterVolume: (vol: number) => void;
  setSfxVolume: (vol: number) => void;
  setMusicVolume: (vol: number) => void;
  setGraphicsQuality: (quality: 'low' | 'medium' | 'high') => void;
  setShowFPS: (show: boolean) => void;
  setTouchControls: (enabled: boolean) => void;
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  masterVolume: 0.8,
  sfxVolume: 1.0,
  musicVolume: 0.6,
  graphicsQuality: 'high',
  showFPS: false,
  touchControlsEnabled: true,

  setMasterVolume: (vol) => set({ masterVolume: vol }),
  setSfxVolume: (vol) => set({ sfxVolume: vol }),
  setMusicVolume: (vol) => set({ musicVolume: vol }),
  setGraphicsQuality: (quality) => set({ graphicsQuality: quality }),
  setShowFPS: (show) => set({ showFPS: show }),
  setTouchControls: (enabled) => set({ touchControlsEnabled: enabled }),
}));
