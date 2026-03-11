import type { AuthConfig } from "convex/server";
import type { BetterAuthOptions } from "better-auth";
import { createBanataAuthStaticOptions, type BanataAuthConfig } from "../auth";

const staticConfig: BanataAuthConfig = {
	appName: "Banata Auth",
	siteUrl: "http://localhost:3000",
	secret: "placeholder-for-component-schema",
	authMethods: {
		emailPassword: true,
		magicLink: true,
		emailOtp: true,
		passkey: true,
		twoFactor: true,
		anonymous: true,
		username: true,
		multiSession: true,
		organization: true,
		sso: true,
		scim: true,
		apiKey: true,
	},
	passkey: {
		rpId: "localhost",
		rpName: "Banata Auth",
		origin: "http://localhost:3000",
	},
};

const staticAuthConfig = {
	providers: [{ applicationID: "convex", domain: "http://localhost:3000" }],
} as unknown as AuthConfig;

const staticAuthComponent = {
	adapter: () => ({}),
	registerRoutes: () => {},
} as unknown as {
	adapter: () => BetterAuthOptions["database"];
	registerRoutes: () => void;
};

export const options = createBanataAuthStaticOptions({
	authComponent: staticAuthComponent as never,
	authConfig: staticAuthConfig,
	config: staticConfig,
});
