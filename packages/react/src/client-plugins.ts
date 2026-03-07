/**
 * Re-export Convex + Better Auth client plugins so consumers
 * don't need `@convex-dev/better-auth` or `better-auth` as
 * direct dependencies.
 *
 * @example
 * ```ts
 * import {
 *   createAuthClient,
 *   convexClient,
 *   crossDomainClient,
 *   organizationClient,
 * } from "@banata-auth/react/plugins";
 *
 * export const authClient = createAuthClient({
 *   plugins: [convexClient(), crossDomainClient(), organizationClient()],
 * });
 * ```
 */

// Convex ↔ Better Auth bridge plugins
export {
	convexClient,
	crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";

// Auth client factory
export { createAuthClient } from "better-auth/react";

// Better Auth client plugins
export {
	adminClient,
	organizationClient,
	apiKeyClient,
	twoFactorClient,
	multiSessionClient,
	usernameClient,
} from "better-auth/client/plugins";
