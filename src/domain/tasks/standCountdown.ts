import { clamp } from '../shared/clamp';

/**
 * Stand With Help countdown limits, in seconds (R10.7).
 * Her physio should confirm the 15 to 60 second range before release.
 */
export const STAND_COUNTDOWN = { min: 15, max: 60, default: 30, step: 5 } as const;

/** Keeps a stored or entered countdown inside the allowed range. Non-numbers give the default. */
export function clampStandCountdown(value: number): number {
  if (!Number.isFinite(value)) return STAND_COUNTDOWN.default;
  return clamp(Math.round(value), STAND_COUNTDOWN.min, STAND_COUNTDOWN.max);
}
