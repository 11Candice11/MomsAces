import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { createTheme, type Theme } from './createTheme';
import type { TextScaleName } from './typography';

const ThemeContext = createContext<Theme>(createTheme('normal'));

interface ThemeProviderProps {
  /** The user's text size. Task 2.5 connects this to the settings store. */
  textScale?: TextScaleName;
  children: ReactNode;
}

export function ThemeProvider({ textScale = 'normal', children }: ThemeProviderProps) {
  const theme = useMemo(() => createTheme(textScale), [textScale]);
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

/** Returns the theme tokens with the user's text scale applied. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}
