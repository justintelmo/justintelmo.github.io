import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { contrastRatio, parseThemeTokens } from '../../src/lib/contrast';

const SPEC_TOKENS = [
  'bg',
  'surface',
  'text',
  'text-muted',
  'accent-magenta',
  'accent-blue',
  'accent-lavender',
  'border',
];

const FOREGROUNDS = ['text', 'text-muted', 'accent-magenta', 'accent-blue', 'accent-lavender'];
const BACKGROUNDS = ['bg', 'surface'];
const AA_NORMAL_TEXT = 4.5;

const tokens = parseThemeTokens(readFileSync('src/styles/theme.css', 'utf8'));

describe('contrastRatio', () => {
  it('is 21 for black on white', () => {
    expect(contrastRatio('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });

  it('matches the known WCAG value for #777777 on white', () => {
    expect(contrastRatio('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
  });

  it('does not depend on argument order', () => {
    expect(contrastRatio('#ffffff', '#777777')).toBe(contrastRatio('#777777', '#ffffff'));
  });
});

describe('theme.css', () => {
  it('keeps the system dark block identical to the toggled dark block', () => {
    expect(tokens.darkMedia).toEqual(tokens.dark);
  });

  it.each(['light', 'dark'] as const)('defines every spec token in %s mode', (mode) => {
    expect(Object.keys(tokens[mode]).sort()).toEqual([...SPEC_TOKENS].sort());
  });

  const pairs = (['light', 'dark'] as const).flatMap((mode) =>
    FOREGROUNDS.flatMap((fg) => BACKGROUNDS.map((bg) => [mode, fg, bg] as const)),
  );

  it.each(pairs)('%s: --%s on --%s meets WCAG AA', (mode, fg, bg) => {
    const ratio = contrastRatio(tokens[mode][fg]!, tokens[mode][bg]!);
    expect(ratio).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });

  // Filled buttons flip the pair: page background as text on an accent fill (rest and hover).
  const buttonPairs = (['light', 'dark'] as const).flatMap((mode) =>
    ['accent-blue', 'accent-magenta'].map((fill) => [mode, fill] as const),
  );

  it.each(buttonPairs)('%s: --bg on a --%s button meets WCAG AA', (mode, fill) => {
    expect(contrastRatio(tokens[mode].bg!, tokens[mode][fill]!)).toBeGreaterThanOrEqual(AA_NORMAL_TEXT);
  });
});
