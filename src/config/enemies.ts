export const ENEMY_CONFIG: Record<string, {
  health: number;
  speed: number;
  damage: number;
  attackRange: number;
  aggroRange: number;
}> = {
  bat: {
    health: 20,
    speed: 4,
    damage: 5,
    attackRange: 1.5,
    aggroRange: 8,
  },
  skeleton: {
    health: 50,
    speed: 2.5,
    damage: 15,
    attackRange: 2,
    aggroRange: 10,
  },
  shadowWraith: {
    health: 80,
    speed: 3,
    damage: 25,
    attackRange: 3,
    aggroRange: 12,
  },
};
