import { internalMutationGeneric } from "convex/server";
import { v } from "convex/values";

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

const TABLES_WITH_PROJECT_ID = [
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

export const backfillProjectId = internalMutationGeneric({
	args: {
		targetProjectId: v.optional(v.string()),
		startFromTable: v.optional(v.string()),
		batchSize: v.optional(v.float64()),
	},
	handler: async (ctx, args) => {
		const maxBatch = args.batchSize ?? 500;

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
		}

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
			const records = await ctx.db
				.query(table as never)
				.withIndex(
					"projectId" as never,
					((q: { eq: (field: string, value: unknown) => unknown }) =>
						(q as { eq: (field: string, value: unknown) => unknown }).eq(
							"projectId",
							undefined,
						)) as never,
				)
				.take(maxBatch - totalPatched);

			if (records.length === 0) {
				continue;
			}

			for (const record of records) {
				await ctx.db.patch(record._id, { projectId } as never);
				totalPatched++;
			}

			if (totalPatched >= maxBatch) {
				return {
					done: false,
					nextTable: table,
					patched: totalPatched,
					projectId,
				};
			}
		}

		return { done: true, patched: totalPatched, projectId };
	},
});

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

export const removeEnvironmentIds = internalMutationGeneric({
	args: {},
	handler: async (ctx) => {
		let totalCleaned = 0;

		for (const table of TABLES_WITH_ENVIRONMENT_ID) {
			const allRecords = await ctx.db.query(table as never).collect();

			for (const record of allRecords) {
				if ((record as Record<string, unknown>).environmentId !== undefined) {
					await ctx.db.patch(record._id, { environmentId: undefined } as never);
					totalCleaned++;
				}
			}
		}

		return { done: true, cleaned: totalCleaned };
	},
});

export const clearAllData = internalMutationGeneric({
	args: {
		startFromTable: v.optional(v.string()),
		batchSize: v.optional(v.float64()),
	},
	handler: async (ctx, args) => {
		const maxBatch = args.batchSize ?? 500;

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

			const records = await ctx.db.query(table as never).take(remaining);
			for (const record of records) {
				await ctx.db.delete(record._id);
				totalDeleted++;
			}

			const moreExist = await ctx.db.query(table as never).first();
			if (moreExist) {
				return {
					done: false,
					nextTable: table,
					deleted: totalDeleted,
				};
			}
		}

		return { done: true, deleted: totalDeleted };
	},
});
