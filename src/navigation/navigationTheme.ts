import { DefaultTheme, type Theme } from '@react-navigation/native';

import { colors, fonts } from '@/theme';

/** Dark velvet navigation theme, so there is never a white flash between screens. */
export const navigationTheme: Theme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    primary: colors.gold,
    background: colors.velvet,
    card: colors.velvetRaised,
    text: colors.textOnDark,
    border: colors.purple,
    notification: colors.magenta,
  },
  fonts: {
    regular: { fontFamily: fonts.body, fontWeight: '400' },
    medium: { fontFamily: fonts.body, fontWeight: '500' },
    bold: { fontFamily: fonts.bodyBold, fontWeight: '700' },
    heavy: { fontFamily: fonts.bodyBold, fontWeight: '800' },
  },
};
