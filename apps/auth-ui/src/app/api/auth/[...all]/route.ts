import { createRouteHandler } from "@banata-auth/nextjs";

const handler = createRouteHandler({
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "",
	allowInternalProjectScope: true,
});

export const { GET, POST, PUT, PATCH, DELETE } = handler;
