import { z } from "zod";

export const productionKeyPurposes = [
	"app_secret",
	"jwt_signing",
	"vault_encryption",
	"refresh_token_pepper",
	"webhook_signing",
	"offline_pos_snapshot_signing",
] as const;

export type ProductionKeyPurpose = (typeof productionKeyPurposes)[number];

export const keyCustodyProviderSchema = z.enum(["aws_kms", "gcp_kms", "azure_key_vault", "hsm", "external"]);
export type KeyCustodyProvider = z.infer<typeof keyCustodyProviderSchema>;

export const productionKeyReferenceSchema = z.object({
	purpose: z.enum(productionKeyPurposes),
	provider: keyCustodyProviderSchema,
	keyId: z.string().trim().min(1),
	region: z.string().trim().min(1).optional(),
	version: z.string().trim().min(1).optional(),
	rotationDays: z.number().int().positive().max(730).optional(),
});

export type ProductionKeyReference = z.infer<typeof productionKeyReferenceSchema>;

export const productionKeyCustodySchema = z
	.object({
		environment: z.enum(["production", "staging"]),
		keys: z.array(productionKeyReferenceSchema).min(productionKeyPurposes.length),
		breakGlassRunbookUrl: z.string().url(),
		accessLoggingEnabled: z.boolean(),
		emergencyRotationTestedAt: z.string().datetime().optional(),
	})
	.superRefine((config, ctx) => {
		const byPurpose = new Map<ProductionKeyPurpose, ProductionKeyReference>();
		for (const key of config.keys) {
			if (byPurpose.has(key.purpose)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Duplicate key purpose ${key.purpose}.`,
					path: ["keys"],
				});
			}
			byPurpose.set(key.purpose, key);
		}

		for (const purpose of productionKeyPurposes) {
			if (!byPurpose.has(purpose)) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Missing key purpose ${purpose}.`,
					path: ["keys"],
				});
			}
		}

		const custodyIds = new Map<string, ProductionKeyPurpose>();
		for (const key of config.keys) {
			const custodyId = `${key.provider}:${key.region ?? ""}:${key.keyId}`;
			const existingPurpose = custodyIds.get(custodyId);
			if (existingPurpose && existingPurpose !== key.purpose) {
				ctx.addIssue({
					code: z.ZodIssueCode.custom,
					message: `Key custody reference ${custodyId} is reused for ${existingPurpose} and ${key.purpose}.`,
					path: ["keys"],
				});
			}
			custodyIds.set(custodyId, key.purpose);
		}

		if (!config.accessLoggingEnabled) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Production key custody requires access logging.",
				path: ["accessLoggingEnabled"],
			});
		}
	});

export type ProductionKeyCustody = z.infer<typeof productionKeyCustodySchema>;

export function validateProductionKeyCustody(config: ProductionKeyCustody): ProductionKeyCustody {
	return productionKeyCustodySchema.parse(config);
}
