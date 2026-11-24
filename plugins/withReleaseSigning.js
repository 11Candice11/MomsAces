/**
 * Release signing plugin for Mom's Aces.
 *
 * Reads signing configuration from gradle.properties (either ~/.gradle/gradle.properties
 * or environment variables) so the keystore is never committed to git.
 *
 * Required properties (set in ~/.gradle/gradle.properties or as environment variables):
 *   MOMSACES_RELEASE_STORE_FILE     - Path to keystore file (e.g., /Users/you/Keys/momsaces/release.keystore)
 *   MOMSACES_RELEASE_KEY_ALIAS      - Key alias (e.g., momsaces)
 *   MOMSACES_RELEASE_STORE_PASSWORD - Keystore password
 *   MOMSACES_RELEASE_KEY_PASSWORD   - Key password
 *
 * See docs/release-signing.md for setup instructions.
 */
const { withGradleProperties } = require('expo/config-plugins');

module.exports = function withReleaseSigning(config) {
  return withGradleProperties(config, (modConfig) => {
    // This plugin doesn't modify gradle.properties directly.
    // It documents the expected properties that should exist in ~/.gradle/gradle.properties
    // The android/app/build.gradle reads them automatically.
    return modConfig;
  });
};
