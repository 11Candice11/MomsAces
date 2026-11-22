import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { BatteryGuideScreen } from '@/screens/BatteryGuideScreen';
import { ExerciseSessionScreen } from '@/screens/ExerciseSessionScreen';
import { GuideScreen } from '@/screens/GuideScreen';
import { PathScreen } from '@/screens/PathScreen';
import { SettingsScreen } from '@/screens/SettingsScreen';
import { SolitaireScreen } from '@/screens/SolitaireScreen';
import { StandWithHelpScreen } from '@/screens/StandWithHelpScreen';
import { WinScreen } from '@/screens/WinScreen';
import { useMotion } from '@/theme';

import { navigationRef } from './navigationRef';
import { navigationTheme } from './navigationTheme';
import { TabNavigator } from './TabNavigator';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const motion = useMotion();
  // Screen transitions follow the motion level: none = instant, calm = fade, full = platform default.
  const animation = motion.level === 'none' ? 'none' : motion.level === 'calm' ? 'fade' : 'default';

  return (
    <NavigationContainer ref={navigationRef} theme={navigationTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation }}>
        <Stack.Screen name="Tabs" component={TabNavigator} />
        <Stack.Screen name="Path" component={PathScreen} />
        <Stack.Screen name="StandWithHelp" component={StandWithHelpScreen} />
        <Stack.Screen name="ExerciseSession" component={ExerciseSessionScreen} />
        <Stack.Screen name="Solitaire" component={SolitaireScreen} />
        <Stack.Screen name="Win" component={WinScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="BatteryGuide" component={BatteryGuideScreen} />
        <Stack.Screen name="Guide" component={GuideScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
