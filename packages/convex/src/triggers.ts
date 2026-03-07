/**
 * Convex trigger system for Banata Auth lifecycle events.
 *
 * Triggers allow consumers to run custom logic when auth-related
 * events occur (user created, user updated, session created, etc.).
 * These are modeled after Convex's trigger pattern.
 *
 * @example
 * ```ts
 * import { defineBanataAuthTriggers } from "@banata-auth/convex/triggers";
 *
 * export const triggers = defineBanataAuthTriggers({
 *   onUserCreated: async (ctx, user) => {
 *     // Send welcome email, create default org, etc.
 *     console.log("New user:", user.email);
 *   },
 *   onUserUpdated: async (ctx, { oldUser, newUser }) => {
 *     // Sync user data to external systems
 *   },
 *   onSessionCreated: async (ctx, session) => {
 *     // Log sign-in event
 *   },
 * });
 * ```
 */

import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { FunctionReference, GenericDataModel } from "convex/server";

// ─── Trigger Event Types ────────────────────────────────────────────

/** Structured metadata for trigger data. */
export type TriggerMetadata = Record<string, string | number | boolean | null>;

export interface TriggerUser {
	_id: string;
	name: string;
	email: string;
	emailVerified: boolean;
	image?: string;
	username?: string;
	role?: string;
	banned?: boolean;
	twoFactorEnabled?: boolean;
	isAnonymous?: boolean;
	metadata?: TriggerMetadata;
	createdAt: number;
	updatedAt: number;
}

export interface TriggerSession {
	_id: string;
	userId: string;
	expiresAt: number;
	ipAddress?: string;
	userAgent?: string;
	activeOrganizationId?: string;
	impersonatedBy?: string;
	createdAt: number;
	updatedAt: number;
}

export interface TriggerOrganization {
	_id: string;
	name: string;
	slug: string;
	logo?: string;
	metadata?: TriggerMetadata;
	createdAt: number;
	updatedAt: number;
}

export interface TriggerMember {
	_id: string;
	organizationId: string;
	userId: string;
	role: string;
	createdAt: number;
	updatedAt: number;
}

// ─── Trigger Handler Types ──────────────────────────────────────────

/**
 * Context provided to trigger handlers.
 * This is a subset of the Convex mutation context, fully typed.
 */
export interface TriggerContext {
	/** Run a Convex query. */
	runQuery: <Args extends Record<string, unknown>, Output>(
		query: FunctionReference<"query", "public" | "internal", Args, Output>,
		args: Args,
	) => Promise<Output>;
	/** Run a Convex mutation. */
	runMutation: <Args extends Record<string, unknown>, Output>(
		mutation: FunctionReference<"mutation", "public" | "internal", Args, Output>,
		args: Args,
	) => Promise<Output>;
	/** Run a Convex action. */
	runAction: <Args extends Record<string, unknown>, Output>(
		action: FunctionReference<"action", "public" | "internal", Args, Output>,
		args: Args,
	) => Promise<Output>;
	/** Schedule a function to run later. */
	scheduler: {
		runAfter: <Args extends Record<string, unknown>>(
			delayMs: number,
			fn: FunctionReference<"mutation" | "action", "public" | "internal", Args>,
			args: Args,
		) => Promise<string>;
		runAt: <Args extends Record<string, unknown>>(
			timestamp: number,
			fn: FunctionReference<"mutation" | "action", "public" | "internal", Args>,
			args: Args,
		) => Promise<string>;
	};
}

export interface BanataAuthTriggers {
	/** Fired when a new user is created (sign-up, OAuth first login, SCIM provisioning). */
	onUserCreated?: (ctx: TriggerContext, user: TriggerUser) => Promise<void>;

	/** Fired when a user is updated (profile change, role change, ban/unban). */
	onUserUpdated?: (
		ctx: TriggerContext,
		data: { oldUser: TriggerUser; newUser: TriggerUser },
	) => Promise<void>;

	/** Fired when a user is deleted. */
	onUserDeleted?: (ctx: TriggerContext, user: TriggerUser) => Promise<void>;

	/** Fired when a new session is created (sign-in). */
	onSessionCreated?: (ctx: TriggerContext, session: TriggerSession) => Promise<void>;

	/** Fired when a session is revoked (sign-out). */
	onSessionRevoked?: (ctx: TriggerContext, session: TriggerSession) => Promise<void>;

	/** Fired when an organization is created. */
	onOrganizationCreated?: (ctx: TriggerContext, org: TriggerOrganization) => Promise<void>;

	/** Fired when an organization is updated. */
	onOrganizationUpdated?: (
		ctx: TriggerContext,
		data: { oldOrg: TriggerOrganization; newOrg: TriggerOrganization },
	) => Promise<void>;

	/** Fired when an organization is deleted. */
	onOrganizationDeleted?: (ctx: TriggerContext, org: TriggerOrganization) => Promise<void>;

	/** Fired when a member is added to an organization. */
	onMemberAdded?: (ctx: TriggerContext, member: TriggerMember) => Promise<void>;

	/** Fired when a member is removed from an organization. */
	onMemberRemoved?: (ctx: TriggerContext, member: TriggerMember) => Promise<void>;

	/** Fired when a member's role changes. */
	onMemberRoleChanged?: (
		ctx: TriggerContext,
		data: { member: TriggerMember; oldRole: string; newRole: string },
	) => Promise<void>;

	/** Fired when email verification completes. */
	onEmailVerified?: (ctx: TriggerContext, user: TriggerUser) => Promise<void>;

	/** Fired when two-factor auth is enabled for a user. */
	onTwoFactorEnabled?: (ctx: TriggerContext, user: TriggerUser) => Promise<void>;

	/** Fired when two-factor auth is disabled for a user. */
	onTwoFactorDisabled?: (ctx: TriggerContext, user: TriggerUser) => Promise<void>;
}

// ─── Trigger Registration ───────────────────────────────────────────

/**
 * Define lifecycle triggers for Banata Auth events.
 *
 * This function validates and returns the trigger configuration
 * that will be used by the Banata Auth component to fire lifecycle hooks.
 *
 * @param triggers - The trigger handlers to register
 * @returns The validated trigger configuration
 */
export function defineBanataAuthTriggers(triggers: BanataAuthTriggers): BanataAuthTriggers {
	return triggers;
}

/**
 * Execute a trigger handler safely.
 *
 * This wraps trigger execution with error handling so that a failing
 * trigger doesn't break the auth flow. Errors are logged but not thrown.
 *
 * @internal
 */
export async function executeTrigger<T>(
	triggerName: string,
	handler: ((ctx: TriggerContext, data: T) => Promise<void>) | undefined,
	ctx: TriggerContext,
	data: T,
): Promise<void> {
	if (!handler) return;

	try {
		await handler(ctx, data);
	} catch (error) {
		// Log but don't throw — triggers should not break auth flows
		console.error(
			`[BanataAuth] Trigger "${triggerName}" failed:`,
			error instanceof Error ? error.message : String(error),
		);
	}
}

/**
 * Create a TriggerContext from a Convex GenericCtx.
 *
 * This adapts the Convex function context to the trigger context shape
 * expected by trigger handlers.
 *
 * @internal
 */
export function createTriggerContext(ctx: GenericCtx<GenericDataModel>): TriggerContext {
	// The GenericCtx union (query | mutation | action) doesn't guarantee all
	// methods exist. We cast to the widest shape — at runtime, the actual
	// context will have the right methods based on the calling function type.
	const ctxRecord = ctx as unknown as Record<string, unknown>;

	return {
		runQuery: (ctxRecord.runQuery ?? noop) as TriggerContext["runQuery"],
		runMutation: (ctxRecord.runMutation ?? noop) as TriggerContext["runMutation"],
		runAction: (ctxRecord.runAction ?? noop) as TriggerContext["runAction"],
		scheduler: (ctxRecord.scheduler ?? {
			runAfter: noop,
			runAt: noop,
		}) as TriggerContext["scheduler"],
	};
}

async function noop(): Promise<never> {
	throw new Error(
		"[BanataAuth] This context method is not available in the current function type.",
	);
}
