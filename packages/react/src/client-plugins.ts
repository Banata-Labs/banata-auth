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
import {
	organizationClient as betterAuthOrganizationClient,
} from "better-auth/client/plugins";
export {
	adminClient,
	apiKeyClient,
	twoFactorClient,
	multiSessionClient,
	usernameClient,
} from "better-auth/client/plugins";

type BanataOrganizationClientOptions = NonNullable<
	Parameters<typeof betterAuthOrganizationClient>[0]
> & {
	roles?: Record<string, unknown>;
};

export const organizationClient = <CO extends BanataOrganizationClientOptions>(
	options?: CO,
) =>
	betterAuthOrganizationClient<CO & { roles: Record<string, unknown> }>(
		options as (CO & { roles: Record<string, unknown> }) | undefined,
	);
