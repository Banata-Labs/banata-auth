import { z } from "zod";

export const maturityCapabilityIds = [
	"enterprise-byok",
	"device-risk-scoring",
	"auth-anomaly-detection",
	"session-forensics",
	"fine-grained-authorization",
	"enterprise-compliance-packaging",
] as const;

export type MaturityCapabilityId = (typeof maturityCapabilityIds)[number];

export const maturityCapabilitySchema = z.object({
	id: z.enum(maturityCapabilityIds),
	status: z.enum(["planned", "beta", "available", "deferred"]),
	owner: z.string().trim().min(1),
	targetPhase: z.enum(["p2", "post-launch", "enterprise-only"]),
	evidence: z.array(z.string().url()).default([]),
	notes: z.string().trim().min(20),
});

export const maturityReadinessPlanSchema = z
	.object({
		version: z.literal(1),
		updatedAt: z.string().date(),
		capabilities: z.array(maturityCapabilitySchema).min(maturityCapabilityIds.length),
	})
	.superRefine((plan, ctx) => {
		const seen = new Set<MaturityCapabilityId>();
		for (const capability of plan.capabilities) {
			if (seen.has(capability.id)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Duplicate maturity capability ${capability.id}.`,
					path: ["capabilities"],
				});
			}
			seen.add(capability.id);
		}

		for (const id of maturityCapabilityIds) {
			if (!seen.has(id)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Missing maturity capability ${id}.`,
					path: ["capabilities"],
				});
			}
		}
	});

export type MaturityReadinessPlan = z.infer<typeof maturityReadinessPlanSchema>;

export function validateMaturityReadinessPlan(plan: MaturityReadinessPlan): MaturityReadinessPlan {
	return maturityReadinessPlanSchema.parse(plan);
}
