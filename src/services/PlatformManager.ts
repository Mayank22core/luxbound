export type Platform = 'desktop' | 'android' | 'ios' | 'web';
export type Runtime = 'capacitor' | 'browser';
export type InputMode = 'mouse' | 'touch';

interface PlatformInfo {
  platform: Platform;
  runtime: Runtime;
  inputMode: InputMode;
  hasTouch: boolean;
  hasLightSensor: boolean;
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
}

let cached: PlatformInfo | null = null;

function detectPlatform(): Platform {
  const ua = navigator.userAgent.toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return 'ios';
  if (window.matchMedia('(display-mode: standalone)').matches) return 'android';
  return 'desktop';
}

function detectRuntime(): Runtime {
  const w = window as Record<string, unknown>;
  if (w.Capacitor && typeof w.Capacitor === 'object') {
    const cap = w.Capacitor as Record<string, unknown>;
    if (typeof cap.isNativePlatform === 'function' && cap.isNativePlatform()) {
      return 'capacitor';
    }
  }
  return 'browser';
}

function detectInputMode(): InputMode {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return 'touch';
  return 'mouse';
}

export function getPlatform(): PlatformInfo {
  if (cached) return cached;

  const platform = detectPlatform();
  const runtime = detectRuntime();
  const inputMode = detectInputMode();
  const hasTouch = inputMode === 'touch';
  const hasLightSensor = platform === 'android' && runtime === 'capacitor';

  cached = {
    platform,
    runtime,
    inputMode,
    hasTouch,
    hasLightSensor,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  };

  return cached;
}

export function isTouchDevice(): boolean {
  return getPlatform().hasTouch;
}

export function isCapacitor(): boolean {
  return getPlatform().runtime === 'capacitor';
}

export function isAndroid(): boolean {
  return getPlatform().platform === 'android';
}
