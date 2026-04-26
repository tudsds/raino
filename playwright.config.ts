import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: 0,
  use: {
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'site',
      testMatch: /(site|multilingual).*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3000' },
    },
    {
      name: 'studio',
      testMatch: /studio\/.*\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], baseURL: 'http://localhost:3001' },
    },
  ],
  webServer: [
    {
      command: 'pnpm dev --filter @raino/site',
      port: 3000,
      reuseExistingServer: true,
      timeout: 120000,
    },
    {
      command: 'MOCK_LLM=true pnpm dev --filter @raino/studio',
      port: 3001,
      reuseExistingServer: true,
      timeout: 120000,
    },
  ],
});
