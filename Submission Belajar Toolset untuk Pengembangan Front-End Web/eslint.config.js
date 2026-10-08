import js from '@eslint/js';
import globals from 'globals';
import prettierRecommended from 'eslint-plugin-prettier/recommended';

export default [
  { ignores: ['dist/', 'node_modules/'] },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      'no-unused-vars': 'error',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      eqeqeq: 'error',
      'prefer-const': 'error',
      'no-var': 'error',
    },
  },
  prettierRecommended,
];
