import { ConfigContext, ExpoConfig } from 'expo/config'

const baseConfig: ExpoConfig = {
  name: 'expo-sse-patch',
  slug: 'expo-sse-patch',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  extra: {
    eas: {
      projectId: 'c5452e18-099e-4350-bb80-9a1b7df564cb', // fill in expo projectId here
    },
  },
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.martinhksf.expossepatch',
  },
  web: {
    favicon: './assets/favicon.png',
  },
  plugins: [
    [
      'expo-build-properties',
      {
        android: {
          // allow connecting to local http server while in release mode.
          usesCleartextTraffic: true,
        },
      },
    ],
  ],
}

export default function setupConfig({ config }: ConfigContext) {
  return {
    ...config,
    ...baseConfig,
  }
}
