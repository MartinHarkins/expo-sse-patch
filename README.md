# Offer some patches for fixing SSE for expo SDK 51

> Issue is **FIXED for expo SDK 52**  [expo-52](https://github.com/MartinHarkins/expo-sse-patch/tree/expo-52)
> For expo **SDK 50**, find the reproduction & resolution in branch [expo-50](https://github.com/MartinHarkins/expo-sse-patch/tree/expo-50)

> Thanks for **@etler**'s work for the SDK 51 patch: https://github.com/etler/expo-sse-patch/tree/expo-51-fix
> His detailed investigation:
> - https://github.com/expo/expo/issues/27526#issuecomment-2148457485
> - https://github.com/expo/expo/issues/27526#issuecomment-2148893292
> 
> Essentially the problem was moved and only shows up in dev builds through `eas build`, which requires the `expo-dev-client`.
> 
> I picked his ./plugins/withAndroidExpoSSEPatch.ts and just restricted the `if` condition a bit
> 
> ```diff
> - if (true) {
> + if (body.contentType()?.type == "text" && body.contentType()?.subtype == "event-stream" || peeked.request(byteCount + 1)) {
> ```

- [expo-env-info](#npx-expo-env-info) (anchor)
- [expo doctor](#npx-expo-doctorlatest) (anchor)

Related:
- Expo Issue: https://github.com/expo/expo/issues/27526
- event-source-polyfill PR: https://github.com/Yaffle/EventSource/pull/228

Plugins that patch the problems: 
- [./plugins/withAndroidExpoSSEPatch.ts](./plugins/withAndroidExpoSSEPatch.ts)
> How to use expo plugins: https://docs.expo.dev/config-plugins/plugins-and-mods/

Essentially, the plugin patch consists in:
- checking for content type `text/event-stream` in https://github.com/expo/expo/blob/5bd5d1695f932b8448950bb5d927a06bca27547c/packages/expo-modules-core/android/src/main/java/expo/modules/kotlin/devtools/ExpoRequestCdpInterceptor.kt#L57

### Side note about event-source-polyfill
Had to patch package `event-source-polyfill` as, while in release variant, it crashes the application when there is a connexion error. More there: https://github.com/Yaffle/EventSource/pull/228#issuecomment-1986087336  
That is a side issue and doesn't remove the fact that expo and react-native are not letting the sse streams through.

## Reproducing the problem
### 1. Run server
```
# runs npm install within server-sse/
npm run server:setup

# runs local express server on port 3000 or PORT env
npm run server:start
```

### 2. Run app WITHOUT the fix
```
# cleanup
rm -r android node_modules

npm install

# run without the fix
SSE_NO_FIX=true eas build --platform android --profile development --local
# you will be prompted to create an eas project and add the projectId to app.config.ts
 
# once the app is started
adb reverse tcp:3000 tcp:3000 
```

In app:
1. Press Open Connexion => should do nothing

### 3. Run app WITH the fix
```
# cleanup
rm -r android node_modules

npm install

# run with the fix
eas build --platform android --profile development --local
# you will be prompted to create an eas project and add the projectId to app.config.ts

# once the app is started
adb reverse tcp:3000 tcp:3000 
```

In app:
1. Press Open Connexion => should print
   > [type: open]  
   > [type: message  
   >  data: {"num": 1}]  
   > [type: message  
   >  data: {"num": 2}]  
   > etc.

## Appendix
### npx expo-env-info:
```
    expo-env-info 1.2.0 environment info:
    System:
      OS: Linux 6.5 Ubuntu 22.04.4 LTS 22.04.4 LTS (Jammy Jellyfish)
      Shell: 5.8.1 - /bin/zsh
    Binaries:
      Node: 20.13.1 - ~/.nvm/versions/node/v20.13.1/bin/node
      npm: 10.8.1 - ~/.nvm/versions/node/v20.13.1/bin/npm
    SDKs:
      Android SDK:
        API Levels: 34
        Build Tools: 33.0.1, 34.0.0
        System Images: android-34 | Google APIs Intel x86_64 Atom, android-34 | Google Play Intel x86_64 Atom
    npmPackages:
      expo: ^51.0 => 51.0.14 
      react: 18.2.0 => 18.2.0 
      react-dom: 18.2.0 => 18.2.0 
      react-native: 0.74.2 => 0.74.2 
      react-native-web: ~0.19.6 => 0.19.10 
    npmGlobalPackages:
      eas-cli: 10.0.0
    Expo Workflow: managed
```

### npx expo-doctor@latest

```
✔ Check Expo config for common issues
✔ Check package.json for common issues
✔ Check native tooling versions
✔ Check dependencies for packages that should not be installed directly
✔ Check for common project setup issues
✔ Check npm/ yarn versions
✔ Check for issues with metro config
✔ Check Expo config (app.json/ app.config.js) schema
✔ Check for legacy global CLI installed locally
✔ Check that native modules do not use incompatible support packages
✔ Check that native modules use compatible support package versions for installed Expo SDK
✔ Check that packages match versions required by installed Expo SDK

Didn't find any issues with the project!
```
