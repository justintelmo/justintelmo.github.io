import { describe, expect, it } from "vitest";
import { check } from "../eval/check.mjs";

// A bug here would let a bad answer pass the eval, so the checker gets its own tests.
describe("eval check", () => {
	it("passes an answer that meets every rule, ignoring case", () => {
		expect(check("Justin used KOTLIN at Glu.", { all: ["kotlin"], any: ["glu", "kixeye"], none: ["paris"] })).toEqual([]);
	});

	it("names each missing, absent, and forbidden phrase", () => {
		expect(check("Paris.", { all: ["Kotlin"], any: ["Glu", "KIXEYE"], none: ["paris"] })).toEqual([
			'missing "Kotlin"',
			'has none of: "Glu", "KIXEYE"',
			'contains "paris"',
		]);
	});

	it("treats an empty rule list as no rule", () => {
		expect(check("anything", {})).toEqual([]);
	});
});
