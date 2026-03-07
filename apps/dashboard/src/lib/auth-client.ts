"use client";

import {
	apiKeyClient,
	convexClient,
	createAuthClient,
	organizationClient,
	twoFactorClient,
} from "@banata-auth/react/plugins";

/**
 * Better Auth client for the Banata dashboard.
 *
 * Dogfoods @banata-auth/react/plugins — exactly how a customer would use it.
 * Includes twoFactorClient for Account/Security page MFA management.
 */
export const authClient = createAuthClient({
	plugins: [convexClient(), organizationClient(), apiKeyClient(), twoFactorClient()],
});
