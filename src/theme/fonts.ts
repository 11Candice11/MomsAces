// Deep imports so Metro bundles only the three font files we use (not every weight).
import { Nunito_600SemiBold } from '@expo-google-fonts/nunito/600SemiBold';
import { Nunito_700Bold } from '@expo-google-fonts/nunito/700Bold';
import { PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display/700Bold';

/** Font files bundled in the app (no network at runtime). Keys match `fonts` in typography.ts. */
export const fontAssets = {
  PlayfairDisplay_700Bold,
  Nunito_600SemiBold,
  Nunito_700Bold,
};
