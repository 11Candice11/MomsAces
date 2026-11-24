# Release Signing

Mom's Aces uses release signing to create APKs that can be installed on the target device. The signing configuration is read from `~/.gradle/gradle.properties` or environment variables, so the keystore and passwords are never committed to git.

## Setup (Local Development)

### 1. Create a keystore (first time only)

If you haven't created a release keystore yet:

```bash
mkdir -p ~/Keys/momsaces
cd ~/Keys/momsaces

keytool -genkeypair -v \
  -storetype PKCS12 \
  -keystore release.keystore \
  -alias momsaces \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

You'll be prompted for:
- Keystore password (choose a strong password)
- Key password (can be the same as keystore password)
- Your name, organization, etc.

**Important:** Back up `~/Keys/momsaces/release.keystore` to a secure location. If you lose it, you cannot update the app on devices that have it installed.

### 2. Configure gradle.properties

Add these lines to `~/.gradle/gradle.properties` (create the file if it doesn't exist):

```properties
MOMSACES_RELEASE_STORE_FILE=/Users/YOUR_USERNAME/Keys/momsaces/release.keystore
MOMSACES_RELEASE_KEY_ALIAS=momsaces
MOMSACES_RELEASE_STORE_PASSWORD=your_keystore_password
MOMSACES_RELEASE_KEY_PASSWORD=your_key_password
```

Replace `YOUR_USERNAME` and the passwords with your actual values.

**Security:** `~/.gradle/gradle.properties` is not part of the repository and should never be committed to git.

### 3. Build a signed release APK

```bash
npm run android -- --variant release
```

Or directly with Gradle:

```bash
cd android
./gradlew assembleRelease
```

The signed APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
```

## Setup (GitHub Actions CI)

To enable automatic signing on GitHub Actions, see `.github/workflows/README.md`.

## Verifying the signature

```bash
apksigner verify --print-certs android/app/build/outputs/apk/release/app-release.apk
```

## Installing a release APK

```bash
adb install -r android/app/build/outputs/apk/release/app-release.apk
```

The `-r` flag allows reinstalling while keeping data (same as updating the app).

## Troubleshooting

### "Keystore file not found"

Make sure the `MOMSACES_RELEASE_STORE_FILE` path in `~/.gradle/gradle.properties` is absolute and correct.

### "Cannot recover key"

The key password might be wrong. Check `MOMSACES_RELEASE_KEY_PASSWORD` in your gradle.properties.

### Build succeeds but APK is unsigned

The Gradle build script should read the signing config from gradle.properties. If the properties are missing or incorrect, the build falls back to creating `app-release-unsigned.apk`.

Check that:
1. `~/.gradle/gradle.properties` exists and has the four required properties
2. The keystore file exists at the path you specified
3. The passwords are correct
