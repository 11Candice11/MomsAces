import type { StateStorage } from 'zustand/middleware';
import { createSafeJSONStorage } from '../safeJsonStorage';

function memory(initial: Record<string, string> = {}): StateStorage {
  const data = { ...initial };
  return {
    getItem: (k) => data[k] ?? null,
    setItem: (k, v) => {
      data[k] = v;
    },
    removeItem: (k) => {
      delete data[k];
    },
  };
}

describe('createSafeJSONStorage', () => {
  it('round-trips a value', () => {
    const backing = memory();
    const storage = createSafeJSONStorage<{ n: number }>(() => backing, jest.fn());
    storage.setItem('k', { state: { n: 1 }, version: 2 });
    expect(storage.getItem('k')).toEqual({ state: { n: 1 }, version: 2 });
  });

  it('returns null for a missing key without reporting', () => {
    const onError = jest.fn();
    expect(createSafeJSONStorage(() => memory(), onError).getItem('k')).toBeNull();
    expect(onError).not.toHaveBeenCalled();
  });

  it.each(['{not json', '"just a string"', '{"version":2}'])(
    'returns null and reports for corrupt data %p',
    (raw) => {
      const onError = jest.fn();
      const storage = createSafeJSONStorage(() => memory({ k: raw }), onError);
      expect(storage.getItem('k')).toBeNull();
      expect(onError).toHaveBeenCalledWith('k', expect.any(Error));
    },
  );

  it('treats a missing version as 0 so migrate runs', () => {
    const storage = createSafeJSONStorage(() => memory({ k: '{"state":{}}' }), jest.fn());
    expect(storage.getItem('k')).toEqual({ state: {}, version: 0 });
  });

  it('never throws when the underlying storage fails', () => {
    const broken: StateStorage = {
      getItem: () => {
        throw new Error('disk');
      },
      setItem: () => {
        throw new Error('disk');
      },
      removeItem: () => {
        throw new Error('disk');
      },
    };
    const onError = jest.fn();
    const storage = createSafeJSONStorage(() => broken, onError);
    expect(storage.getItem('k')).toBeNull();
    expect(() => storage.setItem('k', { state: {}, version: 1 })).not.toThrow();
    expect(() => storage.removeItem('k')).not.toThrow();
    expect(onError).toHaveBeenCalledTimes(3);
  });
});
