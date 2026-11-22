import { defineConfig, type OxfmtConfig } from 'oxfmt';

const config: OxfmtConfig = defineConfig({
  printWidth: 80,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  sortImports: false,
  sortPackageJson: false,
  embeddedLanguageFormatting: 'off',
  // Keep the existing formatter's file set. API docs and other generated
  // files are also excluded through .gitignore.
  ignorePatterns: ['benchmark/documents/', '**/*.mdx'],
  associations: [{ files: ['**/*.svg'], language: 'html' }],
  astro: true,
  overrides: [
    {
      files: ['**/*.css', '**/*.yml', '**/*.yaml'],
      options: { singleQuote: false },
    },
    {
      files: ['**/*.astro'],
      options: { embeddedLanguageFormatting: 'auto' },
    },
  ],
});

export default config;
