/**
 * Bridge between Banata Auth triggers and Better Auth's databaseHooks.
 *
 * Better Auth provides databaseHooks that fire when database operations occur.
 * This module converts BanataAuthTriggers into the databaseHooks format.
 *
 * @see https://www.better-auth.com/docs/concepts/database-hooks
 */

import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import type { GenericDataModel } from "convex/server";
import type {
	BanataAuthTriggers,
	TriggerMember,
	TriggerOrganization,
	TriggerSession,
	TriggerUser,
} from "./triggers";
import { createTriggerContext, executeTrigger } from "./triggers";

// ─── Database Hook Record Types ─────────────────────────────────────
// Better Auth passes raw database records to hook callbacks.
// We type these as Record<string, unknown> and map them through
// the trigger conversion functions for safety.

/**
 * Map a raw database record to a TriggerUser shape.
 */
function toTriggerUser(record: Record<string, unknown>): TriggerUser {
	return {
		_id: String(record.id ?? record._id ?? ""),
		name: String(record.name ?? ""),
		email: String(record.email ?? ""),
		emailVerified: Boolean(record.emailVerified),
		image: record.image as string | undefined,
		username: record.username as string | undefined,
		role: record.role as string | undefined,
		banned: record.banned as boolean | undefined,
		twoFactorEnabled: record.twoFactorEnabled as boolean | undefined,
		isAnonymous: record.isAnonymous as boolean | undefined,
		metadata: record.metadata as TriggerUser["metadata"],
		createdAt: Number(record.createdAt ?? Date.now()),
		updatedAt: Number(record.updatedAt ?? Date.now()),
	};
}

/**
 * Map a raw database record to a TriggerSession shape.
 */
function toTriggerSession(record: Record<string, unknown>): TriggerSession {
	return {
		_id: String(record.id ?? record._id ?? ""),
		userId: String(record.userId ?? ""),
		expiresAt: Number(record.expiresAt ?? 0),
		ipAddress: record.ipAddress as string | undefined,
		userAgent: record.userAgent as string | undefined,
		activeOrganizationId: record.activeOrganizationId as string | undefined,
		impersonatedBy: record.impersonatedBy as string | undefined,
		createdAt: Number(record.createdAt ?? Date.now()),
		updatedAt: Number(record.updatedAt ?? Date.now()),
	};
}

/**
 * Map a raw database record to a TriggerOrganization shape.
 */
function toTriggerOrganization(record: Record<string, unknown>): TriggerOrganization {
	return {
		_id: String(record.id ?? record._id ?? ""),
		name: String(record.name ?? ""),
		slug: String(record.slug ?? ""),
		logo: record.logo as string | undefined,
		metadata: record.metadata as TriggerOrganization["metadata"],
		createdAt: Number(record.createdAt ?? Date.now()),
		updatedAt: Number(record.updatedAt ?? Date.now()),
	};
}

/**
 * Map a raw database record to a TriggerMember shape.
 */
function toTriggerMember(record: Record<string, unknown>): TriggerMember {
	return {
		_id: String(record.id ?? record._id ?? ""),
		organizationId: String(record.organizationId ?? ""),
		userId: String(record.userId ?? ""),
		role: String(record.role ?? ""),
		createdAt: Number(record.createdAt ?? Date.now()),
		updatedAt: Number(record.updatedAt ?? Date.now()),
	};
}

/**
 * Safely convert a hook callback argument to a Record<string, unknown>.
 *
 * Better Auth's databaseHooks pass the raw database record as the
 * callback argument. The exact shape depends on the table/model.
 * We normalize it to Record<string, unknown> for safe access.
 */
function toRecord(value: unknown): Record<string, unknown> {
	if (typeof value === "object" && value !== null) {
		return value as Record<string, unknown>;
	}
	return {};
}

// ─── Hook Builder Types ─────────────────────────────────────────────
// Better Auth's databaseHooks type is:
//   { [model: string]: { create?: { after?; before? }; update?: { after?; before? } } }
// The callback signature is (record: T) => void | Promise<void>
// where T depends on the model. Since these are runtime records from
// the database adapter, we accept `unknown` and normalize.

interface ModelHookCallbacks {
	create?: {
		after?: (record: unknown) => Promise<void>;
	};
	update?: {
		after?: (record: unknown) => Promise<void>;
	};
}

interface DatabaseHooksMap {
	user: ModelHookCallbacks;
	session: ModelHookCallbacks;
	organization: ModelHookCallbacks;
	member: ModelHookCallbacks;
}

/**
 * Create Better Auth databaseHooks from Banata Auth triggers.
 *
 * This bridges the two systems: when Better Auth fires a database hook
 * (e.g., after creating a user), the corresponding trigger handler is
 * invoked with a properly typed TriggerContext.
 *
 * @param ctx - Convex function context (for creating TriggerContext)
 * @param triggers - The registered trigger handlers
 * @returns BetterAuthOptions["databaseHooks"] compatible object
 */
export function createDatabaseHooks(
	ctx: GenericCtx<GenericDataModel>,
	triggers: BanataAuthTriggers | undefined,
): BetterAuthOptions["databaseHooks"] {
	if (!triggers) return undefined;

	const triggerCtx = createTriggerContext(ctx);

	const hooks: DatabaseHooksMap = {
		user: {
			create: {
				after: async (record: unknown) => {
					await executeTrigger(
						"onUserCreated",
						triggers.onUserCreated,
						triggerCtx,
						toTriggerUser(toRecord(record)),
					);
				},
			},
			update: {
				after: async (record: unknown) => {
					// Better Auth's update hook doesn't provide oldUser,
					// so we pass the updated user for both old and new.
					// Consumers who need the old value should use Convex triggers directly.
					const triggerUser = toTriggerUser(toRecord(record));
					await executeTrigger("onUserUpdated", triggers.onUserUpdated, triggerCtx, {
						oldUser: triggerUser,
						newUser: triggerUser,
					});
				},
			},
		},
		session: {
			create: {
				after: async (record: unknown) => {
					await executeTrigger(
						"onSessionCreated",
						triggers.onSessionCreated,
						triggerCtx,
						toTriggerSession(toRecord(record)),
					);
				},
			},
		},
		organization: {
			create: {
				after: async (record: unknown) => {
					await executeTrigger(
						"onOrganizationCreated",
						triggers.onOrganizationCreated,
						triggerCtx,
						toTriggerOrganization(toRecord(record)),
					);
				},
			},
			update: {
				after: async (record: unknown) => {
					const triggerOrg = toTriggerOrganization(toRecord(record));
					await executeTrigger(
						"onOrganizationUpdated",
						triggers.onOrganizationUpdated,
						triggerCtx,
						{
							oldOrg: triggerOrg,
							newOrg: triggerOrg,
						},
					);
				},
			},
		},
		member: {
			create: {
				after: async (record: unknown) => {
					await executeTrigger(
						"onMemberAdded",
						triggers.onMemberAdded,
						triggerCtx,
						toTriggerMember(toRecord(record)),
					);
				},
			},
		},
	};

	// Cast through unknown to satisfy BetterAuthOptions["databaseHooks"]
	// which uses a mapped type over all model names. Our hooks object
	// provides the correct runtime structure but TypeScript cannot verify
	// the mapped type statically without importing internal BA types.
	return hooks as unknown as BetterAuthOptions["databaseHooks"];
}
