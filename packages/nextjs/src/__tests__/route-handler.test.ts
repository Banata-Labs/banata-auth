import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createRouteHandler } from "../route-handler";

// Mock global fetch
const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

/**
 * Helper to create a mock Request object.
 */
function createMockRequest(
	url: string,
	options: {
		method?: string;
		headers?: Record<string, string>;
		body?: string | null;
	} = {},
): Request {
	return new Request(url, {
		method: options.method ?? "GET",
		headers: options.headers ?? {},
		body: options.body ?? null,
	});
}

/**
 * Helper to create a mock Response for fetch to return.
 */
function createMockResponse(
	body: string,
	options: { status?: number; statusText?: string; headers?: Record<string, string> } = {},
): Response {
	return new Response(body, {
		status: options.status ?? 200,
		statusText: options.statusText ?? "OK",
		headers: options.headers ?? {},
	});
}

function firstFetchCall(): [Request, RequestInit?] {
	const call = mockFetch.mock.calls[0];
	if (!call) {
		throw new Error("Expected fetch to be called at least once");
	}
	return call as [Request, RequestInit?];
}

function createManagedHandler(options: Partial<Parameters<typeof createRouteHandler>[0]> = {}) {
	return createRouteHandler({
		authUrl: "https://auth.acme.test",
		apiKey: "sk_test_project_key",
		...options,
	});
}

describe("createRouteHandler", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("handler shape", () => {
		it("returns an object with GET, POST, PUT, PATCH, DELETE handlers", () => {
			const handler = createManagedHandler();

			expect(handler).toHaveProperty("GET");
			expect(handler).toHaveProperty("POST");
			expect(handler).toHaveProperty("PUT");
			expect(handler).toHaveProperty("PATCH");
			expect(handler).toHaveProperty("DELETE");
			expect(typeof handler.GET).toBe("function");
			expect(typeof handler.POST).toBe("function");
			expect(typeof handler.PUT).toBe("function");
			expect(typeof handler.PATCH).toBe("function");
			expect(typeof handler.DELETE).toBe("function");
		});

		it("all handlers are the same function reference", () => {
			const handler = createManagedHandler();

			expect(handler.GET).toBe(handler.POST);
			expect(handler.POST).toBe(handler.PUT);
			expect(handler.PUT).toBe(handler.PATCH);
			expect(handler.PATCH).toBe(handler.DELETE);
		});
	});

	describe("request forwarding", () => {
		it("forwards request to Convex site URL with correct path", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/sign-in");
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			const fetchedUrl = new URL(fetchedRequest.url);
			expect(fetchedUrl.origin).toBe("https://auth.acme.test");
			expect(fetchedUrl.pathname).toBe("/api/auth/sign-in");
		});

		it("defaults to auth.banata.dev when authUrl is omitted", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				apiKey: "sk_test_project_key",
			});

			const request = createMockRequest("http://localhost:3000/api/auth/session");
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.url).toContain("https://auth.banata.dev/api/auth/session");
			expect(fetchedRequest.headers.get("host")).toBe("auth.banata.dev");
		});

		it("strips trailing slash from authUrl", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler({
				authUrl: "https://auth.acme.test/",
			});

			const request = createMockRequest("http://localhost:3000/api/auth/callback");
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			// Should not have double slash
			expect(fetchedRequest.url).not.toContain("auth.acme.test//api");
			expect(fetchedRequest.url).toContain("https://auth.acme.test/api/auth/callback");
		});

		it("preserves query string parameters", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest(
				"http://localhost:3000/api/auth/callback?code=abc&state=xyz",
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			const fetchedUrl = new URL(fetchedRequest.url);
			expect(fetchedUrl.searchParams.get("code")).toBe("abc");
			expect(fetchedUrl.searchParams.get("state")).toBe("xyz");
		});

		it("forwards request headers", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/session", {
				headers: {
					authorization: "Bearer token-123",
					"content-type": "application/json",
				},
			});
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("authorization")).toBe("Bearer token-123");
			expect(fetchedRequest.headers.get("content-type")).toBe("application/json");
		});

		it("injects forwarded host and proto from the customer app request", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("https://app.acme.test/api/auth/session");
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-forwarded-host")).toBe("app.acme.test");
			expect(fetchedRequest.headers.get("x-forwarded-proto")).toBe("https");
		});

		it("forwards the Better Auth cookie handoff header for hosted auth", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/sign-in/email", {
				headers: {
					"better-auth-cookie": "session=abc123",
				},
			});
			await handler.POST(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("better-auth-cookie")).toBe("session=abc123");
		});

		it("injects a configured Banata client ID header", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler({
				project: { clientId: "customer-app" },
			});

			const request = createMockRequest("http://localhost:3000/api/auth/session");
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-banata-client-id")).toBe("customer-app");
		});

		it("injects a configured Banata API key as a private upstream header", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/session");
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-api-key")).toBe("sk_test_project_key");
			expect(fetchedRequest.headers.get("authorization")).toBeNull();
		});

		it("can mark Banata-hosted auth surfaces as trusted internal project resolvers", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				authUrl: "https://auth.acme.test",
				allowInternalProjectScope: true,
			});

			const request = createMockRequest("http://localhost:3000/api/auth/sign-in/email");
			await handler.POST(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-banata-internal-project-scope")).toBe("1");
		});

		it("resolves Banata scope from query parameters", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest(
				"http://localhost:3000/api/auth/session?client_id=customer-app&project_id=project_123",
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-banata-client-id")).toBe("customer-app");
			expect(fetchedRequest.headers.get("x-banata-project-id")).toBe("project_123");
		});

		it("resolves Banata scope from cookies", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/session", {
				headers: {
					cookie: "banata_client_id=customer-app; banata_project_id=project_123",
				},
			});
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-banata-client-id")).toBe("customer-app");
			expect(fetchedRequest.headers.get("x-banata-project-id")).toBe("project_123");
		});

		it("sets host header to the Convex site host", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/session");
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("host")).toBe("auth.acme.test");
		});

		it("uses request.method in the forwarded fetch call", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/sign-in", {
				method: "POST",
				body: '{"email":"a@b.com"}',
			});
			await handler.POST(request);

			const [, fetchOptionsRaw] = firstFetchCall();
			const fetchOptions = fetchOptionsRaw as RequestInit;
			expect(fetchOptions.method).toBe("POST");
		});

		it('uses redirect: "manual" in fetch options', async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/callback");
			await handler.GET(request);

			const [, fetchOptionsRaw] = firstFetchCall();
			const fetchOptions = fetchOptionsRaw as RequestInit;
			expect(fetchOptions.redirect).toBe("manual");
		});

		it("rewrites relative callback URLs in JSON bodies to the customer app origin", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest("https://app.acme.test/api/auth/sign-in/social", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					provider: "github",
					callbackURL: "/auth/callback?next=%2Fdashboard",
					errorCallbackURL: "/sign-in?error=1",
				}),
			});
			await handler.POST(request);

			const [fetchedRequest] = firstFetchCall();
			const body = JSON.parse(await fetchedRequest.text()) as Record<string, string>;
			expect(body.callbackURL).toBe("https://app.acme.test/auth/callback?next=%2Fdashboard");
			expect(body.errorCallbackURL).toBe("https://app.acme.test/sign-in?error=1");
		});

		it("rewrites relative callback params in query strings to the customer app origin", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler();

			const request = createMockRequest(
				"https://app.acme.test/api/auth/verify-email?callbackURL=%2Fwelcome%3Ftab%3Dprofile",
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			const fetchedUrl = new URL(fetchedRequest.url);
			expect(fetchedUrl.searchParams.get("callbackURL")).toBe(
				"https://app.acme.test/welcome?tab=profile",
			);
		});
	});

	describe("response forwarding", () => {
		it("returns response body from Convex", async () => {
			const responseBody = JSON.stringify({ user: { id: "123" } });
			mockFetch.mockResolvedValue(createMockResponse(responseBody));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/session");
			const response = await handler.GET(request);
			const body = await response.text();

			expect(body).toBe(responseBody);
		});

		it("returns response status from Convex", async () => {
			mockFetch.mockResolvedValue(
				createMockResponse("Not Found", { status: 404, statusText: "Not Found" }),
			);

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/nonexistent");
			const response = await handler.GET(request);

			expect(response.status).toBe(404);
		});

		it("returns response headers from Convex", async () => {
			mockFetch.mockResolvedValue(
				createMockResponse("ok", {
					headers: {
						"set-cookie": "session=abc; Path=/; HttpOnly",
						"x-custom": "value",
					},
				}),
			);

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/sign-in");
			const response = await handler.GET(request);

			expect(response.headers.get("x-custom")).toBe("value");
		});

		it("strips decompression-sensitive transport headers from proxied responses", async () => {
			mockFetch.mockResolvedValue(
				createMockResponse('{"url":"https://github.com/login/oauth/authorize","redirect":true}', {
					headers: {
						"content-encoding": "gzip",
						"content-length": "123",
						"transfer-encoding": "chunked",
						"set-cookie": "session=abc; Path=/; HttpOnly",
						"x-custom": "value",
					},
				}),
			);

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/sign-in/social");
			const response = await handler.POST(request);

			expect(response.headers.get("content-encoding")).toBeNull();
			expect(response.headers.get("content-length")).toBeNull();
			expect(response.headers.get("transfer-encoding")).toBeNull();
			expect(response.headers.get("set-cookie")).toBe("session=abc; Path=/; HttpOnly");
			expect(response.headers.get("x-custom")).toBe("value");
		});

		it("responds to OPTIONS with the configured CORS headers", async () => {
			const handler = createManagedHandler({
				allowedOrigins: ["https://auth-ui.banata.dev"],
			});

			const request = createMockRequest("http://localhost:3000/api/auth/sign-in/email", {
				method: "OPTIONS",
				headers: {
					origin: "https://auth-ui.banata.dev",
				},
			});
			const response = await handler.OPTIONS(request);

			expect(response.status).toBe(204);
			expect(response.headers.get("access-control-allow-origin")).toBe(
				"https://auth-ui.banata.dev",
			);
			expect(response.headers.get("access-control-allow-credentials")).toBe("true");
			expect(response.headers.get("access-control-expose-headers")).toContain(
				"set-better-auth-cookie",
			);
			expect(mockFetch).not.toHaveBeenCalled();
		});

		it("adds CORS headers to proxied responses for allowed hosted origins", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createManagedHandler({
				allowedOrigins: ["https://auth-ui.banata.dev"],
			});

			const request = createMockRequest("http://localhost:3000/api/auth/get-session", {
				headers: {
					origin: "https://auth-ui.banata.dev",
				},
			});
			const response = await handler.GET(request);

			expect(response.headers.get("access-control-allow-origin")).toBe(
				"https://auth-ui.banata.dev",
			);
			expect(response.headers.get("vary")).toBe("origin");
		});

		it("mirrors set-cookie into set-better-auth-cookie for allowed hosted origins", async () => {
			mockFetch.mockResolvedValue(
				createMockResponse('{"token":"abc"}', {
					headers: {
						"set-cookie": "session=abc; Path=/; HttpOnly; Secure; SameSite=Lax",
					},
				}),
			);

			const handler = createManagedHandler({
				allowedOrigins: ["https://auth-ui.banata.dev"],
			});

			const request = createMockRequest("http://localhost:3000/api/auth/sign-up/email", {
				method: "POST",
				headers: {
					origin: "https://auth-ui.banata.dev",
					"better-auth-cookie": "",
				},
			});
			const response = await handler.POST(request);

			expect(response.headers.get("set-cookie")).toBe(
				"session=abc; Path=/; HttpOnly; Secure; SameSite=Lax",
			);
			expect(response.headers.get("set-better-auth-cookie")).toBe(
				"session=abc; Path=/; HttpOnly; Secure; SameSite=Lax",
			);
		});
	});

	describe("error handling", () => {
		it("returns 502 on fetch error with JSON error body", async () => {
			mockFetch.mockRejectedValue(new Error("Network failure"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/session");
			const response = await handler.GET(request);

			expect(response.status).toBe(502);

			const body = await response.json();
			expect(body).toEqual({ error: "Auth service unavailable" });
		});

		it("returns application/json content-type on error", async () => {
			mockFetch.mockRejectedValue(new Error("Connection refused"));

			const handler = createManagedHandler();

			const request = createMockRequest("http://localhost:3000/api/auth/session");
			const response = await handler.GET(request);

			expect(response.headers.get("Content-Type")).toBe("application/json");
		});
	});
});
