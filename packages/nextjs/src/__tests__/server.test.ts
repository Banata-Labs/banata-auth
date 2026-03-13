import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
	preloadQuery: vi.fn(),
	fetchQuery: vi.fn(),
	fetchMutation: vi.fn(),
	fetchAction: vi.fn(),
	getToken: vi.fn(),
	createRouteHandler: vi.fn(() => ({
		GET: vi.fn(),
		POST: vi.fn(),
		PUT: vi.fn(),
		PATCH: vi.fn(),
		DELETE: vi.fn(),
	})),
}));

vi.mock("convex/nextjs", () => ({
	preloadQuery: mocks.preloadQuery,
	fetchQuery: mocks.fetchQuery,
	fetchMutation: mocks.fetchMutation,
	fetchAction: mocks.fetchAction,
}));

vi.mock("@convex-dev/better-auth/utils", () => ({
	getToken: mocks.getToken,
}));

vi.mock("next/headers.js", () => ({
	headers: vi.fn(async () => new Headers({ cookie: "session=abc" })),
}));

vi.mock("../route-handler", () => ({
	createRouteHandler: mocks.createRouteHandler,
}));

import { createBanataAuthServer } from "../server";

describe("createBanataAuthServer()", () => {
	beforeEach(() => {
		mocks.preloadQuery.mockReset();
		mocks.fetchQuery.mockReset();
		mocks.fetchMutation.mockReset();
		mocks.fetchAction.mockReset();
		mocks.createRouteHandler.mockClear();
		mocks.getToken.mockReset();
		mocks.getToken.mockResolvedValue({
			isFresh: true,
			token: "jwt_123",
		});
	});

	it("returns handler and auth helpers", () => {
		const result = createBanataAuthServer({
			apiKey: "sk_test_project_key",
		});

		expect(result.handler).toBeDefined();
		expect(result.isAuthenticated).toBeDefined();
		expect(result.getToken).toBeDefined();
		expect(result.fetchAuthQuery).toBeDefined();
		expect(result.fetchAuthMutation).toBeDefined();
		expect(result.fetchAuthAction).toBeDefined();
	});

	it("defaults hosted integrations to auth.banata.dev", async () => {
		const server = createBanataAuthServer({
			apiKey: "sk_test_project_key",
		});

		await server.getToken();

		expect(mocks.createRouteHandler).toHaveBeenCalledWith({
			authUrl: "https://auth.banata.dev",
			apiKey: "sk_test_project_key",
			allowedOrigins: undefined,
			project: undefined,
		});
		const [siteUrl] = mocks.getToken.mock.calls[0] as [string, Headers];
		expect(siteUrl).toBe("https://auth.banata.dev");
	});

	it("creates the route handler with the configured API key", () => {
		const result = createBanataAuthServer({
			authUrl: "https://auth.acme.test",
			apiKey: "sk_test_project_key",
			allowedOrigins: ["https://auth-ui.banata.dev"],
			project: { clientId: "acme-app" },
		});

		expect(result.handler).toBeDefined();
		expect(mocks.createRouteHandler).toHaveBeenCalledWith({
			authUrl: "https://auth.acme.test",
			apiKey: "sk_test_project_key",
			allowedOrigins: ["https://auth-ui.banata.dev"],
			project: { clientId: "acme-app" },
		});
	});

	it("injects the API key into token refresh requests", async () => {
		const server = createBanataAuthServer({
			authUrl: "https://auth.acme.test",
			apiKey: "sk_test_project_key",
			project: { clientId: "acme-app", projectId: "project_123" },
		});

		await server.getToken();

		expect(mocks.getToken).toHaveBeenCalledTimes(1);
		const [siteUrl, headers] = mocks.getToken.mock.calls[0] as [string, Headers];
		expect(siteUrl).toBe("https://auth.acme.test");
		expect(headers.get("x-api-key")).toBe("sk_test_project_key");
		expect(headers.get("x-banata-client-id")).toBe("acme-app");
		expect(headers.get("x-banata-project-id")).toBe("project_123");
	});

	it("supports Banata internal hosted surfaces without a customer api key", async () => {
		const server = createBanataAuthServer({
			authUrl: "https://auth.acme.test",
			allowInternalProjectScope: true,
			project: { clientId: "banata-dashboard" },
		});

		await server.getToken();

		expect(mocks.createRouteHandler).toHaveBeenCalledWith({
			authUrl: "https://auth.acme.test",
			allowInternalProjectScope: true,
			apiKey: undefined,
			project: { clientId: "banata-dashboard" },
		});
		const [siteUrl, headers] = mocks.getToken.mock.calls[0] as [string, Headers];
		expect(siteUrl).toBe("https://auth.acme.test");
		expect(headers.get("x-api-key")).toBeNull();
		expect(headers.get("x-banata-internal-project-scope")).toBe("1");
		expect(headers.get("x-banata-client-id")).toBe("banata-dashboard");
	});

	it("passes allowedOrigins through for hosted auth handoff support", () => {
		createBanataAuthServer({
			authUrl: "https://auth.acme.test",
			apiKey: "sk_test_project_key",
			allowedOrigins: ["https://auth-ui.banata.dev", "https://auth.banata.dev"],
		});

		expect(mocks.createRouteHandler).toHaveBeenCalledWith({
			authUrl: "https://auth.acme.test",
			apiKey: "sk_test_project_key",
			allowedOrigins: ["https://auth-ui.banata.dev", "https://auth.banata.dev"],
			project: undefined,
		});
	});

	it("reports authentication state from the resolved token", async () => {
		const server = createBanataAuthServer({
			apiKey: "sk_test_project_key",
		});

		await expect(server.isAuthenticated()).resolves.toBe(true);

		mocks.getToken.mockResolvedValueOnce({
			isFresh: true,
			token: undefined,
		});
		await expect(server.isAuthenticated()).resolves.toBe(false);
	});
});
