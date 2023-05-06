import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'coffeerush.apps.shuttlefinder',
  appName: 'Shuttle Finder',
  bundledWebRuntime: false,
  webDir: 'www',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      androidScaleType: 'CENTER_CROP',
      backgroundColor: '#99cc33',
    },
  },
};

export default config;
