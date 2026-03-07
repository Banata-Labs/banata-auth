// ─── Core Auth Factory ──────────────────────────────────────────────
export {
	createBanataAuthComponent,
	createBanataAuthOptions,
	createBanataAuth,
	createBanataAuthStaticOptions,
} from "./auth";

export type {
	BanataAuthConfig,
	BanataAuthEmailConfig,
	BanataAuthSocialProviders,
	SocialProviderConfig,
} from "./auth";
export type { BanataAuthConvexAuthConfig } from "./auth";

// ─── HTTP Route Registration ────────────────────────────────────────
export { registerBanataAuthRoutes, registerBanataAuthNodeProxyRoutes } from "./http";
export type { CreateAuthFn, RegisterRoutesFn, BanataAuthCorsConfig } from "./http";

// ─── Triggers ───────────────────────────────────────────────────────
export {
	defineBanataAuthTriggers,
	executeTrigger,
	createTriggerContext,
} from "./triggers";
export type {
	BanataAuthTriggers,
	TriggerContext,
	TriggerMetadata,
	TriggerUser,
	TriggerSession,
	TriggerOrganization,
	TriggerMember,
} from "./triggers";

// ─── Hooks (Trigger → Better Auth bridge) ───────────────────────
export { createDatabaseHooks } from "./hooks";
