import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
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

  // Base configuration for all files
  ...compat.extends(
    'next/core-web-vitals',
    'prettier', // Must be last to override other configs
  ),

  // TypeScript files configuration
  ...compat.overrides([
    {
      files: ['**/*.ts', '**/*.tsx'],
      extends: [
        'next/core-web-vitals',
        'plugin:@typescript-eslint/recommended',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/strict-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
        'plugin:prettier/recommended',
      ],
      parser: '@typescript-eslint/parser',
      parserOptions: {
        project: ['./tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
      plugins: ['@typescript-eslint'],
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
        '@typescript-eslint/prefer-const': 'error',
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
        '@typescript-eslint/no-array-constructor': 'error',
        '@typescript-eslint/no-duplicate-enum-values': 'error',
        '@typescript-eslint/no-extra-non-null-assertion': 'error',
        '@typescript-eslint/no-non-null-asserted-nullish-coalescing': 'error',
        '@typescript-eslint/no-non-null-asserted-optional-chain': 'error',
        '@typescript-eslint/no-this-alias': 'error',
        '@typescript-eslint/no-unnecessary-type-constraint': 'error',
        '@typescript-eslint/no-unsafe-argument': 'error',
        '@typescript-eslint/no-unsafe-assignment': 'error',
        '@typescript-eslint/no-unsafe-call': 'error',
        '@typescript-eslint/no-unsafe-member-access': 'error',
        '@typescript-eslint/no-unsafe-return': 'error',
        '@typescript-eslint/prefer-includes': 'error',
        '@typescript-eslint/prefer-readonly': 'error',
        '@typescript-eslint/prefer-reduce-type-parameter': 'error',
        '@typescript-eslint/prefer-string-starts-ends-with': 'error',
        '@typescript-eslint/require-array-sort-compare': 'error',
        '@typescript-eslint/restrict-plus-operands': 'error',
        '@typescript-eslint/restrict-template-expressions': 'error',
        '@typescript-eslint/strict-boolean-expressions': 'error',
        '@typescript-eslint/switch-exhaustiveness-check': 'error',
        '@typescript-eslint/unbound-method': 'error',
        '@typescript-eslint/unified-signatures': 'error',

        // React specific rules
        'react/jsx-uses-react': 'off', // Not needed in React 17+
        'react/react-in-jsx-scope': 'off', // Not needed in React 17+
        'react/prop-types': 'off', // Not needed with TypeScript
        'react/display-name': 'off', // Conflicts with TypeScript
        'react/no-unescaped-entities': 'off', // Prettier handles this
        'react/jsx-key': 'error',
        'react/jsx-no-duplicate-props': 'error',
        'react/jsx-no-undef': 'error',
        'react/no-array-index-key': 'warn',
        'react/no-danger': 'warn',
        'react/no-deprecated': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-find-dom-node': 'error',
        'react/no-is-mounted': 'error',
        'react/no-render-return-value': 'error',
        'react/no-string-refs': 'error',
        'react/no-unknown-property': 'error',
        'react/self-closing-comp': 'error',
        'react/sort-comp': 'off', // Conflicts with TypeScript
        'react/void-dom-elements-no-children': 'error',

        // Next.js specific rules
        '@next/next/no-html-link-for-pages': 'error',
        '@next/next/no-img-element': 'error',
        '@next/next/no-sync-scripts': 'error',
        '@next/next/no-unwanted-polyfillio': 'error',
        '@next/next/no-page-custom-font': 'error',
        '@next/next/no-css-tags': 'error',
        '@next/next/no-head-element': 'error',
        '@next/next/no-typos': 'error',
        '@next/next/no-before-interactive-script-outside-document': 'error',
        '@next/next/no-duplicate-head': 'error',
        '@next/next/no-script-component-in-head': 'error',
        '@next/next/no-styled-jsx-in-document': 'error',
        '@next/next/no-title-in-document-head': 'error',
        '@next/next/no-unwanted-polyfillio': 'error',

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
        'prefer-destructuring': [
          'error',
          {
            array: true,
            object: true,
          },
          {
            enforceForRenamedProperties: false,
          },
        ],
        'object-shorthand': 'error',
        'prefer-arrow-callback': 'error',
        'prefer-rest-params': 'error',
        'prefer-spread': 'error',
        'no-useless-concat': 'error',
        'no-useless-escape': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-call': 'error',
        'no-useless-catch': 'error',
        'no-useless-backreference': 'error',
        'no-useless-assignment': 'error',
        'no-useless-return': 'error',
        'no-useless-constructor': 'error',
        'no-useless-rename': 'error',
        'no-useless-concat': 'error',
        'no-useless-escape': 'error',
        'no-useless-computed-key': 'error',
        'no-useless-call': 'error',
        'no-useless-catch': 'error',
        'no-useless-backreference': 'error',
        'no-useless-assignment': 'error',

        // Prettier integration - these should be disabled as Prettier handles them
        'prettier/prettier': 'error',
      },
    },

    // JavaScript files configuration
    {
      files: ['**/*.js', '**/*.mjs'],
      extends: [
        'next/core-web-vitals',
        'plugin:prettier/recommended',
      ],
      rules: {
        'prettier/prettier': 'error',
        'no-console': 'warn',
        'no-debugger': 'error',
        'no-alert': 'warn',
        'no-var': 'error',
        'prefer-const': 'error',
        'no-unused-vars': [
          'error',
          {
            argsIgnorePattern: '^_',
            varsIgnorePattern: '^_',
            caughtErrorsIgnorePattern: '^_',
          },
        ],
      },
    },

    // Tailwind CSS configuration
    {
      files: ['**/*.tsx', '**/*.ts', '**/*.jsx', '**/*.js'],
      extends: ['plugin:tailwindcss/recommended'],
      plugins: ['tailwindcss'],
      rules: {
        'tailwindcss/classnames-order': 'error',
        'tailwindcss/enforces-negative-arbitrary-values': 'error',
        'tailwindcss/enforces-shorthand': 'error',
        'tailwindcss/migration-from-tailwind-2': 'warn',
        'tailwindcss/no-arbitrary-value': 'off',
        'tailwindcss/no-custom-classname': 'off',
        'tailwindcss/no-contradicting-classname': 'error',
      },
    },
  ]),
];

export default eslintConfig;
