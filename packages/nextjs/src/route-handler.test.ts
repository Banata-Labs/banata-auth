import { describe, expect, it } from "vitest";
import { createRouteHandler } from "./route-handler";

describe("createRouteHandler()", () => {
	it("requires a project api key for customer apps", () => {
		expect(() =>
			createRouteHandler({
				convexSiteUrl: "https://example.convex.site",
			} as never),
		).toThrow(/project-scoped apiKey/i);
	});

	it("allows a customer route handler when an api key is provided", () => {
		expect(() =>
			createRouteHandler({
				convexSiteUrl: "https://example.convex.site",
				apiKey: "ba_test_123",
			}),
		).not.toThrow();
	});

	it("allows internal hosted surfaces without a customer api key", () => {
		expect(() =>
			createRouteHandler({
				convexSiteUrl: "https://example.convex.site",
				allowInternalProjectScope: true,
			}),
		).not.toThrow();
	});
});
