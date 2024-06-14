import { withDangerousMod } from '@expo/config-plugins'
import { ExpoConfig } from '@expo/config-types'
import assert from 'assert'
import fs from 'fs'
import path from 'path'

import { directoryExistsAsync, getFileInfo, replaceContentsWithOffset } from './utils'

const PATCH_TAG = '[SSE_PATCH]'

/**
 * Prevents expo's CdpInterceptor from breaking on streams
 *
 * Essentially applies in {projectRoot}/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/devtools/ExpoNetworkInspectOkHttpInterceptors.kt
 * ```diff
 * - if (peeked.request(byteCount + 1)) {
 * + if (body.contentType()?.type == "text" && body.contentType()?.subtype == "event-stream" || peeked.request(byteCount + 1)) {
 *   // When the request() returns true,
 *   // it means the source have more available bytes then [byteCount].
 *   return null
 * }
 * ```
 *
 * @param config
 */
export function withAndroidExpoSSEPatch(config: ExpoConfig) {
  return withDangerousMod(config, [
    'android',
    async (config) => {
      // {projectRoot}/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/devtools/ExpoNetworkInspectOkHttpInterceptors.kt
      const projectRoot = config.modRequest.projectRoot
      const expoModuleCorePath = path.join(projectRoot, 'node_modules', 'expo-modules-core')
      const expoModuleCoreExists = await directoryExistsAsync(expoModuleCorePath)
      if (!expoModuleCoreExists) {
        // skip if dir doesn't exist
        return config
      }

      const interceptorPath = path.join(
        expoModuleCorePath,
        'android/src/main/java/expo/modules/kotlin/devtools/ExpoNetworkInspectOkHttpInterceptors.kt',
      )
      assert(
        interceptorPath,
        `SSE_PATCH_ERR: ExpoNetworkInspectOkHttpInterceptors not found at android/src/main/java/expo/modules/kotlin/devtools/ExpoNetworkInspectOkHttpInterceptors.kt`,
      )
      const interceptor = getFileInfo(interceptorPath)

      const hasPatch = interceptor.contents.indexOf(PATCH_TAG) >= 0
      if (hasPatch) {
        return config
      }

      const breakStr = 'if (peeked.request(byteCount + 1)) {'
      const start = interceptor.contents.indexOf(breakStr)
      if (start < 0) {
        throw new Error('SSE_PATCH_ERR: Could not find interceptor break condition')
      }

      interceptor.contents = replaceContentsWithOffset(
        interceptor.contents,
        `
    // ${PATCH_TAG}: Ignore text/event-stream types of responses
    // peeked.request(byteCount + 1) breaks for streams.
    if (body.contentType()?.type == "text" && body.contentType()?.subtype == "event-stream" || peeked.request(byteCount + 1)) {`,
        start,
        start + breakStr.length,
      )

      // console.log('interceptorContents', interceptor.contents)

      fs.writeFileSync(interceptor.path, interceptor.contents)
      return config
    },
  ])
}
