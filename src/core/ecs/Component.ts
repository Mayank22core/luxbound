export type ComponentData = Record<string, unknown>;

export interface ComponentDefinition<T extends ComponentData = ComponentData> {
  name: string;
  defaults: T;
}
