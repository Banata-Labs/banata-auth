/**
 * Audit log plugin for Banata Auth.
 *
 * Provides:
 * - API endpoints for listing, creating, and exporting audit events
 * - Automatic logging of auth events via Better Auth hooks
 * - Organization-scoped audit trails
 *
 * This plugin follows Better Auth's plugin pattern and uses the Convex
 * database adapter (from Better Auth's context) to store events in the
 * `auditEvent` table defined in the component schema.
 *
 * @see {@link ../../component/schema.ts} for the auditEvent table definition
 * @see {@link ../../../shared/src/types.ts} for the AuditEvent SDK type
 */

import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, createAuthMiddleware } from "better-auth/api";
import { z } from "zod";
import {
	type AuditEventRow,
	type PluginDBAdapter,
	type WhereClause,
	getProjectScope,
	projectScopeSchema,
	requireProjectPermission,
} from "./types";

// ─── Types ──────────────────────────────────────────────────────────

export interface AuditLogPluginOptions {
	/** Actions to automatically log. If empty, logs all auth actions. */
	autoLogActions?: string[];
	/** Whether to auto-log all Better Auth endpoint calls. Default: true */
	autoLog?: boolean;
}

// ─── Path → Action Mapping ──────────────────────────────────────────

/**
 * Map a Better Auth endpoint path to an audit action string.
 *
 * These action strings follow the `resource.verb` convention used
 * throughout the Banata Auth audit system (see shared/src/types.ts).
 */
function pathToAction(path: string): string | null {
	const map: Record<string, string> = {
		// Authentication
		"/sign-in/email": "user.login",
		"/sign-in/social": "user.login.social",
		"/sign-up/email": "user.create",
		"/sign-out": "user.logout",

		// Password management
		"/forget-password": "user.password_reset_request",
		"/reset-password": "user.password_reset",
		"/change-password": "user.password_change",

		// Profile
		"/update-user": "user.update",
		"/verify-email": "user.email_verified",

		// Two-factor
		"/two-factor/enable": "user.two_factor_enable",
		"/two-factor/disable": "user.two_factor_disable",

		// Organization
		"/organization/create": "organization.create",
		"/organization/update": "organization.update",
		"/organization/delete": "organization.delete",
		"/organization/invite-member": "organization.member_invite",
		"/organization/remove-member": "organization.member_remove",
		"/organization/update-member-role": "organization.member_role_change",

		// Admin
		"/admin/ban-user": "admin.user_ban",
		"/admin/unban-user": "admin.user_unban",
		"/admin/set-role": "admin.user_role_change",
		"/admin/remove-user": "admin.user_delete",
		"/admin/impersonate-user": "admin.impersonate",

		// SSO
		"/banata/sso/register": "sso.connection_create",
		"/banata/sso/update-provider": "sso.connection_update",
		"/banata/sso/delete-provider": "sso.connection_delete",
		"/sign-in/sso": "sso.login",

		// SCIM
		"/banata/scim/register": "scim.directory_create",
		"/banata/scim/delete-provider": "scim.directory_delete",

		// Domain verification
		"/banata/domains/create": "sso.domain_verification_create",
		"/banata/domains/verify": "sso.domain_verification_verify",
		"/banata/domains/delete": "sso.domain_verification_delete",

		// API Key
		"/api-key/create": "api_key.create",
		"/api-key/delete": "api_key.delete",
	};

	// Match partial paths — Better Auth prepends a base path
	for (const [pattern, action] of Object.entries(map)) {
		if (path.endsWith(pattern) || path.includes(pattern)) {
			return action;
		}
	}
	return null;
}

// ─── Zod Schemas ────────────────────────────────────────────────────

const listAuditLogsSchema = z
	.object({
		organizationId: z.string().optional(),
		action: z.string().optional(),
		actorId: z.string().optional(),
		limit: z.number().optional(),
		after: z.string().optional(),
		before: z.string().optional(),
	})
	.merge(projectScopeSchema);

const createAuditLogSchema = z
	.object({
		action: z.string(),
		actorType: z.string(),
		actorId: z.string(),
		actorName: z.string().optional(),
		actorEmail: z.string().optional(),
		targets: z.string().optional(),
		organizationId: z.string().optional(),
		ipAddress: z.string().optional(),
		userAgent: z.string().optional(),
		changes: z.string().optional(),
		metadata: z.string().optional(),
		idempotencyKey: z.string().optional(),
		occurredAt: z.number().optional(),
	})
	.merge(projectScopeSchema);

const exportAuditLogsSchema = z
	.object({
		organizationId: z.string().optional(),
		action: z.string().optional(),
		startDate: z.number().optional(),
		endDate: z.number().optional(),
		format: z.string().optional(),
		/** Maximum number of records to return per page. Capped at 1000. Default: 1000. */
		limit: z.number().min(1).max(1000).optional(),
		/** Cursor-based pagination: pass the last event's `occurredAt` from the previous page. */
		cursor: z.number().optional(),
	})
	.merge(projectScopeSchema);

// ─── Plugin Factory ─────────────────────────────────────────────────

/**
 * Audit log plugin for Banata Auth.
 *
 * Registers custom API endpoints under `/api/auth/banata/audit-logs/`
 * for listing, creating, and exporting audit events.
 *
 * Also installs an `after` hook on all Better Auth endpoints to
 * automatically log auth events (sign-in, sign-up, password changes,
 * organization operations, admin actions, etc.) into the `auditEvent`
 * table via the Convex database adapter.
 *
 * @param options - Optional configuration for auto-logging behavior
 * @returns A Better Auth plugin descriptor
 *
 * @example
 * ```ts
 * import { auditLog } from "./plugins/audit";
 *
 * const plugins = [
 *   auditLog(),
 *   // ... other plugins
 * ];
 * ```
 */
export function auditLog(options?: AuditLogPluginOptions): BetterAuthPlugin {
	const autoLog = options?.autoLog !== false;
	const autoLogActions = options?.autoLogActions ?? [];

	return {
		id: "banata-audit-log",

		// ─── Schema Registration ──────────────────────────────────
		schema: {
			auditEvent: {
				fields: {
					projectId: { type: "string" as const, required: false },
					action: { type: "string", required: true },
					version: { type: "number", required: false },
					actorType: { type: "string", required: true },
					actorId: { type: "string", required: true },
					actorName: { type: "string", required: false },
					actorEmail: { type: "string", required: false },
					actorMetadata: { type: "string", required: false },
					targets: { type: "string", required: false },
					organizationId: { type: "string", required: false },
					ipAddress: { type: "string", required: false },
					userAgent: { type: "string", required: false },
					requestId: { type: "string", required: false },
					changes: { type: "string", required: false },
					idempotencyKey: { type: "string", required: false },
					metadata: { type: "string", required: false },
					occurredAt: { type: "number", required: true },
					createdAt: { type: "number", required: true },
				},
			},
		},

		// ── Custom API Endpoints ────────────────────────────────────
		endpoints: {
			/**
			 * List audit events with optional filters.
			 *
			 * POST /api/auth/banata/audit-logs/list
			 *
			 * Supports filtering by organizationId, action, actorId,
			 * and pagination via limit/after/before cursors.
			 */
			listAuditLogs: createAuthEndpoint(
				"/banata/audit-logs/list",
				{
					method: "POST",
					requireHeaders: true,
					body: listAuditLogsSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "audit.read",
						projectId: scope.projectId,
					});

					// Build where clause from optional filters + project scope
					const filters: WhereClause[] = [...scope.where];
					if (body.organizationId) {
						filters.push({ field: "organizationId", value: body.organizationId });
					}
					if (body.action) {
						filters.push({ field: "action", value: body.action });
					}
					if (body.actorId) {
						filters.push({ field: "actorId", value: body.actorId });
					}

					const limit = body.limit ?? 50;

					const events = await db.findMany<AuditEventRow>({
						model: "auditEvent",
						where: filters,
						limit,
						sortBy: { field: "occurredAt", direction: "desc" },
					});

					return ctx.json({
						data: events,
						listMetadata: { before: null, after: null },
					});
				},
			),

			/**
			 * Create a new audit event manually.
			 *
			 * POST /api/auth/banata/audit-logs/create
			 *
			 * Used for logging custom application events that don't
			 * originate from Better Auth endpoints (e.g., API key usage,
			 * resource access, policy changes).
			 */
			createAuditLog: createAuthEndpoint(
				"/banata/audit-logs/create",
				{
					method: "POST",
					requireHeaders: true,
					body: createAuditLogSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "audit.read",
						projectId: scope.projectId,
					});

					// Build data object, omitting optional fields when absent.
					// Convex v.optional() accepts undefined but NOT null.
					const data: Record<string, unknown> = {
						...scope.data,
						action: body.action,
						version: 1,
						actorType: body.actorType,
						actorId: body.actorId,
						occurredAt: body.occurredAt ?? now,
						createdAt: now,
					};
					if (body.actorName) data.actorName = body.actorName;
					if (body.actorEmail) data.actorEmail = body.actorEmail;
					if (body.targets) data.targets = body.targets;
					if (body.organizationId) data.organizationId = body.organizationId;
					if (body.ipAddress) data.ipAddress = body.ipAddress;
					if (body.userAgent) data.userAgent = body.userAgent;
					if (body.changes) data.changes = body.changes;
					if (body.idempotencyKey) data.idempotencyKey = body.idempotencyKey;
					if (body.metadata) data.metadata = body.metadata;

					const event = await db.create<AuditEventRow>({
						model: "auditEvent",
						data: data as AuditEventRow,
					});

					return ctx.json(event);
				},
			),

			/**
			 * Export audit events for compliance / reporting.
			 *
			 * POST /api/auth/banata/audit-logs/export
			 *
			 * Returns up to 10 000 events matching the given filters.
			 * Consumers can pass startDate/endDate (epoch ms) for
			 * time-range scoping and a format hint (reserved for future
			 * CSV/JSON format support).
			 */
			exportAuditLogs: createAuthEndpoint(
				"/banata/audit-logs/export",
				{
					method: "POST",
					requireHeaders: true,
					body: exportAuditLogsSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const pageLimit = body.limit ?? 1000;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "audit.read",
						projectId: scope.projectId,
					});

					const filters: WhereClause[] = [...scope.where];
					if (body.organizationId) {
						filters.push({
							field: "organizationId",
							value: body.organizationId,
						});
					}
					if (body.action) {
						filters.push({ field: "action", value: body.action });
					}
					// Cursor-based pagination: only fetch events older than the cursor
					if (body.cursor !== undefined) {
						filters.push({
							field: "occurredAt",
							operator: "lt" as const,
							value: body.cursor,
						});
					}

					const events = await db.findMany<AuditEventRow>({
						model: "auditEvent",
						where: filters,
						limit: pageLimit,
						sortBy: { field: "occurredAt", direction: "desc" },
					});

					// If we got a full page, provide a cursor for the next page
					const lastEvent = events[events.length - 1];
					const nextCursor =
						events.length === pageLimit && lastEvent ? (lastEvent.occurredAt as number) : null;

					return ctx.json({
						data: events,
						count: events.length,
						nextCursor,
					});
				},
			),
		},

		// ── Automatic Auth Event Logging ────────────────────────────
		hooks: {
			after: [
				{
					matcher: () => true,
					handler: createAuthMiddleware(async (ctx) => {
						if (!autoLog) return;

						// Only log when there is an authenticated session
						const sessionData = ctx.context?.session;
						if (!sessionData) return;

						const path: string = (ctx as unknown as { path?: string }).path ?? "";
						const action = pathToAction(path);
						if (!action) return;

						// If a whitelist is configured, only log listed actions
						if (autoLogActions.length > 0 && !autoLogActions.includes(action)) {
							return;
						}

						try {
							const db = ctx.context.adapter as unknown as PluginDBAdapter;
							const sessionRecord = sessionData.session;
							// Build data object, omitting optional fields when absent.
							// Convex v.optional() accepts undefined but NOT null.
							const auditData: Record<string, unknown> = {
								action,
								version: 1,
								actorType: "user",
								actorId: sessionRecord.userId ?? "unknown",
								occurredAt: Date.now(),
								createdAt: Date.now(),
							};
							// Include projectId from the request body if available
							const reqBody = (ctx as unknown as { body?: Record<string, unknown> }).body;
							if (reqBody?.projectId && typeof reqBody.projectId === "string") {
								auditData.projectId = reqBody.projectId;
							}
							const orgId = (sessionRecord as Record<string, unknown>).activeOrganizationId as
								| string
								| undefined;
							if (orgId) auditData.organizationId = orgId;
							const ip = ctx.headers?.get("x-forwarded-for");
							if (ip) auditData.ipAddress = ip;
							const ua = ctx.headers?.get("user-agent");
							if (ua) auditData.userAgent = ua;

							await db.create<AuditEventRow>({
								model: "auditEvent",
								data: auditData as AuditEventRow,
							});
						} catch (err) {
							// Audit logging should never break auth flows.
							console.error(
								"[BanataAuth] Auto-log audit event failed:",
								action,
								err instanceof Error ? err.message : "unknown error",
							);
						}
					}),
				},
			],
		},
	};
}

// ─── Helper: logAuditEvent ──────────────────────────────────────────

/**
 * Parameters for the `logAuditEvent` helper.
 *
 * Maps directly to the `auditEvent` table columns defined in
 * the component schema (see `src/component/schema.ts`).
 */
export interface LogAuditEventParams {
	/** Optional project scope for multi-tenant isolation. */
	projectId?: string;
	action: string;
	actorType: "user" | "admin" | "system" | "api_key" | "scim";
	actorId: string;
	actorName?: string;
	actorEmail?: string;
	actorMetadata?: Record<string, string>;
	targets?: Array<{
		type: string;
		id: string;
		name?: string;
		metadata?: Record<string, string>;
	}>;
	organizationId?: string;
	ipAddress?: string;
	userAgent?: string;
	requestId?: string;
	changes?: { before?: Record<string, unknown>; after?: Record<string, unknown> };
	idempotencyKey?: string;
	metadata?: Record<string, string>;
}

/**
 * Log an audit event from a Better Auth hook or trigger handler.
 *
 * This helper can be called from Better Auth hooks, Convex triggers,
 * or any code that has access to the database adapter to create an
 * audit event record without going through the HTTP endpoint.
 *
 * @param adapter - The Better Auth database adapter (ctx.context.adapter)
 * @param params  - The audit event data
 *
 * @example
 * ```ts
 * import { logAuditEvent } from "./plugins/audit";
 *
 * // Inside a Better Auth hook or trigger:
 * await logAuditEvent(ctx.context.adapter, {
 *   action: "user.login",
 *   actorType: "user",
 *   actorId: user.id,
 *   actorEmail: user.email,
 *   ipAddress: request.headers.get("x-forwarded-for"),
 * });
 * ```
 */
export async function logAuditEvent(
	adapter: Pick<PluginDBAdapter, "create">,
	params: LogAuditEventParams,
): Promise<void> {
	const now = Date.now();

	try {
		// Build data object, omitting optional fields when absent.
		// Convex v.optional() accepts undefined but NOT null.
		const data: Record<string, unknown> = {
			action: params.action,
			version: 1,
			actorType: params.actorType,
			actorId: params.actorId,
			occurredAt: now,
			createdAt: now,
		};
		if (params.projectId) data.projectId = params.projectId;
		if (params.actorName) data.actorName = params.actorName;
		if (params.actorEmail) data.actorEmail = params.actorEmail;
		if (params.actorMetadata) data.actorMetadata = JSON.stringify(params.actorMetadata);
		if (params.targets) data.targets = JSON.stringify(params.targets);
		if (params.organizationId) data.organizationId = params.organizationId;
		if (params.ipAddress) data.ipAddress = params.ipAddress;
		if (params.userAgent) data.userAgent = params.userAgent;
		if (params.requestId) data.requestId = params.requestId;
		if (params.changes) data.changes = JSON.stringify(params.changes);
		if (params.idempotencyKey) data.idempotencyKey = params.idempotencyKey;
		if (params.metadata) data.metadata = JSON.stringify(params.metadata);

		await adapter.create({
			model: "auditEvent",
			data,
		});
	} catch {
		// Audit logging should never break auth flows
		console.error("[BanataAuth] Failed to log audit event:", params.action);
	}
}
