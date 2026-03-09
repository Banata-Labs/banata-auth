"use client";

import { convexClient, createAuthClient, organizationClient } from "@banata-auth/react/plugins";
import { ssoClient } from "@better-auth/sso/client";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
	plugins: [convexClient(), organizationClient(), ssoClient()],
});
