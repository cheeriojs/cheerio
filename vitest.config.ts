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
    typecheck: {
      enabled: true,
      include: ['src/api/extract.spec.ts'],
    },
  },
});

export default config;
