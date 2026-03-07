"use client";

import { createAuthClient } from "better-auth/react";
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { organizationClient } from "better-auth/client/plugins";
import { ssoClient } from "@better-auth/sso/client";

export const authClient: ReturnType<typeof createAuthClient> = createAuthClient({
	plugins: [
		convexClient(),
		organizationClient(),
		ssoClient(),
	],
});
