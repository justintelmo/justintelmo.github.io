import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PHONE } from './phone';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return htmlFiles(path);
    return entry.name.endsWith('.html') ? [path] : [];
  });
}

const built = existsSync('dist');

// `npm run ci` builds before testing. Locally, run `npm run build` first or this scan skips.
// In CI a missing dist/ fails instead, so the guard can't quietly turn itself off.
describe.skipIf(!built && !process.env.CI)('phone number scan of the built site (needs `npm run build`)', () => {
  const files = built ? htmlFiles('dist') : [];

  it('finds built pages to scan', () => {
    expect(files.length, 'dist/ is missing or empty; build before running this test').toBeGreaterThan(0);
  });

  it.each(files)('%s has no phone number', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(PHONE);
  });
});
