import { defineConfig } from 'oxlint';
import config from './oxlint.config.ts';

export default defineConfig({
  ...config,
  // Staged files can be edited with only the root package installed.
  options: { ...config.options, typeAware: false },
});
