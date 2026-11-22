/**
 * Mom's Aces makes no network calls (requirement G1), so the release app must not declare the
 * INTERNET permission. A development build still needs it to talk to the Metro bundler.
 *
 * app.json blocks INTERNET in the main manifest (so it is absent from release builds). This plugin
 * adds INTERNET to the debug-only manifest (android/app/src/debug/AndroidManifest.xml), which is
 * merged into debug builds only.
 */
const { withDangerousMod } = require('expo/config-plugins');
const fs = require('fs');
const path = require('path');

const INTERNET = '<uses-permission android:name="android.permission.INTERNET"/>';
const ACCESS_NETWORK_STATE =
  '<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>';

module.exports = function withDebugOnlyInternet(config) {
  return withDangerousMod(config, [
    'android',
    async (modConfig) => {
      const file = path.join(
        modConfig.modRequest.platformProjectRoot,
        'app',
        'src',
        'debug',
        'AndroidManifest.xml',
      );
      let xml = fs.readFileSync(file, 'utf8');
      for (const line of [INTERNET, ACCESS_NETWORK_STATE]) {
        if (!xml.includes(line)) {
          xml = xml.replace(/(<manifest[^>]*>)/, `$1\n    ${line}`);
        }
      }
      fs.writeFileSync(file, xml);
      return modConfig;
    },
  ]);
};
