import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['test/**/*.spec.ts'],
    hookTimeout: 15000,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      include: ['src/**/*.ts'],
      exclude: ['src/index.ts', 'src/models/**/*.ts'],
      reporter: ['text', 'html', 'json-summary', 'json'],
    },
  },
});
