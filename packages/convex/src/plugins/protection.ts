/**
 * Bot protection plugin for Banata Auth.
 *
 * Provides request-level bot detection and abuse prevention using
 * Better Auth's `onRequest` hook. This plugin intercepts incoming
 * requests BEFORE any auth processing occurs and can short-circuit
 * with a 403 if a bot is detected.
 *
 * The plugin is provider-agnostic — it accepts a `verifyRequest`
 * callback that consumers implement with their preferred bot detection
 * service (Vercel BotID, Cloudflare Turnstile, hCaptcha, reCAPTCHA, etc.).
 *
 * @example
 * ```ts
 * import { banataProtection } from "@banata-auth/convex/plugins";
 *
 * // The plugin is automatically included when you configure protection
 * // in your BanataAuthConfig:
 * const config: BanataAuthConfig = {
 *   protection: {
 *     enabled: true,
 *     protectedPaths: ["/sign-in", "/sign-up", "/forget-password", "/reset-password"],
 *     verifyRequest: async (request) => {
 *       // Implement your bot verification logic here
 *       return { isBot: false };
 *     },
 *   },
 * };
 * ```
 */

import type { BetterAuthPlugin } from "better-auth";

// ─── Types ──────────────────────────────────────────────────────────

/**
 * Result of a bot verification check.
 */
export interface BotVerificationResult {
	/** Whether the request was identified as coming from a bot. */
	isBot: boolean;
	/** Optional reason for the bot detection (for logging). */
	reason?: string;
}

/**
 * Function that verifies whether a request is from a bot.
 * Implement this with your bot detection provider of choice.
 *
 * @param request - The incoming HTTP request
 * @returns Verification result indicating whether the request is from a bot
 */
export type BotVerifyFn = (request: Request) => Promise<BotVerificationResult>;

/**
 * Configuration for the bot protection plugin.
 */
export interface BanataProtectionOptions {
	/**
	 * Whether bot protection is enabled.
	 * When false, all requests pass through without verification.
	 * @default true
	 */
	enabled?: boolean;

	/**
	 * Path prefixes to protect from bots.
	 * Only requests whose pathname starts with one of these prefixes
	 * will be verified. All other requests pass through.
	 *
	 * @default ["/sign-in", "/sign-up", "/forget-password", "/reset-password"]
	 */
	protectedPaths?: string[];

	/**
	 * The bot verification function.
	 * Called for every request that matches a protected path.
	 * If not provided, requests pass through (useful for development).
	 */
	verifyRequest?: BotVerifyFn;

	/**
	 * HTTP methods to check. By default only POST requests are verified
	 * since GET requests to auth endpoints are typically metadata/redirect
	 * flows, not credential submissions.
	 *
	 * @default ["POST"]
	 */
	protectedMethods?: string[];

	/**
	 * Custom error message returned when a bot is detected.
	 * @default "Bot detected. Access denied."
	 */
	blockedMessage?: string;

	/**
	 * Called when a bot is detected (for logging/analytics).
	 */
	onBotDetected?: (request: Request, result: BotVerificationResult) => void | Promise<void>;

	/**
	 * Whether to fail open (allow request) when the verification
	 * function throws an error. This prevents legitimate users from
	 * being locked out if the bot detection service is unavailable.
	 *
	 * @default true
	 */
	failOpen?: boolean;
}

// ─── Default Configuration ──────────────────────────────────────────

const DEFAULT_PROTECTED_PATHS = ["/sign-in", "/sign-up", "/forget-password", "/reset-password"];

const DEFAULT_PROTECTED_METHODS = ["POST"];

// ─── Plugin ─────────────────────────────────────────────────────────

/**
 * Bot protection plugin for Banata Auth.
 *
 * Uses Better Auth's `onRequest` hook to intercept requests before
 * any auth processing. Protected paths are checked against the
 * configured `verifyRequest` function.
 *
 * @param options - Protection configuration
 * @returns A Better Auth plugin
 *
 * @example
 * ```ts
 * import { banataProtection } from "@banata-auth/convex/plugins";
 * import { checkBotId } from "botid/server";
 *
 * banataProtection({
 *   verifyRequest: async (request) => {
 *     try {
 *       const result = await checkBotId();
 *       return { isBot: result.isBot };
 *     } catch {
 *       return { isBot: false }; // fail open
 *     }
 *   },
 * });
 * ```
 */
export function banataProtection(options: BanataProtectionOptions = {}): BetterAuthPlugin {
	const {
		enabled = true,
		protectedPaths = DEFAULT_PROTECTED_PATHS,
		protectedMethods = DEFAULT_PROTECTED_METHODS,
		verifyRequest,
		blockedMessage = "Bot detected. Access denied.",
		onBotDetected,
		failOpen = true,
	} = options;

	// Pre-compile the method set for fast lookup
	const methodSet = new Set(protectedMethods.map((m) => m.toUpperCase()));

	return {
		id: "banata-protection",

		onRequest: async (request, _ctx) => {
			// Short-circuit if disabled or no verify function
			if (!enabled || !verifyRequest) {
				return undefined;
			}

			// Only check configured HTTP methods
			if (!methodSet.has(request.method.toUpperCase())) {
				return undefined;
			}

			// Only check requests matching protected paths
			const url = new URL(request.url);
			const isProtected = protectedPaths.some(
				(path) => url.pathname.endsWith(path) || url.pathname.includes(path),
			);

			if (!isProtected) {
				return undefined;
			}

			// Run bot verification
			try {
				const result = await verifyRequest(request);

				if (result.isBot) {
					// Notify callback if provided
					if (onBotDetected) {
						try {
							await onBotDetected(request, result);
						} catch {
							// Don't fail the request if the callback throws
						}
					}

					// Block the request
					return {
						response: new Response(
							JSON.stringify({
								error: blockedMessage,
								...(result.reason ? { reason: result.reason } : {}),
							}),
							{
								status: 403,
								headers: { "Content-Type": "application/json" },
							},
						),
					};
				}

				// Human verified — proceed
				return undefined;
			} catch (error) {
				if (failOpen) {
					// Verification service unavailable — allow through
					console.warn(
						"[banata-protection] Bot verification failed, allowing request (failOpen=true):",
						error instanceof Error ? error.message : error,
					);
					return undefined;
				}

				// Fail closed — block the request
				return {
					response: new Response(
						JSON.stringify({ error: "Bot verification unavailable. Please try again." }),
						{
							status: 503,
							headers: { "Content-Type": "application/json" },
						},
					),
				};
			}
		},
	};
}
