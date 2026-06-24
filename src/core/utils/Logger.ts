const prefix = '[LuxBound]';

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString('en-US', { hour12: false });
}

function shouldLog(level: number): boolean {
  return level >= currentLogLevel;
}

let currentLogLevel = 0;

export const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  SILENT: 4,
} as const;

export type LogLevel = typeof LogLevel[keyof typeof LogLevel];

export const Logger = {
  setLevel(level: LogLevel): void {
    currentLogLevel = level;
  },

  getLevel(): number {
    return currentLogLevel;
  },

  debug(...args: unknown[]): void {
    if (shouldLog(LogLevel.DEBUG)) {
      console.log(`%c${prefix} [DEBUG] [${formatTime()}]`, 'color: #888', ...args);
    }
  },

  info(...args: unknown[]): void {
    if (shouldLog(LogLevel.INFO)) {
      console.log(`%c${prefix} [INFO] [${formatTime()}]`, 'color: #4fc3f7', ...args);
    }
  },

  warn(...args: unknown[]): void {
    if (shouldLog(LogLevel.WARN)) {
      console.warn(`%c${prefix} [WARN] [${formatTime()}]`, 'color: #ffb74d', ...args);
    }
  },

  error(...args: unknown[]): void {
    if (shouldLog(LogLevel.ERROR)) {
      console.error(`%c${prefix} [ERROR] [${formatTime()}]`, 'color: #ef5350', ...args);
    }
  },

  group(label: string): void {
    if (shouldLog(LogLevel.DEBUG)) {
      console.group(`${prefix} ${label}`);
    }
  },

  groupEnd(): void {
    console.groupEnd();
  },
};
