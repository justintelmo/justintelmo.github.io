// Asks the chat Worker every question in cases.mjs and checks the answers.
// Real Claude calls, about $0.01 a run, so it is run by hand and never in CI.
//
//   npm run eval                       local `wrangler dev` on port 8787
//   npm run eval -- <worker URL>/chat  the deployed Worker
//
// Every case counts toward the Worker's daily caps (20 per IP), so a second run the same day
// can hit a 429. Locally, stop `wrangler dev` and delete .wrangler/state to reset the counts.
import { cases } from "./cases.mjs";
import { check } from "./check.mjs";

const url = process.argv[2] ?? "http://localhost:8787/chat";
// Allowed by the Worker in every environment.
const ORIGIN = "http://localhost:4321";
// The Worker allows 10 questions a minute per IP.
const SPACING_MS = 7000;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const indent = (text) => text.replace(/^/gm, "    ");

console.log(`Asking ${url}\n`);
let failed = 0;
for (const [i, c] of cases.entries()) {
	if (i > 0) await sleep(SPACING_MS);

	const messages = [...(c.history ?? []), { role: "user", content: c.question }];
	let response;
	try {
		response = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json", Origin: ORIGIN },
			body: JSON.stringify({ messages }),
		});
	} catch (error) {
		console.error(`Could not reach ${url}: ${error.cause?.message ?? error.message}. Is wrangler dev running?`);
		process.exit(2);
	}
	if (!response.ok) {
		console.error(`Stopped at "${c.name}": HTTP ${response.status} ${await response.text()}`);
		process.exit(2);
	}

	const answer = await response.text();
	const problems = check(answer, c);
	if (problems.length > 0) failed++;
	console.log(`${problems.length === 0 ? "PASS" : "FAIL"}  ${c.name}`);
	console.log(indent(`Q: ${c.question}\nA: ${answer.trim()}`));
	for (const problem of problems) console.log(`    -> ${problem}`);
	console.log();
}

console.log(`${cases.length - failed} of ${cases.length} passed.`);
process.exit(failed === 0 ? 0 : 1);
