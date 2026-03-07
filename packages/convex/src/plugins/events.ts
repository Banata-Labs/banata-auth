/**
 * Events plugin for Banata Auth.
 *
 * Provides a unified event stream API that queries the existing `auditEvent`
 * table and maps records into lightweight `WebhookEvent`-compatible shapes.
 *
 * This gives consumers a simple, poll-based alternative to webhooks —
 * similar to WorkOS's Events API. Under the hood, events are sourced from
 * audit log records stored by the audit plugin.
 *
 * @see {@link ./audit.ts} for the underlying audit log plugin
 * @see {@link ../../../shared/src/types.ts} for the WebhookEvent SDK type
 */

import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import {
	type AuditEventRow,
	type PluginDBAdapter,
	type WhereClause,
	getProjectScope,
	projectScopeSchema,
	requireProjectPermission,
} from "./types";

// ─── Zod Schemas ────────────────────────────────────────────────────

const listEventsSchema = z
	.object({
		/** Filter by one or more event types (action strings). */
		eventTypes: z.array(z.string()).optional(),
		/** Cursor for forward pagination — pass the last event's ID. */
		after: z.string().optional(),
		/** Maximum number of events to return. Default: 50, max: 200. */
		limit: z.number().int().positive().max(200).optional(),
		/** Filter by organization. */
		organizationId: z.string().optional(),
		/** Range start (epoch ms). */
		rangeStart: z.number().optional(),
		/** Range end (epoch ms). */
		rangeEnd: z.number().optional(),
	})
	.merge(projectScopeSchema);

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Map an audit event row to a lightweight event payload.
 */
/** @internal Exported for testing. */
export function toEventPayload(row: AuditEventRow): Record<string, unknown> {
	return {
		id: row.id,
		type: row.action,
		data: {
			actorType: row.actorType,
			actorId: row.actorId,
			actorName: row.actorName,
			actorEmail: row.actorEmail,
			organizationId: row.organizationId,
			targets: row.targets ? safeJsonParse(row.targets as string) : undefined,
			changes: row.changes ? safeJsonParse(row.changes as string) : undefined,
			metadata: row.metadata ? safeJsonParse(row.metadata as string) : undefined,
			ipAddress: row.ipAddress,
			userAgent: row.userAgent,
		},
		createdAt: row.occurredAt ?? row.createdAt,
	};
}

function safeJsonParse(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}

// ─── Plugin Factory ─────────────────────────────────────────────────

/**
 * Events plugin for Banata Auth.
 *
 * Registers a single API endpoint under `/api/auth/banata/events/list`
 * that exposes audit events as a lightweight, pollable event stream.
 *
 * @returns A Better Auth plugin descriptor
 *
 * @example
 * ```ts
 * import { eventsPlugin } from "./plugins/events";
 *
 * const plugins = [
 *   eventsPlugin(),
 *   // ... other plugins
 * ];
 * ```
 */
export function eventsPlugin(): BetterAuthPlugin {
	return {
		id: "banata-events",

		// No additional schema — events are sourced from the auditEvent table.

		endpoints: {
			/**
			 * List events with optional filters.
			 *
			 * POST /api/auth/banata/events/list
			 *
			 * Returns a paginated list of events with cursor-based pagination.
			 */
			listEvents: createAuthEndpoint(
				"/banata/events/list",
				{
					method: "POST",
					body: listEventsSchema,
					requireHeaders: true,
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

					const limit = Math.min(body.limit ?? 50, 200);
					const filters: WhereClause[] = [...scope.where];

					// Filter by event types (action strings)
					if (body.eventTypes && body.eventTypes.length > 0) {
						if (body.eventTypes.length === 1) {
							filters.push({ field: "action", value: body.eventTypes[0]! });
						} else {
							filters.push({
								field: "action",
								operator: "in" as const,
								value: body.eventTypes,
							});
						}
					}

					// Filter by organization
					if (body.organizationId) {
						filters.push({ field: "organizationId", value: body.organizationId });
					}

					// Date range filters
					if (body.rangeStart !== undefined) {
						filters.push({
							field: "occurredAt",
							operator: "gte" as const,
							value: body.rangeStart,
						});
					}
					if (body.rangeEnd !== undefined) {
						filters.push({
							field: "occurredAt",
							operator: "lte" as const,
							value: body.rangeEnd,
						});
					}

					// Cursor-based pagination: fetch events created after the cursor
					// "after" here is the ID of the last event from the previous page.
					// We use occurredAt desc, so we need events with occurredAt < cursor's occurredAt.
					if (body.after) {
						// Look up the cursor event to get its occurredAt
						const cursorRows = await db.findMany<AuditEventRow>({
							model: "auditEvent",
							where: [{ field: "id", value: body.after }, ...scope.where],
							limit: 1,
						});
						if (cursorRows[0]) {
							filters.push({
								field: "occurredAt",
								operator: "lt" as const,
								value: cursorRows[0].occurredAt,
							});
						}
					}

					const rows = await db.findMany<AuditEventRow>({
						model: "auditEvent",
						where: filters,
						limit: limit + 1, // Fetch one extra to determine hasMore
						sortBy: { field: "occurredAt", direction: "desc" },
					});

					const hasMore = rows.length > limit;
					const events = hasMore ? rows.slice(0, limit) : rows;
					const lastEvent = events[events.length - 1];
					const cursor = lastEvent ? (lastEvent.id as string) : undefined;

					return ctx.json({
						data: events.map(toEventPayload),
						cursor: hasMore ? cursor : undefined,
						hasMore,
					});
				},
			),
		},
	};
}
