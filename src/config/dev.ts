import { isCapacitor } from '../services/PlatformManager';

export const DEV_CONFIG = {
  DEV_MODE: !isCapacitor(),
  GHOST_SPEED: 25,
  GHOST_SPRINT_MULTIPLIER: 3,
  GHOST_ZOOM_SPEED: 0.5,
  GHOST_MIN_ZOOM: 2,
  GHOST_MAX_ZOOM: 100,
  GHOST_FOG_NEAR: 50,
  GHOST_FOG_FAR: 200,
} as const;
