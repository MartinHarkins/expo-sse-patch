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
 * Essentially applies in {projectRoot}/node_modules/expo-modules-core/android/src/main/java/expo/modules/kotlin/devtools/ExpoRequestCdpInterceptor.kt
 * ```diff
 * - if (response.peekBody(ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE + 1).contentLength() <= ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE) {
 * + if (response.body?.contentType()?.type == "text" && response.body?.contentType()?.subtype == "event-stream") {
 * +      // do nothing for now
 * + } else if (response.peekBody(ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE + 1).contentLength() <= ExpoNetworkInspectOkHttpNetworkInterceptor.MAX_BODY_SIZE) {
 *      val params2 = ExpoReceivedResponseBodyParams(now, requestId, request, response)
 *      dispatchEvent(Event("Expo(Network.receivedResponseBody)", params2))
 *   }
 * ```
 *
 * @param config
 */
export function withAndroidExpoSSEPatch(config: ExpoConfig) {
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

      const hasPatch = interceptor.contents.indexOf(PATCH_TAG) >= 0
      if (hasPatch) {
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
