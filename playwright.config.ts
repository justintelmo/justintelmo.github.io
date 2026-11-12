import { defineConfig, devices } from '@playwright/test';

const port = 4321;
const baseURL = `http://localhost:${port}`;
// The test build points the chat at a fake address; ask-chat.spec.ts answers it with page.route.
export const ASK_URL = 'https://ask.example.test/chat';

export default defineConfig({
  testDir: 'tests/e2e',
  forbidOnly: !!process.env.CI,
  // CI also writes an HTML report, uploaded when a run fails, with a trace for each failed test.
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: { baseURL, trace: process.env.CI ? 'retain-on-failure' : 'off' },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
  ],
  webServer: {
    command: `npm run build && npm run preview -- --port ${port}`,
    url: baseURL,
    env: { PUBLIC_ASK_URL: ASK_URL },
    reuseExistingServer: !process.env.CI,
  },
});
