import { createBanataAuthServer } from "@banata-auth/nextjs/server";

/**
 * Banata Auth server utilities for the dashboard.
 *
 * Dogfoods @banata-auth/nextjs/server — exactly how a customer would use it.
 */
export const {
	handler,
	preloadAuthQuery,
	isAuthenticated,
	getToken,
	fetchAuthQuery,
	fetchAuthMutation,
	fetchAuthAction,
} = createBanataAuthServer({
	convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
