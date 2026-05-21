import { type RuntimeAuthConfig, listEnabledSocialProviderIds } from "@banata-auth/shared";

export async function getPublicAuthConfig(): Promise<RuntimeAuthConfig> {
	const response = await fetch("/api/auth/banata/config/public", {
		method: "POST",
		credentials: "include",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({}),
	});

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new Error(text || "Unable to load authentication settings.");
	}

	const payload = (await response.json().catch(() => null)) as RuntimeAuthConfig | null;
	if (!payload) {
		throw new Error("Unable to load authentication settings.");
	}

	return payload;
}

export function getEnabledSocialProviders(config: RuntimeAuthConfig | undefined) {
	return listEnabledSocialProviderIds(config).map((id) => ({ id }));
}
