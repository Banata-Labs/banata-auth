"use node";

import { createBanataNodeAuth, handleBanataNodeAuthRequest } from "@banata-auth/convex/node";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { v } from "convex/values";
import type { DataModel } from "./_generated/dataModel";
import { internalAction } from "./_generated/server";
import authConfig from "./auth.config";
import {
	authComponent,
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

interface RuntimeLookupAdapter {
	findMany<T = Record<string, unknown>>(data: {
		model: string;
		where?: Array<{
			field: string;
			value: string | null;
			operator?: "eq" | "in";
		}>;
		limit?: number;
	}): Promise<T[]>;
}

interface RuntimeApiKeyRow extends Record<string, unknown> {
	id: string;
	projectId?: string | null;
	metadata?: unknown;
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
		if (!normalizeScopeValue(body.projectId) && !normalizeScopeValue(body.project_id)) {
			body.projectId = projectId;
		}
		if (pathname === "/api/auth/api-key/create") {
			const metadata =
				typeof body.metadata === "object" && body.metadata !== null
					? { ...(body.metadata as Record<string, unknown>) }
					: {};
			if (!normalizeScopeValue(metadata.projectId) && !normalizeScopeValue(metadata.project_id)) {
				metadata.projectId = projectId;
			}
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
	const adapter = authComponent.adapter(ctx) as unknown as RuntimeLookupAdapter;
	const rows = await adapter.findMany<RuntimeApiKeyRow>({
		model: "apikey",
		where: [{ field: "id", value: keyId }],
		limit: 1,
	});
	return readProjectIdFromRecord(rows[0] ?? {}) === projectId;
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
		const scope = resolveRequestProjectScope(args.request);
		const apiKey = extractApiKeyFromRequest(args.request);
		const resolvedScope = await resolveRuntimeProjectScope(ctx, {
			scope,
			apiKey,
		});
		const useProjectRuntimeConfig = shouldUseProjectRuntimeConfig(args.request.url);
		if (
			resolvedScope.explicitProjectId &&
			resolvedScope.apiKeyProjectId &&
			resolvedScope.explicitProjectId !== resolvedScope.apiKeyProjectId
		) {
			return jsonResponse(403, {
				error: "PROJECT_SCOPE_MISMATCH",
				message: "The supplied project scope does not match the API key's project.",
			});
		}
		if (apiKey && !resolvedScope.apiKeyProjectId && requestSupportsApiKeyBearer(getPathname(args.request.url))) {
			return jsonResponse(403, {
				error: "PROJECT_SCOPE_REQUIRED",
				message: "This API key is not scoped to a Banata project.",
			});
		}
		if (useProjectRuntimeConfig && (scope.hasExplicitScope || Boolean(apiKey))) {
			if (!resolvedScope.projectId) {
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
		const response = await handleBanataNodeAuthRequest(
			ctx,
			(requestCtx: GenericCtx<DataModel>) =>
				createBanataNodeAuth(requestCtx, {
					authComponent,
					authConfig,
					config: runtimeConfig,
				}),
			requestForHandler,
		);
		return {
			...response,
			body: filterProjectScopedResponseBody(
				getPathname(requestForHandler.url),
				response.body,
				resolvedScope.apiKeyProjectId,
			),
		};
	},
});
