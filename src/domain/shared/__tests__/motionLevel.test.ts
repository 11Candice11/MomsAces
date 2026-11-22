import { resolveMotionLevel } from '@/domain/shared/motionLevel';

describe('resolveMotionLevel', () => {
  it.each([
    { systemReduceMotion: false, calmMode: false, expected: 'full' },
    { systemReduceMotion: false, calmMode: true, expected: 'calm' },
    { systemReduceMotion: true, calmMode: false, expected: 'none' },
    { systemReduceMotion: true, calmMode: true, expected: 'none' },
  ])(
    'system=$systemReduceMotion calm=$calmMode gives $expected',
    ({ systemReduceMotion, calmMode, expected }) => {
      expect(resolveMotionLevel({ systemReduceMotion, calmMode })).toBe(expected);
    },
  );
});
