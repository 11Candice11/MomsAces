import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

/**
 * The current time, refreshed every `intervalMs` and whenever the app comes back to the
 * foreground, so cards become due and a new day is dealt without a restart.
 */
export function useNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const timer = setInterval(tick, intervalMs);
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') tick();
    });
    return () => {
      clearInterval(timer);
      sub.remove();
    };
  }, [intervalMs]);
  return now;
}
