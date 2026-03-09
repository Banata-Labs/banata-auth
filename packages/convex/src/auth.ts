/**
 * Banata Auth Convex integration — core auth instance factory.
 *
 * This module provides factory functions to wire Better Auth with Convex,
 * pre-configured with all plugins needed for WorkOS-equivalent functionality.
 *
 * Architecture:
 * - `@convex-dev/better-auth` bridges Better Auth to Convex's document DB
 * - `createClient()` creates the component client with the DB adapter
 * - `betterAuth()` is configured with all Phase 1 plugins
 * - HTTP routes are registered on Convex's httpRouter
 * - JWTs are signed with RS256 keys stored in the jwks table
 * - Convex validates JWTs via the JWKS endpoint
 *
 * Usage in consumer's convex/ directory:
 *
 * ```ts
 * // convex/banataAuth/auth.ts
 * import { createBanataAuthComponent, createBanataAuthOptions, createBanataAuth } from "@banata-auth/convex";
 * import { components } from "../_generated/api";
 * import type { DataModel } from "../_generated/dataModel";
 * import authConfig from "../auth.config";
 * import schema from "./schema";
 *
 * export const authComponent = createBanataAuthComponent(components.banataAuth, schema);
 *
 * export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
 *   createBanataAuthOptions(ctx, {
 *     authComponent,
 *     authConfig,
 *     siteUrl: process.env.SITE_URL!,
 *     secret: process.env.BETTER_AUTH_SECRET!,
 *   });
 *
 * export const createAuth = (ctx: GenericCtx<DataModel>) =>
 *   createBanataAuth(ctx, { authComponent, authConfig, config: { ... } });
 * ```
 */

import { RATE_LIMITS } from "@banata-auth/shared";
import { passkey } from "@better-auth/passkey";
// SCIM runs in Convex's standard runtime. SSO protocol endpoints are mounted
// through a Node action proxy in ./node.ts so samlify can run inside Convex.
import { scim } from "@better-auth/scim";
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions, BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import { apiKey } from "better-auth/plugins";
import { anonymous } from "better-auth/plugins/anonymous";
import { bearer } from "better-auth/plugins/bearer";
import { emailOTP } from "better-auth/plugins/email-otp";
// jwt is handled internally by the convex() plugin — do not import separately
import { magicLink } from "better-auth/plugins/magic-link";
import { multiSession } from "better-auth/plugins/multi-session";
import { twoFactor } from "better-auth/plugins/two-factor";
import { username } from "better-auth/plugins/username";
import type {
	AuthConfig,
	FunctionReference,
	GenericDataModel,
	GenericSchema,
	SchemaDefinition,
} from "convex/server";
import { createDatabaseHooks } from "./hooks";
import { auditLog } from "./plugins/audit";
import { configPlugin } from "./plugins/config";
import { domainsPlugin } from "./plugins/domains";
import { type BanataEmailOptions, banataEmail, createAutoEmailCallbacks } from "./plugins/email";
import { enterpriseProvisioningPlugin } from "./plugins/enterprise";
import { eventsPlugin } from "./plugins/events";
import { organizationRbacPlugin } from "./plugins/organization-rbac";
import { portalPlugin } from "./plugins/portal";
import { projectsPlugin } from "./plugins/projects";
import { type BanataProtectionOptions, banataProtection } from "./plugins/protection";
import { userManagementPlugin } from "./plugins/user-management";
import { vaultPlugin } from "./plugins/vault";
import { webhookSystem } from "./plugins/webhook";

// ─── Slim Component API ─────────────────────────────────────────────
// Structural supertype matching @convex-dev/better-auth's internal SlimComponentApi.
// We define it here to avoid `any` on the component reference parameter.

interface BanataAuthComponentApi {
	adapter: {
		create: FunctionReference<"mutation", "internal">;
		findOne: FunctionReference<"query", "internal">;
		findMany: FunctionReference<"query", "internal">;
		updateOne: FunctionReference<"mutation", "internal">;
		updateMany: FunctionReference<"mutation", "internal">;
		deleteOne: FunctionReference<"mutation", "internal">;
		deleteMany: FunctionReference<"mutation", "internal">;
	};
}

// ─── Types ──────────────────────────────────────────────────────────

/**
 * Optional email delivery overrides used by various auth methods.
 *
 * Banata's default behavior is to send auth emails automatically using
 * the provider and templates configured in the dashboard. These callbacks
 * exist only for projects that intentionally want to override that path.
 */
export interface BanataAuthEmailConfig {
	/** Override verification email delivery. */
	sendVerificationEmail?: (params: {
		user: { email: string; name: string };
		url: string;
		token: string;
	}) => Promise<void>;

	/** Override password reset email delivery. */
	sendResetPassword?: (params: {
		user: { email: string; name: string };
		url: string;
		token: string;
	}) => Promise<void>;

	/** Override magic-link delivery for passwordless sign-in. */
	sendMagicLink?: (params: {
		email: string;
		url: string;
		token: string;
	}) => Promise<void>;

	/** Override one-time-password delivery for email OTP auth. */
	sendOtp?: (params: {
		email: string;
		otp: string;
	}) => Promise<void>;

	/**
	 * Override organization invitation delivery.
	 * Note: The invitation ID is provided instead of a URL.
	 * The consumer constructs the accept URL from the ID.
	 */
	sendInvitationEmail?: (params: {
		email: string;
		invitationId: string;
		organizationName: string;
		inviterName: string;
	}) => Promise<void>;

	/** Send domain verification email. */
	sendDomainVerification?: (params: {
		email: string;
		domain: string;
		verificationToken: string;
	}) => Promise<void>;
}

/**
 * Social provider credentials.
 */
export interface SocialProviderConfig {
	clientId: string;
	clientSecret: string;
	enabled?: boolean;
}

/**
 * Email/password-specific configuration.
 */
export interface BanataEmailPasswordConfig {
	/**
	 * Require users to verify their email before they can sign in.
	 * Defaults to `true`.
	 */
	requireEmailVerification?: boolean;
	/** Minimum password length. Defaults to `8`. */
	minPasswordLength?: number;
	/** Maximum password length. Defaults to `128`. */
	maxPasswordLength?: number;
	/** Automatically sign users in after sign-up. Defaults to `true`. */
	autoSignIn?: boolean;
}

/**
 * Supported social providers and their config shapes.
 * Matches a subset of BetterAuthOptions["socialProviders"] keys.
 */
export interface BanataAuthSocialProviders {
	google?: SocialProviderConfig;
	github?: SocialProviderConfig;
	microsoft?: SocialProviderConfig & { tenantId?: string };
	apple?: SocialProviderConfig;
	discord?: SocialProviderConfig;
	facebook?: SocialProviderConfig;
	twitter?: SocialProviderConfig;
	linkedin?: SocialProviderConfig;
	gitlab?: SocialProviderConfig;
	slack?: SocialProviderConfig;
}

/**
 * Configuration for the Banata Auth instance.
 */
export interface BanataAuthConfig {
	/** App name displayed in emails and OAuth consent screens. */
	appName?: string;

	/**
	 * Site URL — your application's public URL.
	 * Used as Better Auth's `baseURL` for OAuth callbacks and email links.
	 * Typically `process.env.SITE_URL` (e.g., "http://localhost:3000").
	 *
	 * The Next.js route handler at `/api/auth/[...all]` proxies auth
	 * requests to Convex, so OAuth providers redirect to this URL and
	 * the proxy forwards the callback to Convex for processing.
	 */
	siteUrl: string;

	/**
	 * Better Auth secret for signing/encryption.
	 * Typically process.env.BETTER_AUTH_SECRET.
	 */
	secret: string;

	/** Social providers configuration (object, not array). */
	socialProviders?: BanataAuthSocialProviders;

	/** Email callback configuration (optional overrides). */
	email?: BanataAuthEmailConfig;

	/** Email/password auth behavior overrides. */
	emailPassword?: BanataEmailPasswordConfig;

	/**
	 * Built-in email sending options.
	 *
	 * When an email provider is configured through the dashboard, emails
	 * are sent automatically on auth events (verification, password reset,
	 * magic link, OTP, invitation). No consumer callbacks needed.
	 *
	 * Consumer-provided callbacks in `email` still take priority.
	 */
	emailOptions?: BanataEmailOptions;

	/**
	 * Enable/disable specific auth methods.
	 * All default to true unless explicitly set to false.
	 */
	authMethods?: {
		emailPassword?: boolean;
		magicLink?: boolean;
		emailOtp?: boolean;
		passkey?: boolean;
		twoFactor?: boolean;
		anonymous?: boolean;
		username?: boolean;
		multiSession?: boolean;
		organization?: boolean;
		sso?: boolean;
		scim?: boolean;
		apiKey?: boolean;
	};

	/**
	 * Passkey (WebAuthn) configuration.
	 * Required if authMethods.passkey is enabled.
	 */
	passkey?: {
		rpId: string;
		rpName: string;
		origin: string;
	};

	/**
	 * Organization plugin configuration.
	 */
	organizationConfig?: {
		/** Allow users to create organizations (default: true). */
		allowUserToCreateOrg?: boolean;
		/** Creator role when a user creates an org (default: "owner"). */
		creatorRole?: string;
		/** Maximum organizations a user can create. */
		maxOrganizations?: number;
	};

	/** SSO plugin configuration. */
	ssoConfig?: {
		/** Issuer URL for SAML SP entity ID construction. */
		issuer?: string;
		/** Enable domain verification for SSO connections. */
		domainVerification?: boolean;
		/** Default organization provisioning behavior. */
		provisionOrganization?: boolean;
	};

	/** SCIM plugin configuration. */
	scimConfig?: {
		/** Default role for SCIM-provisioned users. */
		defaultRole?: string;
		/** Whether to auto-create organizations from SCIM groups. */
		autoCreateOrganizations?: boolean;
	};

	/** API Key plugin configuration. */
	apiKeyConfig?: {
		/** API key prefix (e.g., "sk_live"). */
		prefix?: string;
		/** Default API key expiration in seconds. */
		defaultExpiresIn?: number;
	};

	/**
	 * Bot protection configuration.
	 *
	 * When configured, Banata Auth intercepts requests to sensitive auth
	 * endpoints (sign-in, sign-up, password reset) and verifies them using
	 * the provided `verifyRequest` function before any auth processing occurs.
	 *
	 * This is provider-agnostic — implement `verifyRequest` with Vercel BotID,
	 * Cloudflare Turnstile, hCaptcha, reCAPTCHA, or any other service.
	 *
	 * @example
	 * ```ts
	 * protection: {
	 *   enabled: true,
	 *   verifyRequest: async (request) => {
	 *     const result = await checkBotId();
	 *     return { isBot: result.isBot };
	 *   },
	 * },
	 * ```
	 */
	protection?: BanataProtectionOptions;

	/** Lifecycle trigger handlers. */
	triggers?: import("./triggers").BanataAuthTriggers;

	/**
	 * Trusted origins for CSRF/origin validation.
	 *
	 * Better Auth validates the `Origin` header on cookie-bearing requests.
	 * By default, only `siteUrl` is trusted. In development, the Next.js
	 * proxy may run on a different port (e.g. `http://localhost:3002`)
	 * and forward the browser's `Origin` header, causing a 403.
	 *
	 * Add all origins your dashboard/app may run on:
	 * ```ts
	 * trustedOrigins: ["http://localhost:3000", "http://localhost:3002"]
	 * ```
	 */
	trustedOrigins?: string[];

	/**
	 * Additional Better Auth options to merge.
	 * Use this for advanced configuration not covered by the typed config.
	 */
	advanced?: Partial<BetterAuthOptions>;
}

/**
 * Re-export Convex's AuthConfig for convenience.
 * This is the type consumers use in `convex/auth.config.ts`.
 */
export type { AuthConfig as BanataAuthConvexAuthConfig } from "convex/server";

// ─── Component Client Type ──────────────────────────────────────────

/** The return type of `createClient` with GenericDataModel defaults. */
type ComponentClient = ReturnType<typeof createClient>;

const MODULE_ANALYSIS_SECRET = "placeholder-for-module-analysis";
let warnedAboutMissingSecret = false;

function isPlainObject(value: unknown): value is Record<string, unknown> {
	return Object.prototype.toString.call(value) === "[object Object]";
}

function mergeOptionValues(base: unknown, override: unknown, key?: string): unknown {
	if (override === undefined) {
		return base;
	}

	if (Array.isArray(base) && Array.isArray(override)) {
		if (key === "plugins") {
			return [...base, ...override];
		}

		if (
			base.every((item) => typeof item === "string") &&
			override.every((item) => typeof item === "string")
		) {
			return Array.from(new Set([...base, ...override]));
		}

		return [...base, ...override];
	}

	if (isPlainObject(base) && isPlainObject(override)) {
		const merged: Record<string, unknown> = { ...base };
		for (const [childKey, childValue] of Object.entries(override)) {
			merged[childKey] = mergeOptionValues(merged[childKey], childValue, childKey);
		}
		return merged;
	}

	return override;
}

function mergeBetterAuthOptions(
	base: BetterAuthOptions,
	override: Partial<BetterAuthOptions> | undefined,
): BetterAuthOptions {
	if (!override) {
		return base;
	}

	return mergeOptionValues(base, override) as BetterAuthOptions;
}

function resolveConfiguredSecret(secret: string | undefined): string {
	const normalized = typeof secret === "string" ? secret.trim() : "";
	if (normalized.length > 0) {
		return secret as string;
	}

	if (!warnedAboutMissingSecret) {
		warnedAboutMissingSecret = true;
		console.warn(
			"[BanataAuth] BETTER_AUTH_SECRET is not available during config evaluation. " +
				"Using a placeholder so Convex module analysis can complete. " +
				"Set a real BETTER_AUTH_SECRET in your deployment before serving auth traffic.",
		);
	}

	return MODULE_ANALYSIS_SECRET;
}

// ─── Factory Functions ──────────────────────────────────────────────

/**
 * Create the Better Auth Convex component client.
 *
 * This bridges `@convex-dev/better-auth` to your Convex component,
 * providing the database adapter and HTTP route registration.
 *
 * @param componentRef - The component reference from `components.banataAuth`
 * @param schema - The component schema definition
 * @param options - Optional client options
 * @returns The component client with adapter and registerRoutes
 *
 * @example
 * ```ts
 * import { createBanataAuthComponent } from "@banata-auth/convex";
 * import { components } from "../_generated/api";
 * import schema from "./schema";
 *
 * export const authComponent = createBanataAuthComponent(
 *   components.banataAuth,
 *   schema,
 * );
 * ```
 */
export function createBanataAuthComponent<
	TDataModel extends GenericDataModel,
	TSchema extends SchemaDefinition<GenericSchema, true>,
>(componentRef: BanataAuthComponentApi, schema: TSchema, options?: { verbose?: boolean }) {
	return createClient<TDataModel, TSchema, BanataAuthComponentApi>(componentRef, {
		local: { schema },
		verbose: options?.verbose ?? false,
	});
}

/**
 * Build the Better Auth options object from Banata Auth config.
 *
 * This configures all Phase 1 plugins and returns a BetterAuthOptions
 * that can be passed to `betterAuth()`. The Convex database adapter
 * is injected from the component client.
 *
 * @param ctx - Convex function context
 * @param params - Configuration parameters
 * @returns BetterAuthOptions ready for `betterAuth()`
 *
 * @example
 * ```ts
 * export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
 *   createBanataAuthOptions(ctx, {
 *     authComponent,
 *     authConfig,
 *     config: {
 *       siteUrl: process.env.SITE_URL!,
 *       secret: process.env.BETTER_AUTH_SECRET!,
 *       socialProviders: { github: { clientId: "...", clientSecret: "..." } },
 *     },
 *   });
 * ```
 */
export function createBanataAuthOptions(
	ctx: GenericCtx<GenericDataModel>,
	params: {
		authComponent: ComponentClient;
		authConfig: AuthConfig;
		config: BanataAuthConfig;
	},
): BetterAuthOptions {
	const { authComponent, authConfig, config } = params;
	const methods = config.authMethods ?? {};
	const emailPassword = config.emailPassword ?? {};
	const resolvedSecret = resolveConfiguredSecret(config.secret);

	// Build social providers object — Better Auth expects { github?: {...}, google?: {...} }
	const socialProviders = buildSocialProviders(config.socialProviders);

	// ── Built-in email system ──
	// Create auto-email callbacks that read provider config from the DB.
	// These serve as fallbacks when the consumer doesn't provide their own.
	const dbAdapter = authComponent.adapter(ctx);
	const emailOpts: BanataEmailOptions = {
		appName: config.appName,
		...config.emailOptions,
	};
	const autoCallbacks = createAutoEmailCallbacks(
		() => dbAdapter as unknown as import("./plugins/types").PluginDBAdapter,
		emailOpts,
	);

	// Build plugins array (pass auto-email callbacks for magic link, OTP, etc.)
	const plugins = buildPlugins(config, methods, autoCallbacks, emailOpts);

	// Build trustedOrigins — always include siteUrl, plus any extras
	const trustedOrigins: string[] = [config.siteUrl];
	if (config.trustedOrigins) {
		for (const origin of config.trustedOrigins) {
			if (!trustedOrigins.includes(origin)) {
				trustedOrigins.push(origin);
			}
		}
	}

	// Merge: consumer callback > auto callback
	const resolvedSendReset = config.email?.sendResetPassword ?? autoCallbacks.sendResetPassword;

	// Build the options
	const options: BetterAuthOptions = {
		appName: config.appName ?? "Banata Auth",
		baseURL: config.siteUrl,
		secret: resolvedSecret,
		trustedOrigins,
		database: dbAdapter,
		emailAndPassword: {
			enabled: methods.emailPassword !== false,
			requireEmailVerification: emailPassword.requireEmailVerification ?? true,
			minPasswordLength: emailPassword.minPasswordLength ?? 8,
			maxPasswordLength: emailPassword.maxPasswordLength ?? 128,
			sendResetPassword: async ({
				user,
				url,
				token,
			}: { user: { email: string; name: string }; url: string; token: string }) => {
				await resolvedSendReset({ user, url, token });
			},
			autoSignIn: emailPassword.autoSignIn ?? true,
		},
		// Rate limiting — protects sign-in, sign-up, password reset, and OTP endpoints
		// from brute-force and credential-stuffing attacks.
		rateLimit: {
			enabled: true,
			window: 60, // 1-minute window
			max: RATE_LIMITS.general, // default max per window
			customRules: {
				"/sign-in/*": {
					window: 60,
					max: RATE_LIMITS.signIn,
				},
				"/sign-up/*": {
					window: 60,
					max: RATE_LIMITS.signUp,
				},
				"/forget-password": {
					window: 60,
					max: RATE_LIMITS.passwordReset,
				},
				"/reset-password": {
					window: 60,
					max: RATE_LIMITS.passwordReset,
				},
				"/email-otp/*": {
					window: 60,
					max: RATE_LIMITS.emailOperations,
				},
				"/magic-link/*": {
					window: 60,
					max: RATE_LIMITS.emailOperations,
				},
				"/admin/*": {
					window: 60,
					max: RATE_LIMITS.admin,
				},
			},
		},
		...(socialProviders != null && { socialProviders }),
		plugins: [
			// Core Convex plugin — handles JWT/JWKS for Convex auth
			convex({
				authConfig,
				// Auto-rotate JWKS keys if the algorithm changed (e.g. EdDSA → RS256)
				jwksRotateOnTokenGenerationError: true,
			}),
			...plugins,
		],
		// Wire lifecycle triggers into Better Auth's database hooks
		databaseHooks: createDatabaseHooks(ctx, config.triggers),
	};

	return mergeBetterAuthOptions(options, config.advanced);
}

/**
 * Create the Better Auth instance for a given Convex context.
 *
 * This is the main factory function that creates a fully configured
 * Better Auth instance ready to handle auth requests.
 *
 * @param ctx - Convex function context
 * @param params - Same params as createBanataAuthOptions
 * @returns A Better Auth instance
 *
 * @example
 * ```ts
 * export const createAuth = (ctx: GenericCtx<DataModel>) =>
 *   createBanataAuth(ctx, {
 *     authComponent,
 *     authConfig,
 *     config: { siteUrl: "...", secret: "..." },
 *   });
 * ```
 */
export function createBanataAuth(
	ctx: GenericCtx<GenericDataModel>,
	params: {
		authComponent: ComponentClient;
		authConfig: AuthConfig;
		config: BanataAuthConfig;
	},
) {
	return betterAuth(createBanataAuthOptions(ctx, params));
}

/**
 * Helper to create the static auth options for schema generation.
 *
 * The `npx auth generate` CLI needs a static options object (not bound to
 * a Convex context). This creates one with a dummy adapter.
 *
 * @example
 * ```ts
 * // For CLI: npx auth generate --config ./convex/banataAuth/auth.ts
 * export const options = createBanataAuthStaticOptions({ ... });
 * ```
 */
export function createBanataAuthStaticOptions(params: {
	authComponent: ComponentClient;
	authConfig: AuthConfig;
	config: BanataAuthConfig;
}) {
	// Pass an empty object as ctx — the adapter won't be used during schema generation
	return createBanataAuthOptions({} as GenericCtx<GenericDataModel>, params);
}

// ─── Internal Helpers ───────────────────────────────────────────────

/**
 * Build the BetterAuth social providers object from our typed config.
 *
 * Better Auth expects `{ github?: { clientId, clientSecret, enabled? }, ... }`,
 * NOT an array.
 */
function buildSocialProviders(
	providers: BanataAuthSocialProviders | undefined,
): BetterAuthOptions["socialProviders"] | undefined {
	if (providers == null) return undefined;

	const entries = Object.entries(providers);
	if (entries.length === 0) return undefined;

	// Build the social providers object matching BetterAuth's SocialProviders mapped type.
	// Each key is a provider name, value is { clientId, clientSecret, enabled? }.
	const result: Record<string, SocialProviderConfig> = {};
	for (const [key, value] of entries) {
		if (value == null) continue;
		const clientId = typeof value.clientId === "string" ? value.clientId.trim() : "";
		const clientSecret =
			typeof value.clientSecret === "string" ? value.clientSecret.trim() : "";
		if (!clientId || !clientSecret) continue;
		result[key] = {
			...value,
			clientId,
			clientSecret,
		};
	}

	// Cast to the expected type — we're building the correct shape
	// but TypeScript can't verify the keys match the mapped type exactly.
	return Object.keys(result).length > 0
		? (result as BetterAuthOptions["socialProviders"])
		: undefined;
}

/**
 * Build the config plugin's social providers map from our typed config.
 *
 * Converts BanataAuthSocialProviders (which has clientId/clientSecret)
 * into the simpler { enabled: boolean, demo: boolean } shape that the
 * config plugin exposes to the dashboard.
 */
function buildConfigSocialProviders(
	providers: BanataAuthSocialProviders | undefined,
): Record<string, { enabled: boolean; demo: boolean }> | undefined {
	if (providers == null) return undefined;

	const result: Record<string, { enabled: boolean; demo: boolean }> = {};
	for (const [key, value] of Object.entries(providers)) {
		if (value != null) {
			result[key] = {
				enabled: value.enabled !== false,
				demo: false,
			};
		}
	}
	return Object.keys(result).length > 0 ? result : undefined;
}

/**
 * Build the plugins array based on enabled auth methods.
 */
function buildPlugins(
	config: BanataAuthConfig,
	methods: NonNullable<BanataAuthConfig["authMethods"]>,
	autoCallbacks: ReturnType<typeof createAutoEmailCallbacks>,
	emailOpts: BanataEmailOptions,
): BetterAuthPlugin[] {
	const plugins: BetterAuthPlugin[] = [
		// NOTE: Do NOT add jwt() here — the convex() plugin already includes
		// JWT functionality with the correct RS256 algorithm configuration.
		// Adding a standalone jwt() would create a duplicate with EdDSA defaults,
		// causing JOSENotSupported errors.

		// Audit log plugin — always enabled, logs all auth events
		auditLog(),

		// Webhook system plugin — manages outbound webhook endpoints and delivery
		webhookSystem(),

		// Config plugin — dashboard config, roles, permissions, branding, emails
		configPlugin({
			authMethods: methods,
			socialProviders: buildConfigSocialProviders(config.socialProviders),
			features: {
				hostedUi: false, // Will be enabled when auth-ui app is deployed
				signUp: methods.emailPassword !== false,
				mfa: methods.twoFactor !== false,
				localization: false,
			},
			sessions: {
				maxSessionLength: "7 days",
				accessTokenDuration: "15 minutes",
				inactivityTimeout: "2 days",
			},
		}),

		// Email plugin — auto-sends emails using dashboard-configured provider
		banataEmail(emailOpts),

		// Projects plugin — multi-project and multi-environment support
		projectsPlugin(),

		// Enterprise provisioning plugin — project-scoped SSO and SCIM management endpoints
		enterpriseProvisioningPlugin(),

		// Domain verification plugin — DNS-based enterprise domain ownership checks
		domainsPlugin(),

		// Events plugin — unified event stream (query layer over audit events)
		eventsPlugin(),

		// Vault plugin — envelope encryption for secrets via AES-256-GCM
		vaultPlugin(),

		// Portal plugin — short-lived admin portal link generation
		portalPlugin(),

		// User management plugin — project-scoped /admin/* compatibility without Better Auth admin
		userManagementPlugin(),

		// Bearer token plugin — API key-style auth
		bearer(),

		// Username plugin — sign-in with username
		username(),
	];

	// ── Magic Link ──
	// Enabled if the method is on AND either consumer provided a callback
	// OR an email provider is configured (auto callbacks always available)
	if (methods.magicLink !== false) {
		const resolvedSendMagicLink = config.email?.sendMagicLink ?? autoCallbacks.sendMagicLink;
		plugins.push(
			magicLink({
				expiresIn: 600,
				sendMagicLink: async ({
					email,
					url,
					token,
				}: { email: string; url: string; token: string }) => {
					await resolvedSendMagicLink({ email, url, token });
				},
			}),
		);
	}

	// ── Email OTP ──
	if (methods.emailOtp !== false) {
		const resolvedSendOtp = config.email?.sendOtp ?? autoCallbacks.sendOtp;
		plugins.push(
			emailOTP({
				expiresIn: 600,
				otpLength: 6,
				sendVerificationOTP: async ({ email, otp }: { email: string; otp: string }) => {
					await resolvedSendOtp({ email, otp });
				},
			}),
		);
	}

	if (methods.twoFactor !== false) {
		plugins.push(
			twoFactor({
				issuer: config.appName ?? "Banata Auth",
				backupCodes: {
					length: 8,
					characters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
				},
			}),
		);
	}

	if (methods.passkey !== false && config.passkey) {
		plugins.push(
			passkey({
				rpID: config.passkey.rpId,
				rpName: config.passkey.rpName,
				origin: config.passkey.origin,
			}),
		);
	}

	if (methods.anonymous !== false) {
		plugins.push(anonymous());
	}

	if (methods.multiSession !== false) {
		plugins.push(multiSession());
	}

	if (methods.organization !== false) {
		plugins.push(organizationRbacPlugin());
	}

	// SCIM — Better Auth stores `scimProvider.scimToken`; keep it hashed at rest.
	if (methods.scim !== false) {
		plugins.push(
			scim({
				storeSCIMToken: "hashed",
			}),
		);
	}

	// SSO protocol endpoints are mounted by the Node auth factory in ./node.ts.
	// Management endpoints stay on the RBAC-backed enterprise provisioning plugin above.

	if (methods.apiKey !== false) {
		plugins.push(
			apiKey({
				enableMetadata: true,
				enableSessionForAPIKeys: true,
				...(config.apiKeyConfig?.prefix
					? {
							defaultPrefix: config.apiKeyConfig.prefix,
						}
					: {}),
				...(config.apiKeyConfig?.defaultExpiresIn
					? {
							keyExpiration: {
								defaultExpiresIn: config.apiKeyConfig.defaultExpiresIn,
							},
						}
					: {}),
				customAPIKeyGetter: (ctx) => {
					const path = typeof ctx.path === "string" ? ctx.path : "";
					const isApiKeyManagedPath =
						path.startsWith("/admin/") ||
						path.startsWith("/banata/") ||
						path.startsWith("/organization/") ||
						path.startsWith("/api-key/");
					const directApiKey =
						ctx.headers?.get("x-api-key") ?? ctx.request?.headers.get("x-api-key") ?? null;
					if (directApiKey?.trim()) {
						return directApiKey.trim();
					}
					if (!isApiKeyManagedPath) {
						return undefined;
					}

					const authorizationHeader =
						ctx.headers?.get("authorization") ??
						ctx.request?.headers.get("authorization") ??
						null;
					if (authorizationHeader) {
						const [scheme, token] = authorizationHeader.split(/\s+/, 2);
						if (scheme?.toLowerCase() === "bearer" && token?.trim()) {
							return token.trim();
						}
					}

					return undefined;
				},
			}),
		);
	}

	// Bot protection plugin — intercepts requests before auth processing
	if (config.protection) {
		plugins.push(banataProtection(config.protection));
	}

	return plugins;
}
