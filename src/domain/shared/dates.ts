/** Date helpers. Pure: the caller passes the moment; nothing reads the clock here. */

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Local calendar date of an epoch time, as 'YYYY-MM-DD'. */
export function localDateKey(epochMs: number): string {
  const d = new Date(epochMs);
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** True for a well-formed 'YYYY-MM-DD' string that is a real calendar date. */
export function isDateKey(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d;
}

/** Epoch ms of local midnight at the start of a 'YYYY-MM-DD' date. */
export function startOfDateKey(dateKey: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, d).getTime();
}

/** Adds whole days to a 'YYYY-MM-DD' date (negative to go back). */
export function addDays(dateKey: string, days: number): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  return localDateKey(new Date(y, m - 1, d + days).getTime());
}

/** The Monday that starts the week containing a date (weeks start on Monday). */
export function mondayOf(dateKey: string): string {
  const [y, m, d] = dateKey.split('-').map(Number);
  const weekday = new Date(y, m - 1, d).getDay(); // 0 = Sunday
  const back = (weekday + 6) % 7;
  return addDays(dateKey, -back);
}

/** Epoch ms for a local 'HH:mm' time on a 'YYYY-MM-DD' date. */
export function atLocalTime(dateKey: string, time: string): number {
  const [y, m, d] = dateKey.split('-').map(Number);
  const [hh, mm] = time.split(':').map(Number);
  return new Date(y, m - 1, d, hh, mm).getTime();
}
