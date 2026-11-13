import { DurableObject } from "cloudflare:workers";

// The daily caps behind the per-minute limiter: one count per IP and one for everyone,
// so a script spread over many IPs still can't spend the month's budget in a day.
// It is one object on purpose. A global count needs one place to live, and chat traffic is
// far below the roughly 1,000 requests a second a single object can serve.
const GLOBAL = "*";

export class DailyQuota extends DurableObject<Env> {
	constructor(ctx: DurableObjectState, env: Env) {
		super(ctx, env);
		ctx.blockConcurrencyWhile(async () => {
			ctx.storage.sql.exec(
				"CREATE TABLE IF NOT EXISTS counts (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL, PRIMARY KEY (day, key))",
			);
		});
	}

	// Counts one question for `key` and for everyone, unless either is already at its limit.
	// No awaits inside, so concurrent calls can't both read the same count.
	take(day: string, key: string, perKeyLimit: number, globalLimit: number): boolean {
		const sql = this.ctx.storage.sql;
		sql.exec("DELETE FROM counts WHERE day <> ?", day);
		const count = (k: string) =>
			sql.exec<{ n: number }>("SELECT n FROM counts WHERE day = ? AND key = ?", day, k).toArray()[0]?.n ?? 0;

		if (count(GLOBAL) >= globalLimit || count(key) >= perKeyLimit) return false;
		for (const k of [GLOBAL, key]) {
			sql.exec(
				"INSERT INTO counts (day, key, n) VALUES (?, ?, 1) ON CONFLICT (day, key) DO UPDATE SET n = n + 1",
				day,
				k,
			);
		}
		return true;
	}
}

// The UTC date, so every visitor's day rolls over at the same moment.
export function today(): string {
	return new Date().toISOString().slice(0, 10);
}

// Keeps raw addresses out of storage. Not anonymous (IPv4 is small enough to brute-force),
// but rows only live until the day ends.
export async function quotaKey(ip: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(ip));
	return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}
