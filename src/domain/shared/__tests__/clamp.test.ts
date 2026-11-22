import { clamp } from '@/domain/shared/clamp';

describe('clamp (smoke test for Jest, ts-jest and the @/ alias)', () => {
  it.each([
    [5, 0, 10, 5],
    [-1, 0, 10, 0],
    [11, 0, 10, 10],
    [0, 0, 10, 0],
    [10, 0, 10, 10],
  ])('clamp(%d, %d, %d) = %d', (value, min, max, expected) => {
    expect(clamp(value, min, max)).toBe(expected);
  });

  it('throws when min is greater than max', () => {
    expect(() => clamp(1, 10, 0)).toThrow(RangeError);
  });
});
