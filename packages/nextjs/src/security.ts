export interface BanataSecurityHeadersOptions {
	contentSecurityPolicy?: string | false;
	reportOnlyContentSecurityPolicy?: string;
	includeStrictTransportSecurity?: boolean;
	frameAncestors?: "none" | "self";
	cacheControl?: string | false;
}

export interface OriginGuardOptions {
	method: string;
	requestUrl: string;
	origin: string | null;
	allowedOrigins?: string[];
}

export interface CookiePolicyOptions {
	requireSecure?: boolean;
	requireHttpOnly?: boolean;
	allowedSameSite?: Array<"lax" | "strict" | "none">;
}

export interface CookiePolicyIssue {
	cookieName: string;
	issue: "missing-secure" | "missing-http-only" | "missing-samesite" | "invalid-samesite";
}

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const DEFAULT_CSP = [
	"default-src 'self'",
	"base-uri 'self'",
	"frame-ancestors 'none'",
	"object-src 'none'",
	"script-src 'self'",
	"style-src 'self' 'unsafe-inline'",
	"img-src 'self' data: https:",
	"font-src 'self' data:",
	"connect-src 'self' https:",
	"form-action 'self'",
	"upgrade-insecure-requests",
].join("; ");

export function buildBanataSecurityHeaders(options: BanataSecurityHeadersOptions = {}): Headers {
	const headers = new Headers();
	const csp =
		options.contentSecurityPolicy === false
			? null
			: (options.contentSecurityPolicy ??
				DEFAULT_CSP.replace(
					"frame-ancestors 'none'",
					options.frameAncestors === "self" ? "frame-ancestors 'self'" : "frame-ancestors 'none'",
				));

	if (csp) {
		headers.set("content-security-policy", csp);
	}
	if (options.reportOnlyContentSecurityPolicy) {
		headers.set("content-security-policy-report-only", options.reportOnlyContentSecurityPolicy);
	}
	if (options.includeStrictTransportSecurity !== false) {
		headers.set("strict-transport-security", "max-age=31536000; includeSubDomains; preload");
	}
	headers.set("x-content-type-options", "nosniff");
	headers.set("referrer-policy", "strict-origin-when-cross-origin");
	headers.set("x-frame-options", options.frameAncestors === "self" ? "SAMEORIGIN" : "DENY");
	headers.set("permissions-policy", "camera=(), microphone=(), geolocation=(), payment=()");
	headers.set("cross-origin-opener-policy", "same-origin");
	headers.set("cross-origin-resource-policy", "same-site");
	if (options.cacheControl !== false) {
		headers.set("cache-control", options.cacheControl ?? "no-store");
	}

	return headers;
}

export function applyBanataSecurityHeaders(
	headers: Headers,
	options: BanataSecurityHeadersOptions = {},
): Headers {
	for (const [name, value] of buildBanataSecurityHeaders(options)) {
		if (!headers.has(name)) {
			headers.set(name, value);
		}
	}
	return headers;
}

export function assertTrustedOrigin(options: OriginGuardOptions): void {
	const method = options.method.toUpperCase();
	if (SAFE_METHODS.has(method)) {
		return;
	}

	const requestOrigin = new URL(options.requestUrl).origin;
	if (!options.origin) {
		throw new Error("Unsafe auth request is missing an Origin header.");
	}
	if (options.origin === requestOrigin) {
		return;
	}
	if (options.allowedOrigins?.includes(options.origin)) {
		return;
	}

	throw new Error("Unsafe auth request Origin is not trusted.");
}

export function validateAuthCookiePolicy(
	setCookieHeaders: string[],
	options: CookiePolicyOptions = {},
): CookiePolicyIssue[] {
	const requireSecure = options.requireSecure ?? true;
	const requireHttpOnly = options.requireHttpOnly ?? true;
	const allowedSameSite = options.allowedSameSite ?? ["lax", "strict"];
	const issues: CookiePolicyIssue[] = [];

	for (const header of setCookieHeaders) {
		const [nameValue, ...attributeParts] = header.split(";").map((part) => part.trim());
		const cookieName = nameValue?.split("=")[0] ?? "";
		if (!cookieName || !isAuthCookieName(cookieName)) {
			continue;
		}

		const attributes = new Map<string, string | true>();
		for (const attribute of attributeParts) {
			const [rawKey, rawValue] = attribute.split("=");
			if (!rawKey) continue;
			attributes.set(rawKey.toLowerCase(), rawValue?.toLowerCase() ?? true);
		}

		if (requireSecure && !attributes.has("secure")) {
			issues.push({ cookieName, issue: "missing-secure" });
		}
		if (requireHttpOnly && !attributes.has("httponly")) {
			issues.push({ cookieName, issue: "missing-http-only" });
		}

		const sameSite = attributes.get("samesite");
		if (!sameSite || sameSite === true) {
			issues.push({ cookieName, issue: "missing-samesite" });
		} else if (!allowedSameSite.includes(sameSite as "lax" | "strict" | "none")) {
			issues.push({ cookieName, issue: "invalid-samesite" });
		}
	}

	return issues;
}

function isAuthCookieName(cookieName: string): boolean {
	return (
		cookieName.includes("session_token") ||
		cookieName === "convex_jwt" ||
		cookieName.startsWith("__Secure-better-auth")
	);
}
