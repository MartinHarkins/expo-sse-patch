import { ConfigContext, ExpoConfig } from 'expo/config'

import { withAndroidEventSourceFixes } from './plugins'

const baseConfig: ExpoConfig = {
  name: 'expo-sse-patch',
  slug: 'expo-sse-patch',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
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
}

export default function setupConfig({ config }: ConfigContext) {
  return withAndroidEventSourceFixes({
    ...config,
    ...baseConfig,
  })
}
