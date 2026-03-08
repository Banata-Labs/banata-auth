import { describe, expect, it } from "vitest";
import type {
	PluginDBAdapter,
	SessionRecord,
	SessionUser,
	WhereClause,
} from "./types";
import {
	getEffectiveProjectPermissions,
	getRolePermissions,
	requireGlobalAdmin,
	requireProjectPermission,
} from "./types";

type Row = Record<string, unknown>;
type ModelData = Record<string, Row[]>;

function matchesWhere(row: Row, clause: WhereClause): boolean {
	const value = row[clause.field];
	switch (clause.operator ?? "eq") {
		case "in":
			return Array.isArray(clause.value) && clause.value.includes(value as never);
		case "contains":
			return typeof value === "string" && typeof clause.value === "string"
				? value.includes(clause.value)
				: false;
		default:
			return value === clause.value;
	}
}

function createAdapter(models: ModelData): PluginDBAdapter {
	return {
		async create<T extends Record<string, unknown>>() {
			throw new Error("create not implemented in test adapter");
		},
		async findOne<T = Record<string, unknown>>(
			data: Parameters<PluginDBAdapter["findOne"]>[0],
		) {
			const rows = await this.findMany<T>({ ...data, limit: 1 });
			return rows[0] ?? null;
		},
		async findMany<T = Record<string, unknown>>(
			data: Parameters<PluginDBAdapter["findMany"]>[0],
		) {
			const rows = (models[data.model] ?? []).filter((row) =>
				(data.where ?? []).every((clause: WhereClause) => matchesWhere(row, clause)),
			);
			const limited =
				typeof data.offset === "number" || typeof data.limit === "number"
					? rows.slice(data.offset ?? 0, (data.offset ?? 0) + (data.limit ?? rows.length))
					: rows;
			return limited as T[];
		},
		async update<T = Record<string, unknown>>() {
			throw new Error("update not implemented in test adapter");
		},
		async delete() {
			throw new Error("delete not implemented in test adapter");
		},
		async deleteMany() {
			throw new Error("deleteMany not implemented in test adapter");
		},
		async count(data: Parameters<PluginDBAdapter["count"]>[0]) {
			return (models[data.model] ?? []).filter((row) =>
				(data.where ?? []).every((clause: WhereClause) => matchesWhere(row, clause)),
			).length;
		},
	};
}

function createCtx(params?: {
	user?: Partial<SessionUser>;
	session?: Partial<SessionRecord>;
	authenticated?: boolean;
}) {
	const authenticated = params?.authenticated ?? true;
	const user: SessionUser = {
		id: "user_1",
		email: "user@example.com",
		name: "User",
		emailVerified: true,
		role: "user",
		...params?.user,
	};
	const session: SessionRecord = {
		id: "session_1",
		userId: user.id,
		token: "token_1",
		expiresAt: Date.now() + 60_000,
		createdAt: Date.now(),
		updatedAt: Date.now(),
		...params?.session,
	};

	return {
		context: {
			session: authenticated ? { user, session } : null,
		},
		error(status: string, body?: { message?: string }) {
			const error = new Error(body?.message ?? status) as Error & {
				status: string;
				body?: { message?: string };
			};
			error.status = status;
			error.body = body;
			return error;
		},
	};
}

describe("RBAC helpers", () => {
	it("allows global admins through requireGlobalAdmin", async () => {
		const ctx = createCtx({ user: { role: "admin" } });
		expect((await requireGlobalAdmin(ctx)).user.role).toBe("admin");
	});

	it("rejects non-admin users in requireGlobalAdmin", async () => {
		const ctx = createCtx({ user: { role: "user" } });
		await expect(requireGlobalAdmin(ctx)).rejects.toThrowError(/Global admin access required/);
	});

	it("resolves role permissions from project role definitions", async () => {
		const db = createAdapter({
			roleDefinition: [
				{
					id: "role_1",
					projectId: "project_1",
					slug: "viewer",
					permissions: JSON.stringify(["dashboard.read", "audit.read"]),
				},
				{
					id: "role_2",
					projectId: "project_1",
					slug: "broken",
					permissions: "{not-json}",
				},
			],
		});

		const permissions = await getRolePermissions(db, {
			projectId: "project_1",
			roleSlugs: ["viewer", "broken"],
		});

		expect(Array.from(permissions).sort()).toEqual(["audit.read", "dashboard.read"]);
	});

	it("treats project owners as wildcard admins", async () => {
		const db = createAdapter({
			user: [{ id: "owner_1", role: "user" }],
			project: [{ id: "project_1", ownerId: "owner_1" }],
			member: [],
			roleDefinition: [],
		});

		const permissions = await getEffectiveProjectPermissions(db, {
			userId: "owner_1",
			projectId: "project_1",
		});

		expect(permissions.has("*")).toBe(true);
	});

	it("resolves member permissions from assigned RBAC roles", async () => {
		const db = createAdapter({
			user: [{ id: "member_1", role: "user" }],
			project: [{ id: "project_1", ownerId: "owner_1" }],
			member: [
				{
					id: "member_row_1",
					userId: "member_1",
					projectId: "project_1",
					role: "viewer,webhook_admin",
				},
			],
			roleDefinition: [
				{
					id: "role_1",
					projectId: "project_1",
					slug: "viewer",
					permissions: JSON.stringify(["dashboard.read"]),
				},
				{
					id: "role_2",
					projectId: "project_1",
					slug: "webhook_admin",
					permissions: JSON.stringify(["webhook.manage"]),
				},
			],
		});

		const permissions = await getEffectiveProjectPermissions(db, {
			userId: "member_1",
			projectId: "project_1",
		});

		expect(Array.from(permissions).sort()).toEqual(["dashboard.read", "webhook.manage"]);
	});

	it("fails closed when project scope is missing", async () => {
		const db = createAdapter({
			user: [{ id: "member_1", role: "user" }],
			project: [],
			member: [],
			roleDefinition: [],
		});
		const ctx = createCtx({ user: { id: "member_1" } });

		await expect(
			requireProjectPermission(ctx, {
				db,
				permission: "dashboard.read",
			}),
		).rejects.toMatchObject({ status: "FORBIDDEN" });
	});

	it("rejects unauthenticated permission checks", async () => {
		const db = createAdapter({
			user: [],
			project: [],
			member: [],
			roleDefinition: [],
		});
		const ctx = createCtx({ authenticated: false });

		await expect(
			requireProjectPermission(ctx, {
				db,
				projectId: "project_1",
				permission: "dashboard.read",
			}),
		).rejects.toMatchObject({ status: "UNAUTHORIZED" });
	});

	it("allows members with the required project permission", async () => {
		const db = createAdapter({
			user: [{ id: "member_1", role: "user" }],
			project: [{ id: "project_1", ownerId: "owner_1" }],
			member: [
				{
					id: "member_row_1",
					userId: "member_1",
					projectId: "project_1",
					role: "viewer",
				},
			],
			roleDefinition: [
				{
					id: "role_1",
					projectId: "project_1",
					slug: "viewer",
					permissions: JSON.stringify(["dashboard.read"]),
				},
			],
		});
		const ctx = createCtx({ user: { id: "member_1" } });

		await expect(
			requireProjectPermission(ctx, {
				db,
				projectId: "project_1",
				permission: "dashboard.read",
			}),
		).resolves.toBeUndefined();
	});

	it("rejects members without the required project permission", async () => {
		const db = createAdapter({
			user: [{ id: "member_1", role: "user" }],
			project: [{ id: "project_1", ownerId: "owner_1" }],
			member: [
				{
					id: "member_row_1",
					userId: "member_1",
					projectId: "project_1",
					role: "viewer",
				},
			],
			roleDefinition: [
				{
					id: "role_1",
					projectId: "project_1",
					slug: "viewer",
					permissions: JSON.stringify(["dashboard.read"]),
				},
			],
		});
		const ctx = createCtx({ user: { id: "member_1" } });

		await expect(
			requireProjectPermission(ctx, {
				db,
				projectId: "project_1",
				permission: "webhook.manage",
			}),
		).rejects.toMatchObject({ status: "FORBIDDEN" });
	});
});
