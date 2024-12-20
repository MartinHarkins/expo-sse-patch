# Showcase fix of event-source-polyfill. Expo issue is [FIXED](https://github.com/expo/expo/issues/27526).

> For expo **SDK 50**, find the reproduction & resolution in branch [expo-50](https://github.com/MartinHarkins/expo-sse-patch/tree/expo-50)  
> For expo **SDK 51**, find the reproduction & resolution in branch [expo-51](https://github.com/MartinHarkins/expo-sse-patch/tree/expo-51)

Related:
- event-source-polyfill PR: https://github.com/Yaffle/EventSource/pull/228

### About event-source-polyfill
Had to patch package `event-source-polyfill` as, while in release variant, it crashes the application when there is a connexion error. More there: https://github.com/Yaffle/EventSource/pull/228#issuecomment-1986087336  
That is a side issue and doesn't remove the fact that expo and react-native are not letting the sse streams through.

## Run Example
### 1. Run server
```
# runs npm install within server-sse/
npm run server:setup

# runs local express server on port 3000 or PORT env
npm run server:start
```

### 3. Run app
```
# cleanup
rm -r android node_modules

npm install

# build the app
eas build --platform android --profile development --local
# you will be prompted to create an eas project and add the projectId to app.config.ts

# sideload apk to your device / emulator

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
