export type HostedAuthMode = "sign-in" | "sign-up";

const DEFAULT_HOSTED_AUTH_URL = "https://auth-ui.banata.dev";

function normalizeBaseUrl(value: string) {
	return value.replace(/\/$/, "");
}

export function buildHostedAuthUrl(mode: HostedAuthMode) {
	const clientId = import.meta.env.VITE_BANATA_CLIENT_ID?.trim();
	if (!clientId) {
		return null;
	}

	const hostedAuthUrl = normalizeBaseUrl(
		import.meta.env.VITE_BANATA_HOSTED_AUTH_URL?.trim() || DEFAULT_HOSTED_AUTH_URL,
	);
	const url = new URL(mode === "sign-up" ? "/sign-up" : "/sign-in", hostedAuthUrl);
	url.searchParams.set("client_id", clientId);
	url.searchParams.set("redirect_url", new URL("/app", window.location.origin).toString());
	return url.toString();
}
