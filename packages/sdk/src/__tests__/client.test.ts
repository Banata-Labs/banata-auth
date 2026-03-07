import { BanataAuthError } from "@banata-auth/shared";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { BanataAuth, HttpClient } from "../client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function mockFetch(
	response: {
		status?: number;
		body?: unknown;
		headers?: Record<string, string>;
	} = {},
) {
	const { status = 200, body = {}, headers = {} } = response;

	const fn = vi.fn().mockResolvedValue({
		ok: status >= 200 && status < 300,
		status,
		headers: new Headers({
			"content-type": "application/json",
			...headers,
		}),
		json: vi.fn().mockResolvedValue(body),
	});

	vi.stubGlobal("fetch", fn);
	return fn;
}

function mockFetchSequence(
	responses: Array<{
		status?: number;
		body?: unknown;
		headers?: Record<string, string>;
	}>,
) {
	const fn = vi.fn();

	for (const response of responses) {
		const { status = 200, body = {}, headers = {} } = response;
		fn.mockResolvedValueOnce({
			ok: status >= 200 && status < 300,
			status,
			headers: new Headers({
				"content-type": "application/json",
				...headers,
			}),
			json: vi.fn().mockResolvedValue(body),
		});
	}

	vi.stubGlobal("fetch", fn);
	return fn;
}

function getFetchCall(fetchMock: ReturnType<typeof vi.fn>) {
	const call = fetchMock.mock.calls[0];
	if (!call) {
		throw new Error("Expected fetch to be called at least once");
	}
	return call as [string, Record<string, unknown>?];
}

interface MockFetchOptions {
	headers: Record<string, string>;
	method?: string;
	body?: string;
	signal?: AbortSignal;
	[key: string]: unknown;
}

function getFetchOptions(fetchMock: ReturnType<typeof vi.fn>): MockFetchOptions {
	const [, options] = getFetchCall(fetchMock);
	return (options ?? {}) as MockFetchOptions;
}

function getFetchUrl(fetchMock: ReturnType<typeof vi.fn>): string {
	const [url] = getFetchCall(fetchMock);
	return url;
}

// ─── BanataAuth Constructor ────────────────────────────────────────────────────

describe("BanataAuth", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	describe("constructor", () => {
		it("accepts a string API key", () => {
			mockFetch();
			const client = new BanataAuth("sk_test_123");
			expect(client).toBeInstanceOf(BanataAuth);
		});

		it("accepts an options object with apiKey", () => {
			mockFetch();
			const client = new BanataAuth({ apiKey: "sk_test_123" });
			expect(client).toBeInstanceOf(BanataAuth);
		});

		it("accepts an options object with apiKey and baseUrl", () => {
			mockFetch();
			const client = new BanataAuth({
				apiKey: "sk_test_123",
				baseUrl: "https://example.com",
			});
			expect(client).toBeInstanceOf(BanataAuth);
		});

		it("accepts an options object with all options", () => {
			mockFetch();
			const client = new BanataAuth({
				apiKey: "sk_test_123",
				baseUrl: "https://example.com",
				timeout: 5000,
				retries: 5,
			});
			expect(client).toBeInstanceOf(BanataAuth);
		});

		it("throws if no API key provided (empty string)", () => {
			expect(() => new BanataAuth("")).toThrow("API key is required");
		});

		it("throws if options.apiKey is empty string", () => {
			expect(() => new BanataAuth({ apiKey: "" })).toThrow("API key is required");
		});

		it("throws if options.apiKey is not provided", () => {
			expect(() => new BanataAuth({ apiKey: undefined as unknown as string })).toThrow(
				"API key is required",
			);
		});
	});

	describe("resource accessors", () => {
		let client: BanataAuth;

		beforeEach(() => {
			mockFetch();
			client = new BanataAuth("sk_test_123");
		});

		it("has userManagement resource", () => {
			expect(client.userManagement).toBeDefined();
		});

		it("has organizations resource", () => {
			expect(client.organizations).toBeDefined();
		});

		it("has sso resource", () => {
			expect(client.sso).toBeDefined();
		});

		it("has directorySync resource", () => {
			expect(client.directorySync).toBeDefined();
		});

		it("has auditLogs resource", () => {
			expect(client.auditLogs).toBeDefined();
		});

		it("has events resource", () => {
			expect(client.events).toBeDefined();
		});

		it("has webhooks resource", () => {
			expect(client.webhooks).toBeDefined();
		});

		it("has portal resource", () => {
			expect(client.portal).toBeDefined();
		});

		it("has vault resource", () => {
			expect(client.vault).toBeDefined();
		});

		it("has domains resource", () => {
			expect(client.domains).toBeDefined();
		});

		it("has rbac resource", () => {
			expect(client.rbac).toBeDefined();
		});
	});

	describe("convenience aliases", () => {
		let client: BanataAuth;

		beforeEach(() => {
			mockFetch();
			client = new BanataAuth("sk_test_123");
		});

		it("users alias points to userManagement", () => {
			expect(client.users).toBe(client.userManagement);
		});

		it("directories alias points to directorySync", () => {
			expect(client.directories).toBe(client.directorySync);
		});

		it("orgs alias points to organizations", () => {
			expect(client.orgs).toBe(client.organizations);
		});
	});
});

// ─── HttpClient ───────────────────────────────────────────────────────────────

describe("HttpClient", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.unstubAllGlobals();
	});

	function createClient(
		overrides?: Partial<{
			apiKey: string;
			baseUrl: string;
			timeout: number;
			retries: number;
		}>,
	) {
		return new HttpClient({
			apiKey: overrides?.apiKey ?? "sk_test_key",
			baseUrl: overrides?.baseUrl ?? "https://api.example.com",
			timeout: overrides?.timeout ?? 30_000,
			retries: overrides?.retries ?? 3,
		});
	}

	describe("request headers", () => {
		it("sends Authorization header with Bearer token", async () => {
			const fetchMock = mockFetch({ body: { ok: true } });
			const client = createClient({ apiKey: "sk_my_secret" });

			await client.get("/test");

			const options = getFetchOptions(fetchMock);
			expect(options.headers.Authorization).toBe("Bearer sk_my_secret");
		});

		it("sends Content-Type: application/json header", async () => {
			const fetchMock = mockFetch({ body: { ok: true } });
			const client = createClient();

			await client.get("/test");

			const options = getFetchOptions(fetchMock);
			expect(options.headers["Content-Type"]).toBe("application/json");
		});

		it("sends User-Agent header", async () => {
			const fetchMock = mockFetch({ body: { ok: true } });
			const client = createClient();

			await client.get("/test");

			const options = getFetchOptions(fetchMock);
			expect(options.headers["User-Agent"]).toBe("banata-auth-sdk/0.1.0");
		});

		it("allows custom headers to be provided", async () => {
			const fetchMock = mockFetch({ body: { ok: true } });
			const client = createClient();

			await client.request("GET", "/test", {
				headers: { "X-Custom": "value" },
			});

			const options = getFetchOptions(fetchMock);
			expect(options.headers["X-Custom"]).toBe("value");
		});

		it("custom headers override default headers", async () => {
			const fetchMock = mockFetch({ body: { ok: true } });
			const client = createClient();

			await client.request("GET", "/test", {
				headers: { "Content-Type": "text/plain" },
			});

			const options = getFetchOptions(fetchMock);
			expect(options.headers["Content-Type"]).toBe("text/plain");
		});
	});

	describe("URL construction and query parameters", () => {
		it("constructs URL from baseUrl and path", async () => {
			const fetchMock = mockFetch({ body: {} });
			const client = createClient({ baseUrl: "https://api.example.com" });

			await client.get("/api/users");

			const url = getFetchUrl(fetchMock);
			expect(url).toBe("https://api.example.com/api/users");
		});

		it("strips trailing slash from baseUrl", async () => {
			const fetchMock = mockFetch({ body: {} });
			const client = createClient({ baseUrl: "https://api.example.com/" });

			await client.get("/api/users");

			const url = getFetchUrl(fetchMock);
			expect(url).toBe("https://api.example.com/api/users");
		});

		it("appends query parameters to URL", async () => {
			const fetchMock = mockFetch({ body: {} });
			const client = createClient();

			await client.get("/api/users", { limit: 10, order: "asc" });

			const url = getFetchUrl(fetchMock);
			const parsed = new URL(url);
			expect(parsed.searchParams.get("limit")).toBe("10");
			expect(parsed.searchParams.get("order")).toBe("asc");
		});

		it("handles boolean query parameters", async () => {
			const fetchMock = mockFetch({ body: {} });
			const client = createClient();

			await client.get("/api/users", { active: true });

			const url = getFetchUrl(fetchMock);
			const parsed = new URL(url);
			expect(parsed.searchParams.get("active")).toBe("true");
		});

		it("skips undefined query params", async () => {
			const fetchMock = mockFetch({ body: {} });
			const client = createClient();

			await client.get("/api/users", {
				limit: 10,
				email: undefined,
				order: undefined,
			});

			const url = getFetchUrl(fetchMock);
			const parsed = new URL(url);
			expect(parsed.searchParams.get("limit")).toBe("10");
			expect(parsed.searchParams.has("email")).toBe(false);
			expect(parsed.searchParams.has("order")).toBe(false);
		});
	});

	describe("HTTP methods", () => {
		it("sends GET request", async () => {
			const fetchMock = mockFetch({ body: { data: "get" } });
			const client = createClient();

			const result = await client.get("/test");

			const options = getFetchOptions(fetchMock);
			expect(options.method).toBe("GET");
			expect(result).toEqual({ data: "get" });
		});

		it("sends POST request with body", async () => {
			const fetchMock = mockFetch({ body: { id: "123" } });
			const client = createClient();

			const result = await client.post("/test", { name: "test" });

			const options = getFetchOptions(fetchMock);
			expect(options.method).toBe("POST");
			expect(options.body).toBe(JSON.stringify({ name: "test" }));
			expect(result).toEqual({ id: "123" });
		});

		it("sends POST request without body", async () => {
			const fetchMock = mockFetch({ body: { id: "123" } });
			const client = createClient();

			await client.post("/test");

			const options = getFetchOptions(fetchMock);
			expect(options.method).toBe("POST");
			expect(options.body).toBeUndefined();
		});

		it("sends PUT request with body", async () => {
			const fetchMock = mockFetch({ body: { updated: true } });
			const client = createClient();

			const result = await client.put("/test", { name: "updated" });

			const options = getFetchOptions(fetchMock);
			expect(options.method).toBe("PUT");
			expect(options.body).toBe(JSON.stringify({ name: "updated" }));
			expect(result).toEqual({ updated: true });
		});

		it("sends PATCH request with body", async () => {
			const fetchMock = mockFetch({ body: { patched: true } });
			const client = createClient();

			const result = await client.patch("/test", { name: "patched" });

			const options = getFetchOptions(fetchMock);
			expect(options.method).toBe("PATCH");
			expect(options.body).toBe(JSON.stringify({ name: "patched" }));
			expect(result).toEqual({ patched: true });
		});

		it("sends DELETE request", async () => {
			const fetchMock = mockFetch({ status: 204 });
			const client = createClient();

			const result = await client.delete("/test");

			const options = getFetchOptions(fetchMock);
			expect(options.method).toBe("DELETE");
			expect(result).toBeUndefined();
		});
	});

	describe("response handling", () => {
		it("returns parsed JSON on success", async () => {
			mockFetch({
				status: 200,
				body: { users: [{ id: "1", name: "Alice" }] },
			});
			const client = createClient();

			const result = await client.get("/api/users");

			expect(result).toEqual({ users: [{ id: "1", name: "Alice" }] });
		});

		it("returns undefined on 204 No Content", async () => {
			mockFetch({ status: 204 });
			const client = createClient();

			const result = await client.delete("/api/users/1");

			expect(result).toBeUndefined();
		});

		it("returns parsed JSON on 201 Created", async () => {
			mockFetch({
				status: 201,
				body: { id: "new_1", name: "New User" },
			});
			const client = createClient();

			const result = await client.post("/api/users", { name: "New User" });

			expect(result).toEqual({ id: "new_1", name: "New User" });
		});
	});

	describe("error handling", () => {
		it("throws BanataAuthError on 400 Bad Request", async () => {
			mockFetch({
				status: 400,
				body: { message: "Bad request", code: "bad_request" },
			});
			const client = createClient({ retries: 0 });

			await expect(client.get("/test")).rejects.toThrow();
			try {
				await client.get("/test");
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(BanataAuthError);
				if (error instanceof BanataAuthError) {
					expect(error.status).toBe(400);
				}
			}
		});

		it("throws AuthenticationError on 401", async () => {
			mockFetch({
				status: 401,
				body: { message: "Invalid API key" },
			});
			const client = createClient({ retries: 0 });

			await expect(client.get("/test")).rejects.toThrow();
			try {
				await client.get("/test");
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(BanataAuthError);
				if (error instanceof BanataAuthError) {
					expect(error.name).toBe("AuthenticationError");
					expect(error.status).toBe(401);
				}
			}
		});

		it("throws NotFoundError on 404", async () => {
			mockFetch({
				status: 404,
				body: { message: "User not found" },
			});
			const client = createClient({ retries: 0 });

			await expect(client.get("/test")).rejects.toThrow();
			try {
				await client.get("/test");
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(BanataAuthError);
				if (error instanceof BanataAuthError) {
					expect(error.name).toBe("NotFoundError");
					expect(error.status).toBe(404);
				}
			}
		});

		it("throws ValidationError on 422", async () => {
			mockFetch({
				status: 422,
				body: {
					message: "Validation failed",
					errors: [{ field: "email", message: "Invalid email" }],
				},
			});
			const client = createClient({ retries: 0 });

			await expect(client.get("/test")).rejects.toThrow();
			try {
				await client.get("/test");
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(BanataAuthError);
				if (error instanceof BanataAuthError) {
					expect(error.name).toBe("ValidationError");
					expect(error.status).toBe(422);
				}
			}
		});

		it("throws RateLimitError on 429", async () => {
			mockFetch({
				status: 429,
				body: { message: "Rate limit exceeded" },
			});
			const client = createClient({ retries: 0 });

			await expect(client.get("/test")).rejects.toThrow();
			try {
				await client.get("/test");
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(BanataAuthError);
				if (error instanceof BanataAuthError) {
					expect(error.name).toBe("RateLimitError");
					expect(error.status).toBe(429);
				}
			}
		});

		it("includes requestId in error when x-request-id header present", async () => {
			mockFetch({
				status: 401,
				body: { message: "Unauthorized" },
				headers: { "x-request-id": "req_abc123" },
			});
			const client = createClient({ retries: 0 });

			try {
				await client.get("/test");
			} catch (error: unknown) {
				expect(error).toBeInstanceOf(BanataAuthError);
				if (error instanceof BanataAuthError) {
					expect(error.requestId).toBe("req_abc123");
				}
			}
		});

		it("handles error response with no JSON body gracefully", async () => {
			const fn = vi.fn().mockResolvedValue({
				ok: false,
				status: 500,
				headers: new Headers({}),
				json: vi.fn().mockRejectedValue(new Error("no JSON")),
			});
			vi.stubGlobal("fetch", fn);

			const client = createClient({ retries: 0 });

			await expect(client.get("/test")).rejects.toThrow();
		});
	});

	describe("retry behavior", () => {
		it("retries on 500 errors up to maxRetries", async () => {
			const fetchMock = mockFetchSequence([
				{ status: 500, body: { message: "Internal error" } },
				{ status: 500, body: { message: "Internal error" } },
				{ status: 500, body: { message: "Internal error" } },
				{ status: 200, body: { success: true } },
			]);
			const client = createClient({ retries: 3 });

			const result = await client.get("/test");

			expect(fetchMock).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
			expect(result).toEqual({ success: true });
		});

		it("retries on 502 errors", async () => {
			const fetchMock = mockFetchSequence([
				{ status: 502, body: { message: "Bad gateway" } },
				{ status: 200, body: { ok: true } },
			]);
			const client = createClient({ retries: 3 });

			const result = await client.get("/test");

			expect(fetchMock).toHaveBeenCalledTimes(2);
			expect(result).toEqual({ ok: true });
		});

		it("retries on 503 errors", async () => {
			const fetchMock = mockFetchSequence([
				{ status: 503, body: { message: "Service unavailable" } },
				{ status: 200, body: { ok: true } },
			]);
			const client = createClient({ retries: 3 });

			const result = await client.get("/test");

			expect(fetchMock).toHaveBeenCalledTimes(2);
			expect(result).toEqual({ ok: true });
		});

		it("throws after exhausting all retries on 5xx", async () => {
			const fetchMock = mockFetchSequence([
				{ status: 500, body: { message: "Internal error" } },
				{ status: 500, body: { message: "Internal error" } },
				{ status: 500, body: { message: "Internal error" } },
				{ status: 500, body: { message: "Internal error" } },
			]);
			const client = createClient({ retries: 3 });

			await expect(client.get("/test")).rejects.toThrow();
			expect(fetchMock).toHaveBeenCalledTimes(4); // 1 initial + 3 retries
		});

		it("does NOT retry on 400 errors", async () => {
			const fetchMock = mockFetch({
				status: 400,
				body: { message: "Bad request" },
			});
			const client = createClient({ retries: 3 });

			await expect(client.get("/test")).rejects.toThrow();
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it("does NOT retry on 401 errors", async () => {
			const fetchMock = mockFetch({
				status: 401,
				body: { message: "Unauthorized" },
			});
			const client = createClient({ retries: 3 });

			await expect(client.get("/test")).rejects.toThrow();
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it("does NOT retry on 404 errors", async () => {
			const fetchMock = mockFetch({
				status: 404,
				body: { message: "Not found" },
			});
			const client = createClient({ retries: 3 });

			await expect(client.get("/test")).rejects.toThrow();
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it("does NOT retry on 422 errors", async () => {
			const fetchMock = mockFetch({
				status: 422,
				body: { message: "Validation failed" },
			});
			const client = createClient({ retries: 3 });

			await expect(client.get("/test")).rejects.toThrow();
			expect(fetchMock).toHaveBeenCalledTimes(1);
		});

		it("retries on 429 errors with backoff", async () => {
			const fetchMock = mockFetch({
				status: 429,
				body: { message: "Rate limited" },
			});
			const client = createClient({ retries: 3 });

			await expect(client.get("/test")).rejects.toThrow();
			// 1 initial + 3 retries = 4 calls
			expect(fetchMock).toHaveBeenCalledTimes(4);
		});

		it("respects Retry-After header on 429 and eventually succeeds", async () => {
			const fetchMock = mockFetchSequence([
				{ status: 429, body: { message: "Rate limited" }, headers: { "retry-after": "0" } },
				{ status: 200, body: { ok: true } },
			]);
			const client = createClient({ retries: 3 });

			const result = await client.get("/test");
			expect(fetchMock).toHaveBeenCalledTimes(2);
			expect(result).toEqual({ ok: true });
		});

		it("succeeds on first try with 0 retries configured", async () => {
			const fetchMock = mockFetch({ body: { ok: true } });
			const client = createClient({ retries: 0 });

			const result = await client.get("/test");

			expect(fetchMock).toHaveBeenCalledTimes(1);
			expect(result).toEqual({ ok: true });
		});
	});

	describe("timeout via AbortController", () => {
		it("uses AbortController signal in fetch call", async () => {
			const fetchMock = mockFetch({ body: { ok: true } });
			const client = createClient({ timeout: 5000 });

			await client.get("/test");

			const options = getFetchOptions(fetchMock);
			expect(options.signal).toBeInstanceOf(AbortSignal);
		});

		it("throws timeout error when request exceeds timeout", async () => {
			const fn = vi.fn().mockImplementation(() => {
				const error = new Error("The operation was aborted");
				error.name = "AbortError";
				return Promise.reject(error);
			});
			vi.stubGlobal("fetch", fn);

			const client = createClient({ timeout: 1, retries: 0 });

			await expect(client.get("/test")).rejects.toThrow();
		});
	});

	describe("request body serialization", () => {
		it("serializes body as JSON for POST", async () => {
			const fetchMock = mockFetch({ body: {} });
			const client = createClient();

			await client.post("/test", { key: "value", nested: { a: 1 } });

			const options = getFetchOptions(fetchMock);
			expect(options.body).toBe(JSON.stringify({ key: "value", nested: { a: 1 } }));
		});

		it("does not include body for GET requests", async () => {
			const fetchMock = mockFetch({ body: {} });
			const client = createClient();

			await client.get("/test");

			const options = getFetchOptions(fetchMock);
			expect(options.body).toBeUndefined();
		});
	});
});
