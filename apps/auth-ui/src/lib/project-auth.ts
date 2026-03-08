"use client";

import { useEffect, useMemo, useState } from "react";

export const BANATA_CLIENT_ID_COOKIE = "banata_client_id";
export const BANATA_PROJECT_ID_COOKIE = "banata_project_id";

interface RuntimeAuthMethods {
	emailPassword: boolean;
	magicLink: boolean;
	emailOtp: boolean;
	passkey: boolean;
	twoFactor: boolean;
	organization: boolean;
	sso: boolean;
}

interface RuntimeSocialProviderStatus {
	enabled: boolean;
}

export interface PublicAuthConfig {
	authMethods: RuntimeAuthMethods;
	socialProviders: Record<string, RuntimeSocialProviderStatus>;
}

export interface ProjectAuthScope {
	clientId: string | null;
	projectId: string | null;
}

interface UseProjectAuthConfigResult {
	scope: ProjectAuthScope;
	config: PublicAuthConfig | null;
	error: string | null;
	isLoading: boolean;
	hasScope: boolean;
	scopedPath: (path: string) => string;
	scopedApiPath: (path: string) => string;
	enabledSocialProviders: Array<{ id: string; label: string }>;
}

function readCookie(name: string): string | null {
	if (typeof document === "undefined") return null;
	const prefix = `${name}=`;
	for (const entry of document.cookie.split(";")) {
		const trimmed = entry.trim();
		if (trimmed.startsWith(prefix)) {
			return decodeURIComponent(trimmed.slice(prefix.length));
		}
	}
	return null;
}

function writeCookie(name: string, value: string | null) {
	if (typeof document === "undefined" || !value) return;
	document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; SameSite=Lax`;
}

function readScopeFromWindow(): ProjectAuthScope {
	if (typeof window === "undefined") {
		return { clientId: null, projectId: null };
	}

	const params = new URLSearchParams(window.location.search);
	const clientId =
		params.get("client_id") ??
		params.get("clientId") ??
		readCookie(BANATA_CLIENT_ID_COOKIE);
	const projectId =
		params.get("project_id") ??
		params.get("projectId") ??
		readCookie(BANATA_PROJECT_ID_COOKIE);

	if (clientId) writeCookie(BANATA_CLIENT_ID_COOKIE, clientId);
	if (projectId) writeCookie(BANATA_PROJECT_ID_COOKIE, projectId);

	return {
		clientId: clientId?.trim() || null,
		projectId: projectId?.trim() || null,
	};
}

function appendScope(path: string, scope: ProjectAuthScope): string {
	const [rawPathname, rawSearch = ""] = path.split("?");
	const pathname = rawPathname || path;
	const params = new URLSearchParams(rawSearch);

	if (scope.clientId && !params.has("client_id") && !params.has("clientId")) {
		params.set("client_id", scope.clientId);
	}
	if (scope.projectId && !params.has("project_id") && !params.has("projectId")) {
		params.set("project_id", scope.projectId);
	}

	const query = params.toString();
	return query ? `${pathname}?${query}` : pathname;
}

function toProviderLabel(providerId: string): string {
	return providerId
		.split(/[-_]/g)
		.filter(Boolean)
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(" ");
}

export function useProjectAuthConfig(): UseProjectAuthConfigResult {
	const [scope, setScope] = useState<ProjectAuthScope>({ clientId: null, projectId: null });
	const [config, setConfig] = useState<PublicAuthConfig | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	useEffect(() => {
		const nextScope = readScopeFromWindow();
		setScope(nextScope);

		if (!nextScope.clientId && !nextScope.projectId) {
			setConfig(null);
			setError(null);
			setIsLoading(false);
			return;
		}

		let cancelled = false;

		async function loadConfig() {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch("/api/auth/banata/config/public", {
					method: "POST",
					headers: { "content-type": "application/json" },
					body: JSON.stringify({
						...(nextScope.clientId ? { clientId: nextScope.clientId } : {}),
						...(nextScope.projectId ? { projectId: nextScope.projectId } : {}),
					}),
				});

				if (!response.ok) {
					throw new Error("Unable to load project auth settings");
				}

				const payload = (await response.json()) as PublicAuthConfig;
				if (!cancelled) {
					setConfig(payload);
				}
			} catch (loadError) {
				if (!cancelled) {
					setConfig(null);
					setError(
						loadError instanceof Error
							? loadError.message
							: "Unable to load project auth settings",
					);
				}
			} finally {
				if (!cancelled) {
					setIsLoading(false);
				}
			}
		}

		void loadConfig();

		return () => {
			cancelled = true;
		};
	}, []);

	const enabledSocialProviders = useMemo(
		() =>
			Object.entries(config?.socialProviders ?? {})
				.filter(([, provider]) => provider.enabled)
				.map(([providerId]) => ({
					id: providerId,
					label: toProviderLabel(providerId),
				})),
		[config],
	);

	return {
		scope,
		config,
		error,
		isLoading,
		hasScope: Boolean(scope.clientId || scope.projectId),
		scopedPath: (path) => appendScope(path, scope),
		scopedApiPath: (path) => appendScope(path, scope),
		enabledSocialProviders,
	};
}
