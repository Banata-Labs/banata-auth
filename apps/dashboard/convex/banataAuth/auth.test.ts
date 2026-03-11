import type { BetterAuthPlugin } from "better-auth";
import { describe, expect, it } from "vitest";
import { createAuthOptions, getConfig } from "./auth";

describe("dashboard banata auth runtime", () => {
	it("enables API key metadata for the platform auth runtime", () => {
		const options = createAuthOptions({} as never);
		const apiKeyPlugin = options.plugins?.find((plugin) => plugin.id === "api-key") as
			| (BetterAuthPlugin & {
					options?: {
						enableMetadata?: boolean;
						enableSessionForAPIKeys?: boolean;
					};
			  })
			| undefined;

		expect(apiKeyPlugin?.options?.enableMetadata).toBe(true);
		expect(apiKeyPlugin?.options?.enableSessionForAPIKeys).toBe(true);
	});

	it("derives the hosted UI URL from the production site URL when AUTH_UI_URL is unset", () => {
		const originalSiteUrl = process.env.SITE_URL;
		const originalHostedUiUrl = process.env.AUTH_UI_URL;

		process.env.SITE_URL = "https://auth.banata.dev";
		delete process.env.AUTH_UI_URL;

		try {
			expect(getConfig().hostedUiUrl).toBe("https://auth-ui.banata.dev");
		} finally {
			if (typeof originalSiteUrl === "undefined") {
				delete process.env.SITE_URL;
			} else {
				process.env.SITE_URL = originalSiteUrl;
			}

			if (typeof originalHostedUiUrl === "undefined") {
				delete process.env.AUTH_UI_URL;
			} else {
				process.env.AUTH_UI_URL = originalHostedUiUrl;
			}
		}
	});
});
