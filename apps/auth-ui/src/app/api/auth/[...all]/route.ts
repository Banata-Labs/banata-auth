import { createRouteHandler } from "@banata-auth/nextjs";

const handler = createRouteHandler({
	authUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL ?? "",
	allowInternalProjectScope: true,
});

export const { GET, POST, PUT, PATCH, DELETE } = handler;
