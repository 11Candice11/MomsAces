import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { RootStackParamList } from '@/navigation/types';
import { strings } from '@/strings';
import { useTheme } from '@/theme';

import { BigButton } from './BigButton';
import type { IconName } from './Icon';
import { HelpButton } from './HelpButton';
import { IconButton } from './IconButton';

export interface FrameAction {
  label: string;
  onPress: () => void;
  icon?: IconName;
  disabled?: boolean;
}

interface ScreenFrameProps {
  title: string;
  children: ReactNode;
  /** The one main action. Always sits in the same place: bottom of the screen, weighted right. */
  primaryAction?: FrameAction;
  /** A smaller action to the left of the primary one (for example "Later"). */
  secondaryAction?: FrameAction;
  /** Show a labelled "Back" button (stack screens). */
  showBack?: boolean;
  /** Show a labelled "Settings" button in the top bar. */
  showSettings?: boolean;
  /** The "Help" button is on every screen except the guide itself. */
  showHelp?: boolean;
}

export function ScreenFrame({
  title,
  children,
  primaryAction,
  secondaryAction,
  showBack = false,
  showSettings = false,
  showHelp = true,
}: ScreenFrameProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View
      style={[
        styles.root,
        { backgroundColor: theme.colors.velvet, paddingTop: insets.top + theme.spacing.sm },
      ]}
    >
      <View style={[styles.topBar, { paddingHorizontal: theme.spacing.md, gap: theme.spacing.sm }]}>
        {showBack ? (
          <IconButton
            icon="arrow-left"
            label={strings.common.back}
            onPress={() => navigation.goBack()}
          />
        ) : null}
        {showBack ? (
          <View style={styles.title} />
        ) : (
          <Text accessibilityRole="header" style={[theme.text.title, styles.title]}>
            {title}
          </Text>
        )}
        {/* Settings and Help stay together, at the right, even when the bar wraps. */}
        <View style={[styles.topActions, { gap: theme.spacing.sm }]}>
          {showSettings ? (
            <IconButton
              icon="cog-outline"
              label={strings.common.settings}
              onPress={() => navigation.navigate('Settings')}
            />
          ) : null}
          {showHelp ? <HelpButton /> : null}
        </View>
      </View>

      {showBack ? (
        // Stack screens: the title gets the full width under the buttons, so it never breaks mid-word.
        <Text
          accessibilityRole="header"
          style={[
            theme.text.title,
            { paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm },
          ]}
        >
          {title}
        </Text>
      ) : null}
      <View style={[styles.content, { padding: theme.spacing.md }]}>{children}</View>

      {primaryAction ? (
        <View
          style={[
            styles.actions,
            {
              paddingHorizontal: theme.spacing.md,
              paddingBottom: theme.spacing.md,
              gap: theme.touch.gap,
            },
          ]}
        >
          {secondaryAction ? (
            <BigButton
              variant="secondary"
              label={secondaryAction.label}
              icon={secondaryAction.icon}
              disabled={secondaryAction.disabled}
              onPress={secondaryAction.onPress}
              style={styles.secondary}
            />
          ) : null}
          <BigButton
            variant="primary"
            label={primaryAction.label}
            icon={primaryAction.icon}
            disabled={primaryAction.disabled}
            onPress={primaryAction.onPress}
            style={styles.primary}
          />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  topBar: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  title: { flexGrow: 1, flexShrink: 0 },
  topActions: { flexDirection: 'row', marginLeft: 'auto' },
  content: { flex: 1 },
  actions: { flexDirection: 'row', alignItems: 'stretch' },
  secondary: { flex: 1 },
  primary: { flex: 2 },
});
