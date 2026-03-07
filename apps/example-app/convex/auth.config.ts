/**
 * Convex auth configuration.
 *
 * Tells Convex how to validate JWTs issued by Better Auth
 * via the JWKS endpoint.
 */
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
	providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
