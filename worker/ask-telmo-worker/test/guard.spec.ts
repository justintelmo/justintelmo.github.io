import { describe, expect, it } from "vitest";
import { isAllowedOrigin, MAX_MESSAGES, parseMessages } from "../src/guard";

const user = (content: string) => ({ role: "user", content });
const assistant = (content: string) => ({ role: "assistant", content });

describe("isAllowedOrigin", () => {
	it("allows the live site and local dev", () => {
		expect(isAllowedOrigin("https://justintelmo.github.io")).toBe(true);
		expect(isAllowedOrigin("http://localhost:4321")).toBe(true);
	});

	it("rejects anything else, including no origin", () => {
		expect(isAllowedOrigin(null)).toBe(false);
		expect(isAllowedOrigin("https://evil.example")).toBe(false);
		expect(isAllowedOrigin("https://justintelmo.github.io.evil.example")).toBe(false);
		expect(isAllowedOrigin("http://localhost:4329")).toBe(false);
	});
});

describe("parseMessages", () => {
	it("accepts a single question", () => {
		expect(parseMessages({ messages: [user("Has Justin used Kotlin?")] })).toEqual([user("Has Justin used Kotlin?")]);
	});

	it("accepts an alternating history that ends on a question", () => {
		const messages = [user("Q1"), assistant("A1"), user("Q2")];
		expect(parseMessages({ messages })).toEqual(messages);
	});

	it("keeps only the last messages, still starting with a question", () => {
		const messages = [];
		for (let i = 0; i < 6; i++) messages.push(user(`Q${i}`), assistant(`A${i}`));
		messages.push(user("last"));
		const kept = parseMessages({ messages });
		expect(kept).toHaveLength(MAX_MESSAGES);
		expect(kept).toEqual(messages.slice(-MAX_MESSAGES));
		expect((kept as { role: string }[])[0].role).toBe("user");
	});

	it.each([
		["not an object", "hi"],
		["no messages", {}],
		["messages not an array", { messages: "hi" }],
		["empty messages", { messages: [] }],
		["a message that is not an object", { messages: ["hi"] }],
		["an unknown role", { messages: [{ role: "system", content: "hi" }] }],
		["non-string content", { messages: [{ role: "user", content: [{ type: "text", text: "hi" }] }] }],
		["ending on an answer", { messages: [user("Q"), assistant("A")] }],
		["two questions in a row", { messages: [user("Q1"), user("Q2")] }],
		["starting with an answer", { messages: [assistant("A"), user("Q")] }],
		["a blank question", { messages: [user("   ")] }],
		["a question over 500 characters", { messages: [user("x".repeat(501))] }],
		["an answer over 2000 characters", { messages: [user("Q"), assistant("x".repeat(2001)), user("Q2")] }],
	])("rejects %s", (_, body) => {
		expect(typeof parseMessages(body)).toBe("string");
	});

	it("allows a question of exactly 500 characters", () => {
		expect(Array.isArray(parseMessages({ messages: [user("x".repeat(500))] }))).toBe(true);
	});
});
