import { Pressable, StyleSheet, Text } from 'react-native';

import { useTheme } from '@/theme';

import { Icon, type IconName } from './Icon';

interface IconButtonProps {
  icon: IconName;
  /** Short text label. An icon is never shown without one. */
  label: string;
  onPress: () => void;
}

/** A compact, labelled button (for example Settings or Help in the top bar). 72dp minimum height. */
export function IconButton({ icon, label, onPress }: IconButtonProps) {
  const theme = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      android_ripple={{ color: theme.colors.shadow }}
      style={({ pressed }) => [
        styles.base,
        {
          minHeight: theme.touch.min,
          minWidth: theme.touch.min,
          backgroundColor: theme.colors.velvetRaised,
          borderColor: theme.colors.gold,
          borderRadius: theme.radii.pill,
          paddingHorizontal: theme.spacing.md,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <Icon name={icon} color={theme.colors.goldHighlight} size={theme.fontSizes.body + 4} />
      <Text style={theme.text.bodyBold}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
  },
});
