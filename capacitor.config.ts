import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.nativa.shop',
  appName: 'Nativa',
  webDir: 'www',
  // Se eliminó bundledWebRuntime porque Capacitor ahora es más inteligente
  server: {
    androidScheme: 'https'
  }
};

export default config;