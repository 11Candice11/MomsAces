import type { ReactNode } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import { useTheme } from '@/theme';

export type PlayingCardFace = 'cream' | 'gold' | 'back';

interface PlayingCardProps {
  width: number;
  face?: PlayingCardFace;
  /** Corner index, for example "A". Shown top-left and bottom-right, both upright. */
  cornerRank?: string;
  /** Corner suit symbol, for example "♠". */
  cornerSuit?: string;
  children?: ReactNode;
  /** Gold border width (the static form of the glow). */
  borderWidth?: number;
  style?: StyleProp<ViewStyle>;
}

const ASPECT = 1.4;

/**
 * A playing card face. Corner indices sit inside a reserved inner padding and do not scale with
 * the text size, so they are never clipped (R18.7). Both indices are upright (design section 25).
 * Decorative by default: the screen gives the card its accessibility label.
 */
export function PlayingCard({
  width,
  face = 'cream',
  cornerRank,
  cornerSuit,
  children,
  borderWidth = 3,
  style,
}: PlayingCardProps) {
  const theme = useTheme();
  const height = Math.round(width * ASPECT);
  const indexSize = Math.max(14, Math.round(width * 0.11));
  const inset = Math.round(indexSize * 0.6);
  const background =
    face === 'gold'
      ? theme.colors.goldHighlight
      : face === 'back'
        ? theme.colors.burgundy
        : theme.colors.cream;
  const ink = face === 'back' ? theme.colors.goldHighlight : theme.colors.burgundy;

  const corner = (position: 'top' | 'bottom') =>
    cornerRank ? (
      <View
        style={[
          styles.corner,
          position === 'top' ? { top: inset, left: inset } : { bottom: inset, right: inset },
        ]}
        importantForAccessibility="no-hide-descendants"
      >
        <Text
          allowFontScaling={false}
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: indexSize * 1.3,
            color: ink,
            lineHeight: indexSize * 1.5,
          }}
        >
          {cornerRank}
        </Text>
        {cornerSuit ? (
          <Text
            allowFontScaling={false}
            style={{ fontSize: indexSize, color: ink, lineHeight: indexSize * 1.2 }}
          >
            {cornerSuit}
          </Text>
        ) : null}
      </View>
    ) : null;

  return (
    <View
      style={[
        styles.card,
        {
          width,
          height,
          backgroundColor: background,
          borderColor: theme.colors.gold,
          borderWidth,
          borderRadius: theme.radii.md,
          // Content stays out of the corner bands (top and bottom), so indices are never covered.
          paddingVertical: inset + indexSize * 2.8,
          paddingHorizontal: inset,
        },
        style,
      ]}
    >
      {face === 'back' ? (
        <View
          style={[
            StyleSheet.absoluteFill,
            styles.backPattern,
            { margin: inset, borderColor: theme.colors.gold, borderRadius: theme.radii.sm },
          ]}
        />
      ) : null}
      {corner('top')}
      <View style={styles.center}>{children}</View>
      {corner('bottom')}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  corner: { position: 'absolute', alignItems: 'center' },
  center: { flex: 1, alignSelf: 'stretch', alignItems: 'center', justifyContent: 'center' },
  backPattern: { borderWidth: 2 },
});
