import { Logger } from './Logger';

interface ErrorContext {
  system?: string;
  entity?: number;
  phase?: string;
}

export const ErrorHandler = {
  handle(err: unknown, context?: ErrorContext): void {
    const message = err instanceof Error ? err.message : String(err);
    const stack = err instanceof Error ? err.stack : undefined;
    const ctxStr = context ? ` [${JSON.stringify(context)}]` : '';

    Logger.error(`${ctxStr} ${message}`);
    if (stack) {
      Logger.debug('Stack trace:', stack);
    }
  },

  wrap<T>(fn: () => T, context?: ErrorContext): T | undefined {
    try {
      return fn();
    } catch (err) {
      ErrorHandler.handle(err, context);
      return undefined;
    }
  },

  async wrapAsync<T>(fn: () => Promise<T>, context?: ErrorContext): Promise<T | undefined> {
    try {
      return await fn();
    } catch (err) {
      ErrorHandler.handle(err, context);
      return undefined;
    }
  },

  assert(condition: boolean, message: string): asserts condition {
    if (!condition) {
      Logger.error(`Assertion failed: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
  },
};
