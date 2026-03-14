import { describe, expect, it, vi } from "vitest";
import {
	flattenPermissionCheckInput,
	hasRequestedPermissions,
	resolveScopedProjectId,
} from "./user-management";

describe("user-management helpers", () => {
	it("flattens permission statements into RBAC slugs", () => {
		expect(
			flattenPermissionCheckInput({
				user: ["impersonate", "set-password"],
				dashboard: ["manage"],
			}),
		).toEqual(["user.impersonate", "user.set-password", "dashboard.manage"]);
	});

	it("passes through string-array permission checks", () => {
		expect(
			flattenPermissionCheckInput(["dashboard.read", "dashboard.manage"]),
		).toEqual(["dashboard.read", "dashboard.manage"]);
	});

	it("requires every requested permission unless wildcard is granted", () => {
		expect(
			hasRequestedPermissions(
				new Set(["dashboard.read", "user.impersonate"]),
				["dashboard.read", "user.impersonate"],
			),
		).toBe(true);
		expect(
			hasRequestedPermissions(new Set(["dashboard.read"]), ["dashboard.read", "user.impersonate"]),
		).toBe(false);
		expect(hasRequestedPermissions(new Set(["*"]), ["anything.here"])).toBe(true);
	});

	it("resolves project scope from the API key when the body omits projectId", async () => {
		const apiKey = "banata_test_key";
		const db = {
			findOne: vi.fn(async ({ model, where }: { model: string; where: Array<{ value: string }> }) => {
				if (model !== "apikey") {
					return null;
				}
				const values = where.map((clause) => clause.value);
				return values.includes(apiKey)
					? { id: "key_1", key: apiKey, userId: "user_1", projectId: "project_api_key" }
					: null;
			}),
		} as any;

		const ctx = {
			headers: new Headers({ "x-api-key": apiKey }),
			request: new Request("https://auth.banata.dev/api/auth/admin/list-users", {
				method: "POST",
				headers: { "x-api-key": apiKey },
			}),
		} as any;

		await expect(resolveScopedProjectId(ctx, db, {})).resolves.toBe("project_api_key");
	});
});
