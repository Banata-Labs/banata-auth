import { describe, expect, it } from "vitest";
import {
	ID_PREFIXES,
	RATE_LIMITS,
	SIZE_LIMITS,
	TOKEN_LIFETIMES,
	WEBHOOK_MAX_ATTEMPTS,
	WEBHOOK_MAX_CONSECUTIVE_FAILURES,
	WEBHOOK_RETRY_DELAYS,
} from "../constants";

describe("constants", () => {
	describe("ID_PREFIXES", () => {
		const expectedKeys: (keyof typeof ID_PREFIXES)[] = [
			"user",
			"session",
			"account",
			"organization",
			"organizationMember",
			"organizationInvitation",
			"team",
			"ssoConnection",
			"ssoProfile",
			"directory",
			"directoryUser",
			"directoryGroup",
			"auditEvent",
			"event",
			"webhookEndpoint",
			"webhookDelivery",
			"apiKey",
			"role",
			"vaultSecret",
			"domainVerification",
			"fgaTuple",
			"radarEvent",
			"project",
			"environment",
			"emailTemplate",
		];

		it("has all expected keys", () => {
			for (const key of expectedKeys) {
				expect(ID_PREFIXES).toHaveProperty(key);
			}
		});

		it("has no extra keys beyond expected", () => {
			const keys = Object.keys(ID_PREFIXES);
			expect(keys).toHaveLength(expectedKeys.length);
		});

		it("all values are non-empty strings", () => {
			for (const [key, value] of Object.entries(ID_PREFIXES)) {
				expect(typeof value).toBe("string");
				expect(value.length).toBeGreaterThan(0);
			}
		});

		it("has no duplicate prefixes", () => {
			const values = Object.values(ID_PREFIXES);
			const uniqueValues = new Set(values);
			expect(uniqueValues.size).toBe(values.length);
		});

		it("maps known resource types to correct prefixes", () => {
			expect(ID_PREFIXES.user).toBe("usr");
			expect(ID_PREFIXES.session).toBe("ses");
			expect(ID_PREFIXES.account).toBe("acc");
			expect(ID_PREFIXES.organization).toBe("org");
			expect(ID_PREFIXES.organizationMember).toBe("mem");
			expect(ID_PREFIXES.organizationInvitation).toBe("inv");
			expect(ID_PREFIXES.team).toBe("team");
			expect(ID_PREFIXES.ssoConnection).toBe("conn");
			expect(ID_PREFIXES.ssoProfile).toBe("prof");
			expect(ID_PREFIXES.directory).toBe("dir");
			expect(ID_PREFIXES.directoryUser).toBe("diru");
			expect(ID_PREFIXES.directoryGroup).toBe("dirg");
			expect(ID_PREFIXES.auditEvent).toBe("evt");
			expect(ID_PREFIXES.event).toBe("event");
			expect(ID_PREFIXES.webhookEndpoint).toBe("wh");
			expect(ID_PREFIXES.webhookDelivery).toBe("whd");
			expect(ID_PREFIXES.apiKey).toBe("ak");
			expect(ID_PREFIXES.role).toBe("role");
			expect(ID_PREFIXES.vaultSecret).toBe("vsec");
			expect(ID_PREFIXES.domainVerification).toBe("dv");
			expect(ID_PREFIXES.fgaTuple).toBe("fga");
			expect(ID_PREFIXES.radarEvent).toBe("radar");
		});
	});

	describe("RATE_LIMITS", () => {
		it("all values are non-negative numbers", () => {
			for (const [key, value] of Object.entries(RATE_LIMITS)) {
				expect(typeof value).toBe("number");
				expect(value).toBeGreaterThanOrEqual(0);
			}
		});

		it("has expected keys", () => {
			expect(RATE_LIMITS).toHaveProperty("general");
			expect(RATE_LIMITS).toHaveProperty("signIn");
			expect(RATE_LIMITS).toHaveProperty("signUp");
			expect(RATE_LIMITS).toHaveProperty("passwordReset");
			expect(RATE_LIMITS).toHaveProperty("emailOperations");
			expect(RATE_LIMITS).toHaveProperty("scim");
			expect(RATE_LIMITS).toHaveProperty("admin");
			expect(RATE_LIMITS).toHaveProperty("webhookDelivery");
		});

		it("webhookDelivery has no limit (0)", () => {
			expect(RATE_LIMITS.webhookDelivery).toBe(0);
		});

		it("general rate limit is the highest", () => {
			expect(RATE_LIMITS.general).toBe(600);
		});
	});

	describe("TOKEN_LIFETIMES", () => {
		it("all values are positive numbers", () => {
			for (const [key, value] of Object.entries(TOKEN_LIFETIMES)) {
				expect(typeof value).toBe("number");
				expect(value).toBeGreaterThan(0);
			}
		});

		it("has expected keys", () => {
			expect(TOKEN_LIFETIMES).toHaveProperty("accessToken");
			expect(TOKEN_LIFETIMES).toHaveProperty("session");
			expect(TOKEN_LIFETIMES).toHaveProperty("sessionAbsoluteMax");
			expect(TOKEN_LIFETIMES).toHaveProperty("passwordReset");
			expect(TOKEN_LIFETIMES).toHaveProperty("emailVerification");
			expect(TOKEN_LIFETIMES).toHaveProperty("magicLink");
			expect(TOKEN_LIFETIMES).toHaveProperty("emailOtp");
			expect(TOKEN_LIFETIMES).toHaveProperty("adminPortalShort");
			expect(TOKEN_LIFETIMES).toHaveProperty("adminPortalLong");
			expect(TOKEN_LIFETIMES).toHaveProperty("invitation");
			expect(TOKEN_LIFETIMES).toHaveProperty("jwksRotation");
		});

		it("access token is 15 minutes", () => {
			expect(TOKEN_LIFETIMES.accessToken).toBe(15 * 60);
		});

		it("session is 7 days", () => {
			expect(TOKEN_LIFETIMES.session).toBe(7 * 24 * 60 * 60);
		});

		it("sessionAbsoluteMax is greater than session", () => {
			expect(TOKEN_LIFETIMES.sessionAbsoluteMax).toBeGreaterThan(TOKEN_LIFETIMES.session);
		});
	});

	describe("SIZE_LIMITS", () => {
		it("all values are positive numbers", () => {
			for (const [key, value] of Object.entries(SIZE_LIMITS)) {
				expect(typeof value).toBe("number");
				expect(value).toBeGreaterThan(0);
			}
		});

		it("has expected keys", () => {
			expect(SIZE_LIMITS).toHaveProperty("metadataMaxBytes");
			expect(SIZE_LIMITS).toHaveProperty("samlMaxBytes");
			expect(SIZE_LIMITS).toHaveProperty("samlMaxDepth");
			expect(SIZE_LIMITS).toHaveProperty("webhookMaxBytes");
			expect(SIZE_LIMITS).toHaveProperty("webhookResponseMaxBytes");
			expect(SIZE_LIMITS).toHaveProperty("scimMaxBytes");
			expect(SIZE_LIMITS).toHaveProperty("passwordMaxLength");
			expect(SIZE_LIMITS).toHaveProperty("passwordMinLength");
			expect(SIZE_LIMITS).toHaveProperty("fgaMaxDepth");
		});

		it("metadataMaxBytes is 16KB", () => {
			expect(SIZE_LIMITS.metadataMaxBytes).toBe(16 * 1024);
		});

		it("passwordMinLength is less than passwordMaxLength", () => {
			expect(SIZE_LIMITS.passwordMinLength).toBeLessThan(SIZE_LIMITS.passwordMaxLength);
		});
	});

	describe("WEBHOOK_RETRY_DELAYS", () => {
		it("is an array of 5 elements", () => {
			expect(Array.isArray(WEBHOOK_RETRY_DELAYS)).toBe(true);
			expect(WEBHOOK_RETRY_DELAYS).toHaveLength(5);
		});

		it("first element is 0 (immediate)", () => {
			expect(WEBHOOK_RETRY_DELAYS[0]).toBe(0);
		});

		it("values are in ascending order", () => {
			for (let i = 1; i < WEBHOOK_RETRY_DELAYS.length; i++) {
				expect(WEBHOOK_RETRY_DELAYS[i]).toBeGreaterThan(WEBHOOK_RETRY_DELAYS[i - 1]!);
			}
		});

		it("all values are non-negative numbers", () => {
			for (const value of WEBHOOK_RETRY_DELAYS) {
				expect(typeof value).toBe("number");
				expect(value).toBeGreaterThanOrEqual(0);
			}
		});
	});

	describe("WEBHOOK_MAX_CONSECUTIVE_FAILURES", () => {
		it("is 3", () => {
			expect(WEBHOOK_MAX_CONSECUTIVE_FAILURES).toBe(3);
		});
	});

	describe("WEBHOOK_MAX_ATTEMPTS", () => {
		it("is 5", () => {
			expect(WEBHOOK_MAX_ATTEMPTS).toBe(5);
		});

		it("matches the length of WEBHOOK_RETRY_DELAYS", () => {
			expect(WEBHOOK_MAX_ATTEMPTS).toBe(WEBHOOK_RETRY_DELAYS.length);
		});
	});
});
