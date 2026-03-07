/**
 * HTTP route registration for Banata Auth.
 *
 * Better Auth exposes its endpoints as HTTP routes on Convex's httpRouter.
 * This module provides helpers for both direct Convex runtime registration and
 * Node-action proxy registration for SSO/SCIM flows that need Node libraries.
 */

import type { createClient } from "@convex-dev/better-auth";
import type { CreateAuth } from "@convex-dev/better-auth/utils";
import type {
	FunctionReference,
	GenericDataModel,
	HttpRouter,
	RoutableMethod,
} from "convex/server";
import { httpActionGeneric } from "convex/server";

/**
 * Type for the createAuth function that the HTTP router needs.
 * Uses the properly typed CreateAuth from @convex-dev/better-auth.
 */
export type CreateAuthFn = CreateAuth<GenericDataModel>;

/**
 * Type for the component client's registerRoutes method.
 */
export type RegisterRoutesFn = ReturnType<typeof createClient>["registerRoutes"];

/**
 * CORS configuration for auth routes.
 */
export interface BanataAuthCorsConfig {
	allowedOrigins?: string[];
	allowedHeaders?: string[];
	exposedHeaders?: string[];
}

interface SerializedAuthHeader {
	key: string;
	value: string;
}

interface SerializedAuthRequest {
	method: string;
	url: string;
	headers: SerializedAuthHeader[];
	body: string | null;
}

interface SerializedAuthResponse {
	status: number;
	headers: SerializedAuthHeader[];
	body: string | null;
}

function deserializeAuthResponse(serialized: SerializedAuthResponse) {
	const headers = new Headers();
	for (const header of serialized.headers) {
		headers.append(header.key, header.value);
	}
	return new Response(serialized.body, {
		status: serialized.status,
		headers,
	});
}

/**
 * Register all Banata Auth HTTP routes on a Convex httpRouter.
 */
export function registerBanataAuthRoutes(
	authComponent: ReturnType<typeof createClient>,
	httpRouter: HttpRouter,
	createAuth: CreateAuthFn,
	opts?: { cors?: boolean | BanataAuthCorsConfig },
) {
	authComponent.registerRoutes(httpRouter, createAuth, opts);
}

const ROUTABLE_HTTP_METHODS: RoutableMethod[] = [
	"GET",
	"POST",
	"PUT",
	"PATCH",
	"DELETE",
	"OPTIONS",
];

/**
 * Register auth routes through a Node action proxy.
 *
 * Use this when some Better Auth plugins depend on Node-only libraries while
 * keeping the public HTTP surface on Convex.
 */
export function registerBanataAuthNodeProxyRoutes(
	httpRouter: HttpRouter,
	createAuth: CreateAuthFn,
	handleNodeAuthRequest: FunctionReference<"action", "internal">,
) {
	const staticAuth = createAuth({} as never);
	const path = staticAuth.options.basePath ?? "/api/auth";
	const authRequestHandler = httpActionGeneric(async (ctx, request) => {
		const serializedRequest: SerializedAuthRequest = {
			method: request.method,
			url: request.url,
			headers: Array.from(request.headers.entries()).map(([key, value]) => ({ key, value })),
			body:
				request.method === "GET" || request.method === "HEAD"
					? null
					: await request.text(),
		};
		const serializedResponse = await ctx.runAction(handleNodeAuthRequest, {
			request: serializedRequest,
		});
		return deserializeAuthResponse(serializedResponse);
	});

	const wellKnown = httpRouter.lookup("/.well-known/openid-configuration", "GET");
	if (!wellKnown) {
		httpRouter.route({
			path: "/.well-known/openid-configuration",
			method: "GET",
			handler: httpActionGeneric(async () => {
				const url = `${process.env.CONVEX_SITE_URL}${path}/convex/.well-known/openid-configuration`;
				return Response.redirect(url, 302);
			}),
		});
	}

	for (const method of ROUTABLE_HTTP_METHODS) {
		httpRouter.route({
			pathPrefix: `${path}/`,
			method,
			handler: authRequestHandler,
		});
	}
}
