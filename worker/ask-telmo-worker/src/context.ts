export const CONTEXT_TTL_MS = 10 * 60 * 1000;

// Lives as long as the isolate. Each isolate fetches at most once per TTL.
let cached: { text: string; at: number } | undefined;

// The site's ask-context.txt. Falls back to the last good copy when a refetch fails,
// and returns undefined only if it has never loaded.
export async function loadContext(url: string, now = Date.now()): Promise<string | undefined> {
	if (cached && now - cached.at < CONTEXT_TTL_MS) return cached.text;
	try {
		const res = await fetch(url);
		const text = res.ok ? await res.text() : "";
		if (text.trim()) {
			cached = { text, at: now };
			return text;
		}
		console.error(`ask-context fetch gave ${res.status} with ${text.length} chars`);
	} catch (err) {
		console.error("ask-context fetch failed", err);
	}
	return cached?.text;
}

export function resetContextCache(): void {
	cached = undefined;
}
