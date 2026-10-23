import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { extname, join } from 'node:path';
import { describe, expect, it } from 'vitest';

// The resume has a phone number on it. Drafting copy from it makes a leak easy, so scan for one.
const PHONE = /\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/;
const BINARY = new Set(['.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.ico', '.pdf', '.woff', '.woff2']);

function textFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return textFiles(path);
    return BINARY.has(extname(entry.name).toLowerCase()) ? [] : [path];
  });
}

describe('phone number scan', () => {
  const files = [...textFiles('src'), ...textFiles('public')];

  it('finds files to scan', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it.each(files)('%s has no phone number', (file) => {
    expect(readFileSync(file, 'utf8')).not.toMatch(PHONE);
  });
});
