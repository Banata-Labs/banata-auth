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
	resolveRuntimeProjectId,
	type RuntimeProjectScope,
} from "./banataAuth/auth";

const serializedHeader = v.object({
	key: v.string(),
	value: v.string(),
});

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

function shouldUseProjectRuntimeConfig(urlValue: string): boolean {
	try {
		const pathname = new URL(urlValue).pathname;
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
		const useProjectRuntimeConfig = shouldUseProjectRuntimeConfig(args.request.url);
		if (useProjectRuntimeConfig && scope.hasExplicitScope) {
			const resolvedProjectId = await resolveRuntimeProjectId(ctx, scope);
			if (!resolvedProjectId) {
				return {
					status: 404,
					headers: [{ key: "content-type", value: "application/json" }],
					body: JSON.stringify({ error: "Unknown Banata project scope" }),
				};
			}
		}
		const runtimeConfig = useProjectRuntimeConfig
			? await getRequestConfig(ctx, scope)
			: await getRequestConfig(ctx, null);
		return await handleBanataNodeAuthRequest(
			ctx,
			(requestCtx: GenericCtx<DataModel>) =>
				createBanataNodeAuth(requestCtx, {
					authComponent,
					authConfig,
					config: runtimeConfig,
				}),
			args.request,
		);
	},
});
