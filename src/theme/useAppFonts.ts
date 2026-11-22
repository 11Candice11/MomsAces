import { useFonts } from 'expo-font';

import { fontAssets } from './fonts';

/** Loads the bundled fonts. Returns [loaded, error]. */
export function useAppFonts() {
  return useFonts(fontAssets);
}
