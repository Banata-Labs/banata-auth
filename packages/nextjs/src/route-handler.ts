/**
 * Create a Next.js route handler that proxies auth requests to Convex.
 *
 * This is used in `app/api/auth/[...all]/route.ts` to forward all
 * Better Auth API calls to the Convex HTTP actions endpoint.
 *
 * @example
 * ```ts
 * // app/api/auth/[...all]/route.ts
 * import { createRouteHandler } from "@banata-auth/nextjs";
 *
 * const handler = createRouteHandler({
 *   convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
 * });
 *
 * export const { GET, POST } = handler;
 * ```
 */
/**
 * Headers that are safe to forward from the client to the Convex auth API.
 * All other headers are stripped to avoid leaking internal server details
 * (e.g. X-Forwarded-For, X-Real-IP, CF-* Cloudflare headers, etc.).
 */
const FORWARDED_HEADERS = new Set([
	"accept",
	"accept-language",
	"authorization",
	"content-type",
	"content-length",
	"cookie",
	"origin",
	"referer",
	"user-agent",
	"x-requested-with",
]);

export function createRouteHandler(options: {
	/** The Convex .site URL where HTTP actions are hosted. */
	convexSiteUrl: string;
}) {
	const { convexSiteUrl } = options;
	const siteUrl = convexSiteUrl.replace(/\/$/, "");

	async function handler(request: Request): Promise<Response> {
		const requestUrl = new URL(request.url);
		const targetUrl = `${siteUrl}${requestUrl.pathname}${requestUrl.search}`;

		// Only forward allowed headers to the upstream auth API
		const forwardedHeaders = new Headers();
		for (const [key, value] of request.headers) {
			if (FORWARDED_HEADERS.has(key.toLowerCase())) {
				forwardedHeaders.set(key, value);
			}
		}

		const newRequest = new Request(targetUrl, {
			method: request.method,
			headers: forwardedHeaders,
			body: request.body,
			// @ts-expect-error - duplex is needed for streaming bodies
			duplex: "half",
		});

		// Set the host header to the Convex site
		newRequest.headers.set("host", new URL(siteUrl).host);

		try {
			const response = await fetch(newRequest, {
				method: request.method,
				redirect: "manual",
			});

			// Forward the response including cookies
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: response.headers,
			});
		} catch (error) {
			console.error("[banata-auth] Proxy error:", error);
			return new Response(JSON.stringify({ error: "Auth service unavailable" }), {
				status: 502,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	return {
		GET: handler,
		POST: handler,
		PUT: handler,
		PATCH: handler,
		DELETE: handler,
	};
}
