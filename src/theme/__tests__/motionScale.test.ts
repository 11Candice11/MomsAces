import { motionTokens } from '@/theme/motion';
import { scaleMotion } from '@/theme/motionScale';

describe('scaleMotion', () => {
  it('full motion uses the tokens unchanged and allows loops', () => {
    const m = scaleMotion('full');
    expect(m.duration('normal')).toBe(motionTokens.duration.normal);
    expect(m.count('confettiCount')).toBe(motionTokens.effects.confettiCount);
    expect(m.loop).toBe(true);
    expect(m.glow.animated).toBe(true);
  });

  it('calm mode is slower, has fewer particles and no loops, shake or animated glow', () => {
    const m = scaleMotion('calm');
    expect(m.duration('normal')).toBeGreaterThan(motionTokens.duration.normal);
    expect(m.count('confettiCount')).toBeLessThan(motionTokens.effects.confettiCount);
    expect(m.count('confettiCount')).toBeGreaterThan(0);
    expect(m.loop).toBe(false);
    expect(m.shake).toBe(false);
    expect(m.glow.animated).toBe(false);
  });

  it('none removes movement and particles but keeps a short crossfade', () => {
    const m = scaleMotion('none');
    expect(m.duration('celebrate')).toBe(0);
    expect(m.count('sparkleCount')).toBe(0);
    expect(m.loop).toBe(false);
    expect(m.crossfadeMs).toBeGreaterThan(0);
  });

  it('never flashes, in any level, and the glow is slow and gentle', () => {
    for (const level of ['full', 'calm', 'none'] as const) {
      const m = scaleMotion(level);
      expect(m.flash).toBe(false);
      expect(m.glow.periodMs).toBeGreaterThanOrEqual(2400);
      expect(m.glow.maxOpacity - m.glow.minOpacity).toBeLessThanOrEqual(0.3 + 1e-9);
    }
  });
});
