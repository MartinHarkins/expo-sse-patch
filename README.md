# Offer some patches for fixing SSE for expo

Related:
- https://github.com/facebook/react-native/issues/28835 => With React-Native, SSE aka EventSource does not receive Events on Android#28835
- https://github.com/facebook/react-native/issues/27741 => fetch implementation does not support streams from the spec - needs implementation in React Native core#27741

Plugin that patches the problem: [./plugins/withEventSourceFixes.ts](./plugins/withEventSourceFixes.ts)
> Using expo plugins: https://docs.expo.dev/config-plugins/plugins-and-mods/

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
npm run android:nofix

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

# run without the fix
npm run android:nofix

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

### 4. release build
```
# cleanup
rm -r android node_modules

npm install

# run with or without the fix
npm run android:nofix -- --variant release --no-build-cache
# or
npm run android -- --variant release --no-build-cache

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

### npx expo-env-info:
```
  expo-env-info 1.2.0 environment info:
    System:
      OS: Linux 6.5 Ubuntu 22.04.4 LTS 22.04.4 LTS (Jammy Jellyfish)
      Shell: 5.8.1 - /bin/zsh
    Binaries:
      Node: 20.10.0 - ~/.nvm/versions/node/v20.10.0/bin/node
      npm: 10.5.0 - ~/.nvm/versions/node/v20.10.0/bin/npm
    npmPackages:
      expo: ~50.0.11 => 50.0.11 
      react: 18.2.0 => 18.2.0 
      react-dom: 18.2.0 => 18.2.0 
      react-native: 0.73.4 => 0.73.4 
      react-native-web: ~0.19.6 => 0.19.10 
    npmGlobalPackages:
      eas-cli: 7.2.0
    Expo Workflow: bare
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
✔ Check that native modules do not use incompatible support packages
✔ Check for legacy global CLI installed locally
✔ Check that native modules use compatible support package versions for installed Expo SDK
✔ Check that packages match versions required by installed Expo SDK

Didn't find any issues with the project!
```