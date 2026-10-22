import { defineConfig, devices } from '@playwright/test';

const port = 4321;
const baseURL = `http://localhost:${port}`;

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `npm run build && npm run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
});
