/**
 * Shared type definitions for Banata Auth plugins.
 *
 * These types provide type-safe interfaces for the Better Auth plugin system,
 * replacing raw `any` usage throughout the plugin codebase.
 *
 * Better Auth's plugin system uses `better-call` endpoints under the hood.
 * The handler context (`EndpointContext`) includes the full `AuthContext` which
 * contains the database adapter, session info, and more.
 *
 * @see https://www.better-auth.com/docs/plugins/custom-plugin
 */

import type { BetterAuthOptions } from "better-auth";
import { z } from "zod";

// â”€â”€â”€ Database Adapter Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// These mirror better-auth's DBAdapter interface with narrower types
// to avoid importing internal types that may not be stable.

/**
 * Where clause for database queries.
 * Matches Better Auth's Where type from @better-auth/core/dist/db/adapter.
 */
export interface WhereClause {
	field: string;
	value: string | number | boolean | string[] | number[] | Date | null;
	operator?:
		| "eq"
		| "ne"
		| "lt"
		| "lte"
		| "gt"
		| "gte"
		| "in"
		| "not_in"
		| "contains"
		| "starts_with"
		| "ends_with";
	connector?: "AND" | "OR";
}

/**
 * Sort specification for database queries.
 */
export interface SortBy {
	field: string;
	direction: "asc" | "desc";
}

/**
 * Typed subset of Better Auth's DBAdapter.
 *
 * This represents the adapter available on `ctx.context.adapter`.
 * We use generic `Record<string, unknown>` for data instead of `any`.
 */
export interface PluginDBAdapter {
	create: <T extends Record<string, unknown> = Record<string, unknown>>(data: {
		model: string;
		data: Record<string, unknown>;
		select?: string[];
		forceAllowId?: boolean;
	}) => Promise<T>;

	findOne: <T = Record<string, unknown>>(data: {
		model: string;
		where: WhereClause[];
		select?: string[];
	}) => Promise<T | null>;

	findMany: <T = Record<string, unknown>>(data: {
		model: string;
		where?: WhereClause[];
		limit?: number;
		select?: string[];
		sortBy?: SortBy;
		offset?: number;
	}) => Promise<T[]>;

	update: <T = Record<string, unknown>>(data: {
		model: string;
		where: WhereClause[];
		update: Record<string, unknown>;
	}) => Promise<T | null>;

	delete: (data: {
		model: string;
		where: WhereClause[];
	}) => Promise<void>;

	deleteMany: (data: {
		model: string;
		where: WhereClause[];
	}) => Promise<number>;

	count: (data: {
		model: string;
		where?: WhereClause[];
	}) => Promise<number>;
}

// â”€â”€â”€ Session Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Shape of a user record from the session context.
 */
export interface SessionUser {
	id: string;
	email: string;
	name: string;
	emailVerified: boolean;
	image?: string | null;
	role?: string;
	banned?: boolean;
	[key: string]: unknown;
}

/**
 * Shape of a session record from the session context.
 */
export interface SessionRecord {
	id: string;
	userId: string;
	token: string;
	expiresAt: number | Date;
	ipAddress?: string | null;
	userAgent?: string | null;
	activeOrganizationId?: string | null;
	impersonatedBy?: string | null;
	createdAt: number | Date;
	updatedAt: number | Date;
	[key: string]: unknown;
}

// â”€â”€â”€ Plugin Endpoint Context â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * The AuthContext subset available on `ctx.context` in endpoint handlers.
 *
 * This is a narrowed version of Better Auth's full AuthContext, including
 * only the fields typically used by custom plugins.
 */
export interface PluginAuthContext {
	adapter: PluginDBAdapter;
	session: {
		session: SessionRecord;
		user: SessionUser;
	} | null;
	options: BetterAuthOptions;
	secret: string;
	baseURL: string;
	appName: string;
	generateId: (options: { model: string; size?: number }) => string | false;
}

/**
 * The full endpoint handler context for plugin endpoints.
 *
 * This is the `ctx` parameter received by endpoint handlers registered
 * in a BetterAuthPlugin's `endpoints` object.
 */
export interface PluginEndpointContext<TBody = Record<string, unknown>> {
	/** Parsed and validated request body */
	body: TBody;
	/** Request query parameters */
	query: Record<string, string | undefined>;
	/** Request headers */
	headers: Headers | undefined;
	/** The auth context containing adapter, session, etc. */
	context: PluginAuthContext;
	/** Return a JSON response */
	json: <R extends Record<string, unknown> | null>(
		data: R,
		options?: { status?: number; headers?: Record<string, string> } | Response,
	) => Promise<R>;
	/** Return an error response */
	error: (
		status: number | string,
		body?: { message?: string; code?: string } & Record<string, unknown>,
		headers?: Record<string, string>,
	) => Error;
	/** The request path */
	path: string;
	/** The request object */
	request: Request | undefined;
	/** Get a request header */
	getHeader: (key: string) => string | null;
}

// â”€â”€â”€ Hook Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Context passed to plugin hook matchers and handlers.
 */
export interface PluginHookContext {
	path?: string;
	context: PluginAuthContext & {
		returned?: unknown;
		responseHeaders?: Headers;
	};
	headers?: Headers;
	body?: Record<string, unknown>;
	query?: Record<string, string | undefined>;
}

// â”€â”€â”€ Database Record Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Typed shapes for database rows used across plugins.

/**
 * Row shape for the `auditEvent` table.
 *
 * Index signature allows these types to satisfy Record<string, unknown>
 * which is required by Better Auth's DBAdapter generic constraints.
 */
export interface AuditEventRow extends Record<string, unknown> {
	id: string;
	action: string;
	version: number | null;
	actorType: string;
	actorId: string;
	actorName: string | null;
	actorEmail: string | null;
	/** JSON-serialized Record<string, string> */
	actorMetadata: string | null;
	targets: string | null;
	organizationId: string | null;
	ipAddress: string | null;
	userAgent: string | null;
	requestId: string | null;
	changes: string | null;
	idempotencyKey: string | null;
	/** JSON-serialized Record<string, string> */
	metadata: string | null;
	occurredAt: number;
	createdAt: number;
}

/**
 * Row shape for the `webhookEndpoint` table.
 */
export interface WebhookEndpointRow extends Record<string, unknown> {
	id: string;
	url: string;
	secret: string;
	eventTypes: string | null;
	enabled: boolean;
	successCount: number | null;
	failureCount: number | null;
	consecutiveFailures: number | null;
	lastDeliveryAt: number | null;
	lastDeliveryStatus: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `webhookDelivery` table.
 */
export interface WebhookDeliveryRow extends Record<string, unknown> {
	id: string;
	endpointId: string;
	eventType: string;
	payload: string;
	attempt: number;
	maxAttempts: number;
	status: "pending" | "success" | "failed" | "retrying";
	httpStatus: number | null;
	responseBody: string | null;
	errorMessage: string | null;
	nextRetryAt: number | null;
	deliveredAt: number | null;
	createdAt: number;
}

/**
 * Row shape for the `roleDefinition` table.
 */
export interface RoleDefinitionRow extends Record<string, unknown> {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	permissions: string | null; // JSON stringified array
	isDefault: boolean | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `permissionDefinition` table.
 */
export interface PermissionDefinitionRow extends Record<string, unknown> {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `brandingConfig` table.
 */
export interface BrandingConfigRow extends Record<string, unknown> {
	id: string;
	primaryColor: string | null;
	bgColor: string | null;
	borderRadius: number | null;
	darkMode: boolean | null;
	customCss: string | null;
	font: string | null;
	logoUrl: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `emailTemplate` table.
 */
export interface EmailTemplateRow extends Record<string, unknown> {
	id: string;
	name: string;
	slug: string;
	subject: string;
	previewText: string | null;
	category: string;
	description: string | null;
	/** JSON-serialized EmailBlock[] array. */
	blocksJson: string;
	/** JSON-serialized EmailTemplateVariable[] array. */
	variablesJson: string | null;
	builtIn: boolean | null;
	builtInType: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `emailConfig` table.
 */
export interface EmailConfigRow extends Record<string, unknown> {
	id: string;
	emailType: string;
	name: string;
	description: string | null;
	enabled: boolean;
	category: string;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `dashboardConfig` table.
 * Singleton row pattern: at most one row exists.
 * Stores JSON-serialized partial dashboard config overrides.
 */
export interface DashboardConfigRow extends Record<string, unknown> {
	id: string;
	/** JSON-serialized partial dashboard config overrides */
	configJson: string;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `domainConfig` table.
 */
export interface DomainConfigRow extends Record<string, unknown> {
	id: string;
	domainKey: string;
	title: string;
	description: string | null;
	value: string;
	isDefault: boolean | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `redirectConfig` table.
 * Singleton row with JSON-serialized redirect settings.
 */
export interface RedirectConfigRow extends Record<string, unknown> {
	id: string;
	configJson: string;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `actionConfig` table.
 */
export interface ActionConfigRow extends Record<string, unknown> {
	id: string;
	name: string;
	description: string | null;
	triggerEvent: string;
	webhookUrl: string;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `radarConfig` table.
 * Singleton row with JSON-serialized radar/bot protection settings.
 */
export interface RadarConfigRow extends Record<string, unknown> {
	id: string;
	configJson: string;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `emailProviderConfig` table.
 * Singleton row with JSON-serialized email provider settings.
 */
export interface EmailProviderConfigRow extends Record<string, unknown> {
	id: string;
	configJson: string;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `resourceType` table.
 */
export interface ResourceTypeRow extends Record<string, unknown> {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `addonConfig` table.
 * Singleton row with JSON-serialized addon states.
 */
export interface AddonConfigRow extends Record<string, unknown> {
	id: string;
	configJson: string;
	createdAt: number;
	updatedAt: number;
}

/**
 * Row shape for the `projectConfig` table.
 * One row per project with JSON-serialized project settings.
 */
export interface ProjectConfigRow extends Record<string, unknown> {
	id: string;
	configJson: string;
	projectId?: string;
	createdAt: number;
	updatedAt: number;
}

// â”€â”€â”€ Project Row Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Row shape for the `project` table.
 * Each project is a fully isolated auth tenant.
 */
export interface ProjectRow extends Record<string, unknown> {
	id: string;
	name: string;
	slug: string;
	description?: string;
	logoUrl?: string;
	ownerId: string;
	createdAt: number;
	updatedAt: number;
}

interface MemberPermissionRow extends Record<string, unknown> {
	id: string;
	userId: string;
	role: string;
	projectId?: string;
}

interface ProjectOwnerRow extends Record<string, unknown> {
	id: string;
	ownerId: string;
}

export function parseRoleSlugs(value: string | string[] | null | undefined): string[] {
	const raw = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [];
	return Array.from(new Set(raw.map((role) => role.trim()).filter(Boolean)));
}

export function isGlobalAdminRole(role: string | null | undefined): boolean {
	return role === "admin" || role === "super_admin";
}

export function isGlobalAdminUser(user: Pick<SessionUser, "role"> | null | undefined): boolean {
	return isGlobalAdminRole(user?.role);
}

// â”€â”€â”€ Admin Authorization Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Verify that the current request has an authenticated session.
 *
 * This MUST be called at the top of every custom plugin endpoint
 * that performs administrative operations (webhook CRUD, audit log
 * management, roles/permissions CRUD, branding, email config, etc.).
 *
 * The function uses a loose type signature to remain compatible with
 * Better Auth's `EndpointContext` which uses a narrower union type
 * for error status codes (e.g. `"UNAUTHORIZED" | "FORBIDDEN" | ...`)
 * rather than `string | number`.
 *
 * @param ctx - The endpoint handler context from Better Auth
 * @throws Error with status "UNAUTHORIZED" if not authenticated
 */
// biome-ignore lint: ctx type is intentionally loose to match Better Auth's EndpointContext
export function requireAuthenticated(ctx: any): {
	session: SessionRecord;
	user: SessionUser;
} {
	const authSession = ctx.context?.session;
	if (!authSession?.user?.id || !authSession?.session?.id) {
		throw ctx.error("UNAUTHORIZED", { message: "Authentication required" });
	}

	return {
		session: authSession.session as SessionRecord,
		user: authSession.user as SessionUser,
	};
}

/**
 * @deprecated Use `requireAuthenticated` or `requireGlobalAdmin` instead.
 */
export function requireAdmin(ctx: any): {
	session: SessionRecord;
	user: SessionUser;
} {
	return requireAuthenticated(ctx);
}

// biome-ignore lint: ctx type is intentionally loose to match Better Auth's EndpointContext
export function requireGlobalAdmin(ctx: any): {
	session: SessionRecord;
	user: SessionUser;
} {
	const auth = requireAuthenticated(ctx);
	if (!isGlobalAdminUser(auth.user)) {
		throw ctx.error("FORBIDDEN", { message: "Global admin access required" });
	}

	return auth;
}

export async function getRolePermissions(
	db: PluginDBAdapter,
	params: {
		projectId?: string;
		roleSlugs: string[];
	},
): Promise<Set<string>> {
	const permissions = new Set<string>();
	const { projectId, roleSlugs } = params;

	if (roleSlugs.length === 0) return permissions;
	if (roleSlugs.includes("super_admin")) {
		permissions.add("*");
		return permissions;
	}
	if (!projectId) return permissions;

	const requestedRoleSlugs = new Set(roleSlugs);
	const roleRows = await db.findMany<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [{ field: "projectId", value: projectId }],
		limit: 1000,
	});

	for (const row of roleRows) {
		if (!requestedRoleSlugs.has(row.slug) || !row.permissions) continue;
		try {
			const rowPermissions = JSON.parse(row.permissions) as string[];
			for (const permission of rowPermissions) {
				if (typeof permission === "string" && permission.length > 0) {
					permissions.add(permission);
				}
			}
		} catch {
			// Ignore malformed permission blobs instead of failing open.
		}
	}

	return permissions;
}

/**
 * Resolve the effective permission slugs for a user in a project.
 *
 * Permission sources:
 * 1) Global Better Auth admin role (`user.role`)
 * 2) Project ownership (`project.ownerId`)
 * 3) Organization membership roles in the project (`member.role`)
 */
export async function getEffectiveProjectPermissions(
	db: PluginDBAdapter,
	params: {
		userId: string;
		projectId?: string;
	},
): Promise<Set<string>> {
	const permissions = new Set<string>();
	const { userId, projectId } = params;

	if (!projectId) return permissions;

	const userRows = await db.findMany<SessionUser>({
		model: "user",
		where: [{ field: "id", value: userId }],
		limit: 1,
	});
	const user = userRows[0];
	if (isGlobalAdminUser(user)) {
		permissions.add("*");
		return permissions;
	}

	const projectRows = await db.findMany<ProjectOwnerRow>({
		model: "project",
		where: [{ field: "id", value: projectId }],
		limit: 1,
	});
	if (projectRows[0]?.ownerId === userId) {
		permissions.add("*");
		return permissions;
	}

	const memberRows = await db.findMany<MemberPermissionRow>({
		model: "member",
		where: [
			{ field: "projectId", value: projectId },
			{ field: "userId", value: userId },
		],
		limit: 200,
	});
	if (memberRows.length === 0) return permissions;

	const roleSlugs = new Set<string>();
	for (const member of memberRows) {
		for (const slug of parseRoleSlugs(member.role)) {
			roleSlugs.add(slug);
		}
	}
	if (roleSlugs.size === 0) return permissions;

	const rolePermissions = await getRolePermissions(db, {
		projectId,
		roleSlugs: Array.from(roleSlugs),
	});
	for (const permission of rolePermissions) {
		permissions.add(permission);
	}

	return permissions;
}

/**
 * Throws FORBIDDEN unless the current user has the given permission in project scope.
 */
export async function requireProjectPermission(
	ctx: any,
	params: {
		db: PluginDBAdapter;
		permission: string;
		projectId?: string;
	},
): Promise<void> {
	const { user } = requireAuthenticated(ctx);
	const { db, permission, projectId } = params;

	if (!projectId) {
		throw ctx.error("FORBIDDEN", {
			message: `Project scope is required to check permission \"${permission}\"`,
		});
	}

	const permissions = await getEffectiveProjectPermissions(db, {
		userId: user.id,
		projectId,
	});
	if (permissions.has("*") || permissions.has(permission)) {
		return;
	}

	throw ctx.error("FORBIDDEN", {
		message: `Missing permission: ${permission}`,
	});
}

// â”€â”€â”€ Shared Zod Schemas for Project Scoping â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Zod schema partial for project-scoped endpoints.
 * Add `.merge(projectScopeSchema)` to any endpoint body schema that
 * should accept an optional projectId.
 */
export const projectScopeSchema = z.object({
	projectId: z.string().optional(),
});

/**
 * Extract projectId from a parsed body and return scope helpers.
 *
 * **Strict by default**: throws if `projectId` is missing.
 * All project-scoped data MUST be isolated â€” returning empty filters
 * would silently leak data across projects.
 *
 * Pass `{ optional: true }` only for endpoints that genuinely operate
 * across all projects (e.g. project list, ensure-default).
 */
export function getProjectScope(
	body: Record<string, unknown>,
	opts?: { optional?: boolean },
): {
	/** Where clause filter for findMany/findOne/update/delete. */
	where: WhereClause[];
	/** Data fields to include in create. */
	data: Record<string, string>;
	/** The resolved projectId (always present when strict). */
	projectId: string | undefined;
} {
	const projectId = typeof body.projectId === "string" ? body.projectId : undefined;
	if (!projectId) {
		if (opts?.optional) {
			return { where: [], data: {}, projectId: undefined };
		}
		throw new Error(
			"projectId is required for this endpoint. The dashboard must send a projectId to scope data correctly.",
		);
	}
	return {
		where: [{ field: "projectId", value: projectId }],
		data: { projectId },
		projectId,
	};
}

