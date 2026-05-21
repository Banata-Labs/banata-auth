import {
	createAuthClient,
	organizationClient,
	resolveAuthBaseUrl,
} from "@banata-auth/react/plugins";

export const authClient = createAuthClient({
	baseURL: resolveAuthBaseUrl(import.meta.env.VITE_AUTH_BASE_URL ?? "/api/auth"),
	plugins: [organizationClient()],
});
