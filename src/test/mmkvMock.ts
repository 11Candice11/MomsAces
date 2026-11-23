/**
 * Jest stand-in for react-native-mmkv (mapped in jest.config.js). An in-memory key-value store
 * with the v4 API the app uses, so the persisted stores can be tested in Node.
 */
const instances = new Map<string, Map<string, string | number | boolean>>();

export function createMMKV(config: { id: string } = { id: 'default' }) {
  let data = instances.get(config.id);
  if (!data) {
    data = new Map();
    instances.set(config.id, data);
  }
  const store = data;
  return {
    getString: (key: string) => {
      const v = store.get(key);
      return typeof v === 'string' ? v : undefined;
    },
    getNumber: (key: string) => {
      const v = store.get(key);
      return typeof v === 'number' ? v : undefined;
    },
    set: (key: string, value: string | number | boolean) => {
      store.set(key, value);
    },
    remove: (key: string) => store.delete(key),
    getAllKeys: () => [...store.keys()],
    clearAll: () => store.clear(),
  };
}

/** Test helper: the raw stored values of an instance. */
export function __mmkvData(id = 'moms-aces') {
  return instances.get(id) ?? new Map();
}
