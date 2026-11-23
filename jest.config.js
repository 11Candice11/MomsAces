/** @type {import('jest').Config} */
module.exports = {
  // Jest covers pure logic (src/domain) and the stores. UI is checked by hand on a device.
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts'],
  moduleNameMapper: {
    // In-memory MMKV so the persisted stores run in Node.
    '^react-native-mmkv$': '<rootDir>/src/test/mmkvMock.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  globals: { __DEV__: false },
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/tsconfig.jest.json' }],
  },
  collectCoverageFrom: ['src/domain/**/*.ts', '!src/domain/**/__tests__/**'],
  coverageDirectory: 'coverage',
};
