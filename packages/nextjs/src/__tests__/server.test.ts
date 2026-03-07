import { describe, expect, it, vi } from "vitest";

// Mock the upstream dependency before importing the module under test
vi.mock("@convex-dev/better-auth/nextjs", () => ({
	convexBetterAuthNextJs: vi.fn((opts: { convexUrl: string; convexSiteUrl: string }) => ({
		handler: { GET: vi.fn(), POST: vi.fn() },
		isAuthenticated: vi.fn().mockResolvedValue(true),
		getToken: vi.fn().mockResolvedValue("mock-token"),
		preloadAuthQuery: vi.fn(),
		fetchAuthQuery: vi.fn(),
		fetchAuthMutation: vi.fn(),
		fetchAuthAction: vi.fn(),
		_opts: opts, // expose for assertions
	})),
}));

import { createBanataAuthServer } from "../server";

describe("createBanataAuthServer()", () => {
	it("returns an object with handler, isAuthenticated, getToken, and query helpers", () => {
		const result = createBanataAuthServer({
			convexUrl: "https://test.convex.cloud",
			convexSiteUrl: "https://test.convex.site",
		});

		expect(result).toBeDefined();
		expect(result.handler).toBeDefined();
		expect(result.isAuthenticated).toBeDefined();
		expect(result.getToken).toBeDefined();
		expect(result.fetchAuthQuery).toBeDefined();
		expect(result.fetchAuthMutation).toBeDefined();
		expect(result.fetchAuthAction).toBeDefined();
	});

	it("passes convexUrl and convexSiteUrl to convexBetterAuthNextJs", () => {
		const result = createBanataAuthServer({
			convexUrl: "https://adjective-animal-123.convex.cloud",
			convexSiteUrl: "https://adjective-animal-123.convex.site",
		});

		// The mock exposes _opts so we can verify the options were passed through
		const opts = (result as unknown as { _opts: { convexUrl: string; convexSiteUrl: string } })
			._opts;
		expect(opts.convexUrl).toBe("https://adjective-animal-123.convex.cloud");
		expect(opts.convexSiteUrl).toBe("https://adjective-animal-123.convex.site");
	});

	it("handler contains GET and POST methods for route handler", () => {
		const { handler } = createBanataAuthServer({
			convexUrl: "https://test.convex.cloud",
			convexSiteUrl: "https://test.convex.site",
		});

		expect(handler.GET).toBeDefined();
		expect(handler.POST).toBeDefined();
	});
});
