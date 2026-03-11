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

type RawDatabaseAdapter = {
	findMany: (input: {
		model: string;
		where?: Array<{ field: string; value: unknown }>;
		limit?: number;
	}) => Promise<RateLimitRecord[]>;
	create: (input: {
		model: string;
		data: Record<string, unknown>;
	}) => Promise<unknown>;
	updateMany: (input: {
		model: string;
		where?: Array<{ field: string; value: unknown }>;
		update: Record<string, unknown>;
	}) => Promise<unknown>;
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
		async onRequest(request, ctx) {
			const ip = getIp(request, ctx.options);
			if (!ip) {
				return;
			}

			const path = normalizePathname(request.url, ctx.baseURL);
			const rule = resolveRule(path);
			const key = `${ip}|${path}`;
			const database = ctx.options.database as unknown as RawDatabaseAdapter;
			const where = [{ field: "key", value: key }];

			const existing = ((await database.findMany({
				model: "rateLimit",
				where,
				limit: 1,
			})) as RateLimitRecord[])[0];

			const now = Date.now();
			if (!existing) {
				await database.create({
					model: "rateLimit",
					data: {
						key,
						count: 1,
						lastRequest: now,
					},
				});
				return;
			}

			const windowMs = rule.window * 1000;
			if (now - existing.lastRequest < windowMs && existing.count >= rule.max) {
				return {
					response: rateLimitResponse(getRetryAfter(existing.lastRequest, rule.window)),
				};
			}

			const nextCount = now - existing.lastRequest > windowMs ? 1 : existing.count + 1;
			await database.updateMany({
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
