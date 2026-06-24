export interface PlayerMovedEvent {
  entityId: number;
  position: { x: number; y: number; z: number };
}

export interface LightLevelChangedEvent {
  level: number;
  isHealing: boolean;
  isDamaging: boolean;
}

export interface EnemyKilledEvent {
  entityId: number;
  position: { x: number; y: number; z: number };
  lootType?: string;
}

export interface PlayerDiedEvent {
  entityId: number;
}

export interface GameStateChangedEvent {
  from: string;
  to: string;
}

export interface DungeonGeneratedEvent {
  roomCount: number;
  seed: number;
}

export interface AbilityUsedEvent {
  entityId: number;
  abilityType: string;
  position: { x: number; y: number; z: number };
}

export const GAME_EVENTS = {
  PLAYER_MOVED: 'player:moved',
  LIGHT_LEVEL_CHANGED: 'light:levelChanged',
  ENEMY_KILLED: 'enemy:killed',
  PLAYER_DIED: 'player:died',
  GAME_STATE_CHANGED: 'game:stateChanged',
  DUNGEON_GENERATED: 'dungeon:generated',
  ABILITY_USED: 'ability:used',
} as const;
