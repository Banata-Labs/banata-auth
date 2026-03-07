import { describe, expect, it } from "vitest";
import { resolveSocialProvider, resolveSocialProviders } from "../components/auth/provider-registry";

describe("social provider registry", () => {
	it("fills in built-in labels and icons from provider ids", () => {
		const provider = resolveSocialProvider({ id: "github" });

		expect(provider.label).toBe("GitHub");
		expect(provider.icon).toBeTruthy();
	});

	it("preserves caller-supplied labels and icons", () => {
		const customIcon = <span>custom</span>;
		const provider = resolveSocialProvider({
			id: "google",
			label: "Google Workspace",
			icon: customIcon,
		});

		expect(provider.label).toBe("Google Workspace");
		expect(provider.icon).toBe(customIcon);
	});

	it("humanizes unknown provider ids", () => {
		const providers = resolveSocialProviders([{ id: "custom_oidc" }]);

		expect(providers[0]?.label).toBe("Custom Oidc");
		expect(providers[0]?.icon).toBeTruthy();
	});
});
