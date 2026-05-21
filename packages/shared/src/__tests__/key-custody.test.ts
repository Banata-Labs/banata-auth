import { describe, expect, it } from "vitest";
import { productionKeyPurposes, validateProductionKeyCustody } from "../key-custody";

const baseKeys = productionKeyPurposes.map((purpose, index) => ({
	purpose,
	provider: "aws_kms" as const,
	keyId: `arn:aws:kms:us-east-1:123456789012:key/${purpose}-${index}`,
	region: "us-east-1",
	rotationDays: 90,
}));

describe("production key custody", () => {
	it("accepts separated production key custody references", () => {
		const config = validateProductionKeyCustody({
			environment: "production",
			keys: baseKeys,
			breakGlassRunbookUrl: "https://runbooks.example.com/key-custody",
			accessLoggingEnabled: true,
			emergencyRotationTestedAt: "2026-05-21T00:00:00.000Z",
		});

		expect(config.keys).toHaveLength(productionKeyPurposes.length);
		expect(config.keys.map((key) => key.purpose)).toEqual([...productionKeyPurposes]);
	});

	it("rejects missing key purposes", () => {
		expect(() =>
			validateProductionKeyCustody({
				environment: "production",
				keys: baseKeys.filter((key) => key.purpose !== "refresh_token_pepper"),
				breakGlassRunbookUrl: "https://runbooks.example.com/key-custody",
				accessLoggingEnabled: true,
			}),
		).toThrow(/refresh_token_pepper/);
	});

	it("rejects reused custody references across key purposes", () => {
		const jwtSigningKey = baseKeys.find((key) => key.purpose === "jwt_signing");
		if (!jwtSigningKey) {
			throw new Error("Missing jwt signing test key.");
		}

		expect(() =>
			validateProductionKeyCustody({
				environment: "production",
				keys: baseKeys.map((key) =>
					key.purpose === "vault_encryption"
						? { ...key, keyId: jwtSigningKey.keyId }
						: key,
				),
				breakGlassRunbookUrl: "https://runbooks.example.com/key-custody",
				accessLoggingEnabled: true,
			}),
		).toThrow(/reused/);
	});

	it("requires access logging", () => {
		expect(() =>
			validateProductionKeyCustody({
				environment: "production",
				keys: baseKeys,
				breakGlassRunbookUrl: "https://runbooks.example.com/key-custody",
				accessLoggingEnabled: false,
			}),
		).toThrow(/access logging/);
	});
});
