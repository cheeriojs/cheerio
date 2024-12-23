import { defineConfig, type ViteUserConfig } from 'vitest/config';

const config: ViteUserConfig = defineConfig({
  test: {
    coverage: {
      exclude: [
        'benchmark/**',
        'scripts/**',
        'website/**',
        'dist/**',
        '*.config.ts',
      ],
    },
  },
});

export default config;
