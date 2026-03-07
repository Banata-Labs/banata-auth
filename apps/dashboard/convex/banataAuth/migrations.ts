/**
 * Migrations for the banataAuth component.
 *
 * These run INSIDE the component and have direct ctx.db access to all
 * component tables. The parent app invokes them via:
 *   ctx.runMutation(components.banataAuth.migrations.<name>, args)
 *
 * To run from CLI:
 *   npx convex run --component banataAuth migrations:backfillProjectId
 *   npx convex run --component banataAuth migrations:removeEnvironmentIds
 *   npx convex run --component banataAuth migrations:clearAllData
 */
import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// ─── All tables in the component ────────────────────────────────────────
const ALL_TABLES = [
	"project",
	"user",
	"session",
	"account",
	"verification",
	"twoFactor",
	"passkey",
	"jwks",
	"rateLimit",
	"apikey",
	"organization",
	"member",
	"invitation",
	"ssoProvider",
	"scimProvider",
	"auditEvent",
	"webhookEndpoint",
	"webhookDelivery",
	"roleDefinition",
	"permissionDefinition",
	"brandingConfig",
	"emailTemplate",
	"emailConfig",
	"dashboardConfig",
	"domainConfig",
	"redirectConfig",
	"actionConfig",
	"radarConfig",
	"emailProviderConfig",
	"resourceType",
	"addonConfig",
	"projectConfig",
	"vaultSecret",
	"domainVerification",
] as const;

// ─── Tables that have a projectId field (all except "project" itself) ────
// Ordered roughly by importance / likelihood of having data.
const TABLES_WITH_PROJECT_ID = [
	// Core auth
	"user",
	"session",
	"account",
	"verification",
	// Plugins
	"twoFactor",
	"passkey",
	"jwks",
	"rateLimit",
	"apikey",
	// Organizations
	"organization",
	"member",
	"invitation",
	// SSO/SCIM
	"ssoProvider",
	"scimProvider",
	// Audit & Webhooks
	"auditEvent",
	"webhookEndpoint",
	"webhookDelivery",
	// Config tables
	"roleDefinition",
	"permissionDefinition",
	"brandingConfig",
	"emailTemplate",
	"emailConfig",
	"dashboardConfig",
	"domainConfig",
	"redirectConfig",
	"actionConfig",
	"radarConfig",
	"emailProviderConfig",
	"resourceType",
	"addonConfig",
	"projectConfig",
	// Vault & Domains
	"vaultSecret",
	"domainVerification",
] as const;

/**
 * Backfill projectId on all records that are missing it.
 *
 * Strategy:
 * - If a targetProjectId is provided, use it directly.
 * - Otherwise, find the first project in the DB (sorted by createdAt) and use its _id.
 * - Scan each table for records where projectId is undefined.
 * - Patch them with the resolved projectId.
 *
 * This is idempotent — records that already have a projectId are skipped.
 *
 * Convex mutations have a time/write limit, so this processes tables in batches.
 * Pass `startFromTable` to resume from a specific table if the mutation times out.
 * The mutation returns { done: boolean, nextTable?: string, patched: number }
 * so you can call it repeatedly until done === true.
 *
 * Usage:
 *   npx convex run --component banataAuth migrations:backfillProjectId
 *   npx convex run --component banataAuth migrations:backfillProjectId '{"targetProjectId": "abc123"}'
 *   npx convex run --component banataAuth migrations:backfillProjectId '{"startFromTable": "organization"}'
 */
export const backfillProjectId = internalMutation({
	args: {
		targetProjectId: v.optional(v.string()),
		startFromTable: v.optional(v.string()),
		batchSize: v.optional(v.float64()),
	},
	handler: async (ctx, args) => {
		const maxBatch = args.batchSize ?? 500;

		// ── Resolve the target project ID ────────────────────────────
		let projectId = args.targetProjectId;
		if (!projectId) {
			const firstProject = await ctx.db.query("project").withIndex("createdAt").first();
			if (!firstProject) {
				return {
					done: true,
					patched: 0,
					error: "No projects found in the database. Create a project first.",
				};
			}
			projectId = firstProject._id;
			console.log(
				`[migration] No targetProjectId specified. Using first project: "${firstProject.name}" (${projectId})`,
			);
		}

		// ── Determine which tables to process ────────────────────────
		let tables: readonly string[] = TABLES_WITH_PROJECT_ID;
		if (args.startFromTable) {
			const idx = tables.indexOf(args.startFromTable);
			if (idx === -1) {
				return {
					done: true,
					patched: 0,
					error: `Unknown table: ${args.startFromTable}. Valid tables: ${tables.join(", ")}`,
				};
			}
			tables = tables.slice(idx);
		}

		let totalPatched = 0;

		for (const table of tables) {
			// Query records missing projectId
			// We use the projectId index to find records where projectId is undefined
			const records = await ctx.db
				.query(table as any)
				.withIndex("projectId", (q: any) => q.eq("projectId", undefined))
				.take(maxBatch - totalPatched);

			if (records.length === 0) {
				console.log(`[migration] ${table}: 0 records need backfill`);
				continue;
			}

			for (const record of records) {
				await ctx.db.patch(record._id, { projectId } as any);
				totalPatched++;
			}

			console.log(
				`[migration] ${table}: patched ${records.length} records with projectId=${projectId}`,
			);

			// If we hit the batch limit, tell the caller to resume from this table
			if (totalPatched >= maxBatch) {
				return {
					done: false,
					nextTable: table,
					patched: totalPatched,
					projectId,
				};
			}
		}

		console.log(`[migration] Backfill complete. Total patched: ${totalPatched}`);
		return { done: true, patched: totalPatched, projectId };
	},
});

/**
 * Remove stale environmentId fields from all records.
 * (Environments were removed from the product; this cleans up legacy data.)
 *
 * Tables that historically had environmentId:
 * - apikey, webhookEndpoint, dashboardConfig, domainConfig,
 *   redirectConfig, actionConfig, radarConfig, emailProviderConfig
 */
const TABLES_WITH_ENVIRONMENT_ID = [
	"apikey",
	"webhookEndpoint",
	"dashboardConfig",
	"domainConfig",
	"redirectConfig",
	"actionConfig",
	"radarConfig",
	"emailProviderConfig",
] as const;

export const removeEnvironmentIds = internalMutation({
	args: {},
	handler: async (ctx) => {
		let totalCleaned = 0;

		for (const table of TABLES_WITH_ENVIRONMENT_ID) {
			const allRecords = await ctx.db.query(table as any).collect();
			let tableCleaned = 0;

			for (const record of allRecords) {
				if ((record as any).environmentId !== undefined) {
					await ctx.db.patch(record._id, { environmentId: undefined } as any);
					tableCleaned++;
				}
			}

			if (tableCleaned > 0) {
				console.log(`[migration] ${table}: removed environmentId from ${tableCleaned} records`);
				totalCleaned += tableCleaned;
			}
		}

		console.log(`[migration] removeEnvironmentIds complete. Total cleaned: ${totalCleaned}`);
		return { done: true, cleaned: totalCleaned };
	},
});

/**
 * Delete ALL records from ALL tables in the component.
 * This is a nuclear option — wipes everything for a fresh start.
 *
 * Batched to stay within Convex mutation limits. Returns
 * { done: boolean, deleted: number, nextTable?: string }
 * so you can call it repeatedly until done === true.
 *
 * Usage:
 *   npx convex run --component banataAuth migrations:clearAllData
 *   npx convex run --component banataAuth migrations:clearAllData '{"startFromTable": "organization"}'
 */
export const clearAllData = internalMutation({
	args: {
		startFromTable: v.optional(v.string()),
		batchSize: v.optional(v.float64()),
	},
	handler: async (ctx, args) => {
		const maxBatch = args.batchSize ?? 500;

		// ── Determine which tables to process ────────────────────────
		let tables: readonly string[] = ALL_TABLES;
		if (args.startFromTable) {
			const idx = tables.indexOf(args.startFromTable);
			if (idx === -1) {
				return {
					done: true,
					deleted: 0,
					error: `Unknown table: ${args.startFromTable}. Valid tables: ${tables.join(", ")}`,
				};
			}
			tables = tables.slice(idx);
		}

		let totalDeleted = 0;

		for (const table of tables) {
			const remaining = maxBatch - totalDeleted;
			if (remaining <= 0) {
				return {
					done: false,
					nextTable: table,
					deleted: totalDeleted,
				};
			}

			const records = await ctx.db.query(table as any).take(remaining);

			if (records.length === 0) {
				console.log(`[migration] ${table}: already empty`);
				continue;
			}

			for (const record of records) {
				await ctx.db.delete(record._id);
				totalDeleted++;
			}

			console.log(`[migration] ${table}: deleted ${records.length} records`);

			// Check if there are more records in this table
			const moreExist = await ctx.db.query(table as any).first();
			if (moreExist) {
				// Table still has records, need to continue from this table
				return {
					done: false,
					nextTable: table,
					deleted: totalDeleted,
				};
			}
		}

		console.log(`[migration] clearAllData complete. Total deleted: ${totalDeleted}`);
		return { done: true, deleted: totalDeleted };
	},
});
