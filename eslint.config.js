import { fileURLToPath } from 'node:url'; // Added for .gitignore path
import { includeIgnoreFile } from '@eslint/compat'; // Added for .gitignore
import feedicFlatConfig from '@feedic/eslint-config';
import { commonTypeScriptRules } from '@feedic/eslint-config/typescript';
import eslintPluginVitest from '@vitest/eslint-plugin';
import { defineConfig } from 'eslint/config';
import eslintConfigBiome from 'eslint-config-biome';
import globals from 'globals';
import tseslint from 'typescript-eslint';

const gitignorePath = fileURLToPath(new URL('.gitignore', import.meta.url));

export default defineConfig(
  includeIgnoreFile(gitignorePath), // Handle .gitignore patterns

  // Global linter options
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  // Base configurations for all relevant files
  ...feedicFlatConfig,

  {
    rules: {
      'jsdoc/tag-lines': [2, 'any', { startLines: 1 }],
      'jsdoc/require-param-type': 0,
      'jsdoc/require-returns-type': 0,
      'jsdoc/no-types': 2,
      'jsdoc/require-returns-check': 0,
      'jsdoc/check-tag-names': [
        2,
        {
          definedTags: ['private'],
        },
      ],
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
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      'n/file-extension-in-import': [2, 'always'],
      'no-lonely-if': 2,
      'no-proto': 2,
      'no-else-return': [2, { allowElseIf: false }],
      'no-unused-expressions': 2,
      'no-useless-call': 2,
      'no-constant-binary-expression': 2,
      'no-void': 2,
      'unicorn/no-array-callback-reference': 0,
      'unicorn/no-array-reduce': 0,
      'unicorn/no-for-loop': 0,
      'unicorn/no-useless-undefined': 0,
      'unicorn/prefer-array-find': 0,
      'unicorn/prevent-abbreviations': 0,

      /*
       * Rules that do not fit how cheerio is built. These are off for good,
       * not pending work.
       */

      /*
       * Cheerio's API is `this`-bound: every method in `src/api` is called
       * with the Cheerio instance as `this` and mixed onto the prototype by
       * `Object.assign`. 257 reports, none actionable.
       */
      'unicorn/no-this-outside-of-class': 0,
      /*
       * Fires on cheerio's own traversal methods (`.parent()`, `.closest()`,
       * `.children()`), suggesting DOM APIs that do not exist here.
       */
      'unicorn/better-dom-traversing': 0,
      /*
       * `_root`, `_make`, `_parse` and `_render` are documented API, so they
       * cannot become `#private`.
       */
      'unicorn/prefer-private-class-fields': 0,
      /*
       * The prototype assignment in `src/cheerio.ts` is how the API is
       * composed; it is the module's purpose, not an accident.
       */
      'unicorn/no-top-level-side-effects': 0,
      /*
       * Reports dynamic keys that callers supply themselves (`extract()`
       * schema keys, `css()` property names) and land on local result
       * objects. There is no static key to switch to.
       */
      'unicorn/no-unsafe-property-key': 0,
      /*
       * `name in el` mirrors jQuery's `.prop()`, which also reflects
       * inherited members; `i in item` is the sparse-array check in
       * `isArrayLike`. Both are deliberate.
       */
      'unicorn/no-computed-property-existence-check': 0,
      /*
       * Both read `Cheerio.prototype.toArray()` as `Iterator#toArray()`. It
       * returns a plain array, so the suggested rewrites call `.flatMap()` on
       * a Cheerio instance and `.toArray()` on an array — neither exists.
       */
      'unicorn/prefer-iterator-to-array-at-end': 0,
      'unicorn/no-useless-iterator-to-array': 0,
      /*
       * The reported `${value}` wrappers coerce arguments at the API
       * boundary, where the types say `string` but JavaScript callers pass
       * numbers: `attr('width', 100)` has to store `"100"`, and `text(42)`
       * has to render `42`. Verified against all four sites.
       */
      'unicorn/no-useless-template-literals': 0,
      /*
       * Directly contradicts Biome's `useNumberNamespace`, which this repo
       * turns on and which rewrites `Infinity` back to
       * `Number.POSITIVE_INFINITY`. `eslint-config-biome` does not yet know
       * about this rule, so disable it here to stop the two formatters from
       * undoing each other.
       */
      'unicorn/prefer-global-number-constants': 0,

      /*
       * TODO: rules that only need renames. Each is mechanical but touches
       * hundreds of lines, so they are better done on their own.
       */

      /*
       * TODO(rename): 548 reports — `i` -> `index`, `str` -> `string_`,
       * `ret` -> `returnValue`, `el` -> `element`, `arr` -> `array`.
       */
      'unicorn/name-replacements': 0,
      /*
       * TODO(rename): 25 reports — booleans wanting an `is`/`has`/`should`
       * prefix, e.g. `cheerioOnly`, `removeAll`.
       */
      'unicorn/consistent-boolean-name': 0,
      /*
       * TODO(rename): 2 reports — the locals `setClass` and `removeAll` in
       * `src/api/attributes.ts` read as verbs but hold a string and a boolean.
       */
      'unicorn/no-non-function-verb-prefix': 0,
      /*
       * TODO(rename): 3 reports — `__fixtures__` and `__tests__` follow the
       * test-runner convention rather than kebab-case.
       */
      'unicorn/filename-case': 0,
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
      ...commonTypeScriptRules,
      // Enabling this in cheerio currently triggers broad churn across src + website.
      '@typescript-eslint/no-unnecessary-condition': 0,
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
      /*
       * The `http://` URLs here are fixture data for `attr()`/`css()` and XML
       * namespace URIs, which are identifiers rather than links to follow.
       */
      'unicorn/prefer-https': 0,
      /*
       * Reports cheerio's own `.find()` and `.map()`, which tests call for a
       * thrown error or for the callback's side effects.
       */
      'unicorn/no-unused-array-method-return': 0,
    },
  },

  // This file is not published, so it is not bound by the `engines` range.
  {
    files: ['eslint.config.js'],
    rules: {
      'n/no-unsupported-features/node-builtins': 0,
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
        tsconfigRootDir: `${import.meta.dirname}/website`,
      },
    },
  },

  // Prettier - must be the last configuration to override styling rules
  eslintConfigBiome,
);
