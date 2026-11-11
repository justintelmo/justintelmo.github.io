import { afterEach, describe, expect, it, vi } from "vitest";
import { CONTEXT_TTL_MS, loadContext, resetContextCache } from "../src/context";

const URL = "https://site.example/ask-context.txt";

function stubFetch(...responses: (Response | Error)[]) {
	const spy = vi.spyOn(globalThis, "fetch");
	for (const r of responses) {
		if (r instanceof Error) spy.mockRejectedValueOnce(r);
		else spy.mockResolvedValueOnce(r);
	}
	return spy;
}

afterEach(() => {
	vi.restoreAllMocks();
	resetContextCache();
});

describe("loadContext", () => {
	it("fetches the context and reuses it within the TTL", async () => {
		const spy = stubFetch(new Response("context v1"));
		expect(await loadContext(URL, 0)).toBe("context v1");
		expect(await loadContext(URL, CONTEXT_TTL_MS - 1)).toBe("context v1");
		expect(spy).toHaveBeenCalledTimes(1);
		expect(spy).toHaveBeenCalledWith(URL);
	});

	it("refetches after the TTL", async () => {
		stubFetch(new Response("context v1"), new Response("context v2"));
		await loadContext(URL, 0);
		expect(await loadContext(URL, CONTEXT_TTL_MS)).toBe("context v2");
	});

	it("keeps the last good copy when a refetch fails", async () => {
		stubFetch(new Response("context v1"), new Response("oops", { status: 500 }), new Error("network down"));
		await loadContext(URL, 0);
		expect(await loadContext(URL, CONTEXT_TTL_MS)).toBe("context v1");
		expect(await loadContext(URL, CONTEXT_TTL_MS + 1)).toBe("context v1");
	});

	it("returns undefined when it has never loaded", async () => {
		stubFetch(new Response("missing", { status: 404 }), new Error("network down"), new Response("   "));
		expect(await loadContext(URL, 0)).toBeUndefined();
		expect(await loadContext(URL, 1)).toBeUndefined();
		expect(await loadContext(URL, 2)).toBeUndefined();
	});
});
