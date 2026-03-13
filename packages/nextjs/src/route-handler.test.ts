import { describe, expect, it } from "vitest";
import { createRouteHandler } from "./route-handler";

describe("createRouteHandler()", () => {
	it("requires a project api key for customer apps", () => {
		expect(() =>
			createRouteHandler({
			} as never),
		).toThrow(/project-scoped apiKey/i);
	});

	it("allows a customer route handler when an api key is provided", () => {
		expect(() =>
			createRouteHandler({
				apiKey: "ba_test_123",
			}),
		).not.toThrow();
	});

	it("defaults hosted customer apps to auth.banata.dev", () => {
		expect(() =>
			createRouteHandler({
				apiKey: "ba_test_123",
			}),
		).not.toThrow();
	});

	it("allows internal hosted surfaces without a customer api key", () => {
		expect(() =>
			createRouteHandler({
				allowInternalProjectScope: true,
			}),
		).not.toThrow();
	});
});
