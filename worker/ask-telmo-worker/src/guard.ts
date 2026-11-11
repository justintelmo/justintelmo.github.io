export const ALLOWED_ORIGINS = ["https://justintelmo.github.io", "http://localhost:4321"];
export const MAX_QUESTION_CHARS = 500;
// The browser sends the whole history, so answers are capped too: otherwise a fake
// "assistant" turn could carry any amount of text into the request we pay for.
export const MAX_ANSWER_CHARS = 2000;
// Odd, so the kept history still starts with a question: three exchanges plus the new one.
export const MAX_MESSAGES = 7;
export const MAX_BODY_CHARS = 20_000;

export type ChatMessage = { role: "user" | "assistant"; content: string };

export function isAllowedOrigin(origin: string | null): origin is string {
	return origin !== null && ALLOWED_ORIGINS.includes(origin);
}

// The last MAX_MESSAGES messages, or a short reason the request is invalid.
export function parseMessages(body: unknown): ChatMessage[] | string {
	const all = (body as { messages?: unknown } | null)?.messages;
	if (!Array.isArray(all) || all.length === 0) return 'Expected {"messages": [...]} with at least one message.';

	const kept = all.slice(-MAX_MESSAGES);
	for (const [i, m] of kept.entries()) {
		const expected = i % 2 === 0 ? "user" : "assistant";
		if (typeof m !== "object" || m === null || m.role !== expected || typeof m.content !== "string") {
			return "Messages must be {role, content} strings, alternating, starting and ending with a question.";
		}
		if (expected === "user" && (m.content.trim() === "" || m.content.length > MAX_QUESTION_CHARS)) {
			return `Questions must be 1 to ${MAX_QUESTION_CHARS} characters.`;
		}
		if (expected === "assistant" && m.content.length > MAX_ANSWER_CHARS) return "An earlier answer is too long.";
	}
	if (kept.length % 2 === 0) return "The last message must be a question.";
	return kept as ChatMessage[];
}
