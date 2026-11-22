import { colors } from './colors';
import { motionTokens } from './motion';
import { radii, spacing } from './spacing';
import { touch } from './touch';
import {
  fontSizes,
  fonts,
  lineHeightRatio,
  textScales,
  type FontSizeName,
  type TextScaleName,
} from './typography';

export interface TextStyleToken {
  fontFamily: string;
  fontSize: number;
  lineHeight: number;
  color: string;
}

export interface Theme {
  colors: typeof colors;
  spacing: typeof spacing;
  radii: typeof radii;
  touch: typeof touch;
  motion: typeof motionTokens;
  fonts: typeof fonts;
  textScale: TextScaleName;
  /** Font sizes with the user's text scale already applied. */
  fontSizes: Record<FontSizeName, number>;
  /** Ready-to-spread text styles with the text scale applied. */
  text: {
    body: TextStyleToken;
    bodyBold: TextStyleToken;
    bodyLarge: TextStyleToken;
    button: TextStyleToken;
    title: TextStyleToken;
    hero: TextStyleToken;
  };
}

function textStyle(fontFamily: string, fontSize: number, color: string): TextStyleToken {
  return { fontFamily, fontSize, lineHeight: Math.round(fontSize * lineHeightRatio), color };
}

/** Pure: builds the theme for a text size. No React here, so it can be reused or tested. */
export function createTheme(textScale: TextScaleName = 'normal'): Theme {
  const factor = textScales[textScale];
  const sizes = Object.fromEntries(
    Object.entries(fontSizes).map(([name, size]) => [name, Math.round(size * factor)]),
  ) as Record<FontSizeName, number>;

  return {
    colors,
    spacing,
    radii,
    touch,
    motion: motionTokens,
    fonts,
    textScale,
    fontSizes: sizes,
    text: {
      body: textStyle(fonts.body, sizes.body, colors.textOnDark),
      bodyBold: textStyle(fonts.bodyBold, sizes.body, colors.textOnDark),
      bodyLarge: textStyle(fonts.body, sizes.bodyLarge, colors.textOnDark),
      button: textStyle(fonts.bodyBold, sizes.button, colors.text),
      title: textStyle(fonts.heading, sizes.title, colors.goldHighlight),
      hero: textStyle(fonts.heading, sizes.hero, colors.goldHighlight),
    },
  };
}
