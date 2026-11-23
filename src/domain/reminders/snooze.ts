/** "Later" moves a card 10 minutes on (R1.6, R2.8). */
export const SNOOZE_MINUTES = 10;

/** Epoch ms when a snooze that starts at `now` ends. */
export function snoozeUntil(now: number, minutes: number = SNOOZE_MINUTES): number {
  return now + Math.max(0, minutes) * 60_000;
}
