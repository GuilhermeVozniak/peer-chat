import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Global ignores
  {
    ignores: [
      'node_modules/**',
      '.next/**',
      'out/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
    ],
  },

  // Base configuration using compat layer
  ...compat.extends('next/core-web-vitals'),

  // TypeScript specific configuration
  ...compat.extends('plugin:@typescript-eslint/recommended'),
  ...compat.extends('plugin:@typescript-eslint/recommended-type-checked'),
  ...compat.extends('plugin:@typescript-eslint/strict-type-checked'),
  ...compat.extends('plugin:@typescript-eslint/stylistic-type-checked'),

  // Prettier configuration
  ...compat.extends('plugin:prettier/recommended'),

  // Custom rules configuration
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    rules: {
      // TypeScript specific rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-var-requires': 'error',
      '@typescript-eslint/consistent-type-imports': [
        'error',
        {
          prefer: 'type-imports',
          fixStyle: 'inline-type-imports',
        },
      ],
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-new': 'error',
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/prefer-as-const': 'error',

      // React specific rules
      'react/jsx-uses-react': 'off', // Not needed in React 17+
      'react/react-in-jsx-scope': 'off', // Not needed in React 17+
      'react/prop-types': 'off', // Not needed with TypeScript
      'react/display-name': 'off', // Conflicts with TypeScript
      'react/no-unescaped-entities': 'off', // Prettier handles this

      // General code quality rules
      'no-console': 'warn',
      'no-debugger': 'error',
      'no-alert': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      'no-unused-expressions': 'error',
      'no-duplicate-imports': 'error',
      'no-useless-return': 'error',
      'no-useless-constructor': 'error',
      'no-useless-rename': 'error',
      'no-void': 'error',
      'prefer-template': 'error',
      'object-shorthand': 'error',
      'prefer-arrow-callback': 'error',
      'prefer-rest-params': 'error',
      'prefer-spread': 'error',

      // Prettier integration
      'prettier/prettier': 'error',
    },
  },
];
