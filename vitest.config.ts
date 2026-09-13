import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'],
    environment: 'jsdom',
    setupFiles: './tests/setup.ts',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
    },
  },
});
