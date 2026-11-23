import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from '@/navigation';
import { useSettingsStore, useStoresHydrated } from '@/store';
import { ThemeProvider, useAppFonts } from '@/theme';

// Keep the splash screen up until fonts and saved data are ready, so nothing flashes.
void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();
  const hydrated = useStoresHydrated();
  const textScale = useSettingsStore((s) => s.textScale);
  const calmMode = useSettingsStore((s) => s.calmMode);
  // If the fonts fail to load, carry on with the system font rather than showing nothing.
  const ready = (fontsLoaded || fontError !== null) && hydrated;

  useEffect(() => {
    if (ready) void SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <ThemeProvider textScale={textScale} calmMode={calmMode}>
        <RootNavigator />
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
