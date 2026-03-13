import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, getSessionFromCtx } from "better-auth/api";
import { deleteSessionCookie, expireCookie, setSessionCookie } from "better-auth/cookies";
import { z } from "zod";
import {
	type PluginDBAdapter,
	type SessionRecord,
	type SessionUser,
	type WhereClause,
	getEffectiveProjectPermissions,
	getProjectScope,
	getRolePermissions,
	isGlobalAdminUser,
	parseRoleSlugs,
	projectScopeSchema,
	requireAuthenticated,
	requireGlobalAdmin,
	requireProjectPermission,
} from "./types";

interface UserRow extends Record<string, unknown> {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	image?: string;
	projectId?: string;
	username?: string;
	phoneNumber?: string;
	phoneNumberVerified?: boolean;
	role?: string;
	banned?: boolean;
	banReason?: string | null;
	banExpires?: number | null;
	metadata?: unknown;
	createdAt: number;
	updatedAt: number;
}

interface SessionRow extends Record<string, unknown> {
	id: string;
	userId: string;
	token: string;
	projectId?: string;
	expiresAt: number | Date;
	ipAddress?: string | null;
	userAgent?: string | null;
	activeOrganizationId?: string | null;
	impersonatedBy?: string | null;
	createdAt: number | Date;
	updatedAt: number | Date;
}

interface AccountRow extends Record<string, unknown> {
	id: string;
	userId: string;
	accountId: string;
	providerId: string;
	projectId?: string;
	createdAt: number | Date;
	updatedAt: number | Date;
	password?: string;
	accessToken?: string;
	refreshToken?: string;
	idToken?: string;
}

interface ProjectOwnerRow extends Record<string, unknown> {
	id: string;
	ownerId: string;
}

interface UserManagementContext {
	context: {
		adapter: PluginDBAdapter;
		internalAdapter: {
			createUser: (data: Record<string, unknown>) => Promise<UserRow | null>;
			createSession: (
				userId: string,
				rememberMe?: boolean,
				data?: Record<string, unknown>,
				disableSessionCache?: boolean,
			) => Promise<SessionRow | null>;
			findUserById: (userId: string) => Promise<UserRow | null>;
			updateUser: (userId: string, data: Record<string, unknown>) => Promise<UserRow>;
			updatePassword: (userId: string, password: string) => Promise<void>;
			linkAccount: (data: Record<string, unknown>) => Promise<AccountRow>;
			deleteUser: (userId: string) => Promise<void>;
			deleteSession: (token: string) => Promise<void>;
			deleteSessions: (userIdOrTokens: string | string[]) => Promise<void>;
		};
		password: {
			hash: (password: string) => Promise<string>;
			config?: {
				minPasswordLength?: number;
				maxPasswordLength?: number;
			};
		};
		authCookies: {
			sessionToken: {
				attributes: Record<string, unknown>;
			};
			dontRememberToken: {
				name: string;
			};
		};
		secret: string;
		createAuthCookie: (name: string) => {
			name: string;
			attributes: Record<string, unknown>;
		};
		session: {
			session: SessionRecord;
			user: SessionUser;
		} | null;
	};
	body: Record<string, unknown>;
	query: Record<string, string | undefined>;
	error: (status: string, body?: { message?: string }) => Error;
	json: <T>(data: T) => Promise<T>;
	getSignedCookie: (name: string, secret: string) => Promise<string | undefined>;
	setSignedCookie: (
		name: string,
		value: string,
		secret: string,
		attributes: Record<string, unknown>,
	) => Promise<void>;
}

type PermissionStatements = Record<string, string[]>;
type PermissionCheckInput = string | string[] | PermissionStatements;

const listUsersBodySchema = z
	.object({
		email: z.string().optional(),
		organizationId: z.string().optional(),
		role: z.string().optional(),
		limit: z.number().int().positive().max(200).optional(),
		offset: z.number().int().min(0).optional(),
		sortBy: z.string().optional(),
		sortDirection: z.enum(["asc", "desc"]).optional(),
		searchValue: z.string().optional(),
		searchField: z.enum(["email", "name"]).optional(),
		searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
		filterField: z.string().optional(),
		filterValue: z.union([z.string(), z.number(), z.boolean()]).optional(),
		filterOperator: z
			.enum(["eq", "ne", "lt", "lte", "gt", "gte", "contains", "starts_with", "ends_with"])
			.optional(),
		before: z.string().optional(),
		after: z.string().optional(),
		order: z.enum(["asc", "desc"]).optional(),
	})
	.merge(projectScopeSchema);

const listUsersQuerySchema = z.object({
	projectId: z.string().optional(),
	email: z.string().optional(),
	organizationId: z.string().optional(),
	role: z.string().optional(),
	limit: z.string().optional(),
	offset: z.string().optional(),
	sortBy: z.string().optional(),
	sortDirection: z.enum(["asc", "desc"]).optional(),
	searchValue: z.string().optional(),
	searchField: z.enum(["email", "name"]).optional(),
	searchOperator: z.enum(["contains", "starts_with", "ends_with"]).optional(),
	filterField: z.string().optional(),
	filterValue: z.string().optional(),
	filterOperator: z
		.enum(["eq", "ne", "lt", "lte", "gt", "gte", "contains", "starts_with", "ends_with"])
		.optional(),
	before: z.string().optional(),
	after: z.string().optional(),
	order: z.enum(["asc", "desc"]).optional(),
});

const getUserBodySchema = z
	.object({
		userId: z.string(),
	})
	.merge(projectScopeSchema);

const getUserQuerySchema = z
	.object({
		id: z.string(),
	})
	.merge(projectScopeSchema);

const createUserBodySchema = z
	.object({
		email: z.string().email(),
		password: z.string().min(8).optional(),
		name: z.string().min(1),
		image: z.string().optional(),
		username: z.string().optional(),
		phoneNumber: z.string().optional(),
		emailVerified: z.boolean().optional(),
		role: z.union([z.string(), z.array(z.string())]).optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
		data: z.record(z.string(), z.unknown()).optional(),
	})
	.merge(projectScopeSchema);

const updateUserBodySchema = z
	.object({
		userId: z.string(),
		name: z.string().optional(),
		image: z.union([z.string(), z.null()]).optional(),
		username: z.string().optional(),
		phoneNumber: z.union([z.string(), z.null()]).optional(),
		emailVerified: z.boolean().optional(),
		password: z.string().min(8).optional(),
		role: z.union([z.string(), z.array(z.string())]).optional(),
		metadata: z.record(z.string(), z.unknown()).optional(),
		data: z.record(z.string(), z.unknown()).optional(),
	})
	.merge(projectScopeSchema);

const setRoleBodySchema = z
	.object({
		userId: z.string(),
		role: z.union([z.string(), z.array(z.string())]),
	})
	.merge(projectScopeSchema);

const banUserBodySchema = z
	.object({
		userId: z.string(),
		banReason: z.string().optional(),
		banExpires: z.number().optional(),
		banExpiresIn: z.number().optional(),
	})
	.merge(projectScopeSchema);

const revokeSessionBodySchema = z
	.object({
		sessionId: z.string().optional(),
		sessionToken: z.string().optional(),
	})
	.merge(projectScopeSchema);

const revokeUserSessionsBodySchema = z
	.object({
		userId: z.string(),
	})
	.merge(projectScopeSchema);

const impersonateUserBodySchema = z
	.object({
		userId: z.string(),
	})
	.merge(projectScopeSchema);

const setUserPasswordBodySchema = z
	.object({
		userId: z.string(),
		newPassword: z.string().min(1),
	})
	.merge(projectScopeSchema);

const permissionStatementsSchema = z.record(z.string(), z.array(z.string()));

const hasPermissionBodySchema = z
	.object({
		userId: z.string().optional(),
		role: z.union([z.string(), z.array(z.string())]).optional(),
	})
	.merge(projectScopeSchema)
	.and(
		z.union([
			z.object({
				permission: z.union([z.string().min(1), permissionStatementsSchema]),
				permissions: z.undefined(),
			}),
			z.object({
				permission: z.undefined(),
				permissions: z.union([z.array(z.string().min(1)).min(1), permissionStatementsSchema]),
			}),
		]),
	);

function serializeRoleInput(role: string | string[] | null | undefined): string | undefined {
	const roles = parseRoleSlugs(role);
	return roles.length > 0 ? roles.join(",") : undefined;
}

export function flattenPermissionCheckInput(input: PermissionCheckInput | undefined): string[] {
	if (!input) return [];
	if (typeof input === "string") {
		return input.length > 0 ? [input] : [];
	}
	if (Array.isArray(input)) {
		return input.filter((value): value is string => typeof value === "string" && value.length > 0);
	}

	const permissions = new Set<string>();
	for (const [resource, actions] of Object.entries(input)) {
		if (!resource || !Array.isArray(actions)) continue;
		for (const action of actions) {
			if (typeof action === "string" && action.length > 0) {
				permissions.add(`${resource}.${action}`);
			}
		}
	}

	return Array.from(permissions);
}

export function hasRequestedPermissions(granted: Set<string>, requested: string[]): boolean {
	if (requested.length === 0) return false;
	if (granted.has("*")) return true;
	return requested.every((permission) => granted.has(permission));
}

function normalizeListUsersPayload(input: Record<string, unknown>): Record<string, unknown> {
	const payload: Record<string, unknown> = { ...input };

	for (const numericKey of ["limit", "offset"]) {
		const value = payload[numericKey];
		if (typeof value === "string" && value.length > 0) {
			const parsed = Number(value);
			if (Number.isFinite(parsed)) {
				payload[numericKey] = parsed;
			}
		}
	}

	if (typeof payload.filterValue === "string") {
		if (payload.filterValue === "true") payload.filterValue = true;
		else if (payload.filterValue === "false") payload.filterValue = false;
		else if (payload.filterValue.trim() !== "" && Number.isFinite(Number(payload.filterValue))) {
			payload.filterValue = Number(payload.filterValue);
		}
	}

	return payload;
}

function sanitizeSession(session: SessionRow) {
	return {
		id: session.id,
		userId: session.userId,
		projectId: session.projectId,
		ipAddress: session.ipAddress ?? null,
		userAgent: session.userAgent ?? null,
		activeOrganizationId: session.activeOrganizationId ?? null,
		impersonatedBy: session.impersonatedBy ?? null,
		expiresAt: session.expiresAt,
		createdAt: session.createdAt,
		updatedAt: session.updatedAt,
	};
}

function sanitizeAccount(account: AccountRow) {
	return {
		id: account.id,
		userId: account.userId,
		accountId: account.accountId,
		providerId: account.providerId,
		projectId: account.projectId,
		createdAt: account.createdAt,
		updatedAt: account.updatedAt,
	};
}

function scopeFromProjectId(projectId?: string) {
	if (!projectId) {
		return { projectId: undefined, where: [] as WhereClause[], data: {} as Record<string, string> };
	}
	return {
		projectId,
		where: [{ field: "projectId", value: projectId }] as WhereClause[],
		data: { projectId },
	};
}

async function findUserById(db: PluginDBAdapter, userId: string): Promise<UserRow | null> {
	const rows = await db.findMany<UserRow>({
		model: "user",
		where: [{ field: "id", value: userId }],
		limit: 1,
	});
	return rows[0] ?? null;
}

async function findSessionRow(
	db: PluginDBAdapter,
	params: {
		sessionId?: string;
		sessionToken?: string;
	},
): Promise<SessionRow | null> {
	if (params.sessionId) {
		const rows = await db.findMany<SessionRow>({
			model: "session",
			where: [{ field: "id", value: params.sessionId }],
			limit: 1,
		});
		if (rows[0]) {
			return rows[0];
		}
	}
	if (params.sessionToken) {
		const rows = await db.findMany<SessionRow>({
			model: "session",
			where: [{ field: "token", value: params.sessionToken }],
			limit: 1,
		});
		return rows[0] ?? null;
	}
	return null;
}

const PROJECT_USER_RELATION_LIMIT = 5000;

async function listProjectUserIds(
	db: PluginDBAdapter,
	projectId: string,
): Promise<Set<string>> {
	const [projectRows, scopedUsers, memberRows, sessionRows, accountRows] = await Promise.all([
		db.findMany<ProjectOwnerRow>({
			model: "project",
			where: [{ field: "id", value: projectId }],
			limit: 1,
		}),
		db.findMany<Pick<UserRow, "id">>({
			model: "user",
			where: [{ field: "projectId", value: projectId }],
			limit: PROJECT_USER_RELATION_LIMIT,
		}),
		db.findMany<{ userId: string }>({
			model: "member",
			where: [{ field: "projectId", value: projectId }],
			limit: PROJECT_USER_RELATION_LIMIT,
		}),
		db.findMany<Pick<SessionRow, "userId">>({
			model: "session",
			where: [{ field: "projectId", value: projectId }],
			limit: PROJECT_USER_RELATION_LIMIT,
		}),
		db.findMany<Pick<AccountRow, "userId">>({
			model: "account",
			where: [{ field: "projectId", value: projectId }],
			limit: PROJECT_USER_RELATION_LIMIT,
		}),
	]);

	const userIds = new Set<string>();
	const projectOwnerId = projectRows[0]?.ownerId;
	if (projectOwnerId) {
		userIds.add(projectOwnerId);
	}
	for (const user of scopedUsers) {
		if (user.id) {
			userIds.add(user.id);
		}
	}
	for (const row of memberRows) {
		if (row.userId) {
			userIds.add(row.userId);
		}
	}
	for (const row of sessionRows) {
		if (row.userId) {
			userIds.add(row.userId);
		}
	}
	for (const row of accountRows) {
		if (row.userId) {
			userIds.add(row.userId);
		}
	}

	return userIds;
}

async function requireListPermission(
	ctx: UserManagementContext,
	db: PluginDBAdapter,
	body: Record<string, unknown>,
	permission: string,
) {
	const scope = getProjectScope(body, { optional: true });
	if (!scope.projectId) {
		await requireGlobalAdmin(ctx);
		return scope;
	}
	await requireProjectPermission(ctx, {
		db,
		permission,
		projectId: scope.projectId,
	});
	return scope;
}

async function resolveUserAccess(
	ctx: UserManagementContext,
	db: PluginDBAdapter,
	params: {
		userId: string;
		body: Record<string, unknown>;
		permission: string;
	},
) {
	const user = await findUserById(db, params.userId);
	if (!user) {
		throw ctx.error("BAD_REQUEST", { message: "User not found" });
	}

	const explicitScope = getProjectScope(params.body, { optional: true });
	if (explicitScope.projectId && user.projectId && user.projectId !== explicitScope.projectId) {
		throw ctx.error("FORBIDDEN", { message: "User does not belong to the requested project" });
	}

	const projectId = explicitScope.projectId ?? user.projectId;
	if (!projectId) {
		await requireGlobalAdmin(ctx);
		return { user, scope: explicitScope };
	}

	await requireProjectPermission(ctx, {
		db,
		permission: params.permission,
		projectId,
	});
	return { user, scope: scopeFromProjectId(projectId) };
}

async function resolveSessionAccess(
	ctx: UserManagementContext,
	db: PluginDBAdapter,
	params: {
		body: Record<string, unknown>;
		permission: string;
	},
) {
	const session = await findSessionRow(db, {
		sessionId: typeof params.body.sessionId === "string" ? params.body.sessionId : undefined,
		sessionToken:
			typeof params.body.sessionToken === "string" ? params.body.sessionToken : undefined,
	});
	if (!session) {
		throw ctx.error("BAD_REQUEST", { message: "Session not found" });
	}

	const explicitScope = getProjectScope(params.body, { optional: true });
	if (
		explicitScope.projectId &&
		session.projectId &&
		session.projectId !== explicitScope.projectId
	) {
		throw ctx.error("FORBIDDEN", { message: "Session does not belong to the requested project" });
	}

	const projectId = explicitScope.projectId ?? session.projectId;
	if (!projectId) {
		await requireGlobalAdmin(ctx);
		return { session, scope: explicitScope };
	}

	await requireProjectPermission(ctx, {
		db,
		permission: params.permission,
		projectId,
	});
	return { session, scope: scopeFromProjectId(projectId) };
}

async function resolvePermissionCheckSubject(
	ctx: UserManagementContext,
	db: PluginDBAdapter,
	body: Record<string, unknown>,
): Promise<Set<string>> {
	const explicitScope = getProjectScope(body, { optional: true });
	const roleInput =
		typeof body.role === "string" || Array.isArray(body.role) ? body.role : undefined;

	if (roleInput) {
		const roleSlugs = parseRoleSlugs(roleInput);
		if (roleSlugs.length === 0) {
			throw ctx.error("BAD_REQUEST", { message: "Role is required" });
		}

		if (!explicitScope.projectId) {
			if (isGlobalAdminUser({ role: roleSlugs.join(",") })) {
				return new Set(["*"]);
			}
			throw ctx.error("BAD_REQUEST", {
				message: "projectId is required when checking project-scoped roles",
			});
		}

		return getRolePermissions(db, {
			projectId: explicitScope.projectId,
			roleSlugs,
		});
	}

	const auth = await requireAuthenticated(ctx);
	const requestedUserId =
		typeof body.userId === "string" && body.userId.length > 0 ? body.userId : auth.user.id;
	const user = await findUserById(db, requestedUserId);
	if (!user) {
		throw ctx.error("BAD_REQUEST", { message: "User not found" });
	}

	if (explicitScope.projectId && user.projectId && user.projectId !== explicitScope.projectId) {
		throw ctx.error("FORBIDDEN", { message: "User does not belong to the requested project" });
	}

	const projectId = explicitScope.projectId ?? user.projectId;
	if (!projectId) {
		if (isGlobalAdminUser(user)) {
			return new Set(["*"]);
		}
		throw ctx.error("BAD_REQUEST", {
			message: "projectId is required when checking project-scoped users",
		});
	}

	return getEffectiveProjectPermissions(db, {
		userId: user.id,
		projectId,
	});
}

async function assertImpersonationTargetAllowed(
	ctx: UserManagementContext,
	db: PluginDBAdapter,
	params: {
		targetUser: UserRow;
		body: Record<string, unknown>;
	},
): Promise<string | undefined> {
	const auth = await requireAuthenticated(ctx);
	if (auth.user.id === params.targetUser.id) {
		throw ctx.error("BAD_REQUEST", { message: "You are already signed in as this user" });
	}

	const explicitScope = getProjectScope(params.body, { optional: true });
	if (
		explicitScope.projectId &&
		params.targetUser.projectId &&
		params.targetUser.projectId !== explicitScope.projectId
	) {
		throw ctx.error("FORBIDDEN", { message: "User does not belong to the requested project" });
	}

	const projectId = explicitScope.projectId ?? params.targetUser.projectId;
	if (!projectId) {
		await requireGlobalAdmin(ctx);
		if (isGlobalAdminUser(params.targetUser)) {
			throw ctx.error("FORBIDDEN", { message: "You cannot impersonate elevated users" });
		}
		return undefined;
	}

	await requireProjectPermission(ctx, {
		db,
		permission: "dashboard.manage",
		projectId,
	});

	const targetPermissions = await getEffectiveProjectPermissions(db, {
		userId: params.targetUser.id,
		projectId,
	});
	if (targetPermissions.has("*") || targetPermissions.has("dashboard.manage")) {
		throw ctx.error("FORBIDDEN", { message: "You cannot impersonate elevated users" });
	}

	return projectId;
}

export function userManagementPlugin(): BetterAuthPlugin {
	// Allowlist of user fields that can be used for sorting and filtering
	const ALLOWED_SORT_FIELDS = new Set([
		"createdAt",
		"updatedAt",
		"email",
		"name",
		"role",
		"emailVerified",
		"banned",
	]);
	const ALLOWED_FILTER_FIELDS = new Set([
		"email",
		"name",
		"role",
		"emailVerified",
		"banned",
		"createdAt",
		"updatedAt",
	]);

	async function handleListUsers(ctx: UserManagementContext, payload: Record<string, unknown>) {
		const db = ctx.context.adapter as unknown as PluginDBAdapter;
		const scope = await requireListPermission(ctx, db, payload, "dashboard.read");
		const limit = typeof payload.limit === "number" ? Math.min(payload.limit, 200) : 100;
		const offset = typeof payload.offset === "number" ? payload.offset : 0;
		const sortDirection =
			payload.sortDirection === "asc" || payload.order === "asc" ? "asc" : "desc";
		const rawSortBy =
			typeof payload.sortBy === "string" && payload.sortBy.length > 0
				? payload.sortBy
				: "createdAt";
		const sortBy = ALLOWED_SORT_FIELDS.has(rawSortBy) ? rawSortBy : "createdAt";

		const where: WhereClause[] = [];
		let scopedUserIds =
			scope.projectId != null ? await listProjectUserIds(db, scope.projectId) : null;
		if (typeof payload.email === "string" && payload.email.length > 0) {
			where.push({ field: "email", value: payload.email.toLowerCase() });
		}
		if (typeof payload.role === "string" && payload.role.length > 0) {
			where.push({ field: "role", value: payload.role });
		}
		if (typeof payload.searchValue === "string" && payload.searchValue.length > 0) {
			where.push({
				field:
					payload.searchField === "name" || payload.searchField === "email"
						? payload.searchField
						: "email",
				operator:
					payload.searchOperator === "starts_with" ||
					payload.searchOperator === "ends_with" ||
					payload.searchOperator === "contains"
						? payload.searchOperator
						: "contains",
				value: payload.searchValue,
			});
		}
		if (
			payload.filterValue !== undefined &&
			typeof payload.filterField === "string" &&
			ALLOWED_FILTER_FIELDS.has(payload.filterField)
		) {
			where.push({
				field: payload.filterField,
				operator:
					payload.filterOperator === "ne" ||
					payload.filterOperator === "lt" ||
					payload.filterOperator === "lte" ||
					payload.filterOperator === "gt" ||
					payload.filterOperator === "gte" ||
					payload.filterOperator === "contains" ||
					payload.filterOperator === "starts_with" ||
					payload.filterOperator === "ends_with"
						? payload.filterOperator
						: "eq",
				value: payload.filterValue as string | number | boolean,
			});
		}

		if (typeof payload.organizationId === "string" && payload.organizationId.length > 0) {
			const memberships = await db.findMany<{ userId: string }>({
				model: "member",
				where: [{ field: "organizationId", value: payload.organizationId }, ...scope.where],
				limit: 1000,
			});
			const organizationUserIds = new Set(
				memberships.map((membership) => membership.userId).filter(Boolean),
			);
			if (organizationUserIds.size === 0) {
				return ctx.json({ users: [], data: [], total: 0, limit, offset });
			}
			if (scopedUserIds) {
				scopedUserIds = new Set(
					Array.from(scopedUserIds).filter((userId) => organizationUserIds.has(userId)),
				);
			} else {
				scopedUserIds = organizationUserIds;
			}
		}

		let users: UserRow[];
		let total: number;
		if (scopedUserIds) {
			if (scopedUserIds.size === 0) {
				return ctx.json({ users: [], data: [], total: 0, limit, offset });
			}
			const candidateUsers = await db.findMany<UserRow>({
				model: "user",
				where,
				limit: PROJECT_USER_RELATION_LIMIT,
				sortBy: { field: sortBy, direction: sortDirection },
			});
			const filteredUsers = candidateUsers.filter((user) => scopedUserIds?.has(user.id));
			total = filteredUsers.length;
			users = filteredUsers.slice(offset, offset + limit);
		} else {
			users = await db.findMany<UserRow>({
				model: "user",
				where,
				limit,
				offset,
				sortBy: { field: sortBy, direction: sortDirection },
			});
			total = await db.count({
				model: "user",
				where,
			});
		}
		return ctx.json({
			users,
			data: users,
			total,
			limit,
			offset,
		});
	}

	return {
		id: "banata-user-management",
		endpoints: {
			listUsersGet: createAuthEndpoint(
				"/admin/list-users",
				{
					method: "GET",
					query: listUsersQuerySchema,
					requireHeaders: true,
				},
				async (ctx) =>
					handleListUsers(
						ctx as unknown as UserManagementContext,
						normalizeListUsersPayload(ctx.query as Record<string, unknown>),
					),
			),

			listUsersPost: createAuthEndpoint(
				"/admin/list-users",
				{
					method: "POST",
					body: listUsersBodySchema,
					requireHeaders: true,
				},
				async (ctx) =>
					handleListUsers(
						ctx as unknown as UserManagementContext,
						normalizeListUsersPayload(ctx.body as Record<string, unknown>),
					),
			),

			getUser: createAuthEndpoint(
				"/admin/get-user",
				{
					method: "POST",
					body: getUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { user } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.read",
					});
					return typedCtx.json(user);
				},
			),

			getUserGet: createAuthEndpoint(
				"/admin/get-user",
				{
					method: "GET",
					query: getUserQuerySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { user } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.query.id,
						body: ctx.query,
						permission: "dashboard.read",
					});
					return typedCtx.json(user);
				},
			),

			createUser: createAuthEndpoint(
				"/admin/create-user",
				{
					method: "POST",
					body: createUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body, { optional: true });
					if (scope.projectId) {
						await requireProjectPermission(typedCtx, {
							db,
							permission: "dashboard.manage",
							projectId: scope.projectId,
						});
					} else {
						await requireGlobalAdmin(typedCtx);
					}

					const existing = await db.findMany<UserRow>({
						model: "user",
						where: [{ field: "email", value: ctx.body.email.toLowerCase() }, ...scope.where],
						limit: 1,
					});
					if (existing[0]) {
						throw typedCtx.error("BAD_REQUEST", { message: "User already exists" });
					}

					const role = serializeRoleInput(ctx.body.role) ?? "user";
					const extraData =
						typeof ctx.body.data === "object" && ctx.body.data !== null
							? (ctx.body.data as Record<string, unknown>)
							: {};
					const internalAdapter = typedCtx.context.internalAdapter;
					const user = await internalAdapter.createUser({
						...extraData,
						...(scope.projectId ? { projectId: scope.projectId } : {}),
						email: ctx.body.email.toLowerCase(),
						name: ctx.body.name,
						role,
						image:
							ctx.body.image ?? (typeof extraData.image === "string" ? extraData.image : undefined),
						username:
							ctx.body.username ??
							(typeof extraData.username === "string" ? extraData.username : undefined),
						phoneNumber:
							ctx.body.phoneNumber ??
							(typeof extraData.phoneNumber === "string" ? extraData.phoneNumber : undefined),
						emailVerified:
							ctx.body.emailVerified ??
							(typeof extraData.emailVerified === "boolean" ? extraData.emailVerified : false),
						metadata: ctx.body.metadata ?? extraData.metadata,
					});
					if (!user) {
						throw typedCtx.error("BAD_REQUEST", { message: "Failed to create user" });
					}

					if (ctx.body.password) {
						const hashedPassword = await typedCtx.context.password.hash(ctx.body.password);
						await internalAdapter.linkAccount({
							accountId: user.id,
							providerId: "credential",
							password: hashedPassword,
							userId: user.id,
							projectId: scope.projectId,
						});
					}

					return typedCtx.json({ user });
				},
			),

			updateUser: createAuthEndpoint(
				"/admin/update-user",
				{
					method: "POST",
					body: updateUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { user, scope } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.manage",
					});
					const extraData =
						typeof ctx.body.data === "object" && ctx.body.data !== null
							? { ...(ctx.body.data as Record<string, unknown>) }
							: {};
					const update: Record<string, unknown> = { ...extraData };
					if (ctx.body.name !== undefined) update.name = ctx.body.name;
					if (ctx.body.image !== undefined && ctx.body.image !== null)
						update.image = ctx.body.image;
					if (ctx.body.username !== undefined) update.username = ctx.body.username;
					if (ctx.body.phoneNumber !== undefined && ctx.body.phoneNumber !== null)
						update.phoneNumber = ctx.body.phoneNumber;
					if (ctx.body.emailVerified !== undefined) update.emailVerified = ctx.body.emailVerified;
					if (ctx.body.metadata !== undefined) update.metadata = ctx.body.metadata;
					const roleInput =
						ctx.body.role !== undefined
							? ctx.body.role
							: typeof extraData.role === "string" || Array.isArray(extraData.role)
								? extraData.role
								: undefined;
					if (roleInput !== undefined) {
						update.role = serializeRoleInput(roleInput);
					}
					if (scope.projectId && !user.projectId) {
						update.projectId = scope.projectId;
					}

					const updatedUser = Object.keys(update).length
						? await typedCtx.context.internalAdapter.updateUser(ctx.body.userId, update)
						: user;

					if (ctx.body.password) {
						const hashedPassword = await typedCtx.context.password.hash(ctx.body.password);
						await typedCtx.context.internalAdapter.updatePassword(ctx.body.userId, hashedPassword);
					}

					return typedCtx.json(updatedUser);
				},
			),

			removeUser: createAuthEndpoint(
				"/admin/remove-user",
				{
					method: "POST",
					body: getUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const auth = await requireAuthenticated(typedCtx);
					if (auth.user.id === ctx.body.userId) {
						throw typedCtx.error("BAD_REQUEST", { message: "You cannot delete your own user" });
					}
					await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.manage",
					});
					await typedCtx.context.internalAdapter.deleteUser(ctx.body.userId);
					return typedCtx.json({ success: true });
				},
			),

			banUser: createAuthEndpoint(
				"/admin/ban-user",
				{
					method: "POST",
					body: banUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const auth = await requireAuthenticated(typedCtx);
					if (auth.user.id === ctx.body.userId) {
						throw typedCtx.error("BAD_REQUEST", { message: "You cannot ban your own user" });
					}
					const { user } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.manage",
					});
					const banExpires =
						typeof ctx.body.banExpires === "number"
							? ctx.body.banExpires
							: typeof ctx.body.banExpiresIn === "number"
								? Date.now() + ctx.body.banExpiresIn * 1000
								: null;
					const updatedUser = await typedCtx.context.internalAdapter.updateUser(user.id, {
						banned: true,
						banReason: ctx.body.banReason ?? "Disabled by admin",
						banExpires,
						updatedAt: new Date(),
					});
					await typedCtx.context.internalAdapter.deleteSessions(user.id);
					return typedCtx.json({ user: updatedUser });
				},
			),

			unbanUser: createAuthEndpoint(
				"/admin/unban-user",
				{
					method: "POST",
					body: getUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { user } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.manage",
					});
					const updatedUser = await typedCtx.context.internalAdapter.updateUser(user.id, {
						banned: false,
						banReason: null,
						banExpires: null,
						updatedAt: new Date(),
					});
					return typedCtx.json({ user: updatedUser });
				},
			),

			setRole: createAuthEndpoint(
				"/admin/set-role",
				{
					method: "POST",
					body: setRoleBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { user } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.manage",
					});
					const updatedUser = await typedCtx.context.internalAdapter.updateUser(user.id, {
						role: serializeRoleInput(ctx.body.role) ?? "user",
						updatedAt: new Date(),
					});
					return typedCtx.json({ user: updatedUser });
				},
			),

			impersonateUser: createAuthEndpoint(
				"/admin/impersonate-user",
				{
					method: "POST",
					body: impersonateUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const auth = await requireAuthenticated(typedCtx);
					const targetUser = await findUserById(db, ctx.body.userId);
					if (!targetUser) {
						throw typedCtx.error("BAD_REQUEST", { message: "User not found" });
					}

					const projectId = await assertImpersonationTargetAllowed(typedCtx, db, {
						targetUser,
						body: ctx.body,
					});

					const session = await typedCtx.context.internalAdapter.createSession(
						targetUser.id,
						true,
						{
							impersonatedBy: auth.user.id,
							expiresAt: new Date(Date.now() + 60 * 60 * 1000),
							...(projectId ? { projectId } : {}),
						},
						true,
					);
					if (!session) {
						throw typedCtx.error("INTERNAL_SERVER_ERROR", {
							message: "Failed to create impersonation session",
						});
					}

					deleteSessionCookie(typedCtx as any);
					const dontRememberMeCookie = await typedCtx.getSignedCookie(
						typedCtx.context.authCookies.dontRememberToken.name,
						typedCtx.context.secret,
					);
					const adminCookie = typedCtx.context.createAuthCookie("admin_session");
					await typedCtx.setSignedCookie(
						adminCookie.name,
						`${auth.session.token}:${dontRememberMeCookie ?? ""}`,
						typedCtx.context.secret,
						typedCtx.context.authCookies.sessionToken.attributes,
					);
					await setSessionCookie(
						typedCtx as any,
						{
							session: session as any,
							user: targetUser as any,
						},
						true,
					);

					return typedCtx.json({
						session: sanitizeSession(session),
						user: targetUser,
					});
				},
			),

			stopImpersonating: createAuthEndpoint(
				"/admin/stop-impersonating",
				{
					method: "POST",
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const authSession = await getSessionFromCtx(ctx);
					if (!authSession) {
						throw typedCtx.error("UNAUTHORIZED", { message: "Authentication required" });
					}
					if (!authSession.session.impersonatedBy) {
						throw typedCtx.error("BAD_REQUEST", {
							message: "You are not impersonating anyone",
						});
					}

					const adminCookie = typedCtx.context.createAuthCookie("admin_session");
					const storedAdminSession = await typedCtx.getSignedCookie(
						adminCookie.name,
						typedCtx.context.secret,
					);
					if (!storedAdminSession) {
						throw typedCtx.error("INTERNAL_SERVER_ERROR", {
							message: "Failed to find admin session",
						});
					}

					const [adminSessionToken, dontRememberMeCookie] = storedAdminSession.split(":");
					if (!adminSessionToken) {
						throw typedCtx.error("INTERNAL_SERVER_ERROR", {
							message: "Failed to parse admin session",
						});
					}

					const adminSession = await findSessionRow(db, {
						sessionToken: adminSessionToken,
					});
					if (!adminSession || adminSession.userId !== authSession.session.impersonatedBy) {
						throw typedCtx.error("INTERNAL_SERVER_ERROR", {
							message: "Failed to find admin session",
						});
					}

					const adminUser = await findUserById(db, adminSession.userId);
					if (!adminUser) {
						throw typedCtx.error("INTERNAL_SERVER_ERROR", {
							message: "Failed to find admin user",
						});
					}

					await typedCtx.context.internalAdapter.deleteSession(authSession.session.token);
					await setSessionCookie(
						typedCtx as any,
						{
							session: adminSession as any,
							user: adminUser as any,
						},
						!!dontRememberMeCookie,
					);
					expireCookie(typedCtx as any, adminCookie as any);

					return typedCtx.json({
						session: sanitizeSession(adminSession),
						user: adminUser,
					});
				},
			),

			listUserAccounts: createAuthEndpoint(
				"/admin/list-user-accounts",
				{
					method: "POST",
					body: getUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { user, scope } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.read",
					});
					const accounts = await db.findMany<AccountRow>({
						model: "account",
						where: [{ field: "userId", value: user.id }, ...scope.where],
						limit: 200,
						sortBy: { field: "createdAt", direction: "desc" },
					});
					const data = accounts.map(sanitizeAccount);
					return typedCtx.json({ accounts: data, data });
				},
			),

			listUserSessions: createAuthEndpoint(
				"/admin/list-user-sessions",
				{
					method: "POST",
					body: getUserBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { user, scope } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.read",
					});
					const sessions = await db.findMany<SessionRow>({
						model: "session",
						where: [{ field: "userId", value: user.id }, ...scope.where],
						limit: 200,
						sortBy: { field: "createdAt", direction: "desc" },
					});
					const data = sessions.map(sanitizeSession);
					return typedCtx.json({ sessions: data, data });
				},
			),

			revokeUserSession: createAuthEndpoint(
				"/admin/revoke-user-session",
				{
					method: "POST",
					body: revokeSessionBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { session } = await resolveSessionAccess(typedCtx, db, {
						body: ctx.body,
						permission: "dashboard.manage",
					});
					await typedCtx.context.internalAdapter.deleteSession(session.token);
					return typedCtx.json({ success: true });
				},
			),

			revokeUserSessions: createAuthEndpoint(
				"/admin/revoke-user-sessions",
				{
					method: "POST",
					body: revokeUserSessionsBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const { user } = await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.manage",
					});
					await typedCtx.context.internalAdapter.deleteSessions(user.id);
					return typedCtx.json({ success: true });
				},
			),

			setUserPassword: createAuthEndpoint(
				"/admin/set-user-password",
				{
					method: "POST",
					body: setUserPasswordBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					await resolveUserAccess(typedCtx, db, {
						userId: ctx.body.userId,
						body: ctx.body,
						permission: "dashboard.manage",
					});

					const minPasswordLength = typedCtx.context.password.config?.minPasswordLength ?? 8;
					if (ctx.body.newPassword.length < minPasswordLength) {
						throw typedCtx.error("BAD_REQUEST", {
							message: `Password must be at least ${minPasswordLength} characters long`,
						});
					}

					const maxPasswordLength = typedCtx.context.password.config?.maxPasswordLength ?? 128;
					if (ctx.body.newPassword.length > maxPasswordLength) {
						throw typedCtx.error("BAD_REQUEST", {
							message: `Password must be at most ${maxPasswordLength} characters long`,
						});
					}

					const hashedPassword = await typedCtx.context.password.hash(ctx.body.newPassword);
					await typedCtx.context.internalAdapter.updatePassword(ctx.body.userId, hashedPassword);
					return typedCtx.json({ status: true });
				},
			),

			hasPermission: createAuthEndpoint(
				"/admin/has-permission",
				{
					method: "POST",
					body: hasPermissionBodySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const typedCtx = ctx as unknown as UserManagementContext;
					const db = typedCtx.context.adapter as unknown as PluginDBAdapter;
					const requestedPermissions = flattenPermissionCheckInput(
						(ctx.body.permissions ?? ctx.body.permission) as PermissionCheckInput | undefined,
					);
					if (requestedPermissions.length === 0) {
						throw typedCtx.error("BAD_REQUEST", {
							message: "invalid permission check. no permission(s) were passed.",
						});
					}

					const grantedPermissions = await resolvePermissionCheckSubject(typedCtx, db, ctx.body);
					return typedCtx.json({
						error: null,
						success: hasRequestedPermissions(grantedPermissions, requestedPermissions),
					});
				},
			),
		},
	};
}
