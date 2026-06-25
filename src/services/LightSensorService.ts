import { isAndroid } from './PlatformManager';
import { Logger } from '../core/utils/Logger';

const SMOOTHING_WINDOW = 5;

function normalizeLux(raw: number): number {
  if (raw < 0) return 0;
  if (raw < 10) return raw / 10 * 0.05;
  if (raw < 80) return 0.05 + ((raw - 10) / 70) * 0.2;
  if (raw < 300) return 0.25 + ((raw - 80) / 220) * 0.35;
  if (raw < 800) return 0.6 + ((raw - 300) / 500) * 0.25;
  return 0.85 + Math.min((raw - 800) / 5000, 1) * 0.15;
}

export interface LightSensorService {
  lux: number;
  normalizedLevel: number;
  available: boolean;
  onUpdate: ((level: number) => void) | null;
  start(): Promise<void>;
  stop(): Promise<void>;
  destroy(): void;
}

export function createLightSensorService(): LightSensorService {
  let lux = 0.5;
  let normalizedLevel = 0.5;
  let available = false;
  let running = false;
  let listenerHandle: { remove: () => Promise<void> } | null = null;
  let sensorModule: typeof import('@capgo/capacitor-light-sensor') | null = null;
  const readings: number[] = [];
  let onUpdate: ((level: number) => void) | null = null;

  function smoothReading(raw: number): number {
    readings.push(raw);
    if (readings.length > SMOOTHING_WINDOW) {
      readings.shift();
    }
    let sum = 0;
    for (let i = 0; i < readings.length; i++) {
      sum += readings[i];
    }
    return sum / readings.length;
  }

  async function loadSensorModule(): Promise<boolean> {
    if (!isAndroid()) return false;
    try {
      sensorModule = await import('@capgo/capacitor-light-sensor');
      return true;
    } catch {
      Logger.debug('LightSensor: Capacitor module not available (web/browser)');
      return false;
    }
  }

  async function start(): Promise<void> {
    if (running) return;

    const loaded = await loadSensorModule();
    if (!loaded || !sensorModule) {
      available = false;
      Logger.debug('LightSensor: unavailable, using fallback');
      return;
    }

    try {
      const { available: sensorAvailable } = await sensorModule.LightSensor.isAvailable();
      if (!sensorAvailable) {
        available = false;
        Logger.debug('LightSensor: device has no light sensor');
        return;
      }

      available = true;
      await sensorModule.LightSensor.start({ updateInterval: 100 });

      listenerHandle = await sensorModule.LightSensor.addListener(
        'lightSensorChange',
        (data) => {
          const smoothed = smoothReading(data.illuminance);
          lux = smoothed;
          normalizedLevel = Math.max(0, Math.min(1, normalizeLux(smoothed)));
          if (onUpdate) {
            onUpdate(normalizedLevel);
          }
        }
      );

      running = true;
      Logger.info(`LightSensor: started (available=${available})`);
    } catch (err) {
      available = false;
      Logger.debug(`LightSensor: failed to start — ${err}`);
    }
  }

  async function stop(): Promise<void> {
    if (!running) return;
    try {
      if (listenerHandle) {
        await listenerHandle.remove();
        listenerHandle = null;
      }
      if (sensorModule) {
        await sensorModule.LightSensor.stop();
      }
    } catch {
      // silent cleanup
    }
    running = false;
  }

  function destroy(): void {
    if (running) {
      stop();
    }
    sensorModule = null;
    readings.length = 0;
  }

  const service: LightSensorService = {
    get lux() { return lux; },
    get normalizedLevel() { return normalizedLevel; },
    get available() { return available; },
    get onUpdate() { return onUpdate; },
    set onUpdate(cb) { onUpdate = cb; },

    start,
    stop,
    destroy,
  };

  return service;
}
