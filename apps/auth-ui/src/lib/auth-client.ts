"use client";

import {
	convexClient,
	createAuthClient,
	crossDomainClient,
	organizationClient,
} from "@banata-auth/react/plugins";
import { ssoClient } from "@better-auth/sso/client";
import { oneTimeTokenClient } from "better-auth/client/plugins";
import { useMemo } from "react";

interface CrossDomainActions {
	crossDomain: {
		getCookie: () => string;
		oneTimeToken: {
			verify: (params: { token: string }) => Promise<{
				data?: {
					user?: unknown;
					session?: { token?: string };
				};
			}>;
		};
		updateSession: () => void;
	};
	oneTimeToken: {
		generate: () => Promise<{ data?: { token?: string } }>;
	};
}

function normalizeBaseUrl(value: string | null | undefined): string {
	const trimmed = value?.replace(/\/$/, "");
	if (trimmed?.startsWith("http://") || trimmed?.startsWith("https://")) {
		return trimmed;
	}

	if (typeof window !== "undefined") {
		return new URL(trimmed ?? "/api/auth", window.location.origin).toString();
	}

	return `http://localhost${trimmed ?? "/api/auth"}`;
}

export type ProjectAuthClient = ReturnType<typeof createAuthClient>;

export function createProjectAuthClient(baseUrl?: string | null): ProjectAuthClient {
	return createAuthClient({
		baseURL: normalizeBaseUrl(baseUrl),
		plugins: [
			crossDomainClient(),
			oneTimeTokenClient(),
			convexClient(),
			organizationClient(),
			ssoClient(),
		],
	});
}

export function useProjectAuthClient(baseUrl?: string | null): ProjectAuthClient {
	return useMemo(() => createProjectAuthClient(baseUrl), [baseUrl]);
}

export function asCrossDomainActions(client: unknown): CrossDomainActions {
	return client as CrossDomainActions;
}

export async function postCrossDomainAuthJson(
	client: unknown,
	baseUrl: string,
	path: string,
	body: Record<string, unknown>,
): Promise<Response> {
	const cookie = asCrossDomainActions(client).crossDomain.getCookie();
	return fetch(`${normalizeBaseUrl(baseUrl)}${path}`, {
		method: "POST",
		headers: {
			"content-type": "application/json",
			...(cookie ? { "Better-Auth-Cookie": cookie } : {}),
		},
		body: JSON.stringify(body),
		credentials: "omit",
	});
}

export async function generateHostedOneTimeToken(client: unknown): Promise<string | null> {
	const result = await asCrossDomainActions(client).oneTimeToken.generate();
	return result.data?.token ?? null;
}
