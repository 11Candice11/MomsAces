/** Typography tokens. Sizes are in sp (React Native font scale applies on top of `textScale`). */
export const fonts = {
  heading: 'PlayfairDisplay_700Bold',
  body: 'Nunito_600SemiBold',
  bodyBold: 'Nunito_700Bold',
} as const;

export const fontSizes = {
  body: 20,
  bodyLarge: 24,
  button: 26,
  title: 32,
  hero: 44,
} as const;

export const lineHeightRatio = 1.35;

export type FontSizeName = keyof typeof fontSizes;

/** The user's text size setting. Multiplies every font size. */
export const textScales = {
  normal: 1,
  large: 1.25,
  xlarge: 1.5,
} as const;

export type TextScaleName = keyof typeof textScales;
