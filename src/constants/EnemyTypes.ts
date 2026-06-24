export const EnemyType = {
  BAT: 'bat',
  SKELETON: 'skeleton',
  SHADOW_WRAITH: 'shadowWraith',
} as const;

export type EnemyType = typeof EnemyType[keyof typeof EnemyType];
