import { isAllowedOrigin, MAX_BODY_CHARS, parseMessages } from "./guard";

function cors(origin: string): Record<string, string> {
	return { "Access-Control-Allow-Origin": origin, Vary: "Origin" };
}

function error(status: number, message: string, headers: Record<string, string> = {}): Response {
	return Response.json({ error: message }, { status, headers });
}

export default {
	async fetch(request, env): Promise<Response> {
		const origin = request.headers.get("Origin");
		if (!isAllowedOrigin(origin)) return error(403, "Origin not allowed.");
		const headers = cors(origin);

		if (new URL(request.url).pathname !== "/chat") return error(404, "Not found.", headers);
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: {
					...headers,
					"Access-Control-Allow-Methods": "POST",
					"Access-Control-Allow-Headers": "Content-Type",
					"Access-Control-Max-Age": "86400",
				},
			});
		}
		if (request.method !== "POST") return error(405, "Use POST.", { ...headers, Allow: "POST, OPTIONS" });

		const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";
		const { success } = await env.CHAT_LIMITER.limit({ key: ip });
		if (!success) return error(429, "Too many questions. Try again in a minute.", headers);

		const text = await request.text();
		if (text.length > MAX_BODY_CHARS) return error(413, "Request too large.", headers);
		let body: unknown;
		try {
			body = JSON.parse(text);
		} catch {
			return error(400, "Body must be JSON.", headers);
		}
		const messages = parseMessages(body);
		if (typeof messages === "string") return error(400, messages, headers);

		return error(501, "Not built yet.", headers);
	},
} satisfies ExportedHandler<Env>;
