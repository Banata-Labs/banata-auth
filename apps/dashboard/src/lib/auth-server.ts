import { createBanataAuthServer } from "@banata-auth/nextjs/server";
import { resolveDashboardConvexSiteUrl } from "./convex-urls";

/**
 * Banata Auth server utilities for the dashboard.
 *
 * Dogfoods @banata-auth/nextjs/server - exactly how a customer would use it.
 */
type DashboardAuthServer = ReturnType<typeof createBanataAuthServer>;

const missingAuthConfigMessage =
	"Banata dashboard requires NEXT_PUBLIC_CONVEX_SITE_URL, or NEXT_PUBLIC_CONVEX_URL so the .convex.site URL can be derived.";

let cachedServer: DashboardAuthServer | null | undefined;

function createMissingConfigResponse(): Response {
	return new Response(JSON.stringify({ error: missingAuthConfigMessage }), {
		status: 500,
		headers: {
			"content-type": "application/json",
		},
	});
}

function getServer(): DashboardAuthServer | null {
	if (cachedServer !== undefined) {
		return cachedServer;
	}

	const convexSiteUrl = resolveDashboardConvexSiteUrl();
	if (!convexSiteUrl) {
		cachedServer = null;
		return cachedServer;
	}

	cachedServer = createBanataAuthServer({
		authUrl: convexSiteUrl,
		allowInternalProjectScope: true,
	});
	return cachedServer;
}

function requireServer(): DashboardAuthServer {
	const server = getServer();
	if (!server) {
		throw new Error(missingAuthConfigMessage);
	}
	return server;
}

export const handler: DashboardAuthServer["handler"] = {
	GET: async (request) => {
		const server = getServer();
		return server ? server.handler.GET(request) : createMissingConfigResponse();
	},
	POST: async (request) => {
		const server = getServer();
		return server ? server.handler.POST(request) : createMissingConfigResponse();
	},
	PUT: async (request) => {
		const server = getServer();
		return server ? server.handler.PUT(request) : createMissingConfigResponse();
	},
	PATCH: async (request) => {
		const server = getServer();
		return server ? server.handler.PATCH(request) : createMissingConfigResponse();
	},
	DELETE: async (request) => {
		const server = getServer();
		return server ? server.handler.DELETE(request) : createMissingConfigResponse();
	},
	OPTIONS: async (request) => {
		const server = getServer();
		return server ? server.handler.OPTIONS(request) : createMissingConfigResponse();
	},
};

export const preloadAuthQuery = ((...args: Parameters<DashboardAuthServer["preloadAuthQuery"]>) => {
	return requireServer().preloadAuthQuery(...args);
}) as DashboardAuthServer["preloadAuthQuery"];

export const isAuthenticated = (async (
	...args: Parameters<DashboardAuthServer["isAuthenticated"]>
) => {
	const server = getServer();
	if (!server) {
		return false;
	}
	return server.isAuthenticated(...args);
}) as DashboardAuthServer["isAuthenticated"];

export const getToken = (async (...args: Parameters<DashboardAuthServer["getToken"]>) => {
	const server = getServer();
	if (!server) {
		return null;
	}
	return server.getToken(...args);
}) as DashboardAuthServer["getToken"];

export const fetchAuthQuery = ((...args: Parameters<DashboardAuthServer["fetchAuthQuery"]>) => {
	return requireServer().fetchAuthQuery(...args);
}) as DashboardAuthServer["fetchAuthQuery"];

export const fetchAuthMutation = ((
	...args: Parameters<DashboardAuthServer["fetchAuthMutation"]>
) => {
	return requireServer().fetchAuthMutation(...args);
}) as DashboardAuthServer["fetchAuthMutation"];

export const fetchAuthAction = ((...args: Parameters<DashboardAuthServer["fetchAuthAction"]>) => {
	return requireServer().fetchAuthAction(...args);
}) as DashboardAuthServer["fetchAuthAction"];
