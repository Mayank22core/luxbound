import * as THREE from 'three';
import { Logger } from '../core/utils/Logger';

interface RendererConfig {
  antialias: boolean;
  pixelRatio: number;
  shadowMapEnabled: boolean;
  maxPixelRatio: number;
}

const DEFAULT_CONFIG: RendererConfig = {
  antialias: true,
  pixelRatio: Math.min(window.devicePixelRatio, 2),
  shadowMapEnabled: true,
  maxPixelRatio: 2,
};

export function createRenderer(
  canvas: HTMLCanvasElement,
  config: Partial<RendererConfig> = {}
): THREE.WebGLRenderer {
  const cfg = { ...DEFAULT_CONFIG, ...config };

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: cfg.antialias,
    powerPreference: 'high-performance',
  });

  renderer.setPixelRatio(Math.min(window.devicePixelRatio, cfg.maxPixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  if (cfg.shadowMapEnabled) {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  }

  Logger.info('Renderer initialized');
  return renderer;
}

export function resizeRenderer(
  renderer: THREE.WebGLRenderer,
  width: number,
  height: number
): void {
  renderer.setSize(width, height);
}
