/** The phone's clock style (R2.22). */
export type ClockFormat = '12h' | '24h';

/**
 * Formats a stored 'HH:mm' time for display: "9:00 AM" on a 12-hour phone, "09:00" on a 24-hour
 * phone. The one formatter for every time shown to her. Invalid input is returned unchanged.
 */
export function formatTime(time: string, clock: ClockFormat): string {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!match) return time;
  const hour = Number(match[1]);
  const minute = match[2];
  if (clock === '24h') return `${match[1]}:${minute}`;
  const suffix = hour < 12 ? 'AM' : 'PM';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;
  return `${hour12}:${minute} ${suffix}`;
}
