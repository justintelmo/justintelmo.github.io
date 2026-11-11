// A minimal Messages API stream, so the real SDK can parse it without a network.
export function claudeStream(texts: string[], stopReason = "end_turn"): Response {
	const usage = { input_tokens: 12, output_tokens: 1, cache_creation_input_tokens: 0, cache_read_input_tokens: 3000 };
	const events = [
		{
			type: "message_start",
			message: { id: "msg_test", type: "message", role: "assistant", model: "claude-haiku-5-5", content: [], stop_reason: null, stop_sequence: null, usage },
		},
		{ type: "content_block_start", index: 0, content_block: { type: "text", text: "" } },
		...texts.map((text) => ({ type: "content_block_delta", index: 0, delta: { type: "text_delta", text } })),
		{ type: "content_block_stop", index: 0 },
		{ type: "message_delta", delta: { stop_reason: stopReason, stop_sequence: null }, usage: { ...usage, output_tokens: 20 } },
		{ type: "message_stop" },
	];
	const body = events.map((e) => `event: ${e.type}\ndata: ${JSON.stringify(e)}\n\n`).join("");
	return new Response(body, { headers: { "Content-Type": "text/event-stream" } });
}

export function claudeError(status: number): Response {
	return Response.json({ type: "error", error: { type: "invalid_request_error", message: "test error" } }, { status });
}
