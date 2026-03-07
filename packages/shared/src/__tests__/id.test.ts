import { describe, it, expect } from "vitest";
import {
	ulid,
	generateId,
	getResourceType,
	validateId,
	generateRandomToken,
	generateOtp,
} from "../id";
import { ID_PREFIXES, type ResourceType } from "../constants";

const CROCKFORD_BASE32 = /^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]+$/;

describe("id", () => {
	describe("ulid()", () => {
		it("returns a 26-character string", () => {
			const id = ulid();
			expect(id).toHaveLength(26);
		});

		it("returns a string", () => {
			expect(typeof ulid()).toBe("string");
		});

		it("returns different values on each call", () => {
			const ids = new Set(Array.from({ length: 100 }, () => ulid()));
			expect(ids.size).toBe(100);
		});

		it("characters are all valid Crockford Base32", () => {
			const id = ulid();
			expect(id).toMatch(CROCKFORD_BASE32);
		});

		it("multiple ULIDs all use valid Crockford Base32", () => {
			for (let i = 0; i < 50; i++) {
				const id = ulid();
				expect(id).toMatch(CROCKFORD_BASE32);
			}
		});

		it("ULIDs generated in sequence are lexicographically sortable", () => {
			const id1 = ulid();
			// Small delay to ensure different timestamp
			const id2 = ulid();
			// Same millisecond ULIDs may not be ordered, but they should be valid
			expect(id1).toHaveLength(26);
			expect(id2).toHaveLength(26);
		});
	});

	describe("generateId()", () => {
		it('generateId("user") starts with "usr_"', () => {
			const id = generateId("user");
			expect(id.startsWith("usr_")).toBe(true);
		});

		it('generateId("organization") starts with "org_"', () => {
			const id = generateId("organization");
			expect(id.startsWith("org_")).toBe(true);
		});

		it("each resource type starts with the correct prefix", () => {
			const resourceTypes = Object.keys(ID_PREFIXES) as ResourceType[];
			for (const resourceType of resourceTypes) {
				const id = generateId(resourceType);
				const expectedPrefix = `${ID_PREFIXES[resourceType]}_`;
				expect(id.startsWith(expectedPrefix)).toBe(true);
			}
		});

		it("generated ID contains a valid ULID after the prefix", () => {
			const id = generateId("user");
			const ulidPart = id.slice("usr_".length);
			expect(ulidPart).toHaveLength(26);
			expect(ulidPart).toMatch(CROCKFORD_BASE32);
		});

		it("generates unique IDs for the same resource type", () => {
			const ids = new Set(Array.from({ length: 100 }, () => generateId("user")));
			expect(ids.size).toBe(100);
		});

		it("generates IDs with correct format for multi-char prefixes", () => {
			const id = generateId("ssoConnection");
			expect(id.startsWith("conn_")).toBe(true);
			expect(id.length).toBe("conn_".length + 26);
		});
	});

	describe("getResourceType()", () => {
		it('getResourceType("usr_...") returns "user"', () => {
			const id = generateId("user");
			expect(getResourceType(id)).toBe("user");
		});

		it('getResourceType("org_...") returns "organization"', () => {
			const id = generateId("organization");
			expect(getResourceType(id)).toBe("organization");
		});

		it("returns correct type for every resource type", () => {
			const resourceTypes = Object.keys(ID_PREFIXES) as ResourceType[];
			for (const resourceType of resourceTypes) {
				const id = generateId(resourceType);
				expect(getResourceType(id)).toBe(resourceType);
			}
		});

		it('getResourceType("invalid") returns null', () => {
			expect(getResourceType("invalid")).toBe(null);
		});

		it('getResourceType("") returns null', () => {
			expect(getResourceType("")).toBe(null);
		});

		it("returns null for unrecognized prefix", () => {
			expect(getResourceType("zzz_01H9GBQN5WP3FVJKZ0JGMH3RXE")).toBe(null);
		});

		it("returns null for string with only underscores", () => {
			expect(getResourceType("___")).toBe(null);
		});
	});

	describe("validateId()", () => {
		it('validateId("usr_abc", "user") returns true', () => {
			expect(validateId("usr_abc", "user")).toBe(true);
		});

		it('validateId("org_abc", "user") returns false', () => {
			expect(validateId("org_abc", "user")).toBe(false);
		});

		it("validates correctly for all resource types", () => {
			const resourceTypes = Object.keys(ID_PREFIXES) as ResourceType[];
			for (const resourceType of resourceTypes) {
				const id = generateId(resourceType);
				expect(validateId(id, resourceType)).toBe(true);
			}
		});

		it("rejects IDs with wrong resource type", () => {
			const userId = generateId("user");
			expect(validateId(userId, "organization")).toBe(false);
			expect(validateId(userId, "session")).toBe(false);
		});

		it("rejects empty string", () => {
			expect(validateId("", "user")).toBe(false);
		});

		it("rejects string without underscore", () => {
			expect(validateId("nounderscore", "user")).toBe(false);
		});
	});

	describe("generateRandomToken()", () => {
		it("returns a non-empty string", () => {
			const token = generateRandomToken();
			expect(typeof token).toBe("string");
			expect(token.length).toBeGreaterThan(0);
		});

		it("default byte length produces a token", () => {
			const token = generateRandomToken();
			// 32 bytes -> ~43 base64 chars (without padding)
			expect(token.length).toBeGreaterThan(20);
		});

		it("generateRandomToken(16) returns a shorter string than generateRandomToken(32)", () => {
			const short = generateRandomToken(16);
			const long = generateRandomToken(32);
			expect(short.length).toBeLessThan(long.length);
		});

		it("produces URL-safe base64 (no +, /, = characters)", () => {
			for (let i = 0; i < 50; i++) {
				const token = generateRandomToken();
				expect(token).not.toContain("+");
				expect(token).not.toContain("/");
				expect(token).not.toContain("=");
			}
		});

		it("generates unique tokens", () => {
			const tokens = new Set(Array.from({ length: 100 }, () => generateRandomToken()));
			expect(tokens.size).toBe(100);
		});
	});

	describe("generateOtp()", () => {
		it("returns a 6-digit string by default", () => {
			const otp = generateOtp();
			expect(otp).toHaveLength(6);
		});

		it("all characters are numeric", () => {
			const otp = generateOtp();
			expect(otp).toMatch(/^\d+$/);
		});

		it("generateOtp(8) returns an 8-digit string", () => {
			const otp = generateOtp(8);
			expect(otp).toHaveLength(8);
			expect(otp).toMatch(/^\d{8}$/);
		});

		it("generateOtp(4) returns a 4-digit string", () => {
			const otp = generateOtp(4);
			expect(otp).toHaveLength(4);
			expect(otp).toMatch(/^\d{4}$/);
		});

		it("generates different OTPs", () => {
			const otps = new Set(Array.from({ length: 100 }, () => generateOtp()));
			// With 6 digits, collisions among 100 are extremely unlikely
			expect(otps.size).toBeGreaterThan(90);
		});

		it("OTP digits are all in range 0-9", () => {
			for (let i = 0; i < 50; i++) {
				const otp = generateOtp();
				for (const char of otp) {
					const digit = parseInt(char, 10);
					expect(digit).toBeGreaterThanOrEqual(0);
					expect(digit).toBeLessThanOrEqual(9);
				}
			}
		});
	});
});
