import { cloudflareTest } from "@cloudflare/vitest-plugin";
import { defineConfig } from "vitest/config";

export default defineConfig({
	plugins: [
		cloudflareTest({
			wrangler: { configPath: "./wrangler.jsonc" },
			// Tests fake the API at fetch level; this only satisfies the SDK.
			miniflare: { bindings: { ANTHROPIC_API_KEY: "test-key" } },
		}),
	],
});
