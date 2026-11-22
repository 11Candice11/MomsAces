import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { strings } from '@/strings';
import { ThemeProvider, useAppFonts, useTheme } from '@/theme';

// Keep the splash screen up until the bundled fonts are ready, so text never flashes in a fallback font.
void SplashScreen.preventAutoHideAsync();

// Temporary screen: shows the theme working. Replaced by the navigation shell in task 1.7.
function ThemePreview() {
  const theme = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.velvet }]}>
      <Text style={theme.text.hero}>{strings.common.appName}</Text>
      <Text style={theme.text.body}>{strings.common.tagline}</Text>
    </View>
  );
}

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
    <ThemeProvider>
      <ThemePreview />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
});
