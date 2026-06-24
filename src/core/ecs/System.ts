import type { EntityId } from '../types/game';

export interface System {
  name: string;
  priority: number;
  update(dt: number, world: World): void;
  init?(world: World): void;
  destroy?(): void;
}

export interface World {
  addEntity(): EntityId;
  removeEntity(id: EntityId): boolean;
  hasEntity(id: EntityId): boolean;

  addComponent<T>(id: EntityId, name: string, data: T): void;
  removeComponent(id: EntityId, name: string): void;
  getComponent<T>(id: EntityId, name: string): T | undefined;
  hasComponent(id: EntityId, name: string): boolean;

  query(...componentNames: string[]): EntityId[];
  queryOne(...componentNames: string[]): EntityId | null;

  getEntityCount(): number;
  getComponentNames(id: EntityId): string[];
}
