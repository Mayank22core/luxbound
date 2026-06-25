import { useGameStore } from '../../ui/hooks/useGameState';
import { LIGHT_THRESHOLDS, LIGHT_EFFECTS } from '../../constants/LightLevels';
import { GameState } from '../../constants/GameState';
import { Logger } from '../../core/utils/Logger';
import type { World } from '../../core/ecs';
import type { HealthData } from '../../core/types/game';

export const LIGHT_STATES = {
  DARK: 0.1,
  NEUTRAL: 0.5,
  BRIGHT: 0.9,
} as const;

export type LightStateValue = typeof LIGHT_STATES[keyof typeof LIGHT_STATES];

const STATE_ORDER: LightStateValue[] = [
  LIGHT_STATES.DARK,
  LIGHT_STATES.NEUTRAL,
  LIGHT_STATES.BRIGHT,
];

export interface LightSystem {
  currentLevel: number;
  currentStateIndex: number;
  sensorMode: boolean;
  cycle(): LightStateValue;
  setLevel(level: number): void;
  setSensorLevel(level: number): void;
  update(dt: number, world: World): void;
}

export function createLightSystem(): LightSystem {
  let currentLevel = LIGHT_STATES.NEUTRAL;
  let targetLevel = LIGHT_STATES.NEUTRAL;
  let currentStateIndex = 1;
  let sensorMode = false;
  const LERP_SPEED = 8;

  function applyHealthEffects(dt: number, world: World): void {
    const players = world.query('transform', 'player', 'health');
    if (players.length === 0) return;

    const health = world.getComponent<HealthData>(players[0], 'health');
    if (!health) return;

    const store = useGameStore.getState();

    if (health.current <= 0) {
      store.setLightLevel(currentLevel, false, false);
      store.setState(GameState.DEATH);
      return;
    }

    let isHealing = false;
    let isDamaging = false;

    if (currentLevel < LIGHT_THRESHOLDS.DARKNESS) {
      health.current = Math.min(health.max, health.current + LIGHT_EFFECTS.HEAL_RATE * dt);
      isHealing = true;
    } else if (currentLevel > LIGHT_THRESHOLDS.BRIGHT) {
      health.current = Math.max(0, health.current - LIGHT_EFFECTS.DAMAGE_RATE * dt);
      isDamaging = true;
    }

    store.setPlayerHealth(health.current, health.max);
    store.setLightLevel(currentLevel, isHealing, isDamaging);
  }

  const system: LightSystem = {
    get currentLevel() { return currentLevel; },
    get currentStateIndex() { return currentStateIndex; },
    get sensorMode() { return sensorMode; },

    cycle(): LightStateValue {
      if (sensorMode) return currentLevel as LightStateValue;
      currentStateIndex = (currentStateIndex + 1) % STATE_ORDER.length;
      targetLevel = STATE_ORDER[currentStateIndex];
      Logger.debug(`Light cycle → ${['DARK', 'NEUTRAL', 'BRIGHT'][currentStateIndex]} (${targetLevel})`);
      return targetLevel;
    },

    setLevel(level: number): void {
      targetLevel = Math.max(0, Math.min(1, level));
      currentLevel = targetLevel;
    },

    setSensorLevel(level: number): void {
      sensorMode = true;
      targetLevel = Math.max(0, Math.min(1, level));
    },

    update(dt: number, world: World): void {
      const diff = targetLevel - currentLevel;
      if (Math.abs(diff) > 0.001) {
        currentLevel += diff * Math.min(1, LERP_SPEED * dt);
      } else {
        currentLevel = targetLevel;
      }

      applyHealthEffects(dt, world);
    },
  };

  Logger.info('Light system created — neutral mode');
  return system;
}
