import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'io.ionic.starter',
  appName: 'greenmark-v6',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  }
};

export default config;
