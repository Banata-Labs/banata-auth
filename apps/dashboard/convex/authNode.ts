"use node";

import { createBanataNodeAuth, handleBanataNodeAuthRequest } from "@banata-auth/convex/node";
import { getEffectiveProjectPermissions, type PluginDBAdapter } from "@banata-auth/convex/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { v } from "convex/values";
import type { DataModel } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import authConfig from "./auth.config";
import {
	authComponent,
	getPluginDb,
	getRequestConfig,
	resolveRuntimeProjectScope,
	type RuntimeProjectScope,
} from "./banataAuth/auth";

const serializedHeader = v.object({
	key: v.string(),
	value: v.string(),
});

type SerializedAuthRequest = {
	method: string;
	url: string;
	headers: Array<{ key: string; value: string }>;
	body: string | null;
};

interface RuntimeUserRow extends Record<string, unknown> {
	id: string;
	role?: string | null;
}

interface RuntimeApiKeyRow extends Record<string, unknown> {
	id: string;
	projectId?: string | null;
	metadata?: unknown;
}

interface ConvexJwtClaims extends Record<string, unknown> {
	sub?: string;
	sessionId?: string;
	exp?: number;
}

function parseScopeUrl(urlValue: string | null | undefined): RuntimeProjectScope {
	if (!urlValue) {
		return {};
	}

	try {
		const url = new URL(urlValue, "http://localhost");
		return {
			projectId:
				url.searchParams.get("projectId") ?? url.searchParams.get("project_id"),
			clientId:
				url.searchParams.get("clientId") ?? url.searchParams.get("client_id"),
		};
	} catch {
		return {};
	}
}

function parseRequestBody(body: string | null): Record<string, unknown> | null {
	if (!body) {
		return null;
	}

	try {
		const parsed = JSON.parse(body) as Record<string, unknown>;
		return typeof parsed === "object" && parsed !== null ? parsed : null;
	} catch {
		return null;
	}
}

function normalizeScopeValue(value: unknown): string | null {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function resolveRequestProjectScope(request: {
	url: string;
	headers: Array<{ key: string; value: string }>;
	body: string | null;
}): RuntimeProjectScope & { hasExplicitScope: boolean } {
	const projectHeader = request.headers.find(
		(item) => item.key.toLowerCase() === "x-banata-project-id",
	)?.value;
	const clientHeader = request.headers.find(
		(item) => item.key.toLowerCase() === "x-banata-client-id",
	)?.value;
	const urlScope = parseScopeUrl(request.url);
	const urlNestedScope = (() => {
		try {
			const url = new URL(request.url);
			return parseScopeUrl(
				url.searchParams.get("callbackURL") ??
					url.searchParams.get("callbackUrl") ??
					url.searchParams.get("redirectTo"),
			);
		} catch {
			return {};
		}
	})();
	const body = parseRequestBody(request.body);
	const bodyScope: RuntimeProjectScope = {
		projectId:
			normalizeScopeValue(body?.projectId) ?? normalizeScopeValue(body?.project_id),
		clientId:
			normalizeScopeValue(body?.clientId) ?? normalizeScopeValue(body?.client_id),
	};
	const callbackScope = parseScopeUrl(
		normalizeScopeValue(body?.callbackURL) ??
			normalizeScopeValue(body?.callbackUrl) ??
			normalizeScopeValue(body?.redirectTo) ??
			normalizeScopeValue(body?.redirectURL),
	);

	const projectId =
		normalizeScopeValue(projectHeader) ??
		normalizeScopeValue(urlScope.projectId) ??
		normalizeScopeValue(urlNestedScope.projectId) ??
		normalizeScopeValue(bodyScope.projectId) ??
		normalizeScopeValue(callbackScope.projectId);
	const clientId =
		normalizeScopeValue(clientHeader) ??
		normalizeScopeValue(urlScope.clientId) ??
		normalizeScopeValue(urlNestedScope.clientId) ??
		normalizeScopeValue(bodyScope.clientId) ??
		normalizeScopeValue(callbackScope.clientId);

	return {
		projectId,
		clientId,
		hasExplicitScope: Boolean(projectId || clientId),
	};
}

function getPathname(urlValue: string): string {
	try {
		return new URL(urlValue, "http://localhost").pathname;
	} catch {
		return urlValue;
	}
}

function getHeaderValue(
	headers: Array<{ key: string; value: string }>,
	name: string,
): string | null {
	const match = headers.find((item) => item.key.toLowerCase() === name.toLowerCase());
	return match?.value ?? null;
}

function readCookieValue(cookieHeader: string | null, name: string): string | null {
	if (!cookieHeader) {
		return null;
	}

	for (const part of cookieHeader.split(";")) {
		const [rawName, ...rest] = part.trim().split("=");
		if (rawName !== name) {
			continue;
		}
		const joined = rest.join("=");
		try {
			return normalizeScopeValue(decodeURIComponent(joined));
		} catch {
			return normalizeScopeValue(joined);
		}
	}

	return null;
}

function hasInternalProjectScopeBypass(
	headers: Array<{ key: string; value: string }>,
): boolean {
	return getHeaderValue(headers, "x-banata-internal-project-scope") === "1";
}

function decodeBase64Url(value: string): string | null {
	try {
		const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
		const padding = normalized.length % 4 === 0 ? "" : "=".repeat(4 - (normalized.length % 4));
		return atob(`${normalized}${padding}`);
	} catch {
		return null;
	}
}

function extractConvexJwtClaimsFromRequest(request: SerializedAuthRequest): ConvexJwtClaims | null {
	const cookieHeader = getHeaderValue(request.headers, "cookie");
	const rawJwt =
		readCookieValue(cookieHeader, "better-auth.convex_jwt") ??
		readCookieValue(cookieHeader, "__Secure-better-auth.convex_jwt");
	if (!rawJwt) {
		return null;
	}

	const [, payload] = rawJwt.split(".", 3);
	if (!payload) {
		return null;
	}

	const decoded = decodeBase64Url(payload);
	if (!decoded) {
		return null;
	}

	try {
		const parsed = JSON.parse(decoded) as ConvexJwtClaims;
		return typeof parsed === "object" && parsed !== null ? parsed : null;
	} catch {
		return null;
	}
}

function upsertHeader(
	headers: Array<{ key: string; value: string }>,
	name: string,
	value: string,
): Array<{ key: string; value: string }> {
	let updated = false;
	const nextHeaders = headers.map((header) => {
		if (header.key.toLowerCase() !== name.toLowerCase()) {
			return header;
		}
		updated = true;
		return { key: header.key, value };
	});
	if (!updated) {
		nextHeaders.push({ key: name, value });
	}
	return nextHeaders;
}

function requestSupportsApiKeyBearer(pathname: string): boolean {
	return (
		pathname.startsWith("/api/auth/admin/") ||
		pathname.startsWith("/api/auth/banata/") ||
		pathname.startsWith("/api/auth/organization/") ||
		pathname.startsWith("/api/auth/api-key/")
	);
}

export function extractApiKeyFromRequest(request: SerializedAuthRequest): string | null {
	const pathname = getPathname(request.url);
	const directApiKey = normalizeScopeValue(getHeaderValue(request.headers, "x-api-key"));
	if (directApiKey) {
		return directApiKey;
	}
	if (!requestSupportsApiKeyBearer(pathname)) {
		return null;
	}

	const authorizationHeader = getHeaderValue(request.headers, "authorization");
	if (!authorizationHeader) {
		return null;
	}
	const [scheme, token] = authorizationHeader.split(/\s+/, 2);
	if (scheme?.toLowerCase() !== "bearer") {
		return null;
	}
	return normalizeScopeValue(token);
}

function shouldInjectResolvedProjectId(pathname: string): boolean {
	return (
		pathname.startsWith("/api/auth/admin/") ||
		pathname.startsWith("/api/auth/organization/") ||
		pathname.startsWith("/api/auth/banata/") ||
		pathname.startsWith("/api/auth/two-factor/") ||
		pathname.startsWith("/api/auth/api-key/")
	);
}

function readProjectIdFromRecord(record: Record<string, unknown>): string | null {
	const directProjectId =
		normalizeScopeValue(record.projectId) ?? normalizeScopeValue(record.project_id);
	if (directProjectId) {
		return directProjectId;
	}

	const metadata = record.metadata;
	if (typeof metadata === "string") {
		try {
			return readProjectIdFromRecord({ metadata: JSON.parse(metadata) });
		} catch {
			return null;
		}
	}
	if (typeof metadata === "object" && metadata !== null) {
		return (
			normalizeScopeValue((metadata as Record<string, unknown>).projectId) ??
			normalizeScopeValue((metadata as Record<string, unknown>).project_id)
		);
	}
	return null;
}

function serializeRequestBody(body: Record<string, unknown>): string {
	return JSON.stringify(body);
}

export function applyProjectScopeToRequest(
	request: SerializedAuthRequest,
	projectId: string,
): SerializedAuthRequest {
	const pathname = getPathname(request.url);
	const url = new URL(request.url, "http://localhost");
	if (!url.searchParams.get("projectId")) {
		url.searchParams.set("projectId", projectId);
	}

	let body = parseRequestBody(request.body);
	if (shouldInjectResolvedProjectId(pathname)) {
		body = body ?? {};
		const forceProjectScope = pathname.startsWith("/api/auth/api-key/");
		if (
			forceProjectScope ||
			(!normalizeScopeValue(body.projectId) && !normalizeScopeValue(body.project_id))
		) {
			body.projectId = projectId;
			delete body.project_id;
		}
		if (pathname === "/api/auth/api-key/create") {
			const metadata =
				typeof body.metadata === "object" && body.metadata !== null
					? { ...(body.metadata as Record<string, unknown>) }
					: {};
			metadata.projectId = projectId;
			delete metadata.project_id;
			body.metadata = metadata;
		}
	}

	const nextUrl =
		request.url.startsWith("http://") || request.url.startsWith("https://")
			? url.toString()
			: `${url.pathname}${url.search}${url.hash}`;

	return {
		...request,
		url: nextUrl,
		headers: upsertHeader(request.headers, "x-banata-project-id", projectId),
		body: body ? serializeRequestBody(body) : request.body,
	};
}

function jsonResponse(status: number, payload: Record<string, unknown>) {
	return {
		status,
		headers: [{ key: "content-type", value: "application/json" }],
		body: JSON.stringify(payload),
	};
}

function summarizeRequestForLog(request: SerializedAuthRequest) {
	return {
		method: request.method,
		pathname: getPathname(request.url),
		hasApiKey: Boolean(extractApiKeyFromRequest(request)),
		hasAuthorization: Boolean(getHeaderValue(request.headers, "authorization")),
		hasProjectHeader: Boolean(getHeaderValue(request.headers, "x-banata-project-id")),
		hasClientHeader: Boolean(getHeaderValue(request.headers, "x-banata-client-id")),
		hasInternalScopeBypass: hasInternalProjectScopeBypass(request.headers),
	};
}

function isLocalDashboardRuntime(): boolean {
	const siteUrl = process.env.SITE_URL;
	return typeof siteUrl === "string" && siteUrl.includes("localhost");
}

function filterCollectionByProject(
	payload: unknown,
	projectId: string,
	arrayKey?: string,
): unknown {
	if (Array.isArray(payload)) {
		return payload.filter(
			(item): item is Record<string, unknown> =>
				typeof item === "object" &&
				item !== null &&
				readProjectIdFromRecord(item as Record<string, unknown>) === projectId,
		);
	}

	if (typeof payload !== "object" || payload === null) {
		return payload;
	}

	if (arrayKey) {
		const collection = (payload as Record<string, unknown>)[arrayKey];
		if (Array.isArray(collection)) {
			return {
				...(payload as Record<string, unknown>),
				[arrayKey]: collection.filter(
					(item): item is Record<string, unknown> =>
						typeof item === "object" &&
						item !== null &&
						readProjectIdFromRecord(item as Record<string, unknown>) === projectId,
				),
			};
		}
	}

	return payload;
}

export function filterProjectScopedResponseBody(
	pathname: string,
	body: string | null,
	projectId: string | null,
): string | null {
	if (!body || !projectId) {
		return body;
	}

	let payload: unknown;
	try {
		payload = JSON.parse(body);
	} catch {
		return body;
	}

	if (pathname === "/api/auth/api-key/list") {
		const withKeys = filterCollectionByProject(payload, projectId, "keys");
		return JSON.stringify(filterCollectionByProject(withKeys, projectId, "data"));
	}

	if (pathname === "/api/auth/banata/projects/list") {
		if (typeof payload !== "object" || payload === null) {
			return body;
		}
		const projects = Array.isArray((payload as Record<string, unknown>).projects)
			? ((payload as Record<string, unknown>).projects as Array<Record<string, unknown>>)
			: null;
		if (!projects) {
			return body;
		}
		return JSON.stringify({
			...(payload as Record<string, unknown>),
			projects: projects.filter((project) => normalizeScopeValue(project.id) === projectId),
		});
	}

	return body;
}

async function assertApiKeyRecordInProject(
	ctx: GenericCtx<DataModel>,
	keyId: string,
	projectId: string,
): Promise<boolean> {
	const db = getPluginDb(ctx);
	const row = (await db.findOne({
		model: "apikey",
		where: [{ field: "id", value: keyId }],
	})) as RuntimeApiKeyRow | null;
	return readProjectIdFromRecord(row ?? {}) === projectId;
}

async function resolveSessionUserForRequest(
	_ctx: GenericCtx<DataModel>,
	request: SerializedAuthRequest,
): Promise<RuntimeUserRow | null> {
	const convexJwtClaims = extractConvexJwtClaimsFromRequest(request);
	if (
		convexJwtClaims.sub &&
		(typeof convexJwtClaims.exp !== "number" || convexJwtClaims.exp * 1000 > Date.now())
	) {
		return { id: convexJwtClaims.sub };
	}
	return null;
}

function getApiKeyPermissionForPath(pathname: string): string | null {
	if (pathname === "/api/auth/api-key/create") return "api_key.create";
	if (pathname === "/api/auth/api-key/list" || pathname === "/api/auth/api-key/get") {
		return "api_key.read";
	}
	if (
		pathname === "/api/auth/api-key/delete" ||
		pathname === "/api/auth/api-key/update"
	) {
		return "api_key.delete";
	}
	return null;
}

async function enforceDashboardProjectPermission(
	ctx: GenericCtx<DataModel>,
	db: PluginDBAdapter,
	request: SerializedAuthRequest,
	projectId: string,
): Promise<ReturnType<typeof jsonResponse> | null> {
	const pathname = getPathname(request.url);
	const requiredPermission = getApiKeyPermissionForPath(pathname);
	if (!requiredPermission) {
		return null;
	}

	const user = await resolveSessionUserForRequest(ctx, request);
	if (!user?.id) {
		return jsonResponse(401, {
			error: "AUTHENTICATION_REQUIRED",
			message: "Authentication required",
		});
	}

	const permissions = await getEffectiveProjectPermissions(
		db,
		{
			userId: user.id,
			projectId,
		},
	);

	if (permissions.has("*") || permissions.has(requiredPermission)) {
		return null;
	}

	return jsonResponse(403, {
		error: "FORBIDDEN",
		message: `Missing permission: ${requiredPermission}`,
	});
}

async function enforceApiKeyProjectBoundaries(
	ctx: GenericCtx<DataModel>,
	request: SerializedAuthRequest,
	projectId: string,
): Promise<SerializedAuthRequest | ReturnType<typeof jsonResponse>> {
	const pathname = getPathname(request.url);
	const scopedRequest = applyProjectScopeToRequest(request, projectId);
	const body = parseRequestBody(scopedRequest.body) ?? {};

	if (
		pathname === "/api/auth/banata/projects/create" ||
		pathname === "/api/auth/banata/projects/ensure-default"
	) {
		return jsonResponse(403, {
			error: "PROJECT_SCOPE_REQUIRED",
			message: "Project-scoped API keys cannot create or bootstrap additional projects.",
		});
	}

	if (
		pathname === "/api/auth/banata/projects/get" ||
		pathname === "/api/auth/banata/projects/update" ||
		pathname === "/api/auth/banata/projects/delete"
	) {
		const requestedProjectId = normalizeScopeValue(body.id);
		if (requestedProjectId && requestedProjectId !== projectId) {
			return jsonResponse(403, {
				error: "PROJECT_SCOPE_MISMATCH",
				message: "This API key is scoped to a different Banata project.",
			});
		}
		return {
			...scopedRequest,
			body: serializeRequestBody({
				...body,
				id: projectId,
			}),
		};
	}

	if (
		pathname === "/api/auth/api-key/delete" ||
		pathname === "/api/auth/api-key/get" ||
		pathname === "/api/auth/api-key/update"
	) {
		const keyId = normalizeScopeValue(body.keyId) ?? normalizeScopeValue(body.id);
		if (keyId && !(await assertApiKeyRecordInProject(ctx, keyId, projectId))) {
			return jsonResponse(403, {
				error: "PROJECT_SCOPE_MISMATCH",
				message: "This API key can only manage keys in its own Banata project.",
			});
		}
	}

	return scopedRequest;
}

function shouldUseProjectRuntimeConfig(urlValue: string): boolean {
	try {
		const pathname = new URL(urlValue, "http://localhost").pathname;
		if (
			pathname.startsWith("/api/auth/banata/") ||
			pathname.startsWith("/api/auth/admin/") ||
			pathname.startsWith("/api/auth/organization/") ||
			pathname.startsWith("/api/auth/api-key/") ||
			pathname.startsWith("/api/auth/two-factor/")
		) {
			return false;
		}
		return true;
	} catch {
		return true;
	}
}

export function shouldRejectExplicitProjectScopeWithoutApiKey(
	request: SerializedAuthRequest,
	scope: { hasExplicitScope: boolean },
	apiKey: string | null,
): boolean {
	if (!scope.hasExplicitScope || apiKey || hasInternalProjectScopeBypass(request.headers)) {
		return false;
	}

	return shouldUseProjectRuntimeConfig(request.url);
}

function requiresDashboardProjectScope(request: SerializedAuthRequest): boolean {
	return (
		hasInternalProjectScopeBypass(request.headers) &&
		getPathname(request.url).startsWith("/api/auth/api-key/")
	);
}

export const handleAuthRequest = internalAction({
	args: {
		request: v.object({
			method: v.string(),
			url: v.string(),
			headers: v.array(serializedHeader),
			body: v.union(v.string(), v.null()),
		}),
	},
	returns: v.object({
		status: v.number(),
		headers: v.array(serializedHeader),
		body: v.union(v.string(), v.null()),
	}),
	handler: async (ctx, args) => {
		console.info("[banata-auth] auth request start", summarizeRequestForLog(args.request));
		const scope = resolveRequestProjectScope(args.request);
		const apiKey = extractApiKeyFromRequest(args.request);
		const internalDashboardProjectId =
			!apiKey && hasInternalProjectScopeBypass(args.request.headers)
				? normalizeScopeValue(scope.projectId) ?? null
				: null;
		if (shouldRejectExplicitProjectScopeWithoutApiKey(args.request, scope, apiKey)) {
			console.warn("[banata-auth] rejecting explicit project scope without api key", {
				...summarizeRequestForLog(args.request),
				scope,
			});
			return jsonResponse(403, {
				error: "PROJECT_API_KEY_REQUIRED",
				message:
					"Project-scoped Banata auth requires a project API key. Create one in the dashboard and bind it server-side in your app.",
			});
		}
		const resolvedScope = await resolveRuntimeProjectScope(ctx, {
			scope,
			apiKey,
		});
		const effectiveDashboardProjectId =
			internalDashboardProjectId ?? resolvedScope.projectId ?? null;
		if (requiresDashboardProjectScope(args.request) && !effectiveDashboardProjectId) {
			console.warn("[banata-auth] missing dashboard project scope", {
				...summarizeRequestForLog(args.request),
				scope,
				resolvedScope,
			});
			return jsonResponse(400, {
				error: "PROJECT_SCOPE_REQUIRED",
				message:
					"Dashboard API key operations must include the active project scope.",
			});
		}
		const useProjectRuntimeConfig = shouldUseProjectRuntimeConfig(args.request.url);
		if (
			resolvedScope.explicitProjectId &&
			resolvedScope.apiKeyProjectId &&
			resolvedScope.explicitProjectId !== resolvedScope.apiKeyProjectId
		) {
			console.warn("[banata-auth] project scope mismatch", {
				...summarizeRequestForLog(args.request),
				resolvedScope,
			});
			return jsonResponse(403, {
				error: "PROJECT_SCOPE_MISMATCH",
				message: "The supplied project scope does not match the API key's project.",
			});
		}
		if (apiKey && !resolvedScope.apiKeyProjectId && requestSupportsApiKeyBearer(getPathname(args.request.url))) {
			console.warn("[banata-auth] api key missing project scope", {
				...summarizeRequestForLog(args.request),
				resolvedScope,
			});
			return jsonResponse(403, {
				error: "PROJECT_SCOPE_REQUIRED",
				message: "This API key is not scoped to a Banata project.",
			});
		}
		if (useProjectRuntimeConfig && (scope.hasExplicitScope || Boolean(apiKey))) {
			if (!resolvedScope.projectId) {
				console.warn("[banata-auth] unknown project scope", {
					...summarizeRequestForLog(args.request),
					scope,
					resolvedScope,
				});
				return {
					status: 404,
					headers: [{ key: "content-type", value: "application/json" }],
					body: JSON.stringify({ error: "Unknown Banata project scope" }),
				};
			}
		}

		const requestForHandler =
			resolvedScope.apiKeyProjectId != null
				? await enforceApiKeyProjectBoundaries(ctx, args.request, resolvedScope.apiKeyProjectId)
				: args.request;
		if ("status" in requestForHandler) {
			return requestForHandler;
		}
		const runtimeConfig = useProjectRuntimeConfig
			? await getRequestConfig(ctx, scope, { apiKey })
			: await getRequestConfig(ctx, null, { apiKey });

		// When an API key is present, trust the origin derived from x-forwarded-host.
		// This allows proxy-based integrations (non-Next.js frameworks) to pass origin
		// validation without needing to set origin to a hardcoded trusted value.
		if (apiKey) {
			const forwardedHost = getHeaderValue(args.request.headers, "x-forwarded-host");
			const forwardedProto = getHeaderValue(args.request.headers, "x-forwarded-proto") ?? "https";
			const requestOrigin = getHeaderValue(args.request.headers, "origin");
			const originsToTrust: string[] = [];
			if (forwardedHost) {
				originsToTrust.push(`${forwardedProto}://${forwardedHost}`);
			}
			if (requestOrigin) {
				originsToTrust.push(requestOrigin);
			}
			if (originsToTrust.length > 0) {
				const existing = runtimeConfig.trustedOrigins ?? [];
				runtimeConfig.trustedOrigins = [
					...existing,
					...originsToTrust.filter((o) => !existing.includes(o)),
				];
			}
		}

		const dashboardProjectId =
			!apiKey && hasInternalProjectScopeBypass(args.request.headers)
				? effectiveDashboardProjectId
				: null;
		if (dashboardProjectId) {
			const pluginDb = getPluginDb(ctx, runtimeConfig);
			const permissionError = await enforceDashboardProjectPermission(
				ctx,
				pluginDb,
				args.request,
				dashboardProjectId,
			);
			if (permissionError) {
				console.warn("[banata-auth] dashboard permission denied", {
					...summarizeRequestForLog(args.request),
					dashboardProjectId,
				});
				return permissionError;
			}
		}
		const effectiveRequest =
			dashboardProjectId && getPathname(requestForHandler.url).startsWith("/api/auth/api-key/")
				? applyProjectScopeToRequest(requestForHandler, dashboardProjectId)
				: requestForHandler;
		let response;
		try {
			response = await handleBanataNodeAuthRequest(
				ctx,
				(requestCtx: GenericCtx<DataModel>) =>
					createBanataNodeAuth(requestCtx, {
						authComponent,
						authConfig,
						config: runtimeConfig,
						requestProjectId: resolvedScope.projectId ?? dashboardProjectId ?? null,
					}),
				effectiveRequest,
			);
		} catch (error) {
			const pathname = getPathname(effectiveRequest.url);
			console.error("[banata-auth] auth runtime failure", {
				pathname,
				method: effectiveRequest.method,
				error,
			});
			return jsonResponse(500, {
				error: "AUTH_RUNTIME_ERROR",
				message: "Banata Auth failed while handling this request.",
				...(isLocalDashboardRuntime()
					? {
							details: error instanceof Error ? error.message : String(error),
						}
					: {}),
			});
		}
		console.info("[banata-auth] auth request complete", {
			...summarizeRequestForLog(effectiveRequest),
			status: response.status,
			resolvedProjectId: resolvedScope.projectId ?? null,
			apiKeyProjectId: resolvedScope.apiKeyProjectId ?? null,
			dashboardProjectId,
		});
		return {
			...response,
			body: filterProjectScopedResponseBody(
				getPathname(effectiveRequest.url),
				response.body,
				resolvedScope.apiKeyProjectId ?? dashboardProjectId,
			),
		};
	},
});
