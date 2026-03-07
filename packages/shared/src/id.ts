import { type IdPrefix, ID_PREFIXES, type ResourceType } from "./constants";

/**
 * ULID-compatible timestamp + random ID generator.
 *
 * Generates a 26-character Crockford Base32 encoded ID:
 * - First 10 chars: millisecond timestamp (sortable)
 * - Last 16 chars: cryptographically random
 *
 * This gives us:
 * - Lexicographic sorting by creation time
 * - No coordination needed (no sequences)
 * - 80 bits of randomness (collision-resistant)
 */

const ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ"; // Crockford's Base32
const ENCODING_LEN = ENCODING.length; // 32
const TIME_LEN = 10;
const RANDOM_LEN = 16;

function encodeTime(now: number, len: number): string {
	let str = "";
	let remaining = now;
	for (let i = len; i > 0; i--) {
		const mod = remaining % ENCODING_LEN;
		str = ENCODING[mod]! + str;
		remaining = (remaining - mod) / ENCODING_LEN;
	}
	return str;
}

function encodeRandom(len: number): string {
	let str = "";
	const bytes = new Uint8Array(len);
	crypto.getRandomValues(bytes);
	for (let i = 0; i < len; i++) {
		str += ENCODING[bytes[i]! % ENCODING_LEN];
	}
	return str;
}

/**
 * Generate a ULID (Universally Unique Lexicographically Sortable Identifier).
 */
export function ulid(): string {
	const now = Date.now();
	return encodeTime(now, TIME_LEN) + encodeRandom(RANDOM_LEN);
}

/**
 * Generate a prefixed ID for a given resource type.
 *
 * @example
 * ```ts
 * generateId("user");       // "usr_01H9GBQN5WP3FVJKZ0JGMH3RXE"
 * generateId("organization"); // "org_01H9GBQN5WP3FVJKZ0JGMH3RXE"
 * generateId("ssoConnection"); // "conn_01H9GBQN5WP3FVJKZ0JGMH3RXE"
 * ```
 */
export function generateId(resourceType: ResourceType): string {
	const prefix = ID_PREFIXES[resourceType];
	return `${prefix}_${ulid()}`;
}

/**
 * Extract the resource type from a prefixed ID.
 *
 * @returns The resource type, or null if the prefix is unrecognized.
 *
 * @example
 * ```ts
 * getResourceType("usr_01H9GBQN5WP3FVJKZ0JGMH3RXE"); // "user"
 * getResourceType("org_01H9GBQN5WP3FVJKZ0JGMH3RXE"); // "organization"
 * getResourceType("invalid"); // null
 * ```
 */
export function getResourceType(id: string): ResourceType | null {
	const underscoreIndex = id.indexOf("_");
	if (underscoreIndex === -1) return null;

	const prefix = id.slice(0, underscoreIndex) as IdPrefix;
	const entry = Object.entries(ID_PREFIXES).find(([, v]) => v === prefix);
	return entry ? (entry[0] as ResourceType) : null;
}

/**
 * Validate that an ID has the expected prefix for a resource type.
 *
 * @example
 * ```ts
 * validateId("usr_01H9...", "user");   // true
 * validateId("org_01H9...", "user");   // false
 * ```
 */
export function validateId(id: string, expectedType: ResourceType): boolean {
	const prefix = ID_PREFIXES[expectedType];
	return id.startsWith(`${prefix}_`);
}

/**
 * Generate a cryptographically random string of the specified byte length,
 * encoded as URL-safe base64.
 */
export function generateRandomToken(byteLength = 32): string {
	const bytes = new Uint8Array(byteLength);
	crypto.getRandomValues(bytes);
	// URL-safe base64 encoding
	const base64 = btoa(String.fromCharCode(...bytes));
	return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

/**
 * Generate a random 6-digit numeric OTP.
 */
export function generateOtp(length = 6): string {
	const bytes = new Uint8Array(length);
	crypto.getRandomValues(bytes);
	let otp = "";
	for (let i = 0; i < length; i++) {
		otp += (bytes[i]! % 10).toString();
	}
	return otp;
}
