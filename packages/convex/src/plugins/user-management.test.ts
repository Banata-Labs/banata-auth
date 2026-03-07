import { describe, expect, it } from "vitest";
import {
	flattenPermissionCheckInput,
	hasRequestedPermissions,
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
});
