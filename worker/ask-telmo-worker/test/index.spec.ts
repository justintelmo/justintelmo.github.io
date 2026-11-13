import { env, SELF } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it, type MockInstance, vi } from "vitest";
import { FALLBACK, MAX_TOKENS, MODEL, RULES } from "../src/answer";
import { resetContextCache } from "../src/context";
import { claudeError, claudeStream } from "./claude-fake";

const SITE = "https://justintelmo.github.io";
const URL = "https://ask.example/chat";

// Each call gets its own IP unless one is given, so tests don't share a rate limit count.
let nextIp = 1;
function post(body: string, origin: string | null = SITE, ip = `203.0.113.${nextIp++}`) {
	const headers: Record<string, string> = { "Content-Type": "application/json", "CF-Connecting-IP": ip };
	if (origin) headers.Origin = origin;
	return SELF.fetch(URL, { method: "POST", headers, body });
}

// No network in tests. The SDK calls the global fetch too, so one stub serves both the
// site's context and the Claude API. Tests swap `claude` to change the API's answer.
let fetchSpy: MockInstance<typeof fetch>;
let claude: () => Response;
const claudeRequests: { headers: Headers; body: Record<string, unknown> }[] = [];
beforeEach(() => {
	claude = () => claudeStream(["Justin ", "used Kotlin at Glu."]);
	claudeRequests.length = 0;
	fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
		const request = new Request(input, init);
		if (!request.url.startsWith("https://api.anthropic.com/")) return new Response("SITE CONTEXT\n");
		claudeRequests.push({ headers: request.headers, body: await request.json() });
		return claude();
	});
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

	it("fetches the context from CONTEXT_URL", async () => {
		await (await post(question)).text();
		expect(fetchSpy).toHaveBeenCalledWith(env.CONTEXT_URL);
	});
});

describe("answering", () => {
	it("streams Claude's text back as plain text, with CORS headers", async () => {
		const res = await post(question);
		expect(res.status).toBe(200);
		expect(res.headers.get("Content-Type")).toBe("text/plain; charset=utf-8");
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe(SITE);
		expect(await res.text()).toBe("Justin used Kotlin at Glu.");
	});

	it("sends the cheap, grounded request the plan calls for", async () => {
		await (await post(question)).text();
		const [{ headers, body }] = claudeRequests;
		expect(headers.get("authorization")).toBe("Bearer test-key");
		expect(body).toMatchObject({
			model: MODEL,
			max_tokens: MAX_TOKENS,
			stream: true,
			thinking: { type: "disabled" },
			output_config: { effort: "low" },
			messages: [{ role: "user", content: "Has Justin used Kotlin?" }],
		});
		expect(body.system).toEqual([
			{ type: "text", text: RULES },
			{ type: "text", text: "<context>\nSITE CONTEXT\n</context>", cache_control: { type: "ephemeral" } },
		]);
	});

	it("sends the same system prompt bytes for different questions, so the cache hits", async () => {
		await (await post(question)).text();
		await (await post(JSON.stringify({ messages: [{ role: "user", content: "Where did Justin use PHP?" }] }))).text();
		expect(JSON.stringify(claudeRequests[1].body.system)).toBe(JSON.stringify(claudeRequests[0].body.system));
	});

	it("logs usage, including cache reads", async () => {
		const log = vi.spyOn(console, "log");
		await (await post(question)).text();
		expect(log).toHaveBeenCalledWith(expect.stringContaining('"cache_read_input_tokens":3000'));
	});

	it("adds the fallback line when Claude refuses", async () => {
		claude = () => claudeStream(["Partial"], "refusal");
		expect(await (await post(question)).text()).toBe(`Partial\n\n${FALLBACK}`);
	});

	it("answers with the fallback line when the API call fails", async () => {
		vi.spyOn(console, "error").mockImplementation(() => {});
		claude = () => claudeError(400);
		const res = await post(question);
		expect(res.status).toBe(200);
		expect(await res.text()).toBe(FALLBACK);
	});
});
