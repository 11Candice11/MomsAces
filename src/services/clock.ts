import { getCalendars } from 'expo-localization';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import type { ClockFormat } from '@/domain/shared/formatTime';

/** The phone's 12-hour or 24-hour setting (R2.22). Falls back to 12-hour when unknown. */
export function readDeviceClock(): ClockFormat {
  try {
    return getCalendars()[0]?.uses24hourClock === true ? '24h' : '12h';
  } catch {
    return '12h';
  }
}

/** The clock style, re-read whenever the app returns to the foreground. */
export function useDeviceClock(): ClockFormat {
  const [clock, setClock] = useState<ClockFormat>(readDeviceClock);
  useEffect(() => {
    const sub = AppState.addEventListener('change', (state) => {
      if (state === 'active') setClock(readDeviceClock());
    });
    return () => sub.remove();
  }, []);
  return clock;
}
