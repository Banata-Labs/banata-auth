/**
 * Server-side auth helpers for Next.js.
 *
 * Provides utilities for:
 * - Route handler proxying (Next.js API routes -> Convex .site)
 * - Preloading authenticated Convex queries in server components
 * - Checking auth state in server components/actions
 */
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const {
	handler,
	preloadAuthQuery,
	isAuthenticated,
	getToken,
	fetchAuthQuery,
	fetchAuthMutation,
	fetchAuthAction,
} = convexBetterAuthNextJs({
	convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
