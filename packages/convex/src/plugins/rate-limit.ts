import { RATE_LIMITS } from "@banata-auth/shared";
import type { BetterAuthPlugin } from "better-auth";
import { getIp } from "better-auth/api";

type RateLimitRule = {
	window: number;
	max: number;
};

type RateLimitRecord = {
	key: string;
	count: number;
	lastRequest: number;
};

const DEFAULT_RULE: RateLimitRule = {
	window: 60,
	max: RATE_LIMITS.general,
};

const PATH_RULES: Array<{ pattern: string; rule: RateLimitRule }> = [
	{ pattern: "/sign-in/*", rule: { window: 60, max: RATE_LIMITS.signIn } },
	{ pattern: "/sign-up/*", rule: { window: 60, max: RATE_LIMITS.signUp } },
	{ pattern: "/forget-password", rule: { window: 60, max: RATE_LIMITS.passwordReset } },
	{ pattern: "/reset-password", rule: { window: 60, max: RATE_LIMITS.passwordReset } },
	{ pattern: "/email-otp/*", rule: { window: 60, max: RATE_LIMITS.emailOperations } },
	{ pattern: "/magic-link/*", rule: { window: 60, max: RATE_LIMITS.emailOperations } },
	{ pattern: "/admin/*", rule: { window: 60, max: RATE_LIMITS.admin } },
];

function normalizeScopeValue(value: string | null | undefined): string | null {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function readProjectIdFromUrl(urlValue: string): string | null {
	try {
		const url = new URL(urlValue, "http://localhost");
		return (
			normalizeScopeValue(url.searchParams.get("projectId")) ??
			normalizeScopeValue(url.searchParams.get("project_id"))
		);
	} catch {
		return null;
	}
}

function resolveProjectScopeId(request: Request): string {
	return (
		normalizeScopeValue(request.headers.get("x-banata-project-id")) ??
		readProjectIdFromUrl(request.url) ??
		"__platform__"
	);
}

function normalizeIdentifierValue(value: unknown): string | null {
	if (typeof value !== "string") {
		return null;
	}
	const normalized = value.trim().toLowerCase();
	return normalized.length > 0 ? normalized.slice(0, 320) : null;
}

async function readRequestIdentifier(request: Request): Promise<string | null> {
	const contentType = request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase();
	if (!contentType) {
		return null;
	}

	try {
		if (contentType === "application/json") {
			const body = (await request.clone().json()) as Record<string, unknown>;
			return (
				normalizeIdentifierValue(body.email) ??
				normalizeIdentifierValue(body.username) ??
				normalizeIdentifierValue(body.identifier)
			);
		}

		if (
			contentType === "application/x-www-form-urlencoded" ||
			contentType === "multipart/form-data"
		) {
			const form = await request.clone().formData();
			return (
				normalizeIdentifierValue(form.get("email")) ??
				normalizeIdentifierValue(form.get("username")) ??
				normalizeIdentifierValue(form.get("identifier"))
			);
		}
	} catch {
		return null;
	}

	return null;
}

function normalizePathname(urlValue: string, baseUrl: string): string {
	try {
		const requestUrl = new URL(urlValue, "http://localhost");
		const basePath = new URL(baseUrl, "http://localhost").pathname.replace(/\/$/, "");
		const pathname = requestUrl.pathname;
		if (!basePath || basePath === "/") {
			return pathname;
		}
		return pathname.startsWith(basePath) ? pathname.slice(basePath.length) || "/" : pathname;
	} catch {
		return urlValue;
	}
}

function matchesPattern(pattern: string, path: string): boolean {
	if (!pattern.includes("*")) {
		return pattern === path;
	}

	const escaped = pattern.replace(/[|\\{}()[\]^$+?.]/g, "\\$&").replace(/\*/g, ".*");
	return new RegExp(`^${escaped}$`).test(path);
}

function resolveRule(path: string): RateLimitRule {
	for (const entry of PATH_RULES) {
		if (matchesPattern(entry.pattern, path)) {
			return entry.rule;
		}
	}
	return DEFAULT_RULE;
}

function getRetryAfter(lastRequest: number, windowSeconds: number): number {
	const remaining = lastRequest + windowSeconds * 1000 - Date.now();
	return Math.max(1, Math.ceil(remaining / 1000));
}

function rateLimitResponse(retryAfter: number): Response {
	return new Response(
		JSON.stringify({
			code: "RATE_LIMITED",
			message: "Rate limit exceeded.",
			details: {
				tryAgainIn: retryAfter,
			},
		}),
		{
			status: 429,
			headers: {
				"content-type": "application/json",
				"retry-after": String(retryAfter),
			},
		},
	);
}

export function projectScopedRateLimitPlugin(): BetterAuthPlugin {
	return {
		id: "banata-project-rate-limit",
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		async onRequest(request, ctx) {
			// Temporarily disabled while investigating corrupted rate limit records.
			// The race condition fix is in place but existing records need to expire.
			return;
			const ip = getIp(request, ctx.options);
			if (!ip) {
				return;
			}

			const path = normalizePathname(request.url, ctx.baseURL);
			const rule = resolveRule(path);
			const projectScopeId = resolveProjectScopeId(request);
			const identifier = await readRequestIdentifier(request);
			const key = identifier
				? `${projectScopeId}|${ip}|${path}|${identifier}`
				: `${projectScopeId}|${ip}|${path}`;
			const where = [{ field: "key", value: key }];

			const existing = ((await ctx.adapter.findMany({
				model: "rateLimit",
				where,
				limit: 1,
			})) as RateLimitRecord[])[0];

			const now = Date.now();
			if (!existing) {
				try {
					await ctx.adapter.create({
						model: "rateLimit",
						data: {
							key,
							count: 1,
							lastRequest: now,
						},
					});
					return;
				} catch {
					// Another concurrent request may have created the record first.
					// Fall through to the update path below.
				}
			}

			// Re-fetch in case we lost the creation race and need fresh data
			const current: RateLimitRecord | undefined = existing ?? ((await ctx.adapter.findMany({
				model: "rateLimit",
				where,
				limit: 1,
			})) as RateLimitRecord[])[0];

			if (!current) {
				// Record still doesn't exist even after retry — allow the request
				return;
			}
			const record = current as RateLimitRecord;

			const windowMs = rule.window * 1000;
			const lastReq = record.lastRequest;
			const curCount = record.count;
			if (now - lastReq < windowMs && curCount >= rule.max) {
				return {
					response: rateLimitResponse(getRetryAfter(lastReq, rule.window)),
				};
			}

			const nextCount = now - lastReq > windowMs ? 1 : curCount + 1;
			await ctx.adapter.updateMany({
				model: "rateLimit",
				where,
				update: {
					count: nextCount,
					lastRequest: now,
				},
			});
		},
	};
}
