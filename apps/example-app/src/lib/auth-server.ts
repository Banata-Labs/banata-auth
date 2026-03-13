import { createBanataAuthServer } from "@banata-auth/nextjs/server";

const missingApiKeyMessage =
	"[Banata Auth Example] BANATA_API_KEY is required. " +
	"Create a project API key in the Banata dashboard and set it in your app server environment before starting the app.";

type BanataAuthServer = ReturnType<typeof createBanataAuthServer>;

let cachedServer: BanataAuthServer | null = null;

function getServer(): BanataAuthServer {
	if (cachedServer) {
		return cachedServer;
	}

	const apiKey = process.env.BANATA_API_KEY;
	if (!apiKey) {
		throw new Error(missingApiKeyMessage);
	}

	cachedServer = createBanataAuthServer({
		apiKey,
		authUrl: process.env.BANATA_AUTH_URL,
	});
	return cachedServer;
}

function createMissingApiKeyResponse(): Response {
	return new Response(
		JSON.stringify({
			error: missingApiKeyMessage,
		}),
		{
			status: 500,
			headers: {
				"content-type": "application/json",
			},
		},
	);
}

function withApiKeyGuard<THandler extends (request: Request) => Promise<Response>>(handler: THandler) {
	return (async (request: Request) => {
		if (!process.env.BANATA_API_KEY) {
			return createMissingApiKeyResponse();
		}
		return handler(request);
	}) as THandler;
}

export const handler: BanataAuthServer["handler"] = {
	GET: withApiKeyGuard(async (request) => getServer().handler.GET(request)),
	POST: withApiKeyGuard(async (request) => getServer().handler.POST(request)),
	PUT: withApiKeyGuard(async (request) => getServer().handler.PUT(request)),
	PATCH: withApiKeyGuard(async (request) => getServer().handler.PATCH(request)),
	DELETE: withApiKeyGuard(async (request) => getServer().handler.DELETE(request)),
	OPTIONS: withApiKeyGuard(async (request) => getServer().handler.OPTIONS(request)),
};

export const preloadAuthQuery = ((...args: Parameters<BanataAuthServer["preloadAuthQuery"]>) => {
	return getServer().preloadAuthQuery(...args);
}) as BanataAuthServer["preloadAuthQuery"];

export const isAuthenticated = (async (
	...args: Parameters<BanataAuthServer["isAuthenticated"]>
) => {
	if (!process.env.BANATA_API_KEY) {
		return false;
	}
	return getServer().isAuthenticated(...args);
}) as BanataAuthServer["isAuthenticated"];

export const getToken = (async (...args: Parameters<BanataAuthServer["getToken"]>) => {
	if (!process.env.BANATA_API_KEY) {
		return null;
	}
	return getServer().getToken(...args);
}) as BanataAuthServer["getToken"];

export const fetchAuthQuery = ((...args: Parameters<BanataAuthServer["fetchAuthQuery"]>) => {
	return getServer().fetchAuthQuery(...args);
}) as BanataAuthServer["fetchAuthQuery"];

export const fetchAuthMutation = ((...args: Parameters<BanataAuthServer["fetchAuthMutation"]>) => {
	return getServer().fetchAuthMutation(...args);
}) as BanataAuthServer["fetchAuthMutation"];

export const fetchAuthAction = ((...args: Parameters<BanataAuthServer["fetchAuthAction"]>) => {
	return getServer().fetchAuthAction(...args);
}) as BanataAuthServer["fetchAuthAction"];
