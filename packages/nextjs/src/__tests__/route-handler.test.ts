import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
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

describe("createRouteHandler", () => {
	beforeEach(() => {
		mockFetch.mockReset();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe("handler shape", () => {
		it("returns an object with GET, POST, PUT, PATCH, DELETE handlers", () => {
			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

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
			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			expect(handler.GET).toBe(handler.POST);
			expect(handler.POST).toBe(handler.PUT);
			expect(handler.PUT).toBe(handler.PATCH);
			expect(handler.PATCH).toBe(handler.DELETE);
		});
	});

	describe("request forwarding", () => {
		it("forwards request to Convex site URL with correct path", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/sign-in",
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			const fetchedUrl = new URL(fetchedRequest.url);
			expect(fetchedUrl.origin).toBe("https://my-site.convex.site");
			expect(fetchedUrl.pathname).toBe("/api/auth/sign-in");
		});

		it("strips trailing slash from convexSiteUrl", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site/",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/callback",
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			// Should not have double slash
			expect(fetchedRequest.url).not.toContain(
				"convex.site//api",
			);
			expect(fetchedRequest.url).toContain(
				"https://my-site.convex.site/api/auth/callback",
			);
		});

		it("preserves query string parameters", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

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

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/session",
				{
					headers: {
						authorization: "Bearer token-123",
						"content-type": "application/json",
					},
				},
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("authorization")).toBe(
				"Bearer token-123",
			);
			expect(fetchedRequest.headers.get("content-type")).toBe(
				"application/json",
			);
		});

		it("injects a configured Banata client ID header", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
				project: { clientId: "customer-app" },
			});

			const request = createMockRequest("http://localhost:3000/api/auth/session");
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-banata-client-id")).toBe(
				"customer-app",
			);
		});

		it("resolves Banata scope from query parameters", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/session?client_id=customer-app&project_id=project_123",
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-banata-client-id")).toBe(
				"customer-app",
			);
			expect(fetchedRequest.headers.get("x-banata-project-id")).toBe(
				"project_123",
			);
		});

		it("resolves Banata scope from cookies", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/session",
				{
					headers: {
						cookie: "banata_client_id=customer-app; banata_project_id=project_123",
					},
				},
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("x-banata-client-id")).toBe(
				"customer-app",
			);
			expect(fetchedRequest.headers.get("x-banata-project-id")).toBe(
				"project_123",
			);
		});

		it("sets host header to the Convex site host", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/session",
			);
			await handler.GET(request);

			const [fetchedRequest] = firstFetchCall();
			expect(fetchedRequest.headers.get("host")).toBe(
				"my-site.convex.site",
			);
		});

		it("uses request.method in the forwarded fetch call", async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/sign-in",
				{ method: "POST", body: '{"email":"a@b.com"}' },
			);
			await handler.POST(request);

			const [, fetchOptionsRaw] = firstFetchCall();
			const fetchOptions = fetchOptionsRaw as RequestInit;
			expect(fetchOptions.method).toBe("POST");
		});

		it('uses redirect: "manual" in fetch options', async () => {
			mockFetch.mockResolvedValue(createMockResponse("ok"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/callback",
			);
			await handler.GET(request);

			const [, fetchOptionsRaw] = firstFetchCall();
			const fetchOptions = fetchOptionsRaw as RequestInit;
			expect(fetchOptions.redirect).toBe("manual");
		});
	});

	describe("response forwarding", () => {
		it("returns response body from Convex", async () => {
			const responseBody = JSON.stringify({ user: { id: "123" } });
			mockFetch.mockResolvedValue(createMockResponse(responseBody));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/session",
			);
			const response = await handler.GET(request);
			const body = await response.text();

			expect(body).toBe(responseBody);
		});

		it("returns response status from Convex", async () => {
			mockFetch.mockResolvedValue(
				createMockResponse("Not Found", { status: 404, statusText: "Not Found" }),
			);

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/nonexistent",
			);
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

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/sign-in",
			);
			const response = await handler.GET(request);

			expect(response.headers.get("x-custom")).toBe("value");
		});
	});

	describe("error handling", () => {
		it("returns 502 on fetch error with JSON error body", async () => {
			mockFetch.mockRejectedValue(new Error("Network failure"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/session",
			);
			const response = await handler.GET(request);

			expect(response.status).toBe(502);

			const body = await response.json();
			expect(body).toEqual({ error: "Auth service unavailable" });
		});

		it("returns application/json content-type on error", async () => {
			mockFetch.mockRejectedValue(new Error("Connection refused"));

			const handler = createRouteHandler({
				convexSiteUrl: "https://my-site.convex.site",
			});

			const request = createMockRequest(
				"http://localhost:3000/api/auth/session",
			);
			const response = await handler.GET(request);

			expect(response.headers.get("Content-Type")).toBe(
				"application/json",
			);
		});
	});
});
