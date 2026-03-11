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
		expect(options.plugins?.some((plugin) => plugin.id === "cross-domain")).toBe(false);
	});

	it("keeps platform dashboard auth on the dashboard domain", () => {
		const originalSiteUrl = process.env.SITE_URL;
		const originalHostedUiUrl = process.env.AUTH_UI_URL;

		process.env.SITE_URL = "https://auth.banata.dev";
		delete process.env.AUTH_UI_URL;

		try {
			expect(getConfig().hostedUiUrl).toBeUndefined();
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
