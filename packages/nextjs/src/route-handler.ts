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
	"x-banata-client-id",
	"x-banata-project-id",
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
	"content-encoding",
	"content-length",
	"transfer-encoding",
]);

const PROJECT_ID_COOKIE = "banata_project_id";
const CLIENT_ID_COOKIE = "banata_client_id";

export interface BanataProjectRouteScope {
	projectId?: string;
	clientId?: string;
	resolve?: (
		request: Request,
	) =>
		| { projectId?: string; clientId?: string }
		| Promise<{ projectId?: string; clientId?: string }>;
}

export interface BanataRouteAuthOptions {
	/**
	 * Project-scoped Banata API key.
	 *
	 * This is the recommended way to bind a customer app to a Banata project.
	 * The key is injected server-side into the proxied request and is never
	 * exposed to the browser.
	 */
	apiKey?: string;

	/**
	 * Banata-internal escape hatch for the hosted auth UI.
	 *
	 * This should not be used by customer apps. It allows Banata's own
	 * first-party hosted auth surfaces to resolve project scope from
	 * `client_id` / `project_id` without requiring a customer API key in
	 * the browser.
	 */
	allowInternalProjectScope?: boolean;
}

function normalizeScopeValue(value: string | null | undefined): string | null {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readCookie(cookieHeader: string | null, name: string): string | null {
	if (!cookieHeader) {
		return null;
	}

	for (const pair of cookieHeader.split(";")) {
		const [rawKey, ...rest] = pair.trim().split("=");
		if (rawKey !== name) {
			continue;
		}
		return normalizeScopeValue(decodeURIComponent(rest.join("=")));
	}

	return null;
}

async function resolveProjectScope(
	request: Request,
	scope: BanataProjectRouteScope | undefined,
): Promise<{ projectId?: string; clientId?: string }> {
	const resolved = scope?.resolve ? await scope.resolve(request) : {};
	const url = new URL(request.url);
	const cookieHeader = request.headers.get("cookie");

	const projectId =
		normalizeScopeValue(scope?.projectId) ??
		normalizeScopeValue(resolved.projectId) ??
		normalizeScopeValue(request.headers.get("x-banata-project-id")) ??
		normalizeScopeValue(url.searchParams.get("projectId")) ??
		normalizeScopeValue(url.searchParams.get("project_id")) ??
		readCookie(cookieHeader, PROJECT_ID_COOKIE) ??
		undefined;
	const clientId =
		normalizeScopeValue(scope?.clientId) ??
		normalizeScopeValue(resolved.clientId) ??
		normalizeScopeValue(request.headers.get("x-banata-client-id")) ??
		normalizeScopeValue(url.searchParams.get("clientId")) ??
		normalizeScopeValue(url.searchParams.get("client_id")) ??
		readCookie(cookieHeader, CLIENT_ID_COOKIE) ??
		undefined;

	return {
		...(projectId ? { projectId } : {}),
		...(clientId ? { clientId } : {}),
	};
}

function sanitizeUpstreamResponseHeaders(headers: Headers): Headers {
	const sanitized = new Headers(headers);
	for (const name of STRIPPED_RESPONSE_HEADERS) {
		sanitized.delete(name);
	}
	return sanitized;
}

export function createRouteHandler(options: {
	/** The Convex .site URL where HTTP actions are hosted. */
	convexSiteUrl: string;
	/** Optional server-side Banata API key used to bind the request to a project. */
	apiKey?: string;
	/** Banata-internal escape hatch for hosted auth surfaces. */
	allowInternalProjectScope?: boolean;
	/** Optional explicit or request-resolved Banata project scope. */
	project?: BanataProjectRouteScope;
}) {
	const { allowInternalProjectScope, apiKey, convexSiteUrl, project } = options;
	const siteUrl = convexSiteUrl.replace(/\/$/, "");
	const normalizedApiKey = normalizeScopeValue(apiKey);

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
		const resolvedScope = await resolveProjectScope(request, project);
		if (normalizedApiKey) {
			forwardedHeaders.set("x-api-key", normalizedApiKey);
		}
		if (allowInternalProjectScope) {
			forwardedHeaders.set("x-banata-internal-project-scope", "1");
		}
		if (resolvedScope.projectId) {
			forwardedHeaders.set("x-banata-project-id", resolvedScope.projectId);
		}
		if (resolvedScope.clientId) {
			forwardedHeaders.set("x-banata-client-id", resolvedScope.clientId);
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

			// Undici transparently decompresses upstream bodies. Strip encoding
			// headers so Next/browser clients do not try to decode again.
			return new Response(response.body, {
				status: response.status,
				statusText: response.statusText,
				headers: sanitizeUpstreamResponseHeaders(response.headers),
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
