import { useCalmModeContext } from './ThemeProvider';

/**
 * The single place the Calm mode setting is read for motion. The app root passes
 * `settings.calmMode` from the settings store into `ThemeProvider` (task 2.5).
 */
export function useCalmModeSetting(): boolean {
  return useCalmModeContext();
}
