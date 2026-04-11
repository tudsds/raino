import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['redteam/**/*.test.ts', 'integration/**/*.test.ts', 'e2e/**/*.test.ts'],
    environment: 'node',
    globals: true,
  },
});
