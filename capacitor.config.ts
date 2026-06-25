import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.luxbound.game',
  appName: 'LuxBound',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
  plugins: {
    LightSensor: {
      updateInterval: 100,
    },
  },
};

export default config;
