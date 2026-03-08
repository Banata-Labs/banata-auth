/**
 * Auth API route handler.
 *
 * Proxies auth requests from Next.js to the Convex .site URL
 * where Better Auth HTTP routes are registered.
 */
import { createRouteHandler } from "@banata-auth/nextjs";

const handler = createRouteHandler({
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "",
	project: {
		clientId: process.env.BANATA_CLIENT_ID,
		projectId: process.env.BANATA_PROJECT_ID,
	},
});

export const { GET, POST, PUT, PATCH, DELETE } = handler;
