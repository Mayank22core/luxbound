export const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  DEATH: 'death',
  SETTINGS: 'settings',
  LOADING: 'loading',
} as const;

export type GameState = typeof GameState[keyof typeof GameState];
