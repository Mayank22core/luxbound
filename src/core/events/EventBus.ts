type EventCallback<T = unknown> = (data: T) => void;

interface EventRecord {
  callbacks: Set<EventCallback>;
}

const events = new Map<string, EventRecord>();

export const EventBus = {
  on<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    if (!events.has(event)) {
      events.set(event, { callbacks: new Set() });
    }
    events.get(event)!.callbacks.add(callback as EventCallback);

    return () => {
      events.get(event)?.callbacks.delete(callback as EventCallback);
    };
  },

  once<T = unknown>(event: string, callback: EventCallback<T>): () => void {
    const wrapper: EventCallback<T> = (data) => {
      callback(data);
      unsub();
    };
    const unsub = EventBus.on(event, wrapper);
    return unsub;
  },

  emit<T = unknown>(event: string, data: T): void {
    const record = events.get(event);
    if (!record) return;

    for (const cb of record.callbacks) {
      try {
        cb(data);
      } catch (err) {
        console.error(`[EventBus] Error in handler for "${event}":`, err);
      }
    }
  },

  off(event: string, callback: EventCallback): void {
    events.get(event)?.callbacks.delete(callback);
  },

  removeAll(event?: string): void {
    if (event) {
      events.delete(event);
    } else {
      events.clear();
    }
  },

  listenerCount(event: string): number {
    return events.get(event)?.callbacks.size ?? 0;
  },
};
