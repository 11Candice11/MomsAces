import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
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
  Home: 'home',
  Move: 'dumbbell',
  Play: 'cards-playing-spade',
  Rewards: 'trophy',
};

const tabLabels: Record<keyof TabParamList, string> = {
  Home: strings.tabs.home,
  Move: strings.tabs.move,
  Play: strings.tabs.play,
  Rewards: strings.tabs.rewards,
};

export function TabNavigator() {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        // Labels are always shown under the icons.
        tabBarShowLabel: true,
        tabBarLabelPosition: 'below-icon',
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
        // No side padding, so "Rewards" fits at 20sp on a 360dp-wide phone.
        tabBarItemStyle: { paddingHorizontal: 0 },
        tabBarIcon: ({ color }) => <Icon name={tabIcons[route.name]} color={color} size={32} />,
        // Our own label: never truncated, 20sp, always shown.
        tabBarLabel: ({ color }) => (
          <Text
            style={{ fontFamily: theme.fonts.bodyBold, fontSize: 20, color, textAlign: 'center' }}
            numberOfLines={1}
            adjustsFontSizeToFit
            minimumFontScale={0.75}
          >
            {tabLabels[route.name]}
          </Text>
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Move" component={MoveScreen} />
      <Tab.Screen name="Play" component={PlayScreen} />
      <Tab.Screen name="Rewards" component={RewardsScreen} />
    </Tab.Navigator>
  );
}
