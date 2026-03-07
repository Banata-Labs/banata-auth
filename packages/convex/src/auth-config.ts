/**
 * Convex auth configuration provider for JWT validation.
 *
 * This tells Convex how to validate JWTs issued by Better Auth
 * using the JWKS endpoint exposed by the component.
 *
 * Usage in consumer's convex/auth.config.ts:
 *
 * ```ts
 * import { getAuthConfigProvider } from "@banata-auth/convex/auth-config";
 * import type { AuthConfig } from "convex/server";
 *
 * export default {
 *   providers: [getAuthConfigProvider()],
 * } satisfies AuthConfig;
 * ```
 *
 * We re-export the official function from @convex-dev/better-auth
 * and also provide our own version as a fallback.
 */

// Re-export the official implementation
export { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
