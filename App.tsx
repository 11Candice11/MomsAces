import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StorageGateBanner } from '@/debug/StorageGateBanner';

import { RootNavigator } from '@/navigation';
import { colors, ThemeProvider, useAppFonts } from '@/theme';

// Keep the splash screen up until the bundled fonts are ready, so text never flashes in a fallback font.
void SplashScreen.preventAutoHideAsync();

export default function App() {
  const [fontsLoaded, fontError] = useAppFonts();

  useEffect(() => {
    if (fontsLoaded || fontError) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  // If the fonts fail to load, carry on with the system font rather than showing nothing.
  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        {/* TEMPORARY task 1.9 gate, debug builds only. Remove in task 2.1. */}
        {__DEV__ ? (
          <SafeAreaView edges={['top']} style={{ backgroundColor: colors.gold }}>
            <StorageGateBanner />
          </SafeAreaView>
        ) : null}
        <RootNavigator />
        <StatusBar style="light" />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
