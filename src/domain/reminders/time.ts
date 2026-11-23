/** Times of day are stored as 'HH:mm' (24-hour, zero-padded). */
const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/;

export interface TimeOfDay {
  hour: number;
  minute: number;
}

export function parseTime(time: string): TimeOfDay | null {
  const match = TIME_RE.exec(time);
  if (!match) return null;
  return { hour: Number(match[1]), minute: Number(match[2]) };
}

export function isValidTime(time: unknown): time is string {
  return typeof time === 'string' && TIME_RE.test(time);
}

/** Minutes since midnight. Assumes a valid 'HH:mm'. */
export function minutesOfDay(time: string): number {
  const [hh, mm] = time.split(':').map(Number);
  return hh * 60 + mm;
}

/** Local 'HH:mm' of an epoch time. */
export function timeOfEpoch(epochMs: number): string {
  const d = new Date(epochMs);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}
