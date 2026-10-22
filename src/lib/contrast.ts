export type ThemeTokens = {
  light: Record<string, string>;
  dark: Record<string, string>;
  darkMedia: Record<string, string>;
};

// WCAG 2.x relative luminance of one sRGB channel (0-255).
function channel(value: number): number {
  const c = value / 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex.trim());
  if (!match) throw new Error(`Expected a #rrggbb color, got "${hex}"`);
  const [r, g, b] = match.slice(1).map((part) => channel(parseInt(part, 16)));
  return 0.2126 * r! + 0.7152 * g! + 0.0722 * b!;
}

export function contrastRatio(a: string, b: string): number {
  const [lighter, darker] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (lighter! + 0.05) / (darker! + 0.05);
}

function declarations(css: string, selector: RegExp, name: string): Record<string, string> {
  const block = selector.exec(css);
  if (!block) throw new Error(`theme.css is missing the ${name} block`);
  const tokens: Record<string, string> = {};
  for (const [, key, value] of block[1]!.matchAll(/--([\w-]+)\s*:\s*([^;]+);/g)) {
    tokens[key!] = value!.trim();
  }
  return tokens;
}

// Reads the three token blocks theme.css is required to have. See that file for the layout.
export function parseThemeTokens(css: string): ThemeTokens {
  return {
    light: declarations(css, /(?:^|\n):root\s*\{([^}]*)\}/, 'light :root'),
    darkMedia: declarations(css, /:root:not\(\[data-theme="light"\]\)\s*\{([^}]*)\}/, 'system dark'),
    dark: declarations(css, /:root\[data-theme="dark"\]\s*\{([^}]*)\}/, 'toggled dark'),
  };
}
