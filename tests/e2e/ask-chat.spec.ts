import { expect, test, type Page, type Request } from '@playwright/test';
import { ASK_URL } from '../../playwright.config';

// Every test answers the Worker with page.route, so nothing here reaches the real chat.
const ask = async (page: Page, question: string) => {
  await page.getByLabel('Your question').fill(question);
  await page.getByRole('button', { name: 'Ask' }).click();
};

const sentMessages = (request: Request) => (request.postDataJSON() as { messages: unknown[] }).messages;

test('shows the streamed answer and sends earlier turns with the next question', async ({ page }) => {
  const requests: Request[] = [];
  await page.route(ASK_URL, (route) => {
    requests.push(route.request());
    return route.fulfill({ contentType: 'text/plain; charset=utf-8', body: `Answer ${requests.length}.` });
  });
  await page.goto('/');

  await ask(page, 'What does Justin do?');
  const log = page.getByRole('log');
  await expect(log).toContainText('What does Justin do?');
  await expect(log).toContainText('Answer 1.');

  await ask(page, 'And before that?');
  await expect(log).toContainText('Answer 2.');
  expect(sentMessages(requests[1])).toEqual([
    { role: 'user', content: 'What does Justin do?' },
    { role: 'assistant', content: 'Answer 1.' },
    { role: 'user', content: 'And before that?' },
  ]);
});

test('sends only the last seven messages, like the Worker keeps', async ({ page }) => {
  const requests: Request[] = [];
  await page.route(ASK_URL, (route) => {
    requests.push(route.request());
    return route.fulfill({ contentType: 'text/plain', body: `A${requests.length}` });
  });
  await page.goto('/');

  for (let i = 1; i <= 5; i++) {
    await ask(page, `Q${i}`);
    await expect(page.getByRole('log')).toContainText(`A${i}`);
  }
  const last = sentMessages(requests[4]);
  expect(last).toHaveLength(7);
  expect(last[0]).toEqual({ role: 'user', content: 'Q2' });
});

test('a rate-limited question shows the Worker message and is left out of history', async ({ page }) => {
  const requests: Request[] = [];
  await page.route(ASK_URL, (route) => {
    requests.push(route.request());
    return requests.length === 1
      ? route.fulfill({ status: 429, json: { error: 'Too many questions. Try again in a minute.' } })
      : route.fulfill({ contentType: 'text/plain', body: 'Fine now.' });
  });
  await page.goto('/');

  await ask(page, 'First try');
  await expect(page.getByRole('log')).toContainText('Too many questions. Try again in a minute.');

  await ask(page, 'Second try');
  await expect(page.getByRole('log')).toContainText('Fine now.');
  expect(sentMessages(requests[1])).toEqual([{ role: 'user', content: 'Second try' }]);
});

test('a network failure shows a fallback message and the form works again', async ({ page }) => {
  await page.route(ASK_URL, (route) => route.abort());
  await page.goto('/');

  await ask(page, 'Hello?');
  await expect(page.getByRole('log')).toContainText("The chat isn't reachable right now.");
  await expect(page.getByRole('button', { name: 'Ask' })).toBeEnabled();
});
