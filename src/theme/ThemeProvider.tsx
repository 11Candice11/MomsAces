import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createTheme, type Theme } from './createTheme';
import type { TextScaleName } from './typography';

const ThemeContext = createContext<Theme>(createTheme('normal'));
const CalmModeContext = createContext(false);

interface ThemeProviderProps {
  /** The user's text size (settings.textScale). */
  textScale?: TextScaleName;
  /** The Calm mode / Reduce motion setting (settings.calmMode). Off by default (R19.1). */
  calmMode?: boolean;
  children: ReactNode;
}

/**
 * Supplies the theme and the Calm mode setting. The app root passes both from the settings store,
 * so the theme layer itself does not depend on the stores.
 */
export function ThemeProvider({
  textScale = 'normal',
  calmMode = false,
  children,
}: ThemeProviderProps) {
  const theme = useMemo(() => createTheme(textScale), [textScale]);
  return (
    <ThemeContext.Provider value={theme}>
      <CalmModeContext.Provider value={calmMode}>{children}</CalmModeContext.Provider>
    </ThemeContext.Provider>
  );
}

/** Returns the theme tokens with the user's text scale applied. */
export function useTheme(): Theme {
  return useContext(ThemeContext);
}

/** The Calm mode setting, as given to `ThemeProvider`. Read by `useMotion()` only. */
export function useCalmModeContext(): boolean {
  return useContext(CalmModeContext);
}
