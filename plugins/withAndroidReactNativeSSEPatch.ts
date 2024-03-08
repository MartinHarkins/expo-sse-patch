import { withMainApplication } from '@expo/config-plugins'
import { ExpoConfig } from '@expo/config-types'

const PATCH_TAG = '[SSE_PATCH]'

// related to https://github.com/facebook/react-native/issues/28835 => With React-Native, SSE aka EventSource does not receive Events on Android#28835
export function withAndroidReactNativeSSEPatch(config: ExpoConfig) {
  return withMainApplication(config, (config) => {
    if (config.modResults.language !== 'kt') {
      throw new Error(
        'SSE_PATCH_ERR: this plugin can only fix Event Source (mercure connexion) for Kotlin based MainApplication.kt',
      )
    }
    config.modResults.contents = commentOutFlipper(config.modResults.contents)

    return config
  })
}

export function commentOutFlipper(mainApplication: string) {
  if (mainApplication.match(/\s+ReactNativeFlipper.initializeFlipper\(/m) === null) {
    // Early return if `ReactNativeFlipper.initializeFlipper` is not there.
    return mainApplication
  }

  const hasPatch = mainApplication.indexOf(PATCH_TAG) >= 0
  if (hasPatch) {
    return mainApplication
  }

  // console.log('main app', mainApplication)

  const initFlipperStr = 'ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)'

  const start = mainApplication.indexOf(initFlipperStr)
  if (start < 0) {
    throw new Error(
      'SSE_PATCH_ERR: Could not find "ReactNativeFlipper.initializeFlipper(this, reactNativeHost.reactInstanceManager)"',
    )
  }
  return mainApplication.replace(
    initFlipperStr,
    `// ${PATCH_TAG}: disable flipper in order for event streams to get through
      // ${initFlipperStr}`,
  )
}
