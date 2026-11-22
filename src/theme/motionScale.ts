import type { MotionLevel } from '@/domain/shared/motionLevel';

import {
  motionTokens,
  type MotionDurationName,
  type MotionEasingName,
  type MotionEffectName,
} from './motion';

export interface Motion {
  level: MotionLevel;
  /** Duration in ms for a named token, already scaled for the motion level. */
  duration: (name: MotionDurationName) => number;
  /** Number of particles for a named effect (confetti, sparkles), scaled for the motion level. */
  count: (name: MotionEffectName) => number;
  /** Cubic-bezier control points. Build the easing function from these in animation code. */
  easing: (name: MotionEasingName) => readonly [number, number, number, number];
  /** True only if looping animations (idle loops, glow pulse, looping Lottie) are allowed. */
  loop: boolean;
  /** True only if shake-style feedback is allowed. */
  shake: boolean;
  /** Glow: `animated` false means draw a static border only. */
  glow: { animated: boolean; periodMs: number; minOpacity: number; maxOpacity: number };
  /** Length of a plain crossfade, used where movement is replaced by a fade. */
  crossfadeMs: number;
  /** Nothing in this app flashes, in any motion level. */
  readonly flash: false;
}

// Calm mode: slower, gentler and much less busy.
const CALM_DURATION_FACTOR = 1.5;
const CALM_COUNT_FACTOR = 0.25;

/** Pure: scales the motion tokens for a motion level. The only place Calm mode is applied. */
export function scaleMotion(level: MotionLevel): Motion {
  const { duration, effects, glow, easing } = motionTokens;

  return {
    level,
    duration: (name) => {
      if (level === 'none') return 0;
      const base = duration[name];
      return level === 'calm' ? Math.round(base * CALM_DURATION_FACTOR) : base;
    },
    count: (name) => {
      if (level === 'none') return 0;
      const base = effects[name];
      return level === 'calm' ? Math.round(base * CALM_COUNT_FACTOR) : base;
    },
    easing: (name) => easing[name],
    loop: level === 'full',
    shake: level === 'full',
    glow: {
      animated: level === 'full',
      periodMs: glow.periodMs,
      minOpacity: glow.minOpacity,
      maxOpacity: glow.maxOpacity,
    },
    crossfadeMs: level === 'none' ? 150 : level === 'calm' ? 300 : duration.fast,
    flash: false,
  };
}
