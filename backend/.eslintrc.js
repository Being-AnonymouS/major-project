module.exports = {
  root: true,
  env: {
    node: true,
    es2020: true,
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module',
  },
  extends: [
    'eslint:recommended',
  ],
  ignorePatterns: ['.eslintrc.js', 'dist'],
  rules: {
    'no-unused-vars': 'off', // Turn off base rule
    '@typescript-eslint/no-unused-vars': ['error', { 'argsIgnorePattern': '^_' }],
  },
  plugins: ['@typescript-eslint'],
};