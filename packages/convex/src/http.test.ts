import { describe, expect, it, vi } from "vitest";
import { registerBanataAuthNodeProxyRoutes } from "./http";

describe("registerBanataAuthNodeProxyRoutes()", () => {
	it("does not eagerly construct auth during route registration", () => {
		const createAuth = vi.fn(() => {
			throw new Error("should not be called during route registration");
		});
		const route = vi.fn();
		const lookup = vi.fn(() => undefined);

		registerBanataAuthNodeProxyRoutes(
			{
				route,
				lookup,
			} as never,
			createAuth as never,
			"handleNodeAuthRequest" as never,
		);

		expect(createAuth).not.toHaveBeenCalled();
		expect(route).toHaveBeenCalled();
	});
});
