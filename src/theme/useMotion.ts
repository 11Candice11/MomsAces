import { useMemo } from 'react';

import { resolveMotionLevel } from '@/domain/shared/motionLevel';

import { scaleMotion, type Motion } from './motionScale';
import { useCalmModeSetting } from './useCalmModeSetting';
import { useSystemReduceMotion } from './useSystemReduceMotion';

/**
 * Every animation in the app reads its durations, particle counts and loop permission from here.
 * Calm mode and the Android "remove animations" setting are applied in this one place.
 */
export function useMotion(): Motion {
  const calmMode = useCalmModeSetting();
  const systemReduceMotion = useSystemReduceMotion();
  const level = resolveMotionLevel({ systemReduceMotion, calmMode });
  return useMemo(() => scaleMotion(level), [level]);
}
