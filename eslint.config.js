import eslintJs from '@eslint/js';
import { defineConfig } from 'eslint/config';
import globals from 'globals';
import { includeIgnoreFile } from '@eslint/compat'; // Added for .gitignore
import { fileURLToPath } from 'node:url'; // Added for .gitignore path
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import eslintPluginN from 'eslint-plugin-n';
import eslintPluginUnicorn from 'eslint-plugin-unicorn';
import tseslint from 'typescript-eslint';
import eslintPluginVitest from '@vitest/eslint-plugin';
import eslintConfigPrettier from 'eslint-config-prettier';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath), // Handle .gitignore patterns

  // 0. Global ignores and linter options (ignores here are additional to .gitignore)
  {
    linterOptions: {
      reportUnusedDisableDirectives: true, // Enable reporting of unused disable directives
    },
  },

  // 1. Base configurations for all relevant files
  eslintJs.configs.recommended, // Basic ESLint recommended rules

  {
    // JSDoc configuration
    plugins: { jsdoc: eslintPluginJsdoc },
    rules: {
      ...eslintPluginJsdoc.configs.recommended.rules,
      'jsdoc/require-jsdoc': 0,
      'jsdoc/tag-lines': [2, 'any', { startLines: 1 }],
      'jsdoc/require-param-type': 0,
      'jsdoc/require-returns-type': 0,
      'jsdoc/no-types': 2,
      'jsdoc/require-returns-check': 0, // Was in TS override, better here
    },
    settings: {
      jsdoc: {
        mode: 'typescript',
        tagNamePreference: { category: 'category' },
      },
    },
  },

  {
    // Node plugin configuration
    plugins: { n: eslintPluginN },
    rules: {
      ...eslintPluginN.configs.recommended.rules,
      'n/file-extension-in-import': [2, 'always'],
      'n/no-missing-import': 0,
    },
  },

  {
    // Unicorn plugin configuration
    plugins: { unicorn: eslintPluginUnicorn },
    rules: {
      ...eslintPluginUnicorn.configs.recommended.rules,
      'unicorn/no-null': 0,
      'unicorn/prevent-abbreviations': 0,
      'unicorn/prefer-code-point': 0,
      'unicorn/no-for-loop': 0,
      'unicorn/no-array-callback-reference': 0,
      'unicorn/prefer-spread': 0,
      'unicorn/no-useless-undefined': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/prefer-array-find': 0,
      'unicorn/prefer-module': 0,
      'unicorn/prefer-at': 0,
      'unicorn/prefer-string-replace-all': 0,
      'unicorn/prefer-switch': [2, { emptyDefaultCase: 'do-nothing-comment' }],
    },
  },

  // 2. Global custom rules and language options
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'array-callback-return': [2, { allowImplicit: true }],
      'no-lonely-if': 2,
      'no-proto': 2,
      eqeqeq: [2, 'smart'],
      'no-caller': 2,
      'dot-notation': 2,
      'no-var': 2,
      'prefer-const': 2,
      'prefer-arrow-callback': [2, { allowNamedFunctions: true }],
      'arrow-body-style': [2, 'as-needed'],
      'object-shorthand': 2,
      'prefer-template': 2,
      'one-var': [2, 'never'],
      'prefer-destructuring': [2, { object: true }],
      'capitalized-comments': 2,
      'multiline-comment-style': [2, 'starred-block'],
      'spaced-comment': 2,
      yoda: [2, 'never'],
      curly: [2, 'multi-line'],
      'no-else-return': [2, { allowElseIf: false }],
      'no-unused-expressions': 2,
      'no-useless-call': 2,
      'no-use-before-define': [2, 'nofunc'],
      'no-constant-binary-expression': 2,
      'no-void': 2,
    },
  },

  // 3. TypeScript specific configurations
  tseslint.configs.recommendedTypeChecked,
  tseslint.configs.stylisticTypeChecked,
  {
    // Custom overrides and settings for TypeScript files
    files: ['**/*.ts', '**/*.mts', '**/*.cts'], // Ensure this block specifically targets TS files
    languageOptions: {
      parserOptions: {
        project: true, // Auto-detects tsconfig.json
        tsconfigRootDir: import.meta.dirname, // Root directory for tsconfig.json resolution
      },
    },
    rules: {
      // Override base ESLint rules for TS
      'dot-notation': 0,
      'no-use-before-define': 0,
      // "curly" is already defined globally with [2, "multi-line"]

      // Rule from original TS override related to Node features
      'n/no-unsupported-features/es-syntax': 0,

      // Original TypeScript specific rules
      '@typescript-eslint/prefer-for-of': 0,
      '@typescript-eslint/member-ordering': 0,
      '@typescript-eslint/explicit-function-return-type': 0,
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-use-before-define': [
        2,
        {
          functions: false,
          classes: true,
          variables: true,
          enums: true,
          typedefs: true,
        },
      ],
      '@typescript-eslint/consistent-type-definitions': [2, 'interface'],
      '@typescript-eslint/prefer-function-type': 2,
      '@typescript-eslint/no-unnecessary-type-arguments': 2,
      '@typescript-eslint/prefer-string-starts-ends-with': 2,
      '@typescript-eslint/prefer-readonly': 2,
      '@typescript-eslint/prefer-includes': 2,
      '@typescript-eslint/switch-exhaustiveness-check': 2,
      '@typescript-eslint/prefer-nullish-coalescing': 2,
      '@typescript-eslint/no-non-null-assertion': 1,
      '@typescript-eslint/consistent-type-imports': 2,
      '@typescript-eslint/no-explicit-any': 1, // TODO
    },
  },

  // 4. Vitest specific configuration (for *.spec.ts files)
  {
    files: ['**/*.spec.ts'],
    plugins: { vitest: eslintPluginVitest },
    languageOptions: {
      globals: {
        ...globals.vitest, // Add Vitest globals
      },
    },
    rules: {
      // Assuming "recommended" is the flat config equivalent for "legacy-recommended"
      ...eslintPluginVitest.configs.recommended.rules,
      'n/no-unpublished-import': 0, // Allow importing devDependencies
      '@typescript-eslint/no-explicit-any': 0, // Allow `any` in tests
      '@typescript-eslint/no-non-null-assertion': 0, // Allow `!` assertions in tests
    },
  },

  // 5. Prettier - must be the last configuration to override styling rules
  eslintConfigPrettier,
);
