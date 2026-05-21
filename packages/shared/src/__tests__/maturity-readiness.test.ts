import { describe, expect, it } from "vitest";
import { maturityCapabilityIds, validateMaturityReadinessPlan } from "../maturity-readiness";

function completePlan() {
	return {
		version: 1 as const,
		updatedAt: "2026-05-21",
		capabilities: maturityCapabilityIds.map((id) => ({
			id,
			status: "planned" as const,
			owner: "platform-security",
			targetPhase: "p2" as const,
			evidence: [],
			notes: `Roadmap and customer evidence tracking for ${id} before marketing this mature-platform capability.`,
		})),
	};
}

describe("maturity readiness plan", () => {
	it("accepts a complete P2 maturity capability plan", () => {
		const plan = validateMaturityReadinessPlan(completePlan());

		expect(plan.capabilities.map((capability) => capability.id)).toEqual([
			...maturityCapabilityIds,
		]);
	});

	it("rejects missing P2 maturity capabilities", () => {
		const plan = completePlan();
		plan.capabilities = plan.capabilities.filter(
			(capability) => capability.id !== "enterprise-byok",
		);

		expect(() => validateMaturityReadinessPlan(plan)).toThrow(/enterprise-byok/);
	});

	it("rejects duplicate P2 maturity capabilities", () => {
		const plan = completePlan();
		const firstCapability = plan.capabilities[0];
		if (!firstCapability) {
			throw new Error("Missing maturity capability fixture.");
		}
		plan.capabilities = [...plan.capabilities, firstCapability];

		expect(() => validateMaturityReadinessPlan(plan)).toThrow(/Duplicate/);
	});
});
