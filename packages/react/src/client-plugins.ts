/**
 * Re-export Better Auth client plugins so consumers don't need
 * `better-auth` as a direct dependency.
 *
 * For Convex-specific plugins (convexClient, crossDomainClient),
 * import from "@banata-auth/react/plugins/convex" instead.
 *
 * @example
 * ```ts
 * import {
 *   createAuthClient,
 *   organizationClient,
 * } from "@banata-auth/react/plugins";
 *
 * export const authClient = createAuthClient({
 *   plugins: [organizationClient()],
 * });
 * ```
 */

// Auth client factory
export { createAuthClient } from "better-auth/react";

/**
 * Resolve a potentially relative auth base URL to an absolute URL.
 *
 * Better Auth requires an absolute `baseURL`. This helper resolves
 * relative paths (like `/api/auth`) against `window.location.origin`
 * in the browser, or falls back to `http://localhost/api/auth` on the server.
 *
 * @example
 * ```ts
 * const authClient = createAuthClient({
 *   baseURL: resolveAuthBaseUrl("/api/auth"),
 * });
 * ```
 */
export function resolveAuthBaseUrl(baseUrl?: string | null): string {
	const trimmed = baseUrl?.replace(/\/$/, "");
	if (trimmed?.startsWith("http://") || trimmed?.startsWith("https://")) {
		return trimmed;
	}
	if (typeof window !== "undefined") {
		return new URL(trimmed ?? "/api/auth", window.location.origin).toString();
	}
	return `http://localhost${trimmed ?? "/api/auth"}`;
}

// Better Auth client plugins
import {
	organizationClient as betterAuthOrganizationClient,
} from "better-auth/client/plugins";
export {
	adminClient,
	apiKeyClient,
	oneTimeTokenClient,
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
