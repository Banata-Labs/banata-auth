import { sessionMiddleware } from "better-auth/api";
import { describe, expect, it } from "vitest";
import { organizationRbacPlugin } from "./organization-rbac";

describe("organizationRbacPlugin()", () => {
	it("registers every organization endpoint with session middleware", () => {
		const plugin = organizationRbacPlugin();
		const endpoints = plugin.endpoints ?? {};

		for (const [name, endpoint] of Object.entries(endpoints)) {
			expect(endpoint.options.requireHeaders, `${name} should require headers`).toBe(true);
			expect(endpoint.options.use, `${name} should register middleware`).toContain(
				sessionMiddleware,
			);
		}
	});
});
