import { readFileSync } from 'node:fs';
import { defineConfig, type OxlintConfig } from 'oxlint';

/**
 * Rules turned off (each group says why they do not fit this code).
 *
 * @param rules The names of the rules.
 * @returns The rules, each turned off.
 */
const off = (...rules: string[]): Record<string, 'off'> =>
  Object.fromEntries(rules.map((rule) => [rule, 'off']));

const { dependencies } = JSON.parse(
  readFileSync(new URL('package.json', import.meta.url), 'utf8'),
) as { dependencies: Record<string, string> };
const runtimePackages = Object.keys(dependencies);

const config: OxlintConfig = defineConfig({
  plugins: [
    'eslint',
    'typescript',
    'unicorn',
    'oxc',
    'import',
    'jsdoc',
    'node',
    'promise',
    'vitest',
  ],
  // Every rule, except those turned off below.
  categories: {
    correctness: 'error',
    suspicious: 'error',
    pedantic: 'error',
    perf: 'error',
    style: 'error',
    restriction: 'error',
  },
  options: { typeAware: true, reportUnusedDisableDirectives: 'error' },
  env: { node: true },
  ignorePatterns: ['benchmark/documents/'],
  rules: {
    eqeqeq: ['error', 'smart'],
    'one-var': ['error', 'never'],
    'func-style': ['error', 'declaration', { allowArrowFunctions: true }],
    'prefer-arrow-callback': ['error', { allowNamedFunctions: true }],
    'prefer-destructuring': ['error', { object: true, array: false }],
    'capitalized-comments': [
      'error',
      'always',
      // (Lines continuing a comment continue its sentence.)
      { ignorePattern: 'oxfmt-ignore', ignoreConsecutiveComments: true },
    ],
    yoda: ['error', 'never'],
    curly: ['error', 'multi-line'],
    'no-unused-vars': [
      'error',
      { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
    ],
    'unicorn/catch-error-name': ['error', { name: 'error' }],
    'unicorn/numeric-separators-style': [
      'error',
      { hexadecimal: { onlyIfContainsSeparator: true } },
    ],
    'typescript/explicit-member-accessibility': [
      'error',
      { accessibility: 'no-public' },
    ],
    'typescript/no-confusing-void-expression': [
      'error',
      { ignoreArrowShorthand: true },
    ],
    'typescript/switch-exhaustiveness-check': [
      'error',
      { considerDefaultExhaustiveForUnions: true },
    ],
    'vitest/consistent-test-filename': [
      'error',
      { pattern: String.raw`.*\.spec\.[cm]?[jt]sx?$` },
    ],
    'jsdoc/check-tag-names': [
      'error',
      { definedTags: ['category', 'private'] },
    ],

    // DOM code uses familiar short names, indexed properties and numeric node data.
    ...off('no-magic-numbers', 'no-bitwise', 'id-length'),
    // The public API processes UTF-16 code units and uses nullish values for absence.
    ...off(
      'unicorn/prefer-code-point',
      'unicorn/no-null',
      'no-undefined',
      'unicorn/no-useless-undefined',
      'no-eq-null',
    ),
    // Modern syntax and the runtime's features are fine.
    ...off(
      'oxc/no-async-await',
      'oxc/no-optional-chaining',
      'oxc/no-rest-spread-properties',
      'no-plusplus',
      'no-continue',
      'no-ternary',
      'no-nested-ternary',
      'unicorn/no-nested-ternary',
      'unicorn/no-array-reduce',
      'no-await-in-loop',
      'promise/avoid-new',
      'promise/prefer-await-to-then',
      'node/no-top-level-await',
      'node/no-sync',
      'import/no-nodejs-modules',
      'unicorn/import-style',
    ),
    // The type-aware rule also allows directly returning a promise in TypeScript.
    ...off('require-await'),
    'typescript/require-await': 'error',
    // Sizes, and orders that do not follow the code's structure.
    ...off(
      'max-params',
      'max-statements',
      'max-lines',
      'max-lines-per-function',
      'max-classes-per-file',
      'unicorn/max-nested-calls',
      'max-depth',
      'complexity',
      'import/max-dependencies',
      'no-warning-comments',
      'sort-keys',
      'no-use-before-define',
      'no-inline-comments',
      'init-declarations',
    ),
    // Keep the established import order and module export structure.
    ...off(
      'sort-imports',
      'import/consistent-type-specifier-style',
      'import/no-named-export',
      'import/no-default-export',
      'import/prefer-default-export',
      'import/group-exports',
      'import/exports-last',
      'import/no-relative-parent-imports',
      'import/first',
      'import/no-namespace',
      'oxc/no-barrel-file',
    ),
    // The formatter writes hex digits in lowercase.
    ...off('unicorn/number-literal-case'),
    // TypeScript has the types (and infers them for readonly values and assertions).
    ...off(
      'jsdoc/require-param-type',
      'jsdoc/require-returns-type',
      'jsdoc/require-yields-type',
      'jsdoc/require-throws-type',
      'typescript/prefer-readonly-parameter-types',
      'typescript/no-unsafe-type-assertion',
      'typescript/no-non-null-assertion',
      'typescript/promise-function-async',
    ),
    // Method signatures, mapped types, `{}` and type aliases are chosen for how they check and infer.
    ...off(
      'typescript/method-signature-style',
      'typescript/consistent-indexed-object-style',
      'typescript/consistent-type-definitions',
      'typescript/ban-types',
      'no-redeclare',
    ),
    // Functions converting values declare the types they convert.
    ...off('unicorn/prefer-native-coercion-functions'),
    // Tests use tables, assertion helpers and exact boolean comparisons.
    ...off(
      'vitest/prefer-expect-assertions',
      'vitest/require-test-timeout',
      'vitest/no-conditional-in-test',
      'vitest/no-importing-vitest-globals',
      'vitest/require-hook',
      'vitest/max-expects',
      'vitest/prefer-describe-function-title',
      'vitest/prefer-to-be-truthy',
      'vitest/prefer-to-be-falsy',
      'vitest/prefer-strict-boolean-matchers',
      'vitest/prefer-strict-equal',
      'vitest/prefer-to-have-length',
      'vitest/prefer-to-be',
      'vitest/prefer-expect-type-of',
      'vitest/prefer-lowercase-title',
      'vitest/padding-around-test-blocks',
      'vitest/no-hooks',
      'vitest/no-conditional-tests',
    ),
    // Some API members and DOM internals have leading underscores.
    ...off('no-underscore-dangle'),
    // Public APIs and their tests still exercise deprecated compatibility paths.
    ...off('typescript/no-deprecated', 'typescript/no-invalid-void-type'),
    // Preserve runtime guards, coercion and overloads for untyped callers.
    ...off(
      'typescript/no-unnecessary-condition',
      'typescript/strict-boolean-expressions',
      'typescript/no-unnecessary-template-expression',
      'typescript/no-unnecessary-type-conversion',
      'no-implicit-coercion',
      'typescript/consistent-return',
    ),
    // Existing traversal and mutation idioms keep lookup and iteration costs predictable.
    ...off(
      'typescript/prefer-for-of',
      'unicorn/no-array-callback-reference',
      'unicorn/prefer-array-find',
      'unicorn/prefer-at',
      'unicorn/prefer-string-replace-all',
      'no-multi-assign',
      'no-param-reassign',
      'typescript/no-dynamic-delete',
    ),
    // Existing regular expressions deliberately use code units and positional captures.
    ...off('require-unicode-regexp', 'prefer-named-capture-group'),
    // Inference, local names and explicit early exits are sufficient here.
    ...off(
      'typescript/explicit-function-return-type',
      'typescript/explicit-module-boundary-types',
      'no-shadow',
      'func-names',
      'no-useless-return',
      'class-methods-use-this',
      'default-case',
    ),
    // Cheerio exposes callbacks. Some APIs accept a callback whose result they ignore.
    ...off(
      'promise/prefer-await-to-callbacks',
      'typescript/strict-void-return',
    ),
    // These node-type strings and domhandler's enum represent the same values.
    ...off('typescript/no-unsafe-enum-assignment'),
  },
  overrides: [
    {
      files: ['**/*.{cjs,js,jsx,mjs}'],
      rules: { 'no-undef': 'error' },
    },
    {
      files: ['src/**'],
      excludeFiles: [
        '**/*.spec.{js,jsx,ts,tsx,mjs,mts,cjs,cts}',
        '**/__fixtures__/**',
        '**/__tests__/**',
      ],
      // Published files can only use dependencies installed for consumers.
      rules: {
        'no-restricted-imports': [
          'error',
          {
            patterns: [
              {
                regex: String.raw`^\.\.?/(?:(?:.*/)?(?:__fixtures__|__tests__)(?:/|$)|.*\.spec\.[cm]?[jt]sx?$)`,
                message:
                  'Published files cannot import test fixtures or tests.',
              },
              {
                regex: String.raw`^\.\.?/(?:.*/)?\.\.(?:/|$)`,
                message: 'Use direct paths within src for published imports.',
              },
              {
                group: [
                  '**',
                  ...runtimePackages.map((name) => `!${name}`),
                  '!node:*',
                  // Recheck paths so a package name only matches at the start.
                  '*/**',
                  '!./**',
                  '!../**',
                  '!node:*/**',
                  ...runtimePackages
                    .filter((name) => name.startsWith('@'))
                    .map((name) => `!${name}`),
                  ...runtimePackages.map((name) => `!${name}/**`),
                ],
                message:
                  'Declare runtime imports in package.json dependencies.',
              },
            ],
          },
        ],
      },
    },
    {
      files: ['src/*.{js,jsx,ts,tsx,mjs,mts,cjs,cts}'],
      excludeFiles: ['**/*.spec.{js,jsx,ts,tsx,mjs,mts,cjs,cts}'],
      // A parent import from a top-level source file would leave src.
      rules: { 'import/no-relative-parent-imports': 'error' },
    },
    {
      files: ['src/api/**', 'src/static.ts'],
      // These functions are bound to Cheerio instances or cheerio's querying function.
      rules: off('oxc/no-this-in-exported-function'),
    },
    {
      files: ['src/cheerio.ts'],
      // Object.assign implements the interface merge; prevObject stores any node type.
      rules: off(
        'typescript/no-unsafe-declaration-merging',
        'typescript/no-explicit-any',
      ),
    },
    {
      files: ['src/api/attributes.ts'],
      // TypeDoc uses separate overloads to document distinct behaviors.
      rules: off('typescript/unified-signatures'),
    },
    {
      files: ['src/slim.ts'],
      // The dom-serializer package exposes the same renderer as its named and default exports.
      rules: off('import/no-named-as-default'),
    },
    {
      files: ['src/load.ts', 'src/api/traversing.ts'],
      // Preserve the public documentation during the tooling migration.
      rules: off('jsdoc/require-returns'),
    },
    {
      files: ['scripts/fetch-sponsors.mts', 'website/**/*.mjs'],
      // These scripts consume dynamic sponsor and crawler API payloads.
      rules: off(
        'typescript/no-unsafe-argument',
        'typescript/no-unsafe-assignment',
        'typescript/no-unsafe-call',
        'typescript/no-unsafe-member-access',
        'typescript/no-unsafe-return',
        'typescript/prefer-nullish-coalescing',
      ),
    },
    {
      files: ['scripts/fetch-sponsors.mts'],
      // The API payload shapes are dynamic.
      rules: off('typescript/no-explicit-any'),
    },
    {
      files: ['website/src/env.d.ts'],
      // Astro's ambient declarations use references and remain a script.
      rules: off('import/unambiguous', 'typescript/triple-slash-reference'),
    },
    {
      files: ['**/*.spec.ts'],
      env: { vitest: true },
      // Tests exercise thrown errors, JavaScript callers and missing array slots.
      rules: {
        'no-explicit-any': 'off',
        'vitest/expect-expect': [
          'error',
          { assertFunctionNames: ['expect', 'testAppleSelect'] },
        ],
        ...off('typescript/no-generated-empty-object-type', 'no-extend-native'),
      },
    },
    {
      files: ['benchmark/**', 'scripts/**', 'website/scripts/**'],
      rules: off('no-console', 'node/no-process-env'),
    },
    {
      files: ['website/src/**'],
      env: { browser: true },
      // Keep existing browser API calls, Astro blocks and template conventions.
      rules: off(
        'unicorn/prefer-global-this',
        'unicorn/prefer-query-selector',
        'unicorn/prefer-add-event-listener',
        'unicorn/consistent-existence-index-check',
        'oxc/no-map-spread',
      ),
    },
    {
      files: ['website/src/components/Hero.astro'],
      // Allow the existing unbraced single-statement early return.
      rules: { curly: ['error', 'multi-or-nest'] },
    },
    {
      files: ['**/*.astro'],
      // Astro frontmatter and inline scripts follow the component's scope.
      rules: off(
        'unicorn/filename-case',
        'import/unambiguous',
        'import/no-unassigned-import',
        'no-implicit-globals',
        'logical-assignment-operators',
        'unicorn/no-array-for-each',
        'prefer-rest-params',
        'capitalized-comments',
        'typescript/array-type',
        'typescript/no-explicit-any',
      ),
    },
  ],
});

export default config;
