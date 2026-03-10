import { createBanataAuthServer } from "@banata-auth/nextjs/server";
import { resolveDashboardConvexSiteUrl } from "./convex-urls";

/**
 * Banata Auth server utilities for the dashboard.
 *
 * Dogfoods @banata-auth/nextjs/server - exactly how a customer would use it.
 */
const convexSiteUrl = resolveDashboardConvexSiteUrl();

if (!convexSiteUrl) {
	throw new Error(
		"Banata dashboard requires NEXT_PUBLIC_CONVEX_SITE_URL, or NEXT_PUBLIC_CONVEX_URL so the .convex.site URL can be derived.",
	);
}

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
	convexSiteUrl,
	allowInternalProjectScope: true,
});
