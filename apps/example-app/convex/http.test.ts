import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { modules } from "./test.setup";

describe("example convex auth routes", () => {
	it("boots convex-test runtime", async () => {
		const t = convexTest(undefined, modules);
		const value = await t.run(async () => "ready");
		expect(value).toBe("ready");
	});
});
