const { defineConfig, globalIgnores } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');
const globals = require('globals');

module.exports = defineConfig([
  globalIgnores([
    'dist/**',
    'coverage/**',
    'android/**',
    'ios/**',
    '.expo/**',
    'node_modules/**',
    'node_modules.nosync/**',
  ]),
  expoConfig,
  prettierConfig,
  {
    // Dev scripts and config plugins run in Node, not in the app.
    files: ['scripts/**/*.js', 'plugins/**/*.js'],
    languageOptions: { globals: globals.node },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // Pure logic: src/domain must not import React, React Native, Expo, MMKV, navigation,
    // or any non-domain app code. Use relative imports between domain files.
    files: ['src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                'react',
                'react/*',
                'react-*',
                'react-native',
                'react-native/*',
                'react-native-*',
                'expo',
                'expo/*',
                'expo-*',
                '@expo/*',
                '@react-native/*',
                '@react-native-*',
                '@react-navigation/*',
                'zustand',
                'zustand/*',
              ],
              message:
                'src/domain is pure TypeScript: no React, React Native, Expo, MMKV, navigation or state imports.',
            },
            {
              regex: '^@/(?!domain/)',
              message:
                'src/domain may only import other domain files, not UI, store, services or data.',
            },
          ],
        },
      ],
    },
  },
]);
