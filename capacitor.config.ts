import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.finalglow.app',
  appName: 'finalglowai',
  webDir: 'dist',
  android: {
    // Allows inspecting the release WebView from Chrome -> chrome://inspect
    // so you can see the actual JS error instead of a blank screen.
    webContentsDebuggingEnabled: true,
  },
};

export default config;
