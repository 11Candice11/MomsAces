/**
 * Colour tokens. The whole app uses one dark theme (velvet background, cream text).
 *
 * Contrast (WCAG), checked when this file was written:
 *   cream on velvet 15.97, cream on velvetRaised 13.36, gold on velvet 7.72,
 *   goldHighlight on velvet 12.25, cream on burgundy 9.64, cream on purple 10.76,
 *   text on gold 7.38, text on cream 15.27, cream on magenta 5.55.
 * Do NOT use magenta text on velvet (2.88). Never put cream text on gold.
 * Green (`done`) is only for "Done" checks and always sits on a cream chip.
 */
export const colors = {
  burgundy: '#7A1F2B',
  purple: '#4B2A6B',
  magenta: '#C2185B',
  gold: '#D4A94F',
  goldHighlight: '#F6D98B',
  cream: '#FFF8E7',
  velvet: '#2A1238',
  velvetRaised: '#3B1E4F',
  text: '#2B1B2E',
  textOnDark: '#FFF8E7',
  done: '#2E7D32',
  disabled: '#B9AFC0',
  surface: '#FFFFFF',
  shadow: '#00000033',
} as const;

export type ColorName = keyof typeof colors;
