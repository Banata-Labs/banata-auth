import { sso, type SSOOptions } from "@better-auth/sso";
import type { createClient } from "@convex-dev/better-auth";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthPlugin } from "better-auth";
import { betterAuth } from "better-auth";
import type { AuthConfig, GenericDataModel } from "convex/server";
import { createBanataAuthOptions, type BanataAuthConfig } from "./auth";

type ComponentClient = ReturnType<typeof createClient>;

type CreateNodeAuth = ReturnType<typeof betterAuth>;

const DISABLED_ENTERPRISE_PATHS = [
	"/sso/register",
	"/sso/request-domain-verification",
	"/sso/verify-domain",
	"/scim/generate-token",
] as const;

const DISABLED_ENTERPRISE_PREFIXES = ["/sso/providers"] as const;

export interface SerializedAuthHeader {
	key: string;
	value: string;
}

export interface SerializedAuthRequest {
	method: string;
	url: string;
	headers: SerializedAuthHeader[];
	body: string | null;
}

export interface SerializedAuthResponse {
	status: number;
	headers: SerializedAuthHeader[];
	body: string | null;
}

function getRelativeAuthPath(request: Request, baseURL: string) {
	const pathname = new URL(request.url).pathname;
	const basePath = new URL(baseURL).pathname.replace(/\/$/, "");
	if (pathname === basePath) {
		return "/";
	}
	if (pathname.startsWith(`${basePath}/`)) {
		return pathname.slice(basePath.length);
	}
	return pathname;
}

function appendHeaders(target: Headers, headers: SerializedAuthHeader[]) {
	for (const header of headers) {
		target.append(header.key, header.value);
	}
}

function serializeHeaders(headers: Headers): SerializedAuthHeader[] {
	const serialized = Array.from(headers.entries()).map(([key, value]) => ({ key, value }));
	const getSetCookie = (headers as Headers & { getSetCookie?: () => string[] }).getSetCookie;
	if (!getSetCookie) {
		return serialized;
	}
	const setCookies = getSetCookie.call(headers);
	if (setCookies.length === 0) {
		return serialized;
	}
	return [
		...serialized.filter((header) => header.key.toLowerCase() !== "set-cookie"),
		...setCookies.map((value) => ({ key: "set-cookie", value })),
	];
}

function buildSsoOptions(config: BanataAuthConfig): SSOOptions {
	const domainVerification = config.ssoConfig?.domainVerification
		? { enabled: true }
		: undefined;
	const organizationProvisioning =
		config.ssoConfig?.provisionOrganization === false
			? { disabled: true }
			: undefined;

	return {
		providersLimit: 0,
		...(domainVerification ? { domainVerification } : {}),
		...(organizationProvisioning ? { organizationProvisioning } : {}),
	};
}

export function blockUnsafeEnterprisePaths(): BetterAuthPlugin {
	return {
		id: "banata-enterprise-path-guard",
		onRequest: async (request, ctx) => {
			const relativePath = getRelativeAuthPath(request, ctx.baseURL);
			if (DISABLED_ENTERPRISE_PATHS.includes(relativePath as (typeof DISABLED_ENTERPRISE_PATHS)[number])) {
				return { response: new Response("Not Found", { status: 404 }) };
			}
			if (
				DISABLED_ENTERPRISE_PREFIXES.some(
					(prefix) => relativePath === prefix || relativePath.startsWith(`${prefix}/`),
				)
			) {
				return { response: new Response("Not Found", { status: 404 }) };
			}
			return undefined;
		},
	};
}

export function createBanataNodeAuthOptions(
	ctx: GenericCtx<GenericDataModel>,
	params: {
		authComponent: ComponentClient;
		authConfig: AuthConfig;
		config: BanataAuthConfig;
	},
) {
	const baseOptions = createBanataAuthOptions(ctx, params);
	const plugins = [...(baseOptions.plugins ?? []), blockUnsafeEnterprisePaths()];

	if (params.config.authMethods?.sso !== false) {
		plugins.push(sso(buildSsoOptions(params.config)));
	}

	return {
		...baseOptions,
		disabledPaths: Array.from(
			new Set([...(baseOptions.disabledPaths ?? []), ...DISABLED_ENTERPRISE_PATHS]),
		),
		plugins,
	};
}

export function createBanataNodeAuth(
	ctx: GenericCtx<GenericDataModel>,
	params: {
		authComponent: ComponentClient;
		authConfig: AuthConfig;
		config: BanataAuthConfig;
	},
): CreateNodeAuth {
	return betterAuth(createBanataNodeAuthOptions(ctx, params));
}

function createRequest(serialized: SerializedAuthRequest) {
	const headers = new Headers();
	appendHeaders(headers, serialized.headers);
	const hasBody = serialized.body !== null && serialized.method !== "GET" && serialized.method !== "HEAD";
	return new Request(serialized.url, {
		method: serialized.method,
		headers,
		body: hasBody ? serialized.body : undefined,
	});
}

async function serializeResponse(response: Response): Promise<SerializedAuthResponse> {
	return {
		status: response.status,
		headers: serializeHeaders(response.headers),
		body: response.body === null ? null : await response.text(),
	};
}

export function deserializeAuthResponse(serialized: SerializedAuthResponse) {
	const headers = new Headers();
	appendHeaders(headers, serialized.headers);
	return new Response(serialized.body, {
		status: serialized.status,
		headers,
	});
}

export async function handleBanataNodeAuthRequest(
	ctx: GenericCtx<GenericDataModel>,
	createAuth: (ctx: GenericCtx<GenericDataModel>) => CreateNodeAuth,
	serialized: SerializedAuthRequest,
) {
	const auth = createAuth(ctx);
	const response = await auth.handler(createRequest(serialized));
	return await serializeResponse(response);
}
