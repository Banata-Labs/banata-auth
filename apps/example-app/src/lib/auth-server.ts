import { createBanataAuthServer } from "@banata-auth/nextjs/server";

const apiKey = process.env.BANATA_API_KEY;

if (!apiKey) {
	throw new Error(
		"[Banata Auth Example] BANATA_API_KEY is required. " +
			"Create a project API key in the Banata dashboard and set it in your app server environment before starting the app.",
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
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
	apiKey,
});
