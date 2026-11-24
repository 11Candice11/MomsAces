# GitHub Actions Workflows

## build.yml

Builds a release APK on every push to main/master and on pull requests.

### What it does

1. Checks out the code
2. Sets up Node.js and Java
3. Installs dependencies
4. Runs typecheck, lint, and tests
5. Runs the copy check (no "streak" in copy)
6. Generates the `android/` directory via `expo prebuild`
7. Builds the release APK
8. Uploads the APK as a build artifact (available for 30 days)
9. If you push a git tag, it also attaches the APK to the GitHub release

### The APK will be unsigned

The workflow builds `app-release-unsigned.apk`. To install it on a device, you need to sign it.

#### Option 1: Sign locally after download

Download the artifact from the GitHub Actions run, then sign it with your release keystore:

```bash
# Align the APK
zipalign -v -p 4 app-release-unsigned.apk app-release-unsigned-aligned.apk

# Sign it
apksigner sign --ks ~/Keys/momsaces/release.keystore \
  --ks-key-alias momsaces \
  --out app-release-signed.apk \
  app-release-unsigned-aligned.apk

# Verify the signature
apksigner verify app-release-signed.apk
```

#### Option 2: Add signing secrets to GitHub (for automatic signing)

If you want GitHub to build a signed APK automatically, you need to:

1. **Encode your keystore as base64:**
   ```bash
   base64 -i ~/Keys/momsaces/release.keystore | pbcopy
   ```

2. **Add these secrets to your GitHub repository** (Settings → Secrets and variables → Actions → New repository secret):
   - `RELEASE_KEYSTORE_BASE64` - the base64-encoded keystore (paste from clipboard)
   - `RELEASE_KEYSTORE_PASSWORD` - your keystore password
   - `RELEASE_KEY_ALIAS` - `momsaces`
   - `RELEASE_KEY_PASSWORD` - your key password

3. **Uncomment the signing step** in `build.yml` (see the commented section in that file)

**Security note:** Only add keystore secrets if this is a private repository. Never commit the keystore file itself to git.

### Manual trigger

You can manually trigger a build from the Actions tab → Build APK → Run workflow.

### Artifacts

After a successful build, download the APK from the workflow run:
1. Go to Actions tab
2. Click on the workflow run
3. Scroll to "Artifacts" at the bottom
4. Download "app-release"

### Tags and releases

To create a release with the APK attached:

```bash
git tag v1.0.0
git push origin v1.0.0
```

The workflow will automatically create a GitHub release and attach the APK.
