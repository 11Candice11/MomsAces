# Deployment Guide

## GitHub Actions Automatic Build

Every push to `main` or `master` automatically triggers a build that:
1. Runs tests, typecheck, and lint
2. Generates the android directory via expo prebuild
3. Builds a release APK
4. Uploads it as a build artifact

### Downloading the APK

1. Go to the **Actions** tab in GitHub
2. Click on the latest successful workflow run
3. Scroll to **Artifacts** at the bottom
4. Download `app-release-unsigned` (or `app-release-signed` if you've configured signing secrets)

### Installing on Device

**If unsigned:**
You need to sign it locally first (see `docs/release-signing.md`), then:

```bash
adb install -r app-release.apk
```

**If signed:**
The APK from the `app-release-signed` artifact can be installed directly:

```bash
adb install -r app-release.apk
```

## Creating a GitHub Release

To create a versioned release with the APK attached:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow will automatically create a GitHub release and attach the APK. You (or your mom's helper) can then download it directly from the Releases page.

## Local Release Build

If you want to build locally instead of using GitHub Actions:

```bash
# Make sure signing is configured (see docs/release-signing.md)
cd android
./gradlew assembleRelease

# The APK will be at:
# android/app/build/outputs/apk/release/app-release.apk
```

## First-Time Device Setup

For installing on your mom's device the first time:

1. **Enable USB debugging on the phone:**
   - Settings → About Phone → Tap "Build number" 7 times
   - Settings → Developer options → Enable "USB debugging"

2. **Connect the phone via USB**

3. **Install the APK:**
   ```bash
   adb install -r app-release.apk
   ```

4. **Grant permissions:**
   The app needs:
   - POST_NOTIFICATIONS (notifications)
   - SCHEDULE_EXACT_ALARM (for precise reminder times)
   
   The notification permission will be requested at runtime. For exact alarms:
   ```bash
   adb shell appops set com.candice.momspace SCHEDULE_EXACT_ALARM allow
   ```
   
   Or grant it manually: Settings → Apps → Mom's Aces → Set alarms and reminders → Allow

## Updating the App

Since the app keeps the same package name (`com.candice.momspace`) and signing key, updates are installed over the existing app:

```bash
adb install -r app-release.apk
```

All data (progress, settings, unlocked items) is preserved.

## No OTA Updates

This app does not use Expo's OTA update system. Every update requires installing a new APK.
