import { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface IconProps {
  name: IconName;
  size?: number;
  color: string;
}

/** The one icon component in the app. Icons are always paired with a short text label. */
export function Icon({ name, size = 32, color }: IconProps) {
  // Decorative: the label next to it carries the meaning for screen readers.
  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={color}
      importantForAccessibility="no"
      accessibilityElementsHidden
    />
  );
}
