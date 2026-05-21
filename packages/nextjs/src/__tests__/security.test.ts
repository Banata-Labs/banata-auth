import { describe, expect, it } from "vitest";
import {
	applyBanataSecurityHeaders,
	assertTrustedOrigin,
	buildBanataSecurityHeaders,
	validateAuthCookiePolicy,
} from "../security";

describe("security readiness helpers", () => {
	it("builds conservative default security headers", () => {
		const headers = buildBanataSecurityHeaders();

		expect(headers.get("content-security-policy")).toContain("frame-ancestors 'none'");
		expect(headers.get("strict-transport-security")).toContain("includeSubDomains");
		expect(headers.get("x-content-type-options")).toBe("nosniff");
		expect(headers.get("x-frame-options")).toBe("DENY");
		expect(headers.get("permissions-policy")).toContain("camera=()");
		expect(headers.get("cache-control")).toBe("no-store");
	});

	it("allows cache-control to be customized or omitted", () => {
		expect(
			buildBanataSecurityHeaders({ cacheControl: "private, max-age=60" }).get("cache-control"),
		).toBe("private, max-age=60");
		expect(buildBanataSecurityHeaders({ cacheControl: false }).has("cache-control")).toBe(false);
	});

	it("applies missing security headers without overwriting explicit values", () => {
		const headers = new Headers({ "x-frame-options": "SAMEORIGIN" });

		applyBanataSecurityHeaders(headers);

		expect(headers.get("x-frame-options")).toBe("SAMEORIGIN");
		expect(headers.get("referrer-policy")).toBe("strict-origin-when-cross-origin");
	});

	it("allows safe requests and trusted unsafe origins", () => {
		expect(() =>
			assertTrustedOrigin({
				method: "GET",
				requestUrl: "https://app.example.com/api/auth/session",
				origin: null,
			}),
		).not.toThrow();

		expect(() =>
			assertTrustedOrigin({
				method: "POST",
				requestUrl: "https://app.example.com/api/auth/sign-in",
				origin: "https://app.example.com",
			}),
		).not.toThrow();

		expect(() =>
			assertTrustedOrigin({
				method: "POST",
				requestUrl: "https://app.example.com/api/auth/sign-in",
				origin: "https://auth.example.com",
				allowedOrigins: ["https://auth.example.com"],
			}),
		).not.toThrow();
	});

	it("rejects missing or untrusted origins for unsafe methods", () => {
		expect(() =>
			assertTrustedOrigin({
				method: "POST",
				requestUrl: "https://app.example.com/api/auth/sign-in",
				origin: null,
			}),
		).toThrow(/Origin/);

		expect(() =>
			assertTrustedOrigin({
				method: "DELETE",
				requestUrl: "https://app.example.com/api/auth/session",
				origin: "https://evil.example",
			}),
		).toThrow(/not trusted/);
	});

	it("reports auth cookies missing production attributes", () => {
		expect(
			validateAuthCookiePolicy([
				"better-auth.session_token=abc; Path=/; HttpOnly; Secure; SameSite=Lax",
			]),
		).toEqual([]);

		expect(
			validateAuthCookiePolicy(["better-auth.session_token=abc; Path=/", "theme=dark; Path=/"]),
		).toEqual([
			{ cookieName: "better-auth.session_token", issue: "missing-secure" },
			{ cookieName: "better-auth.session_token", issue: "missing-http-only" },
			{ cookieName: "better-auth.session_token", issue: "missing-samesite" },
		]);
	});
});
