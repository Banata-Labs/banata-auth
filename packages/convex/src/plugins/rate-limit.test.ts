import { RATE_LIMITS } from "@banata-auth/shared";
import { afterEach, describe, expect, it, vi } from "vitest";
import { projectScopedRateLimitPlugin } from "./rate-limit";

describe("projectScopedRateLimitPlugin()", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("creates a project-scoped rate-limit record for the first request", async () => {
		const create = vi.fn(async () => null);
		const plugin = projectScopedRateLimitPlugin();
		const now = 1_710_000_000_000;

		vi.spyOn(Date, "now").mockReturnValue(now);

		const result = await plugin.onRequest?.(
			new Request("https://auth.example.com/api/auth/sign-in/email?project_id=proj_123", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-forwarded-for": "203.0.113.10",
				},
				body: JSON.stringify({ email: "User@Example.com" }),
			}),
			{
				baseURL: "https://auth.example.com/api/auth",
				options: {},
				adapter: {
					findMany: vi.fn(async () => []),
					create,
				},
			} as never,
		);

		expect(result).toBeUndefined();
		expect(create).toHaveBeenCalledWith({
			model: "rateLimit",
			data: {
				key: "proj_123|203.0.113.10|/sign-in/email|user@example.com",
				projectId: "proj_123",
				count: 1,
				lastRequest: now,
			},
		});
	});

	it("returns a 429 response when the scoped bucket exceeds the limit", async () => {
		const plugin = projectScopedRateLimitPlugin();
		const now = 1_710_000_000_000;

		vi.spyOn(Date, "now").mockReturnValue(now);

		const result = await plugin.onRequest?.(
			new Request("https://auth.example.com/api/auth/sign-in/email", {
				method: "POST",
				headers: {
					"content-type": "application/json",
					"x-forwarded-for": "203.0.113.10",
					"x-banata-project-id": "proj_123",
				},
				body: JSON.stringify({ email: "user@example.com" }),
			}),
			{
				baseURL: "https://auth.example.com/api/auth",
				options: {},
				adapter: {
					findMany: vi.fn(async () => [
						{
							key: "proj_123|203.0.113.10|/sign-in/email|user@example.com",
							projectId: "proj_123",
							count: RATE_LIMITS.signIn,
							lastRequest: now - 1_000,
						},
					]),
					updateMany: vi.fn(),
				},
			} as never,
		);

		expect(result?.response?.status).toBe(429);
		expect(result?.response?.headers.get("retry-after")).toBe("59");
		await expect(result?.response?.json()).resolves.toMatchObject({
			code: "RATE_LIMITED",
			details: {
				tryAgainIn: 59,
			},
		});
	});
});
