import { withPlugins } from '@expo/config-plugins'
import { ConfigContext, ExpoConfig } from 'expo/config'

import { withAndroidExpoSSEPatch } from './plugins'

const baseConfig: ExpoConfig = {
  name: 'expo-sse-patch',
  slug: 'expo-sse-patch',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  extra: {
    eas: {
      projectId: '', // fill in expo projectId here
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
  const expoConfig = {
    ...config,
    ...baseConfig,
  }

  if (process.env.SSE_NO_FIX === 'true') {
    return expoConfig
  }

  withPlugins(expoConfig, [withAndroidExpoSSEPatch])

  return expoConfig
}
