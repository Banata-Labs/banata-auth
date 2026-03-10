import { describe, expect, it } from "vitest";
import {
	applyProjectScopeToRequest,
	extractApiKeyFromRequest,
	filterProjectScopedResponseBody,
	shouldRejectExplicitProjectScopeWithoutApiKey,
} from "./authNode";

describe("authNode helpers", () => {
	it("extracts bearer API keys only on managed API surfaces", () => {
		expect(
			extractApiKeyFromRequest({
				method: "POST",
				url: "https://example.com/api/auth/admin/list-users",
				headers: [{ key: "Authorization", value: "Bearer sk_test_project_key" }],
				body: "{}",
			}),
		).toBe("sk_test_project_key");

		expect(
			extractApiKeyFromRequest({
				method: "GET",
				url: "https://example.com/api/auth/sign-in/email",
				headers: [{ key: "Authorization", value: "Bearer not-an-api-key" }],
				body: null,
			}),
		).toBeNull();
	});

	it("injects project scope into project-aware requests", () => {
		const request = applyProjectScopeToRequest(
			{
				method: "POST",
				url: "https://example.com/api/auth/organization/create",
				headers: [],
				body: JSON.stringify({ name: "Acme", slug: "acme" }),
			},
			"proj_123",
		);

		expect(new URL(request.url).searchParams.get("projectId")).toBe("proj_123");
		expect(request.headers).toContainEqual({
			key: "x-banata-project-id",
			value: "proj_123",
		});
		expect(JSON.parse(request.body ?? "{}")).toMatchObject({
			projectId: "proj_123",
		});
	});

	it("stores API key project scope in metadata on key creation", () => {
		const request = applyProjectScopeToRequest(
			{
				method: "POST",
				url: "https://example.com/api/auth/api-key/create",
				headers: [],
				body: JSON.stringify({ name: "CI" }),
			},
			"proj_123",
		);

		expect(JSON.parse(request.body ?? "{}")).toMatchObject({
			projectId: "proj_123",
			metadata: {
				projectId: "proj_123",
			},
		});
	});

	it("overwrites spoofed API key project scope with the active dashboard project", () => {
		const request = applyProjectScopeToRequest(
			{
				method: "POST",
				url: "https://example.com/api/auth/api-key/create",
				headers: [],
				body: JSON.stringify({
					name: "CI",
					projectId: "proj_other",
					metadata: {
						projectId: "proj_other",
					},
				}),
			},
			"proj_123",
		);

		expect(JSON.parse(request.body ?? "{}")).toMatchObject({
			projectId: "proj_123",
			metadata: {
				projectId: "proj_123",
			},
		});
	});

	it("filters API key list responses to the API key project", () => {
		const filtered = filterProjectScopedResponseBody(
			"/api/auth/api-key/list",
			JSON.stringify({
				keys: [
					{ id: "key_1", metadata: { projectId: "proj_123" } },
					{ id: "key_2", metadata: { projectId: "proj_other" } },
				],
			}),
			"proj_123",
		);

		expect(JSON.parse(filtered ?? "{}")).toEqual({
			keys: [{ id: "key_1", metadata: { projectId: "proj_123" } }],
		});
	});

	it("rejects explicit customer project scope when no API key is provided", () => {
		expect(
			shouldRejectExplicitProjectScopeWithoutApiKey(
				{
					method: "POST",
					url: "https://example.com/api/auth/sign-in/email",
					headers: [{ key: "x-banata-client-id", value: "acme-app" }],
					body: JSON.stringify({ email: "user@example.com" }),
				},
				{ hasExplicitScope: true },
				null,
			),
		).toBe(true);
	});

	it("allows explicit project scope when an API key is present", () => {
		expect(
			shouldRejectExplicitProjectScopeWithoutApiKey(
				{
					method: "POST",
					url: "https://example.com/api/auth/sign-in/email",
					headers: [{ key: "x-banata-client-id", value: "acme-app" }],
					body: JSON.stringify({ email: "user@example.com" }),
				},
				{ hasExplicitScope: true },
				"sk_test_project_key",
			),
		).toBe(false);
	});

	it("allows explicit project scope for Banata-hosted auth UI requests", () => {
		expect(
			shouldRejectExplicitProjectScopeWithoutApiKey(
				{
					method: "POST",
					url: "https://example.com/api/auth/sign-in/email",
					headers: [
						{ key: "x-banata-client-id", value: "acme-app" },
						{ key: "x-banata-internal-project-scope", value: "1" },
					],
					body: JSON.stringify({ email: "user@example.com" }),
				},
				{ hasExplicitScope: true },
				null,
			),
		).toBe(false);
	});
});
