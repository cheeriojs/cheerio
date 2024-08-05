import { defineConfig } from 'vitest/config';

export default defineConfig({
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
