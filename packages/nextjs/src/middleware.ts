import { type NextRequest, NextResponse } from "next/server";

/**
 * Cookie names that indicate an active auth session.
 *
 * Better Auth uses `better-auth.session_token` (or `__Secure-better-auth.session_token`
 * in production). The Convex Better Auth integration also sets `convex_jwt`.
 * We check both to cover all deployment scenarios.
 *
 * NOTE: This only checks for cookie *presence*, not validity. The actual
 * token is validated server-side when the API routes are hit.
 */
const AUTH_COOKIE_NAMES = [
	"better-auth.session_token",
	"__Secure-better-auth.session_token",
	"better-auth-session_token",
	"__Secure-better-auth-session_token",
	"convex_jwt",
];

/**
 * Check whether the request carries any known auth session cookie.
 * Uses the standard `NextRequest.cookies` API rather than Better Auth's
 * `getSessionCookie()`, which requires a `Headers` object incompatible
 * with some mocking/testing scenarios.
 */
function hasSessionCookie(request: NextRequest): boolean {
	return AUTH_COOKIE_NAMES.some((name) => {
		const cookie = request.cookies.get(name);
		return cookie !== undefined && cookie.value !== "";
	});
}

export interface BanataAuthMiddlewareOptions {
	/**
	 * Routes that don't require authentication.
	 * Supports exact strings and regex patterns.
	 */
	publicRoutes?: string[];

	/**
	 * Routes that the middleware should ignore entirely.
	 */
	ignoredRoutes?: string[];

	/**
	 * URL to redirect to when unauthenticated.
	 * @default "/sign-in"
	 */
	signInUrl?: string;

	/**
	 * URL to redirect to after successful sign-in.
	 * @default "/dashboard"
	 */
	afterSignInUrl?: string;
}

/**
 * Create a Next.js proxy/middleware that protects routes based on auth state.
 *
 * **Important:** This middleware checks for the *presence* of an auth session
 * cookie, not its validity. The actual token is validated server-side when
 * API routes are hit. This is the standard pattern for Next.js Edge
 * middleware, which runs before the request reaches the server and cannot
 * perform full JWT validation without a network round-trip.
 *
 * In Next.js 16+, the file convention is `proxy.ts` with a named `proxy` export.
 * For Next.js 15 and earlier, use `middleware.ts` with a default export.
 *
 * @example
 * ```ts
 * // proxy.ts (Next.js 16+)
 * import { banataAuthProxy } from "@banata-auth/nextjs";
 *
 * export const proxy = banataAuthProxy({
 *   publicRoutes: ["/", "/pricing", "/blog(.*)"],
 *   signInUrl: "/sign-in",
 * });
 *
 * export const config = {
 *   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
 * };
 * ```
 *
 * @example
 * ```ts
 * // middleware.ts (Next.js 15 and earlier)
 * import { banataAuthMiddleware } from "@banata-auth/nextjs";
 *
 * export default banataAuthMiddleware({
 *   publicRoutes: ["/", "/pricing", "/blog(.*)"],
 *   signInUrl: "/sign-in",
 * });
 *
 * export const config = {
 *   matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
 * };
 * ```
 */
function createAuthProxy(options: BanataAuthMiddlewareOptions = {}) {
	const { publicRoutes = [], ignoredRoutes = [], signInUrl = "/sign-in" } = options;

	// Pre-compile route patterns at config time (once) to avoid
	// re-creating RegExp objects on every request and to catch
	// invalid patterns early.
	const compiledPublicRoutes = compileRoutes(publicRoutes);
	const compiledIgnoredRoutes = compileRoutes(ignoredRoutes);

	return async function proxy(request: NextRequest) {
		const { pathname } = request.nextUrl;

		// Forward pathname as a request header so server components
		// can read it via headers(). This is the official Next.js pattern
		// for passing data from proxy/middleware to server components.
		const requestHeaders = new Headers(request.headers);
		requestHeaders.set("x-pathname", pathname);

		// Check ignored routes
		if (isMatchingRoute(pathname, compiledIgnoredRoutes)) {
			return NextResponse.next({ request: { headers: requestHeaders } });
		}

		// Check public routes
		if (isMatchingRoute(pathname, compiledPublicRoutes)) {
			return NextResponse.next({ request: { headers: requestHeaders } });
		}

		// Check for auth session cookie presence
		if (!hasSessionCookie(request)) {
			const signInURL = new URL(signInUrl, request.url);
			signInURL.searchParams.set("redirect_url", pathname);
			return NextResponse.redirect(signInURL);
		}

		// Token exists - allow the request through.
		return NextResponse.next({ request: { headers: requestHeaders } });
	};
}

/**
 * Create a Next.js proxy function for `proxy.ts` (Next.js 16+).
 * The returned function is named `proxy` for compatibility with the new convention.
 */
export const banataAuthProxy = createAuthProxy;

/**
 * Backward-compatible alias for Next.js 15 and earlier `middleware.ts`.
 * @deprecated Use `banataAuthProxy` with `proxy.ts` for Next.js 16+
 */
export const banataAuthMiddleware = createAuthProxy;

/** A pre-compiled route matcher — either a RegExp or an exact string. */
type CompiledRoute = RegExp | string;

/**
 * Pre-compile route patterns into RegExp objects (anchored with ^ and $).
 * Invalid patterns fall back to exact string matching.
 * This is called once at config time, not per-request.
 */
function compileRoutes(routes: string[]): CompiledRoute[] {
	return routes.map((route) => {
		try {
			return new RegExp(`^${route}$`);
		} catch {
			// If the pattern is invalid regex, fall back to exact match
			return route;
		}
	});
}

function isMatchingRoute(pathname: string, compiledRoutes: CompiledRoute[]): boolean {
	return compiledRoutes.some((route) => {
		if (typeof route === "string") {
			return pathname === route;
		}
		return route.test(pathname);
	});
}
