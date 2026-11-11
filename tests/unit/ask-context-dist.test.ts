import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const built = existsSync('dist/ask-context.txt');

// First line matching `key: value` in a markdown file's frontmatter, without surrounding quotes.
function field(dir: string, file: string, key: string): string {
  const match = readFileSync(join(dir, file), 'utf8').match(new RegExp(`^${key}:\\s*(.+?)\\s*$`, 'm'));
  if (!match) throw new Error(`${dir}/${file} has no "${key}"`);
  return match[1].replace(/^["']|["']$/g, '');
}

const files = (dir: string) => readdirSync(dir).filter((f) => f.endsWith('.md'));

// `npm run ci` builds before testing. Locally, run `npm run build` first or this skips.
// In CI a missing dist/ fails instead, so the guard can't quietly turn itself off.
describe.skipIf(!built && !process.env.CI)('dist/ask-context.txt (needs `npm run build`)', () => {
  const text = built ? readFileSync('dist/ask-context.txt', 'utf8') : '';

  it('exists and is not empty', () => {
    expect(text.length, 'dist/ask-context.txt is missing; build before running this test').toBeGreaterThan(0);
  });

  it.each(files('src/content/jobs'))('has the job in %s', (file) => {
    expect(text).toContain(field('src/content/jobs', file, 'studio'));
    expect(text).toContain(field('src/content/jobs', file, 'role'));
  });

  it.each(files('src/content/games'))('has the game in %s', (file) => {
    expect(text).toContain(field('src/content/games', file, 'title'));
  });
});
