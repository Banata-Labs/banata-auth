import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import { runWithEndpointContext } from "@better-auth/core/context";
import type { BetterAuthPlugin } from "better-auth";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	type BanataAuthConfig,
	banataAuthSchema,
	createBanataAuthOptions,
	defineBanataAuth,
	type SocialProviderConfig,
} from "./auth";

function createOptions(config: Partial<BanataAuthConfig> = {}) {
	const baseConfig: BanataAuthConfig = {
		siteUrl: "http://localhost:3000",
		secret: "test-secret",
		...config,
	};

	return createBanataAuthOptions({} as never, {
		authComponent: {
			adapter: () => ({}),
		} as never,
		authConfig: {
			providers: [getAuthConfigProvider()],
		},
		config: baseConfig,
	});
}

describe("createBanataAuthOptions()", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("supports typed email/password verification settings", () => {
		const options = createOptions({
			emailPassword: {
				requireEmailVerification: false,
				minPasswordLength: 12,
				maxPasswordLength: 256,
				autoSignIn: false,
			},
		});

		expect(options.emailAndPassword?.requireEmailVerification).toBe(false);
		expect(options.emailAndPassword?.minPasswordLength).toBe(12);
		expect(options.emailAndPassword?.maxPasswordLength).toBe(256);
		expect(options.emailAndPassword?.autoSignIn).toBe(false);
	});

	it("deep-merges advanced config without dropping defaults or built-in plugins", () => {
		const extraPlugin = { id: "test-plugin" } as BetterAuthPlugin;
		const options = createOptions({
			advanced: {
				emailAndPassword: {
					requireEmailVerification: false,
				},
				plugins: [extraPlugin],
				trustedOrigins: ["http://localhost:4000"],
			},
		});

		expect(options.emailAndPassword?.requireEmailVerification).toBe(false);
		expect(options.emailAndPassword?.minPasswordLength).toBe(8);
		expect(options.emailAndPassword?.maxPasswordLength).toBe(128);
		expect(options.plugins?.some((plugin) => plugin.id === "test-plugin")).toBe(true);
		expect(options.plugins?.some((plugin) => plugin.id === "banata-organization-rbac")).toBe(true);
		expect(options.trustedOrigins).toContain("http://localhost:3000");
		expect(options.trustedOrigins).toContain("http://localhost:4000");
	});

	it("falls back to a placeholder secret during module analysis", () => {
		const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
		const options = createOptions({
			secret: "",
		});

		expect(options.secret).toBe("placeholder-for-module-analysis");
		expect(warn).toHaveBeenCalled();
	});

	it("skips adapter resolution during static module evaluation", () => {
		vi.spyOn(console, "warn").mockImplementation(() => {});

		expect(() =>
			createBanataAuthOptions({} as never, {
				authComponent: {
					adapter: () => {
						throw new Error("adapter should not resolve during module analysis");
					},
				} as never,
				authConfig: {
					providers: [getAuthConfigProvider()],
				},
				config: {
					siteUrl: "http://localhost:3000",
					secret: "test-secret",
				},
			}),
		).not.toThrow();
	});

	it("skips social providers with missing credentials", () => {
		const github = {
			clientId: "github-client",
			clientSecret: "github-secret",
		} satisfies SocialProviderConfig;

		const options = createOptions({
			socialProviders: {
				github,
				google: {
					clientId: "   ",
					clientSecret: "",
				} as SocialProviderConfig,
			},
		});

		expect(options.socialProviders).toMatchObject({
			github: {
				clientId: "github-client",
				clientSecret: "github-secret",
			},
		});
		expect("google" in (options.socialProviders ?? {})).toBe(false);
	});

	it("configures API keys for dashboard-style bearer auth and project metadata", () => {
		const options = createOptions({
			apiKeyConfig: {
				prefix: "ba_live_",
				defaultExpiresIn: 7 * 24 * 60 * 60,
			},
		});

		const apiKeyPlugin = options.plugins?.find((plugin) => plugin.id === "api-key") as
			| (BetterAuthPlugin & {
					options?: {
						enableMetadata?: boolean;
						enableSessionForAPIKeys?: boolean;
						defaultPrefix?: string;
						keyExpiration?: {
							defaultExpiresIn?: number;
						};
						customAPIKeyGetter?: (ctx: {
							path?: string;
							headers?: Headers;
							request?: { headers: Headers };
						}) => string | undefined;
					};
			  })
			| undefined;

		expect(apiKeyPlugin?.options?.enableMetadata).toBe(true);
		expect(apiKeyPlugin?.options?.enableSessionForAPIKeys).toBe(true);
		expect(apiKeyPlugin?.options?.defaultPrefix).toBe("ba_live_");
		expect(apiKeyPlugin?.options?.keyExpiration?.defaultExpiresIn).toBe(7 * 24 * 60 * 60);
		expect(
			apiKeyPlugin?.options?.customAPIKeyGetter?.({
				path: "/admin/list-users",
				headers: new Headers({
					authorization: "Bearer ba_live_secret",
				}),
			}),
		).toBe("ba_live_secret");
		expect(
			apiKeyPlugin?.options?.customAPIKeyGetter?.({
				path: "/sign-in/email",
				headers: new Headers({
					authorization: "Bearer session_token",
				}),
			}),
		).toBeUndefined();
	});

	it("registers projectId as a known field on core auth models", () => {
		const options = createOptions();

		expect(options.user?.additionalFields?.projectId).toMatchObject({
			type: "string",
			required: false,
		});
		expect(options.session?.additionalFields?.projectId).toMatchObject({
			type: "string",
			required: false,
		});
		expect(options.account?.additionalFields?.projectId).toMatchObject({
			type: "string",
			required: false,
		});
		expect(options.verification?.additionalFields?.projectId).toMatchObject({
			type: "string",
			required: false,
		});
	});

	it("scopes core adapter reads by the current project context", async () => {
		const findOne = vi.fn(async () => null);
		const options = createBanataAuthOptions(
			{ runQuery: vi.fn() } as never,
			{
				authComponent: {
					adapter: () =>
						({
							findOne,
						}) as never,
				} as never,
				authConfig: {
					providers: [getAuthConfigProvider()],
				},
				config: {
					siteUrl: "http://localhost:3000",
					secret: "test-secret",
				},
			},
		);

		await runWithEndpointContext(
			{
				headers: new Headers({
					"x-banata-project-id": "proj_test",
				}),
				request: new Request("http://localhost/api/auth/sign-in/email"),
				context: {} as never,
			},
			async () => {
				await (options.database as { findOne: (input: unknown) => Promise<unknown> }).findOne({
					model: "user",
					where: [{ field: "email", value: "test@example.com" }],
				});
			},
		);

		expect(findOne).toHaveBeenCalledWith({
			model: "user",
			where: [
				{ field: "email", value: "test@example.com" },
				{ field: "projectId", value: "proj_test" },
			],
		});
	});

	it("scopes core adapter creates by the current project context", async () => {
		const create = vi.fn(async () => null);
		const options = createBanataAuthOptions(
			{ runQuery: vi.fn() } as never,
			{
				authComponent: {
					adapter: () =>
						({
							create,
						}) as never,
				} as never,
				authConfig: {
					providers: [getAuthConfigProvider()],
				},
				config: {
					siteUrl: "http://localhost:3000",
					secret: "test-secret",
				},
			},
		);

		await runWithEndpointContext(
			{
				headers: new Headers({
					"x-banata-project-id": "proj_test",
				}),
				request: new Request("http://localhost/api/auth/sign-up/email"),
				context: {} as never,
			},
			async () => {
				await (options.database as { create: (input: unknown) => Promise<unknown> }).create({
					model: "user",
					data: {
						email: "test@example.com",
						name: "Test User",
					},
				});
			},
		);

		expect(create).toHaveBeenCalledWith({
			model: "user",
			data: {
				email: "test@example.com",
				name: "Test User",
				projectId: "proj_test",
			},
		});
	});

	it("uses Banata's project-scoped rate limiter instead of Better Auth's global limiter", () => {
		const options = createOptions();
		expect(options.rateLimit?.enabled).toBe(false);
		expect(options.plugins?.some((plugin) => plugin.id === "banata-project-rate-limit")).toBe(
			true,
		);
	});

	it("registers projectId-aware enterprise models", () => {
		const options = createOptions();
		const enterprisePlugin = options.plugins?.find(
			(plugin) => plugin.id === "banata-enterprise",
		) as
			| (BetterAuthPlugin & {
					schema?: Record<
						string,
						{
							fields?: Record<string, { type: string; required?: boolean }>;
						}
					>;
			  })
			| undefined;

		expect(enterprisePlugin?.schema?.ssoProvider?.fields?.projectId).toMatchObject({
			type: "string",
			required: false,
		});
		expect(enterprisePlugin?.schema?.scimProvider?.fields?.projectId).toMatchObject({
			type: "string",
			required: false,
		});
	});

	it("builds a packaged component helper with the bundled schema", () => {
		const definedAuth = defineBanataAuth({
			componentRef: {
				adapter: {
					create: "create" as never,
					findOne: "findOne" as never,
					findMany: "findMany" as never,
					updateOne: "updateOne" as never,
					updateMany: "updateMany" as never,
					deleteOne: "deleteOne" as never,
					deleteMany: "deleteMany" as never,
				},
			},
			authConfig: {
				providers: [getAuthConfigProvider()],
			},
			config: {
				siteUrl: "http://localhost:3000",
				secret: "test-secret",
			},
		});

		expect(definedAuth.schema).toBe(banataAuthSchema);
		expect(typeof definedAuth.createAuth).toBe("function");
		expect(typeof definedAuth.createAuthOptions).toBe("function");
		expect(definedAuth.options.baseURL).toBe("http://localhost:3000");
	});
});
