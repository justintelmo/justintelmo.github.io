// Plain text checks, case-insensitive. Returns what is wrong with an answer; empty means it passed.
// `all`: every phrase must appear. `any`: at least one must. `none`: none may.
export function check(answer, { all = [], any = [], none = [] }) {
	const text = answer.toLowerCase();
	const has = (phrase) => text.includes(phrase.toLowerCase());
	const problems = [];
	for (const phrase of all) if (!has(phrase)) problems.push(`missing "${phrase}"`);
	if (any.length > 0 && !any.some(has)) problems.push(`has none of: ${any.map((p) => `"${p}"`).join(", ")}`);
	for (const phrase of none) if (has(phrase)) problems.push(`contains "${phrase}"`);
	return problems;
}
