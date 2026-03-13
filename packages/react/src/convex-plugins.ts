/**
 * Convex-specific client plugins for Banata Auth.
 *
 * These require `@convex-dev/better-auth` as a peer dependency.
 * Non-Convex users should import from "@banata-auth/react/plugins" instead.
 *
 * @example
 * ```ts
 * import { convexClient, crossDomainClient } from "@banata-auth/react/plugins/convex";
 * ```
 */
export {
	convexClient,
	crossDomainClient,
} from "@convex-dev/better-auth/client/plugins";
