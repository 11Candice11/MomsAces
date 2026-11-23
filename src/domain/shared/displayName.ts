export const DISPLAY_NAME_MAX_LENGTH = 20;

/** What Ace calls her (R10.5): trimmed, at most 20 characters, the fallback if empty. */
export function normalizeDisplayName(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback;
  const trimmed = Array.from(raw.trim()).slice(0, DISPLAY_NAME_MAX_LENGTH).join('').trim();
  return trimmed.length > 0 ? trimmed : fallback;
}
