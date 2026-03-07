import { describe, it, expect, vi, beforeEach } from "vitest";
import type { NextRequest } from "next/server";

// Mock next/server before importing the module under test
vi.mock("next/server", () => {
	class MockNextResponse {
		static next() {
			return { type: "next" };
		}
		static redirect(url: URL) {
			return { type: "redirect", url: url.toString() };
		}
	}
	return { NextResponse: MockNextResponse };
});

import { banataAuthMiddleware } from "../middleware";

/** Mock response shape returned by the mocked NextResponse. */
interface MockMiddlewareResponse {
	type: string;
	url: string;
}

/**
 * Helper to create a mock NextRequest object.
 * Cast to NextRequest since next/server is fully mocked in this test suite.
 */
function createMockRequest(
	pathname: string,
	cookies: Record<string, string> = {},
): NextRequest {
	return {
		nextUrl: { pathname },
		url: `http://localhost:3000${pathname}`,
		cookies: {
			get: (name: string) =>
				cookies[name] ? { value: cookies[name] } : undefined,
		},
	} as unknown as NextRequest;
}

/**
 * Run middleware and cast the mocked result to our test-friendly shape.
 */
async function runMiddleware(
	middleware: (req: NextRequest) => Promise<unknown>,
	req: NextRequest,
): Promise<MockMiddlewareResponse> {
	return (await middleware(req)) as MockMiddlewareResponse;
}

describe("banataAuthMiddleware", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("default options (no public routes)", () => {
		it("redirects to /sign-in when no auth cookie is present", async () => {
			const middleware = banataAuthMiddleware();
			const request = createMockRequest("/dashboard");
			const response = await runMiddleware(middleware, request);

			expect(response.type).toBe("redirect");
			expect(response.url).toContain("/sign-in");
		});

		it("includes redirect_url param pointing to the original pathname", async () => {
			const middleware = banataAuthMiddleware();
			const request = createMockRequest("/dashboard/settings");
			const response = await runMiddleware(middleware, request);

			expect(response.type).toBe("redirect");
			const url = new URL(response.url);
			expect(url.searchParams.get("redirect_url")).toBe(
				"/dashboard/settings",
			);
		});
	});

	describe("auth cookie detection", () => {
		it("returns next() when convex_jwt cookie is present", async () => {
			const middleware = banataAuthMiddleware();
			const request = createMockRequest("/dashboard", {
				convex_jwt: "some-token-value",
			});
			const response = await runMiddleware(middleware, request);

			expect(response.type).toBe("next");
		});

		it("returns next() when better-auth.session_token cookie is present", async () => {
			const middleware = banataAuthMiddleware();
			const request = createMockRequest("/dashboard", {
				"better-auth.session_token": "some-session-token",
			});
			const response = await runMiddleware(middleware, request);

			expect(response.type).toBe("next");
		});

		it("prefers convex_jwt over better-auth.session_token", async () => {
			const middleware = banataAuthMiddleware();
			const request = createMockRequest("/dashboard", {
				convex_jwt: "jwt-token",
				"better-auth.session_token": "session-token",
			});
			const response = await runMiddleware(middleware, request);

			expect(response.type).toBe("next");
		});
	});

	describe("public routes", () => {
		it("returns next() for exact public routes without auth", async () => {
			const middleware = banataAuthMiddleware({
				publicRoutes: ["/", "/pricing"],
			});

			const rootResponse = await runMiddleware(middleware, createMockRequest("/"));
			expect(rootResponse.type).toBe("next");

			const pricingResponse = await runMiddleware(
				middleware,
				createMockRequest("/pricing"),
			);
			expect(pricingResponse.type).toBe("next");
		});

		it("still redirects for non-public routes without auth", async () => {
			const middleware = banataAuthMiddleware({
				publicRoutes: ["/", "/pricing"],
			});

			const response = await runMiddleware(middleware, createMockRequest("/dashboard"));
			expect(response.type).toBe("redirect");
		});

		it("matches regex public routes like /blog(.*)", async () => {
			const middleware = banataAuthMiddleware({
				publicRoutes: ["/blog(.*)"],
			});

			const blogRoot = await runMiddleware(middleware, createMockRequest("/blog"));
			expect(blogRoot.type).toBe("next");

			const blogPost = await runMiddleware(
				middleware,
				createMockRequest("/blog/my-post"),
			);
			expect(blogPost.type).toBe("next");

			const blogNested = await runMiddleware(
				middleware,
				createMockRequest("/blog/category/post-slug"),
			);
			expect(blogNested.type).toBe("next");
		});

		it("does not match partial regex routes", async () => {
			const middleware = banataAuthMiddleware({
				publicRoutes: ["/blog"],
			});

			// Exact match should work
			const exact = await runMiddleware(middleware, createMockRequest("/blog"));
			expect(exact.type).toBe("next");

			// Sub-path should NOT match (regex is anchored with ^ and $)
			const subPath = await runMiddleware(
				middleware,
				createMockRequest("/blog/my-post"),
			);
			expect(subPath.type).toBe("redirect");
		});
	});

	describe("ignored routes", () => {
		it("returns next() for ignored routes without auth", async () => {
			const middleware = banataAuthMiddleware({
				ignoredRoutes: ["/api/webhook", "/health"],
			});

			const webhook = await runMiddleware(
				middleware,
				createMockRequest("/api/webhook"),
			);
			expect(webhook.type).toBe("next");

			const health = await runMiddleware(middleware, createMockRequest("/health"));
			expect(health.type).toBe("next");
		});

		it("returns next() for ignored routes even with auth cookie", async () => {
			const middleware = banataAuthMiddleware({
				ignoredRoutes: ["/api/webhook"],
			});

			const response = await runMiddleware(
				middleware,
				createMockRequest("/api/webhook", {
					convex_jwt: "some-token",
				}),
			);
			expect(response.type).toBe("next");
		});

		it("ignored routes take priority over public routes", async () => {
			const middleware = banataAuthMiddleware({
				publicRoutes: ["/api/webhook"],
				ignoredRoutes: ["/api/webhook"],
			});

			const response = await runMiddleware(
				middleware,
				createMockRequest("/api/webhook"),
			);
			expect(response.type).toBe("next");
		});
	});

	describe("custom signInUrl", () => {
		it("redirects to custom sign-in URL", async () => {
			const middleware = banataAuthMiddleware({
				signInUrl: "/login",
			});

			const response = await runMiddleware(middleware, createMockRequest("/dashboard"));
			expect(response.type).toBe("redirect");
			expect(response.url).toContain("/login");
		});

		it("includes redirect_url with custom signInUrl", async () => {
			const middleware = banataAuthMiddleware({
				signInUrl: "/auth/login",
			});

			const response = await runMiddleware(
				middleware,
				createMockRequest("/protected/page"),
			);
			const url = new URL(response.url);
			expect(url.pathname).toBe("/auth/login");
			expect(url.searchParams.get("redirect_url")).toBe(
				"/protected/page",
			);
		});
	});

	describe("redirect URL parameter", () => {
		it("sets redirect_url to the original pathname", async () => {
			const middleware = banataAuthMiddleware();

			const response = await runMiddleware(
				middleware,
				createMockRequest("/some/deep/route"),
			);
			const url = new URL(response.url);
			expect(url.searchParams.get("redirect_url")).toBe(
				"/some/deep/route",
			);
		});
	});
});
