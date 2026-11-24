# Build Commands Quick Reference

## Development

```bash
# Start Metro bundler with dev client
npm start

# Build and run on connected Android device (debug build with Metro)
npm run android

# Build and run release variant locally (still needs Metro)
npm run android:release
```

## Release APK (No Metro)

### Local build

```bash
# Build the release APK (no Metro needed after this)
npm run build:apk

# Output: android/app/build/outputs/apk/release/app-release.apk
```

### Install on device

```bash
# Install (or update) on connected device
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

### From GitHub Actions

1. Push to main/master (or manually trigger from Actions tab)
2. Wait for build to complete
3. Download artifact from Actions → Workflow run → Artifacts
4. Extract and install the APK

## Signing Setup

**First time only:** See `docs/release-signing.md` for keystore creation and configuration.

Once configured, `npm run build:apk` will produce a signed APK that can be installed on any device.

## Checks before building

```bash
npm run typecheck  # TypeScript validation
npm run lint       # ESLint
npm test           # Jest tests
```

The GitHub Actions workflow runs all of these automatically.
