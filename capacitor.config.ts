import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  "appId": "com.eliprod.app",
  "appName": "Eli Peças",
  "webDir": "dist",
  "server": {
    "url": "https://eli-pecas.vercel.app",
    "cleartext": true
  }
};

export default config;
