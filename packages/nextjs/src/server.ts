import { getToken as getBetterAuthToken, type GetTokenOptions } from "@convex-dev/better-auth/utils";
import { fetchAction, fetchMutation, fetchQuery, preloadQuery } from "convex/nextjs";
import type { Preloaded } from "convex/react";
import type { ArgsAndOptions, FunctionReference, FunctionReturnType } from "convex/server";
import React from "react";
import {
	createRouteHandler,
	type BanataProjectRouteScope,
} from "./route-handler";

const cache =
	React.cache ??
	((fn: (...args: never[]) => unknown) => {
		return (...args: never[]) => fn(...args);
	});

function parseConvexSiteUrl(url: string): string {
	if (!url) {
		throw new Error(
			"NEXT_PUBLIC_CONVEX_SITE_URL is required. Point it at your Banata instance .convex.site URL.",
		);
	}
	if (url.endsWith(".convex.cloud")) {
		throw new Error(
			`convexSiteUrl must point to the Convex site URL (.convex.site), not ${url}.`,
		);
	}
	return url;
}

type OptionalArgs<FuncRef extends FunctionReference<any, any>> = keyof FuncRef["_args"] extends never
	? [args?: FuncRef["_args"]]
	: [args: FuncRef["_args"]];

function getArgsAndOptions<FuncRef extends FunctionReference<any, any>>(
	args: OptionalArgs<FuncRef>,
	token?: string,
): ArgsAndOptions<FuncRef, { token?: string }> {
	return [args[0], { token }];
}

function normalizeValue(value: string | null | undefined): string | null {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function applyServerAuthHeaders(
	headers: Headers,
	options: {
		apiKey?: string;
		allowInternalProjectScope?: boolean;
		project?: BanataProjectRouteScope;
	},
): void {
	const apiKey = normalizeValue(options.apiKey);
	if (apiKey) {
		headers.set("x-api-key", apiKey);
	}
	if (options.allowInternalProjectScope) {
		headers.set("x-banata-internal-project-scope", "1");
	}

	const projectId = normalizeValue(options.project?.projectId);
	if (projectId) {
		headers.set("x-banata-project-id", projectId);
	}

	const clientId = normalizeValue(options.project?.clientId);
	if (clientId) {
		headers.set("x-banata-client-id", clientId);
	}
}

// The `resolve(request)` callback is route-handler-only because server component
// utilities do not have a Request object to inspect.
type StaticProjectScope = Omit<BanataProjectRouteScope, "resolve">;

interface BanataAuthServerBaseOptions extends GetTokenOptions {
	/**
	 * Your Convex cloud URL (e.g. `https://adjective-animal-123.convex.cloud`).
	 * Typically `process.env.NEXT_PUBLIC_CONVEX_URL`.
	 */
	convexUrl: string;

	/**
	 * Your Convex site URL (e.g. `https://adjective-animal-123.convex.site`).
	 * Typically `process.env.NEXT_PUBLIC_CONVEX_SITE_URL`.
	 */
	convexSiteUrl: string;
	/** Origins allowed to call the auth proxy cross-origin. */
	allowedOrigins?: string[];
}

export type BanataManagedAuthServerOptions = {
	/**
	 * Project-scoped Banata API key.
	 *
	 * This is the default project-binding mechanism for customer apps.
	 * The browser never sees this key; the Next.js server injects it while
	 * proxying auth traffic and refreshing Convex auth tokens.
	 */
	apiKey: string;
	allowInternalProjectScope?: false;
	project?: StaticProjectScope;
};

export type BanataInternalAuthServerOptions = {
	apiKey?: string;
	/**
	 * Banata-internal escape hatch for hosted first-party surfaces.
	 *
	 * This should not be used by customer apps.
	 */
	allowInternalProjectScope: true;
	project?: StaticProjectScope;
};

export type BanataAuthServerOptions = BanataAuthServerBaseOptions &
	(BanataManagedAuthServerOptions | BanataInternalAuthServerOptions);

/**
 * Create the Banata Auth server utilities for Next.js.
 *
 * This is the recommended way to configure server-side auth helpers.
 * It keeps auth cookies on your app's domain while binding the app to a Banata
 * project with a server-side API key.
 */
export function createBanataAuthServer(opts: BanataAuthServerOptions) {
	const siteUrl = parseConvexSiteUrl(opts.convexSiteUrl);

	const cachedGetToken = cache(async ({ forceRefresh }: { forceRefresh?: boolean } = {}) => {
		const requestHeaders = await (await import("next/headers.js")).headers();
		const mutableHeaders = new Headers(requestHeaders);
		mutableHeaders.delete("content-length");
		mutableHeaders.delete("transfer-encoding");
		applyServerAuthHeaders(mutableHeaders, {
			apiKey: opts.apiKey,
			allowInternalProjectScope: opts.allowInternalProjectScope,
			project: opts.project,
		});
		return getBetterAuthToken(siteUrl, mutableHeaders, {
			forceRefresh,
			cookiePrefix: opts.cookiePrefix,
			jwtCache: opts.jwtCache,
		});
	});

	const handler = opts.allowInternalProjectScope
		? createRouteHandler({
				convexSiteUrl: opts.convexSiteUrl,
				allowInternalProjectScope: true,
				allowedOrigins: opts.allowedOrigins,
				apiKey: opts.apiKey,
				project: opts.project,
			})
		: createRouteHandler({
				convexSiteUrl: opts.convexSiteUrl,
				allowedOrigins: opts.allowedOrigins,
				apiKey: opts.apiKey,
				project: opts.project,
			});

	const callWithToken = async <
		FnType extends "query" | "mutation" | "action",
		Fn extends FunctionReference<FnType>,
	>(
		fn: (token?: string) => Promise<FunctionReturnType<Fn>>,
	): Promise<FunctionReturnType<Fn>> => {
		const token = await cachedGetToken();
		try {
			return await fn(token?.token);
		} catch (error) {
			if (!opts.jwtCache?.enabled || token.isFresh || opts.jwtCache.isAuthError(error)) {
				throw error;
			}
			const newToken = await cachedGetToken({ forceRefresh: true });
			return await fn(newToken.token);
		}
	};

	return {
		handler,
		getToken: async () => {
			const token = await cachedGetToken();
			return token.token;
		},
		isAuthenticated: async () => {
			const token = await cachedGetToken();
			return !!token.token;
		},
		preloadAuthQuery: async <Query extends FunctionReference<"query">>(
			query: Query,
			...args: OptionalArgs<Query>
		): Promise<Preloaded<Query>> => {
			return callWithToken((token?: string) => {
				const argsAndOptions = getArgsAndOptions(args, token);
				return preloadQuery(query, ...argsAndOptions);
			});
		},
		fetchAuthQuery: async <Query extends FunctionReference<"query">>(
			query: Query,
			...args: OptionalArgs<Query>
		): Promise<FunctionReturnType<Query>> => {
			return callWithToken((token?: string) => {
				const argsAndOptions = getArgsAndOptions(args, token);
				return fetchQuery(query, ...argsAndOptions);
			});
		},
		fetchAuthMutation: async <Mutation extends FunctionReference<"mutation">>(
			mutation: Mutation,
			...args: OptionalArgs<Mutation>
		): Promise<FunctionReturnType<Mutation>> => {
			return callWithToken((token?: string) => {
				const argsAndOptions = getArgsAndOptions(args, token);
				return fetchMutation(mutation, ...argsAndOptions);
			});
		},
		fetchAuthAction: async <Action extends FunctionReference<"action">>(
			action: Action,
			...args: OptionalArgs<Action>
		): Promise<FunctionReturnType<Action>> => {
			return callWithToken((token?: string) => {
				const argsAndOptions = getArgsAndOptions(args, token);
				return fetchAction(action, ...argsAndOptions);
			});
		},
	};
}

export type BanataAuthServer = ReturnType<typeof createBanataAuthServer>;
