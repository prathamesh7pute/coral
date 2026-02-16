import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.spec.ts'],
    fileParallelism: false,
    hookTimeout: 15000,
    testTimeout: 15000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json-summary', 'json']
    }
  }
})
