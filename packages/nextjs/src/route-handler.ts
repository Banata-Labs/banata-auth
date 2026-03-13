/**
 * Create a Next.js route handler that proxies auth requests to Banata.
 *
 * This is used in `app/api/auth/[...all]/route.ts` to forward all
 * Better Auth API calls to the configured Banata auth endpoint.
 *
 * @example
 * ```ts
 * // app/api/auth/[...all]/route.ts
 * import { createRouteHandler } from "@banata-auth/nextjs";
 *
 * const handler = createRouteHandler({
 *   apiKey: process.env.BANATA_API_KEY!,
 * });
 *
 * export const { GET, POST } = handler;
 * ```
 */
/**
 * Headers that are safe to forward from the client to the Banata auth API.
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
	"better-auth-cookie",
	"x-api-key",
	"x-forwarded-host",
	"x-forwarded-proto",
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
const DEFAULT_BANATA_AUTH_URL = "https://auth.banata.dev";
const CALLBACK_URL_PARAM_NAMES = [
	"callbackURL",
	"callbackUrl",
	"newUserCallbackURL",
	"errorCallbackURL",
	"redirectTo",
	"redirectURL",
] as const;

export interface BanataProjectRouteScope {
	projectId?: string;
	clientId?: string;
	resolve?: (
		request: Request,
	) =>
		| { projectId?: string; clientId?: string }
		| Promise<{ projectId?: string; clientId?: string }>;
}

type BanataManagedRouteAuthOptions = {
	/**
	 * Project-scoped Banata API key.
	 *
	 * This is the required managed-service binding for customer apps.
	 * The key is injected server-side into the proxied request and is never
	 * exposed to the browser.
	 */
	apiKey: string;
	allowInternalProjectScope?: false;
};

type BanataInternalRouteAuthOptions = {
	apiKey?: string;
	/**
	 * Banata-internal escape hatch for hosted first-party surfaces.
	 *
	 * This should not be used by customer apps. It allows Banata's own
	 * dashboard/auth UI to resolve project scope from `client_id` /
	 * `project_id` without requiring a customer API key in the browser.
	 */
	allowInternalProjectScope: true;
};

export type BanataRouteAuthOptions = {
	/** Optional explicit or request-resolved Banata project scope. */
	project?: BanataProjectRouteScope;
} & (BanataManagedRouteAuthOptions | BanataInternalRouteAuthOptions);

export type BanataRouteHandlerOptions = {
	/**
	 * Hosted or self-hosted Banata auth base URL.
	 *
	 * Defaults to `https://auth.banata.dev` for managed Banata projects.
	 */
	authUrl?: string;
	/** Origins allowed to call this auth proxy cross-origin. */
	allowedOrigins?: string[];
} & BanataRouteAuthOptions;

function resolveAuthBaseUrl(authUrl?: string): string {
	const normalizedUrl =
		typeof authUrl === "string" && authUrl.trim().length > 0
			? authUrl.trim()
			: DEFAULT_BANATA_AUTH_URL;
	if (normalizedUrl.endsWith(".convex.cloud")) {
		throw new Error(
			`authUrl must point to your Banata auth base URL, not the raw Convex cloud URL ${normalizedUrl}.`,
		);
	}
	return normalizedUrl.replace(/\/$/, "");
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

function mirrorCrossDomainCookieHeader(request: Request, headers: Headers): Headers {
	const origin = request.headers.get("origin");
	if (!origin) {
		return headers;
	}

	const setCookie = headers.get("set-cookie");
	if (!setCookie || headers.has("set-better-auth-cookie")) {
		return headers;
	}

	headers.set("set-better-auth-cookie", setCookie);
	return headers;
}

function getRequestOrigin(request: Request): string {
	const requestUrl = new URL(request.url);
	const forwardedHost =
		normalizeScopeValue(request.headers.get("x-forwarded-host")) ??
		normalizeScopeValue(request.headers.get("host"));
	const forwardedProto =
		normalizeScopeValue(request.headers.get("x-forwarded-proto")) ??
		requestUrl.protocol.replace(/:$/, "");
	const host = forwardedHost ?? requestUrl.host;
	return `${forwardedProto}://${host}`;
}

function absolutizeCallbackValue(value: unknown, requestOrigin: string): unknown {
	if (typeof value !== "string") {
		return value;
	}

	const trimmed = value.trim();
	if (!trimmed.startsWith("/")) {
		return value;
	}

	return new URL(trimmed, requestOrigin).toString();
}

function rewriteCallbackParams(searchParams: URLSearchParams, requestOrigin: string): void {
	for (const key of CALLBACK_URL_PARAM_NAMES) {
		const value = searchParams.get(key);
		if (!value) {
			continue;
		}
		searchParams.set(key, absolutizeCallbackValue(value, requestOrigin) as string);
	}
}

function rewriteCallbackFieldsInBody(
	body: Record<string, unknown>,
	requestOrigin: string,
): Record<string, unknown> {
	let changed = false;
	const nextBody: Record<string, unknown> = { ...body };

	for (const key of CALLBACK_URL_PARAM_NAMES) {
		const currentValue = nextBody[key];
		const nextValue = absolutizeCallbackValue(currentValue, requestOrigin);
		if (nextValue !== currentValue) {
			nextBody[key] = nextValue;
			changed = true;
		}
	}

	return changed ? nextBody : body;
}

export function createRouteHandler(options: BanataRouteHandlerOptions) {
	const { allowInternalProjectScope, allowedOrigins, apiKey, authUrl, project } = options;
	const siteUrl = resolveAuthBaseUrl(authUrl);
	const normalizedApiKey = normalizeScopeValue(apiKey);
	if (!normalizedApiKey && !allowInternalProjectScope) {
		throw new Error(
			"Banata customer apps must configure a project-scoped apiKey. " +
				"Use allowInternalProjectScope only for Banata's own hosted surfaces.",
		);
	}

	function applyCorsHeaders(request: Request, headers: Headers): Headers {
		const origin = request.headers.get("origin");
		if (!origin || !allowedOrigins?.includes(origin)) {
			return headers;
		}

		headers.set("access-control-allow-origin", origin);
		headers.set("vary", "origin");
		headers.set("access-control-allow-methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
		headers.set(
			"access-control-allow-headers",
			[
				"authorization",
				"better-auth-cookie",
				"content-type",
				"x-banata-client-id",
				"x-banata-project-id",
				"x-requested-with",
			].join(", "),
		);
		headers.set(
			"access-control-expose-headers",
			["set-better-auth-cookie", "set-ott", "x-request-id"].join(", "),
		);
		headers.set("access-control-allow-credentials", "true");
		return headers;
	}

	async function handler(request: Request): Promise<Response> {
		if (request.method === "OPTIONS") {
			return new Response(null, {
				status: 204,
				headers: applyCorsHeaders(request, new Headers()),
			});
		}

		const requestUrl = new URL(request.url);
		const requestOrigin = getRequestOrigin(request);
		const targetSearchParams = new URLSearchParams(requestUrl.search);
		rewriteCallbackParams(targetSearchParams, requestOrigin);
		const targetUrl = `${siteUrl}${requestUrl.pathname}${targetSearchParams.toString() ? `?${targetSearchParams.toString()}` : ""}`;

		// Only forward allowed headers to the upstream auth API
		const forwardedHeaders = new Headers();
		for (const [key, value] of request.headers) {
			if (FORWARDED_HEADERS.has(key.toLowerCase())) {
				forwardedHeaders.set(key, value);
			}
		}
		if (!forwardedHeaders.has("x-forwarded-host")) {
			forwardedHeaders.set("x-forwarded-host", new URL(requestOrigin).host);
		}
		if (!forwardedHeaders.has("x-forwarded-proto")) {
			forwardedHeaders.set("x-forwarded-proto", new URL(requestOrigin).protocol.replace(/:$/, ""));
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

		let requestBody: BodyInit | null | undefined = request.body;
		const contentType = forwardedHeaders.get("content-type") ?? "";
		if (
			request.body &&
			contentType.includes("application/json") &&
			request.method !== "GET" &&
			request.method !== "HEAD"
		) {
			const parsedBody = (await request
				.clone()
				.json()
				.catch(() => null)) as Record<string, unknown> | null;
			if (parsedBody && typeof parsedBody === "object") {
				const rewrittenBody = rewriteCallbackFieldsInBody(parsedBody, requestOrigin);
				if (rewrittenBody !== parsedBody) {
					requestBody = JSON.stringify(rewrittenBody);
					forwardedHeaders.delete("content-length");
				}
			}
		}

		const newRequest = new Request(targetUrl, {
			method: request.method,
			headers: forwardedHeaders,
			body: requestBody,
			// @ts-expect-error - duplex is needed for streaming bodies
			duplex: "half",
		});

		// Set the host header to the upstream Banata auth host
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
				headers: applyCorsHeaders(
					request,
					mirrorCrossDomainCookieHeader(request, sanitizeUpstreamResponseHeaders(response.headers)),
				),
			});
		} catch (error) {
			console.error("[banata-auth] Proxy error:", error);
			return new Response(JSON.stringify({ error: "Auth service unavailable" }), {
				status: 502,
				headers: applyCorsHeaders(request, new Headers({ "Content-Type": "application/json" })),
			});
		}
	}

	return {
		GET: handler,
		POST: handler,
		PUT: handler,
		PATCH: handler,
		DELETE: handler,
		OPTIONS: handler,
	};
}
