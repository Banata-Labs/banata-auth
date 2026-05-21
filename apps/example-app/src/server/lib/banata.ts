import type { Context } from "hono";
import { env } from "./env";

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
	"x-requested-with",
]);

const STRIPPED_RESPONSE_HEADERS = new Set([
	"content-encoding",
	"content-length",
	"transfer-encoding",
]);

const CALLBACK_FIELDS = [
	"callbackURL",
	"callbackUrl",
	"newUserCallbackURL",
	"errorCallbackURL",
	"redirectTo",
	"redirectURL",
] as const;

function normalizeAuthUrl(value: string): string {
	return value.replace(/\/$/, "");
}

function requestOrigin(request: Request): string {
	const url = new URL(request.url);
	return `${url.protocol}//${url.host}`;
}

function absolutizeCallback(value: unknown, origin: string): unknown {
	if (typeof value !== "string") {
		return value;
	}

	const trimmed = value.trim();
	if (!trimmed.startsWith("/")) {
		return value;
	}

	return new URL(trimmed, origin).toString();
}

function rewriteCallbackFields(body: Record<string, unknown>, origin: string) {
	const nextBody: Record<string, unknown> = { ...body };
	let changed = false;

	for (const field of CALLBACK_FIELDS) {
		const currentValue = nextBody[field];
		const nextValue = absolutizeCallback(currentValue, origin);
		if (nextValue !== currentValue) {
			nextBody[field] = nextValue;
			changed = true;
		}
	}

	return changed ? nextBody : body;
}

function rewriteCallbackParams(searchParams: URLSearchParams, origin: string) {
	for (const field of CALLBACK_FIELDS) {
		const currentValue = searchParams.get(field);
		if (!currentValue) {
			continue;
		}

		const nextValue = absolutizeCallback(currentValue, origin);
		if (typeof nextValue === "string") {
			searchParams.set(field, nextValue);
		}
	}
}

function sanitizeHeaders(headers: Headers) {
	const nextHeaders = new Headers(headers);
	for (const header of STRIPPED_RESPONSE_HEADERS) {
		nextHeaders.delete(header);
	}
	return nextHeaders;
}

function mirrorCrossDomainCookie(headers: Headers) {
	const setCookie = headers.get("set-cookie");
	if (setCookie && !headers.has("set-better-auth-cookie")) {
		headers.set("set-better-auth-cookie", setCookie);
	}
}

export async function proxyBanataAuth(c: Context) {
	const request = c.req.raw;
	const origin = requestOrigin(request);
	const requestUrl = new URL(request.url);
	const upstreamUrl = new URL(
		`${normalizeAuthUrl(env.banataAuthUrl)}${requestUrl.pathname.replace(/^\/api\/auth/, "/api/auth")}`,
	);
	upstreamUrl.search = requestUrl.search;
	rewriteCallbackParams(upstreamUrl.searchParams, origin);

	const headers = new Headers();
	for (const [key, value] of request.headers.entries()) {
		if (FORWARDED_HEADERS.has(key.toLowerCase())) {
			headers.set(key, value);
		}
	}

	headers.set("x-api-key", env.banataApiKey);
	headers.set("x-forwarded-host", requestUrl.host);
	headers.set("x-forwarded-proto", requestUrl.protocol.replace(/:$/, ""));

	let body: BodyInit | null | undefined = undefined;
	if (request.method !== "GET" && request.method !== "HEAD") {
		const contentType = headers.get("content-type") || "";
		if (contentType.includes("application/json")) {
			const parsed = (await request
				.clone()
				.json()
				.catch(() => null)) as Record<string, unknown> | null;
			if (parsed) {
				body = JSON.stringify(rewriteCallbackFields(parsed, origin));
				headers.delete("content-length");
			} else {
				body = request.clone().body;
			}
		} else {
			body = request.clone().body;
		}
	}

	const upstreamRequest = new Request(upstreamUrl.toString(), {
		method: request.method,
		headers,
		body,
		// @ts-expect-error Bun/undici duplex typing mismatch
		duplex: "half",
	});

	upstreamRequest.headers.set("host", upstreamUrl.host);

	const upstreamResponse = await fetch(upstreamRequest, {
		redirect: "manual",
	});

	const responseHeaders = sanitizeHeaders(upstreamResponse.headers);
	mirrorCrossDomainCookie(responseHeaders);
	responseHeaders.set(
		"access-control-expose-headers",
		"set-better-auth-cookie, set-ott, x-request-id",
	);

	return new Response(upstreamResponse.body, {
		status: upstreamResponse.status,
		statusText: upstreamResponse.statusText,
		headers: responseHeaders,
	});
}
