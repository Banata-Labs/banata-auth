import { describe, expect, it } from "vitest";
import {
	enterpriseProvisioningPlugin,
	validateSsoConnectionReadiness,
} from "./enterprise";

describe("enterpriseProvisioningPlugin", () => {
	it("registers SCIM token rotation management endpoint", () => {
		const plugin = enterpriseProvisioningPlugin();

		expect(plugin.endpoints?.validateSsoProvider).toBeDefined();
		expect(plugin.endpoints?.registerDirectory).toBeDefined();
		expect(plugin.endpoints?.rotateDirectoryToken).toBeDefined();
		expect(plugin.schema?.scimProvider?.fields?.tokenHash).toMatchObject({
			type: "string",
			required: false,
		});
	});

	it("requires verified routing domains before production SSO routing", () => {
		const report = validateSsoConnectionReadiness({
			active: true,
			providerType: "oidc",
			domain: "acme.com",
			domainVerified: false,
			oidcConfig: JSON.stringify({
				issuer: "https://acme.okta.com/oauth2/default",
				clientId: "client_123",
				clientSecret: "secret_123",
				discoveryEndpoint: "https://acme.okta.com/oauth2/default/.well-known/openid-configuration",
				pkce: true,
			}),
		});

		expect(report.status).toBe("failed");
		expect(report.issues).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					code: "domain_not_verified",
					severity: "error",
				}),
			]),
		);
	});

	it("passes OIDC setup validation when the routing domain is verified", () => {
		const report = validateSsoConnectionReadiness({
			active: true,
			providerType: "oidc",
			domain: "acme.com",
			domainVerified: true,
			oidcConfig: JSON.stringify({
				issuer: "https://acme.okta.com/oauth2/default",
				clientId: "client_123",
				clientSecret: "secret_123",
				discoveryEndpoint: "https://acme.okta.com/oauth2/default/.well-known/openid-configuration",
				pkce: true,
			}),
		});

		expect(report).toEqual({ status: "passed", issues: [] });
	});
});
