export type MotionLevel = 'full' | 'calm' | 'none';

export interface MotionLevelInput {
  /** True when the Android system "remove animations" setting is on. */
  systemReduceMotion: boolean;
  /** The Calm mode / Reduce motion setting in Mom's Aces. Off by default. */
  calmMode: boolean;
}

/**
 * Decides how much motion the app may use.
 * The system setting always wins (R19.3), then Calm mode, otherwise full motion.
 */
export function resolveMotionLevel({
  systemReduceMotion,
  calmMode,
}: MotionLevelInput): MotionLevel {
  if (systemReduceMotion) {
    return 'none';
  }
  return calmMode ? 'calm' : 'full';
}
