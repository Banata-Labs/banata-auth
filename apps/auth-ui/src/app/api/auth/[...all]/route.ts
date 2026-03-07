import { createRouteHandler } from "@banata-auth/nextjs";

const handler = createRouteHandler({
	convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "",
});

export const { GET, POST, PUT, PATCH, DELETE } = handler;
