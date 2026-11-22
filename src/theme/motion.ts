/**
 * Motion tokens. Animation code must read these through `useMotion()` (task 1.5), never directly,
 * so Calm mode and the system "remove animations" setting scale everything in one place.
 * Easing is stored as cubic-bezier control points so this file needs no animation library.
 */
export const motionTokens = {
  duration: { instant: 0, fast: 200, normal: 400, slow: 800, celebrate: 2000 }, // ms
  easing: {
    standard: [0.2, 0, 0, 1],
    gentle: [0.4, 0, 0.2, 1],
    bounceSoft: [0.34, 1.2, 0.64, 1],
  },
  effects: { confettiCount: 40, sparkleCount: 8 },
  // Slow and low-amplitude on purpose: no flashing, no strobing.
  glow: { periodMs: 2400, minOpacity: 0.7, maxOpacity: 1 },
} as const;

export type MotionDurationName = keyof typeof motionTokens.duration;
export type MotionEasingName = keyof typeof motionTokens.easing;
export type MotionEffectName = keyof typeof motionTokens.effects;
