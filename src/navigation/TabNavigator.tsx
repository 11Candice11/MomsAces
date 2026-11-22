import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components';
import { HomeScreen } from '@/screens/HomeScreen';
import { MoveScreen } from '@/screens/MoveScreen';
import { PlayScreen } from '@/screens/PlayScreen';
import { RewardsScreen } from '@/screens/RewardsScreen';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const tabIcons: Record<keyof TabParamList, IconName> = {
  Home: 'home-outline',
  Move: 'run',
  Play: 'cards-playing-outline',
  Rewards: 'trophy-outline',
};

export function TabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: theme.colors.goldHighlight,
        tabBarInactiveTintColor: theme.colors.disabled,
        tabBarStyle: {
          backgroundColor: theme.colors.velvetRaised,
          borderTopColor: theme.colors.purple,
          height: theme.touch.min + theme.spacing.sm + insets.bottom,
          paddingTop: theme.spacing.sm,
          paddingBottom: insets.bottom + theme.spacing.xs,
        },
        // Tab labels stay at the 20sp minimum. Text-scale behaviour is checked in the audit (15.1).
        tabBarLabelStyle: { fontFamily: theme.fonts.bodyBold, fontSize: 20 },
        tabBarIcon: ({ color }) => <Icon name={tabIcons[route.name]} color={color} size={32} />,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: strings.tabs.home }} />
      <Tab.Screen name="Move" component={MoveScreen} options={{ tabBarLabel: strings.tabs.move }} />
      <Tab.Screen name="Play" component={PlayScreen} options={{ tabBarLabel: strings.tabs.play }} />
      <Tab.Screen
        name="Rewards"
        component={RewardsScreen}
        options={{ tabBarLabel: strings.tabs.rewards }}
      />
    </Tab.Navigator>
  );
}
