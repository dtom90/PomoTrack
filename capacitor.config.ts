import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.davidthomason.pomotrack',
  appName: 'Pomotrack',
  webDir: 'dist_web',
  plugins: {
    StatusBar: {
      overlaysWebView: false,
      style: "LIGHT",
      backgroundColor: "#ffffffff",
    },
  }
};

export default config;
