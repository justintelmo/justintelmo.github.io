import { env, SELF } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { resetContextCache } from "../src/context";

const SITE = "https://justintelmo.github.io";
const URL = "https://ask.example/chat";

// Each call gets its own IP unless one is given, so tests don't share a rate limit count.
let nextIp = 1;
function post(body: string, origin: string | null = SITE, ip = `203.0.113.${nextIp++}`) {
	const headers: Record<string, string> = { "Content-Type": "application/json", "CF-Connecting-IP": ip };
	if (origin) headers.Origin = origin;
	return SELF.fetch(URL, { method: "POST", headers, body });
}

// No network in tests: the site's context comes from this stub unless a test overrides it.
let fetchSpy: MockInstance<typeof fetch>;
beforeEach(() => {
	fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async () => new Response("context"));
});
afterEach(() => {
	vi.restoreAllMocks();
	resetContextCache();
});

const question = JSON.stringify({ messages: [{ role: "user", content: "Has Justin used Kotlin?" }] });

describe("request guard", () => {
	it("rejects other origins and requests with no origin", async () => {
		for (const origin of ["https://evil.example", null]) {
			const res = await post(question, origin);
			expect(res.status).toBe(403);
			expect(res.headers.get("Access-Control-Allow-Origin")).toBeNull();
		}
	});

	it("answers the CORS preflight for an allowed origin", async () => {
		const res = await SELF.fetch(URL, { method: "OPTIONS", headers: { Origin: "http://localhost:4321" } });
		expect(res.status).toBe(204);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe("http://localhost:4321");
		expect(res.headers.get("Access-Control-Allow-Methods")).toBe("POST");
		expect(res.headers.get("Access-Control-Allow-Headers")).toBe("Content-Type");
	});

	it("404s other paths and 405s other methods, with CORS headers", async () => {
		const notFound = await SELF.fetch("https://ask.example/", { headers: { Origin: SITE } });
		expect(notFound.status).toBe(404);
		expect(notFound.headers.get("Access-Control-Allow-Origin")).toBe(SITE);

		const wrongMethod = await SELF.fetch(URL, { headers: { Origin: SITE } });
		expect(wrongMethod.status).toBe(405);
		expect(wrongMethod.headers.get("Allow")).toBe("POST, OPTIONS");
	});

	it("400s bad JSON and bad messages, with a JSON error the page can read", async () => {
		for (const body of ["not json", JSON.stringify({ messages: [] })]) {
			const res = await post(body);
			expect(res.status).toBe(400);
			expect(res.headers.get("Access-Control-Allow-Origin")).toBe(SITE);
			expect(await res.json()).toHaveProperty("error");
		}
	});

	it("413s an oversized body before parsing it", async () => {
		const res = await post(JSON.stringify({ messages: [{ role: "user", content: "x".repeat(30_000) }] }));
		expect(res.status).toBe(413);
	});

	it("429s the 11th request in a minute from one IP, with CORS headers", async () => {
		const ip = "198.51.100.7";
		for (let i = 0; i < 10; i++) expect((await post(question, SITE, ip)).status).not.toBe(429);
		const limited = await post(question, SITE, ip);
		expect(limited.status).toBe(429);
		expect(limited.headers.get("Access-Control-Allow-Origin")).toBe(SITE);
		expect((await post(question, SITE, "198.51.100.8")).status).not.toBe(429);
	});

});

describe("site context", () => {
	it("503s when the context has never loaded", async () => {
		fetchSpy.mockResolvedValue(new Response("missing", { status: 404 }));
		const res = await post(question);
		expect(res.status).toBe(503);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe(SITE);
	});

	// Task 5 replaces the 501 with the Claude call.
	it("lets a valid question through once the context loads", async () => {
		const res = await post(question);
		expect(res.status).toBe(501);
		expect(fetchSpy).toHaveBeenCalledWith(env.CONTEXT_URL);
	});
});
