export type EntityId = number;

export interface TransformData {
  position: { x: number; y: number; z: number };
  rotation: { x: number; y: number; z: number };
  scale: { x: number; y: number; z: number };
}

export interface HealthData {
  current: number;
  max: number;
  regenRate: number;
}

export interface VelocityData {
  x: number;
  y: number;
  z: number;
  maxSpeed: number;
}
