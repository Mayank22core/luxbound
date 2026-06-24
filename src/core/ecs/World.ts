import type { EntityId } from '../types/game';
import type { World } from './System';
import { createEntityId } from './Entity';

type ComponentStore = Map<string, unknown>;

interface EntityRecord {
  id: EntityId;
  components: ComponentStore;
}

export function createWorld(): World {
  const entities = new Map<EntityId, EntityRecord>();
  const componentIndex = new Map<string, Set<EntityId>>();

  const world: World = {
    addEntity(): EntityId {
      const id = createEntityId();
      entities.set(id, { id, components: new Map() });
      return id;
    },

    removeEntity(id: EntityId): boolean {
      const record = entities.get(id);
      if (!record) return false;

      for (const [name] of record.components) {
        const index = componentIndex.get(name);
        if (index) index.delete(id);
      }

      entities.delete(id);
      return true;
    },

    hasEntity(id: EntityId): boolean {
      return entities.has(id);
    },

    addComponent<T>(id: EntityId, name: string, data: T): void {
      const record = entities.get(id);
      if (!record) return;

      record.components.set(name, data);

      if (!componentIndex.has(name)) {
        componentIndex.set(name, new Set());
      }
      componentIndex.get(name)!.add(id);
    },

    removeComponent(id: EntityId, name: string): void {
      const record = entities.get(id);
      if (!record) return;

      record.components.delete(name);
      const index = componentIndex.get(name);
      if (index) index.delete(id);
    },

    getComponent<T>(id: EntityId, name: string): T | undefined {
      const record = entities.get(id);
      if (!record) return undefined;
      return record.components.get(name) as T | undefined;
    },

    hasComponent(id: EntityId, name: string): boolean {
      const record = entities.get(id);
      if (!record) return false;
      return record.components.has(name);
    },

    query(...componentNames: string[]): EntityId[] {
      if (componentNames.length === 0) return [];

      const sets = componentNames
        .map((name) => componentIndex.get(name))
        .filter((s): s is Set<EntityId> => s !== undefined);

      if (sets.length === 0) return [];

      sets.sort((a, b) => a.size - b.size);

      const result: EntityId[] = [];
      const smallest = sets[0];

      for (const entityId of smallest) {
        const record = entities.get(entityId);
        if (!record) continue;

        let hasAll = true;
        for (let i = 1; i < sets.length; i++) {
          if (!sets[i].has(entityId)) {
            hasAll = false;
            break;
          }
        }

        if (hasAll) {
          result.push(entityId);
        }
      }

      return result;
    },

    queryOne(...componentNames: string[]): EntityId | null {
      const results = world.query(...componentNames);
      return results.length > 0 ? results[0] : null;
    },

    getEntityCount(): number {
      return entities.size;
    },

    getComponentNames(id: EntityId): string[] {
      const record = entities.get(id);
      if (!record) return [];
      return Array.from(record.components.keys());
    },
  };

  return world;
}
