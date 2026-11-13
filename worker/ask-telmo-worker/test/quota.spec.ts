import { env, runInDurableObject, SELF } from "cloudflare:test";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { resetContextCache } from "../src/context";
import { quotaKey, today } from "../src/quota";
import { claudeStream } from "./claude-fake";

// Each test gets its own object, so counts never leak between tests.
let nextName = 1;
const freshQuota = () => env.DAILY_QUOTA.getByName(`test-${nextName++}`);

describe("DailyQuota", () => {
	it("allows questions up to the per-IP limit, then refuses that IP but not others", async () => {
		const quota = freshQuota();
		for (let i = 0; i < 3; i++) expect(await quota.take("2026-11-13", "a", 3, 100)).toBe(true);
		expect(await quota.take("2026-11-13", "a", 3, 100)).toBe(false);
		expect(await quota.take("2026-11-13", "b", 3, 100)).toBe(true);
	});

	it("refuses everyone once the global limit is reached", async () => {
		const quota = freshQuota();
		for (const key of ["a", "b", "c"]) expect(await quota.take("2026-11-13", key, 10, 3)).toBe(true);
		expect(await quota.take("2026-11-13", "d", 10, 3)).toBe(false);
	});

	it("a refused question does not use up any count", async () => {
		const quota = freshQuota();
		expect(await quota.take("2026-11-13", "a", 1, 2)).toBe(true);
		expect(await quota.take("2026-11-13", "a", 1, 2)).toBe(false);
		// If the refusal above had counted globally, "b" would now be over the global limit of 2.
		expect(await quota.take("2026-11-13", "b", 1, 2)).toBe(true);
	});

	it("starts over on a new day and deletes the old day's rows", async () => {
		const quota = freshQuota();
		expect(await quota.take("2026-11-13", "a", 1, 1)).toBe(true);
		expect(await quota.take("2026-11-13", "a", 1, 1)).toBe(false);
		expect(await quota.take("2026-11-14", "a", 1, 1)).toBe(true);

		const days = await runInDurableObject(quota, (_, state) =>
			state.storage.sql.exec<{ day: string }>("SELECT DISTINCT day FROM counts").toArray(),
		);
		expect(days).toEqual([{ day: "2026-11-14" }]);
	});

	it("keys IPs by a hash, not the raw address", async () => {
		const key = await quotaKey("203.0.113.9");
		expect(key).toMatch(/^[0-9a-f]{64}$/);
		expect(key).not.toContain("203.0.113.9");
		expect(await quotaKey("203.0.113.9")).toBe(key);
	});
});

describe("the Worker", () => {
	const SITE = "https://justintelmo.github.io";
	const question = JSON.stringify({ messages: [{ role: "user", content: "Has Justin used Kotlin?" }] });
	const post = (ip: string, body = question) =>
		SELF.fetch("https://ask.example/chat", {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: SITE, "CF-Connecting-IP": ip },
			body,
		});
	const ipCount = async (ip: string) => {
		const key = await quotaKey(ip);
		return runInDurableObject(env.DAILY_QUOTA.getByName("chat"), (_, state) =>
			state.storage.sql.exec<{ n: number }>("SELECT n FROM counts WHERE key = ?", key).toArray()[0]?.n ?? 0,
		);
	};

	beforeEach(() => {
		vi.spyOn(globalThis, "fetch").mockImplementation(async (input, init) => {
			const request = new Request(input, init);
			if (!request.url.startsWith("https://api.anthropic.com/")) return new Response("SITE CONTEXT\n");
			return claudeStream(["Yes."]);
		});
	});
	afterEach(() => {
		vi.restoreAllMocks();
		resetContextCache();
	});

	it("429s an IP that has used its daily questions, with CORS headers and no Claude call", async () => {
		const ip = "198.51.100.1";
		const quota = env.DAILY_QUOTA.getByName("chat");
		const key = await quotaKey(ip);
		const perIp = env.DAILY_LIMIT_PER_IP;
		for (let i = 0; i < perIp; i++) await quota.take(today(), key, perIp, env.DAILY_LIMIT_TOTAL);

		const res = await post(ip);
		expect(res.status).toBe(429);
		expect(res.headers.get("Access-Control-Allow-Origin")).toBe(SITE);
		expect(await res.json()).toEqual({ error: "The chat has hit its limit for today. Try again tomorrow, or email Justin." });
		expect(vi.mocked(fetch)).not.toHaveBeenCalled();
	});

	it("counts an answered question, but not a rejected one", async () => {
		const ip = "198.51.100.2";
		expect((await post(ip, "not json")).status).toBe(400);
		expect(await ipCount(ip)).toBe(0);

		const res = await post(ip);
		expect(res.status).toBe(200);
		await res.text();
		expect(await ipCount(ip)).toBe(1);
	});
});
