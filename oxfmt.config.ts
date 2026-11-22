import { defineConfig, type OxfmtConfig } from 'oxfmt';

const config: OxfmtConfig = defineConfig({
  printWidth: 80,
  tabWidth: 2,
  singleQuote: true,
  trailingComma: 'all',
  sortImports: false,
  sortPackageJson: false,
  embeddedLanguageFormatting: 'off',
  // Oxfmt formats Astro markup along with frontmatter.
  ignorePatterns: [
    'benchmark/documents/',
    '**/*.astro',
    '**/*.mdx',
    '**/*.svg',
  ],
  overrides: [
    {
      files: ['**/*.css', '**/*.yml', '**/*.yaml'],
      options: { singleQuote: false },
    },
  ],
});

export default config;
