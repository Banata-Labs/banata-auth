import { beforeEach, describe, expect, it, vi } from "vitest";
import {
	banUser,
	createApiKey,
	createOrganization,
	createSsoConnection,
	getUser,
	invalidateCache,
	inviteOrganizationMember,
	listUsers,
	setActiveScope,
	toggleAuthMethod,
	toggleSocialProvider,
	unbanUser,
} from "./dashboard-api";

describe("dashboard api client", () => {
	beforeEach(() => {
		vi.unstubAllGlobals();
		vi.restoreAllMocks();
		invalidateCache();
		setActiveScope(null);
	});

	it("maps list users from wrapped payload", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn(
				async () =>
					new Response(
						JSON.stringify({
							data: [{ id: "usr_1", email: "owner@example.com", name: "Owner", role: "admin" }],
						}),
						{ status: 200, headers: { "content-type": "application/json" } },
					),
			),
		);

		const users = await listUsers();
		expect(users).toHaveLength(1);
		expect(users[0]?.id).toBe("usr_1");
		expect(users[0]?.role).toBe("admin");
	});

	it("posts ban and unban actions to expected endpoints", async () => {
		const fetchMock = vi.fn(
			async () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
		);
		vi.stubGlobal("fetch", fetchMock);

		await banUser("usr_11");
		await unbanUser("usr_11");

		expect(fetchMock).toHaveBeenCalledTimes(2);
		expect(fetchMock).toHaveBeenNthCalledWith(1, "/api/auth/admin/ban-user", expect.any(Object));
		expect(fetchMock).toHaveBeenNthCalledWith(2, "/api/auth/admin/unban-user", expect.any(Object));
	});

	it("uses the dedicated get-user endpoint for user detail lookups", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(JSON.stringify({ id: "usr_11", email: "owner@example.com", role: "admin" }), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const user = await getUser("usr_11");

		expect(user?.id).toBe("usr_11");
		expect(fetchMock).toHaveBeenCalledWith("/api/auth/admin/get-user", expect.any(Object));
	});

	it("posts organization and connection creation payloads", async () => {
		const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
			if (input === "/api/auth/banata/sso/register") {
				return new Response(
					JSON.stringify({
						id: "sso_1",
						organizationId: "org_1",
						type: "oidc",
						name: "Acme OIDC",
						domains: ["acme.com"],
						state: "active",
						oidcConfig: {
							issuer: "https://acme.okta.com",
							clientId: "client_123",
							discoveryUrl: "https://acme.okta.com/.well-known/openid-configuration",
							authorizationUrl: "https://acme.okta.com/oauth2/v1/authorize",
							tokenUrl: "https://acme.okta.com/oauth2/v1/token",
							userinfoUrl: "https://acme.okta.com/oauth2/v1/userinfo",
							jwksUrl: "https://acme.okta.com/oauth2/v1/keys",
							scopes: ["openid", "email", "profile"],
						},
					}),
					{ status: 200, headers: { "content-type": "application/json" } },
				);
			}
			return new Response(JSON.stringify({ ok: true }), { status: 200 });
		});
		vi.stubGlobal("fetch", fetchMock);

		await createOrganization({ name: "Acme", slug: "acme" });
		await inviteOrganizationMember({
			organizationId: "org_1",
			email: "new@acme.com",
			role: "member",
		});
		await createSsoConnection({
			organizationId: "org_1",
			type: "oidc",
			name: "Acme OIDC",
			domains: ["acme.com"],
			oidcConfig: {
				issuer: "https://acme.okta.com",
				clientId: "client_123",
				clientSecret: "secret_123",
			},
		});

		expect(fetchMock).toHaveBeenNthCalledWith(
			1,
			"/api/auth/organization/create",
			expect.any(Object),
		);
		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"/api/auth/organization/invite-member",
			expect.any(Object),
		);
		expect(fetchMock).toHaveBeenNthCalledWith(
			3,
			"/api/auth/banata/sso/register",
			expect.any(Object),
		);
	});

	it("saves auth method toggles through dashboard config", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(JSON.stringify({ authMethods: { emailPassword: true } }), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
		);
		vi.stubGlobal("fetch", fetchMock);

		await toggleAuthMethod("emailPassword", true);

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/auth/banata/config/dashboard/save",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({ authMethods: { emailPassword: true } }),
			}),
		);
	});

	it("preserves provider metadata when toggling social providers", async () => {
		const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
			if (input === "/api/auth/banata/config/dashboard") {
				return new Response(
					JSON.stringify({
						authMethods: {},
						socialProviders: {
							github: { enabled: true, demo: true },
						},
						features: {},
						sessions: {},
					}),
					{ status: 200, headers: { "content-type": "application/json" } },
				);
			}

			return new Response(
				JSON.stringify({
					authMethods: {},
					socialProviders: {
						github: { enabled: false, demo: true },
					},
					features: {},
					sessions: {},
				}),
				{ status: 200, headers: { "content-type": "application/json" } },
			);
		});
		vi.stubGlobal("fetch", fetchMock);

		await toggleSocialProvider("github", false);

		expect(fetchMock).toHaveBeenNthCalledWith(
			2,
			"/api/auth/banata/config/dashboard/save",
			expect.objectContaining({
				method: "POST",
				body: JSON.stringify({
					socialProviders: {
						github: { enabled: false, demo: true },
					},
				}),
			}),
		);
	});

	it("stamps API key creation requests with the active project metadata", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(JSON.stringify({ key: "ba_live_secret" }), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
		);
		vi.stubGlobal("fetch", fetchMock);
		setActiveScope("proj_123");

		await createApiKey("Production", "ba_live_");

		expect(fetchMock).toHaveBeenCalledWith(
			"/api/auth/api-key/create",
			expect.objectContaining({
				method: "POST",
			}),
		);
		const firstCall = (
			fetchMock.mock.calls as unknown as Array<[RequestInfo | URL, RequestInit]>
		)[0];
		expect(firstCall).toBeDefined();
		const requestInit = firstCall![1];
		expect(JSON.parse(String(requestInit.body))).toEqual({
			name: "Production",
			prefix: "ba_live_",
			metadata: {
				projectId: "proj_123",
			},
			projectId: "proj_123",
		});
	});

	it("falls back to the persisted active project before the provider sync effect runs", async () => {
		const fetchMock = vi.fn(
			async () =>
				new Response(JSON.stringify({ key: "ba_persisted_secret" }), {
					status: 200,
					headers: { "content-type": "application/json" },
				}),
		);
		vi.stubGlobal("fetch", fetchMock);
		vi.stubGlobal("window", {
			localStorage: {
				getItem: vi.fn((key: string) =>
					key === "banata-active-project-id" ? "proj_persisted" : null,
				),
			},
		} as unknown as Window & typeof globalThis);

		await createApiKey("Persisted");

		const firstCall = (
			fetchMock.mock.calls as unknown as Array<[RequestInfo | URL, RequestInit]>
		)[0];
		expect(firstCall).toBeDefined();
		expect(firstCall?.[1].headers).toMatchObject({
			"content-type": "application/json",
			"x-banata-project-id": "proj_persisted",
		});
		expect(JSON.parse(String(firstCall?.[1].body))).toMatchObject({
			projectId: "proj_persisted",
			metadata: {
				projectId: "proj_persisted",
			},
		});
	});
});
