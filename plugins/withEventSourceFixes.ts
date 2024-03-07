import { withMainApplication, withPlugins, withDangerousMod } from '@expo/config-plugins'
import { ExpoConfig } from '@expo/config-types'
import assert from 'assert'
import fs from 'fs'
import path from 'path'

import { directoryExistsAsync, getFileInfo, replaceContentsWithOffset } from './utils'

const PATCH_TAG = '[SSE_PATCH]'

export function withAndroidEventSourceFixes(config: ExpoConfig) {
  return withPlugins(config, [withAndroidFlipperDelete, withAndroidCdpInterceptorFix])
}

// related to https://github.com/facebook/react-native/issues/28835 => With React-Native, SSE aka EventSource does not receive Events on Android#28835
export function withAndroidFlipperDelete(config: ExpoConfig) {
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

export function withAndroidCdpInterceptorFix(config: ExpoConfig) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      // {projectRoot}/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/devtools/ExpoRequestCdpInterceptor.kt
      const projectRoot = config.modRequest.projectRoot
      const expoModuleCorePath = path.join(projectRoot, 'node_modules', 'expo-modules-core')
      const expoModuleCoreExists = await directoryExistsAsync(expoModuleCorePath)
      if (!expoModuleCoreExists) {
        // skip if dir doesn't exist
        return config
      }

      const interceptorPath = path.join(
        expoModuleCorePath,
        'android/src/main/java/expo/modules/kotlin/devtools/ExpoRequestCdpInterceptor.kt',
      )
      assert(
        interceptorPath,
        `SSE_PATCH_ERR: ExpoRequestCdpInterceptor not found at android/src/main/java/expo/modules/kotlin/devtools/ExpoRequestCdpInterceptor.kt`,
      )
      const interceptor = getFileInfo(interceptorPath)

      const hasConexPatch = interceptor.contents.indexOf(PATCH_TAG) >= 0
      if (hasConexPatch) {
        return config
      }

      const breakStr =
        'if (response.peekBody(ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE + 1).contentLength() <= ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE) {'
      const start = interceptor.contents.indexOf(breakStr)
      if (start < 0) {
        throw new Error('SSE_PATCH_ERR: Could not find interceptor break condition')
      }

      interceptor.contents = replaceContentsWithOffset(
        interceptor.contents,
        `
    // ${PATCH_TAG}: Ignore text/event-stream types of responses
    // response.peekBody breaks for streams.
    if (response.body?.contentType()?.type == "text" && response.body?.contentType()?.subtype == "event-stream") {
      // do nothing for now
    } else if (response.peekBody(ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE + 1).contentLength() <= ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE) {
`,
        start,
        start + breakStr.length,
      )

      // console.log('interceptorContents', interceptor.contents)

      fs.writeFileSync(interceptor.path, interceptor.contents)
      return config
    },
  ])
}

export function commentOutFlipper(mainApplication: string) {
  if (mainApplication.match(/\s+ReactNativeFlipper.initializeFlipper\(/m) === null) {
    // Early return if `ReactNativeFlipper.initializeFlipper` is not there.
    return mainApplication
  }

  const hasConexPatch = mainApplication.indexOf(PATCH_TAG) >= 0
  if (hasConexPatch) {
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
