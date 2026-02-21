import { fileURLToPath } from 'node:url'; // Added for .gitignore path
import { includeIgnoreFile } from '@eslint/compat'; // Added for .gitignore
import feedicFlatConfig from '@feedic/eslint-config';
import { commonTypeScriptRules } from '@feedic/eslint-config/typescript';
import eslintPluginVitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier';
import eslintPluginJsdoc from 'eslint-plugin-jsdoc';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath), // Handle .gitignore patterns

  // Global linter options
  {
    linterOptions: {
      reportUnusedDisableDirectives: true, // Enable reporting of unused disable directives
    },
  },

  // Base configurations for all relevant files
  ...feedicFlatConfig,

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

  // Global custom rules and language options
  {
    languageOptions: {
      globals: globals.node,
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.js'],
          defaultProject: 'tsconfig.json',
        },
        tsconfigRootDir: import.meta.dirname, // eslint-disable-line n/no-unsupported-features/node-builtins
      },
    },
    rules: {
      'array-callback-return': [2, { allowImplicit: true }],
      'n/file-extension-in-import': [2, 'always'],
      'no-lonely-if': 2,
      'no-proto': 2,
      'no-else-return': [2, { allowElseIf: false }],
      'no-unused-expressions': 2,
      'no-useless-call': 2,
      'no-use-before-define': [2, 'nofunc'],
      'no-constant-binary-expression': 2,
      'no-void': 2,
      'unicorn/no-array-callback-reference': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/no-for-loop': 0,
      'unicorn/no-useless-undefined': 0,
      'unicorn/prefer-array-find': 0,
      'unicorn/prefer-spread': 0,
      'unicorn/prevent-abbreviations': 0,
    },
  },

  // TypeScript specific configurations
  {
    // Custom overrides and settings for TypeScript files
    files: ['**/*.{c,m,}ts', '**/*.tsx'], // Ensure this block specifically targets TS files
    extends: [
      ...tseslint.configs.recommendedTypeChecked,
      ...tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parser: tseslint.parser,
    },
    rules: {
      // Override base ESLint rules for TS
      'dot-notation': 0,
      'no-use-before-define': 0,
      // "curly" is already defined globally with [2, "multi-line"]

      // Original TypeScript specific rules
      ...commonTypeScriptRules,
      '@typescript-eslint/no-unused-vars': [
        'error',
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
      // Enabling this in cheerio currently triggers broad churn across src + website.
      '@typescript-eslint/no-unnecessary-condition': 0,
      '@typescript-eslint/no-non-null-assertion': 1,
      '@typescript-eslint/consistent-type-imports': 2,
      '@typescript-eslint/no-explicit-any': 1, // TODO
    },
  },

  // Vitest specific configuration (for *.spec.ts files)
  {
    files: ['**/*.spec.ts'],
    plugins: { vitest: eslintPluginVitest },
    languageOptions: {
      globals: globals.vitest, // Add Vitest globals
    },
    rules: {
      // Assuming "recommended" is the flat config equivalent for "legacy-recommended"
      ...eslintPluginVitest.configs.recommended.rules,
      'n/no-unpublished-import': 0, // Allow importing devDependencies
      '@typescript-eslint/no-explicit-any': 0, // Allow `any` in tests
      '@typescript-eslint/no-non-null-assertion': 0, // Allow `!` assertions in tests
    },
  },

  // Website specific configuration
  {
    files: ['website/**/*.{m,}ts{x,}'],
    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ['*.mjs'],
        },
        tsconfigRootDir: `${import.meta.dirname}/website`, // eslint-disable-line n/no-unsupported-features/node-builtins
      },
    },
  },

  // Prettier - must be the last configuration to override styling rules
  eslintConfigPrettier,
);
