import type { EntityId } from '../types/game';

let nextId = 1;

export function createEntityId(): EntityId {
  return nextId++;
}
