import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'tech.jlucartc.greenmark',
  appName: 'greenmark',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  "plugins": {
    "LocalNotifications": {
      "smallIcon": "greenmark_notification_icon",
      "iconColor": "#54e431",
    },
    SplashScreen: {
      androidSplashResourceName: "greenmark_splash",
      androidScaleType: "FIT_XY"
    }
  }
};

export default config;
