import { expect, test } from '@playwright/test';

// Fails until public/resume.pdf exists. That is on purpose: the site links to it, so it blocks deploy.
test('the resume PDF is served', async ({ request }) => {
  const response = await request.get('/resume.pdf');
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('pdf');
});
