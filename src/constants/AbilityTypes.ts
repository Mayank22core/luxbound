export const AbilityType = {
  SHADOW_BOLT: 'shadowBolt',
  LIGHT_BURST: 'lightBurst',
  DARKNESS_SHROUD: 'darknessShroud',
  VAMPIRIC_DRAIN: 'vampiricDrain',
} as const;

export type AbilityType = typeof AbilityType[keyof typeof AbilityType];
