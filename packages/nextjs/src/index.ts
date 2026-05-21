export { banataAuthProxy, banataAuthMiddleware } from "./middleware";
export type { BanataAuthMiddlewareOptions } from "./middleware";
export { createRouteHandler } from "./route-handler";
export type { BanataProjectRouteScope, BanataRouteAuthOptions } from "./route-handler";
export {
	applyBanataSecurityHeaders,
	assertTrustedOrigin,
	buildBanataSecurityHeaders,
	validateAuthCookiePolicy,
} from "./security";
export type {
	BanataSecurityHeadersOptions,
	CookiePolicyIssue,
	CookiePolicyOptions,
	OriginGuardOptions,
} from "./security";

// Re-export from better-auth/cookies so consumers can use it directly
// in proxy.ts without needing better-auth as a direct dependency.
export { getSessionCookie } from "better-auth/cookies";
