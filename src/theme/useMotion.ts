import { useMemo } from 'react';
import { resolveMotionLevel } from '@/domain/shared/motionLevel';
import { scaleMotion, type Motion } from './motionScale';
import { useMotionOverride } from './MotionOverride';
import { useCalmModeSetting } from './useCalmModeSetting';
import { useSystemReduceMotion } from './useSystemReduceMotion';

/**
 * Every animation in the app reads its durations, particle counts and loop permission from here.
 * Calm mode and the Android "remove animations" setting are applied in this one place.
 * (The debug gallery can force a level with `MotionOverride`.)
 */
export function useMotion(): Motion {
  const calmMode = useCalmModeSetting();
  const systemReduceMotion = useSystemReduceMotion();
  const override = useMotionOverride();
  const level = override ?? resolveMotionLevel({ systemReduceMotion, calmMode });
  return useMemo(() => scaleMotion(level), [level]);
}
