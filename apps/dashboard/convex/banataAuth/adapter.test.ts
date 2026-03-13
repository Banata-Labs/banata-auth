import { describe, expect, it } from "vitest";
import { authComponent, createAuthOptions } from "./auth";

describe("dashboard auth component adapter", () => {
	it("exposes a component adapter factory", () => {
		expect(typeof authComponent.adapter).toBe("function");
	});

	it("builds an adapter with the standard query methods", () => {
		const adapter = authComponent.adapter({} as never)(createAuthOptions({} as never)) as Record<
			string,
			unknown
		>;

		expect(typeof adapter.findOne).toBe("function");
		expect(typeof adapter.findMany).toBe("function");
		expect(typeof adapter.create).toBe("function");
		expect(typeof adapter.update).toBe("function");
		expect(typeof adapter.delete).toBe("function");
	});
});
