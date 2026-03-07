/**
 * Bot protection utilities for Next.js applications using Banata Auth.
 *
 * Provides helpers to integrate bot detection services (Vercel BotID,
 * Cloudflare Turnstile, hCaptcha, reCAPTCHA) with the Banata Auth
 * route handler.
 *
 * These utilities wrap the route handler's POST method to automatically
 * verify requests against protected auth paths before forwarding to
 * the auth backend.
 *
 * Credentials can be supplied directly or fetched from the Banata Auth
 * config API (configured via the Radar page in the dashboard).
 *
 * @example
 * ```ts
 * // app/api/auth/[...all]/route.ts
 * import { createRouteHandler } from "@banata-auth/nextjs";
 * import { withBotProtection, createBotIdVerifier } from "@banata-auth/nextjs/bot-protection";
 *
 * const handler = createRouteHandler({
 *   convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
 * });
 *
 * export const GET = handler.GET;
 * export const POST = withBotProtection(handler.POST, {
 *   protectedPaths: ["/api/auth/sign-in", "/api/auth/sign-up"],
 *   verify: async () => {
 *     const { checkBotId } = await import("botid/server");
 *     const result = await checkBotId();
 *     return { isBot: result.isBot };
 *   },
 * });
 * ```
 *
 * @example
 * ```ts
 * // Using credentials from the Banata Auth config API
 * import { createConfigAwareVerifier } from "@banata-auth/nextjs/bot-protection";
 *
 * const verify = createConfigAwareVerifier({
 *   configApiUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/auth",
 * });
 *
 * export const POST = withBotProtection(handler.POST, { verify });
 * ```
 */

// ─── Types ──────────────────────────────────────────────────────────

/**
 * Result of a bot verification check.
 */
export interface BotCheckResult {
	/** Whether the request is from a bot. */
	isBot: boolean;
	/** Optional reason string for logging. */
	reason?: string;
}

/**
 * Function that verifies whether a request is from a bot.
 * Implement with your provider of choice.
 */
export type BotCheckFn = (request: Request) => Promise<BotCheckResult>;

/**
 * Configuration for the route-handler-level bot protection wrapper.
 */
export interface BotProtectionConfig {
	/**
	 * The verification function.
	 * Called for every request matching a protected path.
	 */
	verify: BotCheckFn;

	/**
	 * Path prefixes to protect. Requests to other paths pass through.
	 * @default ["/api/auth/sign-in", "/api/auth/sign-up", "/api/auth/forget-password", "/api/auth/reset-password"]
	 */
	protectedPaths?: string[];

	/**
	 * Whether to allow requests through if verification fails (service unavailable).
	 * @default true
	 */
	failOpen?: boolean;

	/**
	 * Error message returned when a bot is detected.
	 * @default "Bot detected. Access denied."
	 */
	blockedMessage?: string;
}

/**
 * Bot provider credentials as stored in the Radar configuration.
 */
export interface BotProviderCredentials {
	apiKey?: string;
	siteKey?: string;
	secretKey?: string;
}

/**
 * Radar configuration shape returned by the config API.
 */
export interface RadarConfigResponse {
	enabled: boolean;
	botDetection: boolean;
	botProvider: string | null;
	botProviderCredentials: BotProviderCredentials;
}

/**
 * Options for creating a config-aware bot verifier.
 */
export interface ConfigAwareVerifierOptions {
	/**
	 * Base URL of the Banata Auth API (e.g., "http://localhost:3000/api/auth").
	 * The radar config endpoint will be called at `${configApiUrl}/banata/config/radar/get`.
	 */
	configApiUrl: string;

	/**
	 * How long to cache the radar config (in milliseconds).
	 * @default 60000 (1 minute)
	 */
	cacheTtlMs?: number;

	/**
	 * Cookie header to forward for authentication.
	 * If not provided, the verifier will try to read from the request headers.
	 */
	cookieHeader?: string;

	/**
	 * Whether to allow requests through if config fetch or verification fails.
	 * @default true
	 */
	failOpen?: boolean;
}

// ─── Default Protected Paths ────────────────────────────────────────

const DEFAULT_PROTECTED_PATHS = [
	"/api/auth/sign-in",
	"/api/auth/sign-up",
	"/api/auth/forget-password",
	"/api/auth/reset-password",
];

// ─── withBotProtection ──────────────────────────────────────────────

/**
 * Wrap a route handler function with bot protection.
 *
 * This is the recommended way to add bot protection in Next.js
 * route handlers. It checks requests against protected paths and
 * verifies them before forwarding to the auth handler.
 *
 * @param handler - The original route handler function (e.g., `handler.POST`)
 * @param config - Bot protection configuration
 * @returns A wrapped handler that verifies bots before forwarding
 *
 * @example
 * ```ts
 * import { createRouteHandler } from "@banata-auth/nextjs";
 * import { withBotProtection } from "@banata-auth/nextjs/bot-protection";
 * import { checkBotId } from "botid/server";
 *
 * const handler = createRouteHandler({ convexSiteUrl: "..." });
 *
 * export const GET = handler.GET;
 * export const POST = withBotProtection(handler.POST, {
 *   verify: async () => {
 *     const result = await checkBotId();
 *     return { isBot: result.isBot };
 *   },
 * });
 * ```
 */
export function withBotProtection<THandler extends (...args: any[]) => Promise<Response>>(
	handler: THandler,
	config: BotProtectionConfig,
): THandler {
	const {
		verify,
		protectedPaths = DEFAULT_PROTECTED_PATHS,
		failOpen = true,
		blockedMessage = "Bot detected. Access denied.",
	} = config;

	const wrapped = async (...args: Parameters<THandler>): Promise<Response> => {
		// Extract the request from the first argument
		const request = args[0] as Request;

		if (request?.url) {
			const url = new URL(request.url);
			const isProtected = protectedPaths.some((path) => url.pathname.startsWith(path));

			if (isProtected) {
				try {
					const result = await verify(request);
					if (result.isBot) {
						return new Response(JSON.stringify({ error: blockedMessage }), {
							status: 403,
							headers: { "Content-Type": "application/json" },
						});
					}
				} catch {
					if (!failOpen) {
						return new Response(
							JSON.stringify({ error: "Bot verification unavailable. Please try again." }),
							{
								status: 503,
								headers: { "Content-Type": "application/json" },
							},
						);
					}
					// fail open — allow through
				}
			}
		}

		return handler(...args);
	};

	return wrapped as THandler;
}

/**
 * Create a BotID verification function for use with `withBotProtection`
 * or the `banataProtection` plugin.
 *
 * This is a convenience factory that wraps Vercel BotID's `checkBotId()`
 * function in the format expected by the protection system.
 *
 * @param checkBotIdFn - The `checkBotId` function from `botid/server`
 * @returns A verification function compatible with `BotCheckFn` / `BotVerifyFn`
 *
 * @example
 * ```ts
 * import { createBotIdVerifier } from "@banata-auth/nextjs/bot-protection";
 * import { checkBotId } from "botid/server";
 *
 * const verify = createBotIdVerifier(checkBotId);
 *
 * export const POST = withBotProtection(handler.POST, { verify });
 * ```
 */
export function createBotIdVerifier(checkBotIdFn: () => Promise<{ isBot: boolean }>): BotCheckFn {
	return async (_request: Request): Promise<BotCheckResult> => {
		try {
			const result = await checkBotIdFn();
			return { isBot: result.isBot };
		} catch {
			// BotID not configured (not on Vercel) — allow through
			return { isBot: false };
		}
	};
}

// ─── Config-Aware Verifier ──────────────────────────────────────────

/**
 * Create a bot verifier that reads provider credentials from the
 * Banata Auth config API (Radar configuration).
 *
 * This allows dashboard admins to configure bot protection credentials
 * through the UI (Radar > Configuration > Bot Detection Provider),
 * and the verifier will automatically pick up the latest credentials.
 *
 * The config is cached in-memory for performance (default: 1 minute TTL).
 *
 * @param options - Config-aware verifier options
 * @returns A verification function that uses the configured bot provider
 *
 * @example
 * ```ts
 * import { createConfigAwareVerifier, withBotProtection } from "@banata-auth/nextjs/bot-protection";
 *
 * const verify = createConfigAwareVerifier({
 *   configApiUrl: process.env.NEXT_PUBLIC_APP_URL + "/api/auth",
 * });
 *
 * export const POST = withBotProtection(handler.POST, { verify });
 * ```
 */
export function createConfigAwareVerifier(options: ConfigAwareVerifierOptions): BotCheckFn {
	const { configApiUrl, cacheTtlMs = 60_000, failOpen = true } = options;

	let cachedConfig: RadarConfigResponse | null = null;
	let cacheTimestamp = 0;

	async function fetchRadarConfig(request: Request): Promise<RadarConfigResponse | null> {
		const now = Date.now();
		if (cachedConfig && now - cacheTimestamp < cacheTtlMs) {
			return cachedConfig;
		}

		try {
			// Forward cookies from the incoming request for auth
			const cookieHeader = options.cookieHeader ?? request.headers.get("cookie") ?? "";

			const response = await fetch(`${configApiUrl}/banata/config/radar/get`, {
				method: "POST",
				headers: {
					"content-type": "application/json",
					...(cookieHeader ? { cookie: cookieHeader } : {}),
				},
				body: JSON.stringify({}),
			});

			if (!response.ok) {
				console.warn("[bot-protection] Failed to fetch radar config:", response.status);
				return cachedConfig; // Return stale cache if available
			}

			const data = (await response.json()) as RadarConfigResponse;
			cachedConfig = data;
			cacheTimestamp = now;
			return data;
		} catch (error) {
			console.warn(
				"[bot-protection] Error fetching radar config:",
				error instanceof Error ? error.message : error,
			);
			return cachedConfig; // Return stale cache if available
		}
	}

	return async (request: Request): Promise<BotCheckResult> => {
		try {
			const radarConfig = await fetchRadarConfig(request);

			// If radar is not enabled or bot detection is off, allow through
			if (!radarConfig?.enabled || !radarConfig.botDetection) {
				return { isBot: false };
			}

			const { botProvider, botProviderCredentials } = radarConfig;

			if (!botProvider || !botProviderCredentials) {
				return { isBot: false };
			}

			// Dispatch to the appropriate provider
			switch (botProvider) {
				case "botid": {
					// Vercel BotID — uses checkBotId() which reads from the request context
					// The API key is configured at the Vercel project level, not per-request
					try {
						const { checkBotId } = await import("botid/server");
						const result = await checkBotId();
						return { isBot: result.isBot };
					} catch {
						// BotID not available (not on Vercel)
						return { isBot: false };
					}
				}

				case "turnstile": {
					// Cloudflare Turnstile verification
					const { secretKey } = botProviderCredentials;
					if (!secretKey) return { isBot: false };

					const formData = new URLSearchParams();
					formData.append("secret", secretKey);

					// The Turnstile token should be in the request body or header
					const turnstileToken =
						request.headers.get("cf-turnstile-response") ??
						request.headers.get("x-turnstile-token");
					if (!turnstileToken) {
						return { isBot: false, reason: "No Turnstile token provided" };
					}
					formData.append("response", turnstileToken);

					const verifyResponse = await fetch(
						"https://challenges.cloudflare.com/turnstile/v0/siteverify",
						{
							method: "POST",
							headers: { "content-type": "application/x-www-form-urlencoded" },
							body: formData.toString(),
						},
					);

					const verifyResult = (await verifyResponse.json()) as { success: boolean };
					return { isBot: !verifyResult.success };
				}

				case "recaptcha": {
					// Google reCAPTCHA v3 verification
					const { secretKey: recaptchaSecret } = botProviderCredentials;
					if (!recaptchaSecret) return { isBot: false };

					const recaptchaToken =
						request.headers.get("x-recaptcha-token") ?? request.headers.get("g-recaptcha-response");
					if (!recaptchaToken) {
						return { isBot: false, reason: "No reCAPTCHA token provided" };
					}

					const recaptchaResponse = await fetch(
						`https://www.google.com/recaptcha/api/siteverify?secret=${encodeURIComponent(recaptchaSecret)}&response=${encodeURIComponent(recaptchaToken)}`,
						{ method: "POST" },
					);

					const recaptchaResult = (await recaptchaResponse.json()) as {
						success: boolean;
						score?: number;
					};
					// Score < 0.5 is likely a bot (reCAPTCHA v3)
					const isBot = !recaptchaResult.success || (recaptchaResult.score ?? 1) < 0.5;
					return { isBot };
				}

				case "hcaptcha": {
					// hCaptcha verification
					const { secretKey: hcaptchaSecret } = botProviderCredentials;
					if (!hcaptchaSecret) return { isBot: false };

					const hcaptchaToken =
						request.headers.get("x-hcaptcha-token") ?? request.headers.get("h-captcha-response");
					if (!hcaptchaToken) {
						return { isBot: false, reason: "No hCaptcha token provided" };
					}

					const hcaptchaResponse = await fetch("https://api.hcaptcha.com/siteverify", {
						method: "POST",
						headers: { "content-type": "application/x-www-form-urlencoded" },
						body: `secret=${encodeURIComponent(hcaptchaSecret)}&response=${encodeURIComponent(hcaptchaToken)}`,
					});

					const hcaptchaResult = (await hcaptchaResponse.json()) as { success: boolean };
					return { isBot: !hcaptchaResult.success };
				}

				default:
					return { isBot: false };
			}
		} catch (error) {
			if (failOpen) {
				console.warn(
					"[bot-protection] Verification failed, allowing request (failOpen=true):",
					error instanceof Error ? error.message : error,
				);
				return { isBot: false };
			}
			return { isBot: true, reason: "Verification service unavailable" };
		}
	};
}
