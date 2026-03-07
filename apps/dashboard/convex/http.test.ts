import { convexTest } from "convex-test";
import { describe, expect, it } from "vitest";
import { modules } from "./test.setup";

describe("dashboard convex auth routes", () => {
	it("boots convex-test runtime", async () => {
		const t = convexTest(undefined, modules);
		const value = await t.run(async () => "ready");
		expect(value).toBe("ready");
	});

	it("supports identity-scoped runtime", async () => {
		const t = convexTest(undefined, modules);
		const asAdmin = t.withIdentity({ subject: "admin_1", name: "Admin" });
		const identityName = await asAdmin.run(async (ctx) => {
			const identity = await ctx.auth.getUserIdentity();
			return identity?.name ?? null;
		});
		expect(identityName).toBe("Admin");
	});
});
