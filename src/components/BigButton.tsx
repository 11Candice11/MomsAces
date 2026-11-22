import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';

export type BigButtonVariant = 'primary' | 'secondary' | 'burgundy';

interface BigButtonProps {
  label: string;
  onPress: () => void;
  /** primary: the one main action (88dp, gold). secondary: smaller (72dp). burgundy: a card action. */
  variant?: BigButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  accessibilityHint?: string;
  style?: StyleProp<ViewStyle>;
}

export function BigButton({
  label,
  onPress,
  variant = 'primary',
  icon,
  disabled = false,
  accessibilityHint,
  style,
}: BigButtonProps) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  const background = disabled
    ? theme.colors.disabled
    : variant === 'primary'
      ? theme.colors.gold
      : variant === 'burgundy'
        ? theme.colors.burgundy
        : theme.colors.velvetRaised;
  const textColor = disabled || isPrimary ? theme.colors.text : theme.colors.textOnDark;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      android_ripple={{ color: theme.colors.shadow }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: isPrimary ? theme.touch.primary : theme.touch.min,
          backgroundColor: background,
          borderColor: isPrimary ? theme.colors.goldHighlight : theme.colors.gold,
          borderRadius: theme.radii.lg,
          paddingHorizontal: theme.spacing.lg,
          opacity: pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      <View style={styles.row}>
        {icon ? <Icon name={icon} color={textColor} size={theme.fontSizes.button} /> : null}
        <Text style={[theme.text.button, { color: textColor }]}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
