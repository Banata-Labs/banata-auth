import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { generateRandomString } from "better-auth/crypto";
import { z } from "zod";
import {
	type PluginDBAdapter,
	getProjectScope,
	projectScopeSchema,
	requireProjectPermission,
} from "./types";

interface DomainVerificationRow extends Record<string, unknown> {
	id: string;
	organizationId: string;
	domain: string;
	projectId?: string | null;
	state: "pending" | "verified" | "failed" | "expired";
	method: "dns_txt";
	txtRecordName: string;
	txtRecordValue: string;
	verifiedAt?: number | null;
	expiresAt?: number | null;
	lastCheckedAt?: number | null;
	checkCount?: number | null;
	createdAt: number;
	updatedAt: number;
}

interface OrganizationRow extends Record<string, unknown> {
	id: string;
	projectId?: string | null;
}

interface SSOProviderRow extends Record<string, unknown> {
	id: string;
	organizationId?: string | null;
	projectId?: string | null;
	domain: string;
	domainVerified?: boolean | null;
	updatedAt: number;
}

type DnsJsonAnswer = { data?: string };
type DnsJsonResponse = { Answer?: DnsJsonAnswer[] };

const TXT_PREFIX = "_better-auth-token";
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const createVerificationSchema = z
	.object({
		organizationId: z.string().min(1),
		domain: z.string().min(1),
	})
	.merge(projectScopeSchema);

const verificationIdSchema = z
	.object({
		id: z.string().min(1),
	})
	.merge(projectScopeSchema);

const listVerificationsSchema = z
	.object({
		organizationId: z.string().optional(),
		limit: z.number().optional(),
	})
	.merge(projectScopeSchema);

function normalizeDomain(domain: string) {
	return domain.trim().toLowerCase().replace(/^\*\./, "").replace(/\.$/, "");
}

function normalizeTxtAnswer(value: string) {
	return value.replace(/^"|"$/g, "").replace(/"\s+"/g, "");
}

function buildTxtRecordName(domain: string) {
	return `${TXT_PREFIX}.${normalizeDomain(domain)}`;
}

function serializeVerification(row: DomainVerificationRow) {
	return {
		id: row.id,
		organizationId: row.organizationId,
		domain: row.domain,
		state: row.state,
		method: row.method,
		txtRecord: {
			name: row.txtRecordName,
			value: row.txtRecordValue,
		},
		verifiedAt: row.verifiedAt ?? null,
		expiresAt: row.expiresAt ?? null,
		lastCheckedAt: row.lastCheckedAt ?? null,
		checkCount: row.checkCount ?? 0,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

async function ensureOrganizationInProject(
	db: PluginDBAdapter,
	organizationId: string,
	projectId: string,
) {
	const organization = await db.findOne<OrganizationRow>({
		model: "organization",
		where: [
			{ field: "id", value: organizationId },
			{ field: "projectId", value: projectId },
		],
	});
	if (!organization) {
		throw new Error("Organization not found for project scope");
	}
}

async function recomputeProviderDomainVerification(
	db: PluginDBAdapter,
	projectId: string,
	organizationId: string,
) {
	const [providers, verifiedRecords] = await Promise.all([
		db.findMany<SSOProviderRow>({
			model: "ssoProvider",
			where: [
				{ field: "projectId", value: projectId },
				{ field: "organizationId", value: organizationId },
			],
			limit: 500,
		}),
		db.findMany<DomainVerificationRow>({
			model: "domainVerification",
			where: [
				{ field: "projectId", value: projectId },
				{ field: "organizationId", value: organizationId },
				{ field: "state", value: "verified" },
			],
			limit: 500,
		}),
	]);

	const verifiedDomains = new Set(verifiedRecords.map((record) => normalizeDomain(record.domain)));
	const now = Date.now();

	for (const provider of providers) {
		const domains = provider.domain
			.split(",")
			.map((entry) => normalizeDomain(entry))
			.filter(Boolean);
		const nextValue = domains.length > 0 && domains.every((domain) => verifiedDomains.has(domain));
		if ((provider.domainVerified ?? false) === nextValue) {
			continue;
		}
		await db.update<SSOProviderRow>({
			model: "ssoProvider",
			where: [{ field: "id", value: provider.id }],
			update: {
				domainVerified: nextValue,
				updatedAt: now,
			},
		});
	}
}

async function fetchTxtAnswers(recordName: string): Promise<string[]> {
	const response = await fetch(
		`https://dns.google/resolve?name=${encodeURIComponent(recordName)}&type=TXT`,
		{
			headers: { accept: "application/dns-json" },
		},
	);
	if (!response.ok) {
		return [];
	}
	const payload = (await response.json()) as DnsJsonResponse;
	return (payload.Answer ?? [])
		.map((answer) => (typeof answer.data === "string" ? normalizeTxtAnswer(answer.data) : ""))
		.filter(Boolean);
}

export function domainsPlugin(): BetterAuthPlugin {
	return {
		id: "banata-domains",
		schema: {
			domainVerification: {
				fields: {
					organizationId: { type: "string" as const, required: true },
					domain: { type: "string" as const, required: true },
					projectId: { type: "string" as const, required: false },
					state: { type: "string" as const, required: true },
					method: { type: "string" as const, required: true },
					txtRecordName: { type: "string" as const, required: true },
					txtRecordValue: { type: "string" as const, required: true },
					verifiedAt: { type: "number" as const, required: false },
					expiresAt: { type: "number" as const, required: false },
					lastCheckedAt: { type: "number" as const, required: false },
					checkCount: { type: "number" as const, required: false },
					createdAt: { type: "number" as const, required: true },
					updatedAt: { type: "number" as const, required: true },
				},
			},
		},
		endpoints: {
			createVerification: createAuthEndpoint(
				"/banata/domains/create",
				{
					method: "POST", requireHeaders: true,
					body: createVerificationSchema,
					/* API-key auth handled by requireProjectPermission */
				},
				async (ctx) => {
					try {
						const db = ctx.context.adapter as unknown as PluginDBAdapter;
						const scope = getProjectScope(ctx.body);
						await requireProjectPermission(ctx, {
							db,
							projectId: scope.projectId,
							permission: "sso.manage",
						});
						await ensureOrganizationInProject(db, ctx.body.organizationId, scope.projectId!);

						const now = Date.now();
						const domain = normalizeDomain(ctx.body.domain);
						const recordData = {
							projectId: scope.projectId,
							organizationId: ctx.body.organizationId,
							domain,
							state: "pending" as const,
							method: "dns_txt" as const,
							txtRecordName: buildTxtRecordName(domain),
							txtRecordValue: generateRandomString(32),
							expiresAt: now + ONE_WEEK_MS,
							checkCount: 0,
							updatedAt: now,
						};

						const existing = await db.findOne<DomainVerificationRow>({
							model: "domainVerification",
							where: [
								{ field: "projectId", value: scope.projectId! },
								{ field: "organizationId", value: ctx.body.organizationId },
								{ field: "domain", value: domain },
							],
						});

						const record = existing
							? await db.update<DomainVerificationRow>({
									model: "domainVerification",
									where: [{ field: "id", value: existing.id }],
									update: recordData,
								})
							: await db.create<DomainVerificationRow>({
									model: "domainVerification",
									data: {
										...recordData,
										createdAt: now,
									},
								});

						if (!record) {
							throw ctx.error("INTERNAL_SERVER_ERROR", {
								message: "Failed to create domain verification",
							});
						}

						await recomputeProviderDomainVerification(db, scope.projectId!, ctx.body.organizationId);
						return ctx.json(serializeVerification(record));
					} catch (err) {
						if (err && typeof err === "object" && "status" in err) throw err;
						const message = err instanceof Error ? err.message : "Unknown error";
						return ctx.json({ error: message });
					}
				},
			),

			getVerification: createAuthEndpoint(
				"/banata/domains/get",
				{
					method: "POST", requireHeaders: true,
					body: verificationIdSchema,
					/* API-key auth handled by requireProjectPermission */
				},
				async (ctx) => {
					try {
						const db = ctx.context.adapter as unknown as PluginDBAdapter;
						const scope = getProjectScope(ctx.body);
						await requireProjectPermission(ctx, {
							db,
							projectId: scope.projectId,
							permission: "sso.read",
						});
						const record = await db.findOne<DomainVerificationRow>({
							model: "domainVerification",
							where: [
								{ field: "id", value: ctx.body.id },
								{ field: "projectId", value: scope.projectId! },
							],
						});
						if (!record) {
							throw ctx.error("NOT_FOUND", { message: "Domain verification not found" });
						}
						return ctx.json(serializeVerification(record));
					} catch (err) {
						if (err && typeof err === "object" && "status" in err) throw err;
						const message = err instanceof Error ? err.message : "Unknown error";
						return ctx.json({ error: message });
					}
				},
			),

			verifyDomain: createAuthEndpoint(
				"/banata/domains/verify",
				{
					method: "POST", requireHeaders: true,
					body: verificationIdSchema,
					/* API-key auth handled by requireProjectPermission */
				},
				async (ctx) => {
					try {
						const db = ctx.context.adapter as unknown as PluginDBAdapter;
						const scope = getProjectScope(ctx.body);
						await requireProjectPermission(ctx, {
							db,
							projectId: scope.projectId,
							permission: "sso.manage",
						});
						const record = await db.findOne<DomainVerificationRow>({
							model: "domainVerification",
							where: [
								{ field: "id", value: ctx.body.id },
								{ field: "projectId", value: scope.projectId! },
							],
						});
						if (!record) {
							throw ctx.error("NOT_FOUND", { message: "Domain verification not found" });
						}

						const now = Date.now();
						const answers = await fetchTxtAnswers(record.txtRecordName);
						const nextState = answers.includes(record.txtRecordValue)
							? "verified"
							: record.expiresAt != null && record.expiresAt < now
								? "expired"
								: "failed";
						const updated = await db.update<DomainVerificationRow>({
							model: "domainVerification",
							where: [{ field: "id", value: record.id }],
							update: {
								state: nextState,
								verifiedAt: nextState === "verified" ? now : undefined,
								lastCheckedAt: now,
								checkCount: (record.checkCount ?? 0) + 1,
								updatedAt: now,
							},
						});

						if (!updated) {
							throw ctx.error("INTERNAL_SERVER_ERROR", {
								message: "Failed to update domain verification",
							});
						}

						await recomputeProviderDomainVerification(
							db,
							scope.projectId!,
							record.organizationId,
						);
						return ctx.json(serializeVerification(updated));
					} catch (err) {
						if (err && typeof err === "object" && "status" in err) throw err;
						const message = err instanceof Error ? err.message : "Unknown error";
						return ctx.json({ error: message });
					}
				},
			),

			listVerifications: createAuthEndpoint(
				"/banata/domains/list",
				{
					method: "POST", requireHeaders: true,
					body: listVerificationsSchema,
					/* API-key auth handled by requireProjectPermission */
				},
				async (ctx) => {
					try {
						const db = ctx.context.adapter as unknown as PluginDBAdapter;
						const scope = getProjectScope(ctx.body);
						await requireProjectPermission(ctx, {
							db,
							projectId: scope.projectId,
							permission: "sso.read",
						});
						const rows = await db.findMany<DomainVerificationRow>({
							model: "domainVerification",
							where: [
								...scope.where,
								...(ctx.body.organizationId
									? [{ field: "organizationId", value: ctx.body.organizationId }]
									: []),
							],
							limit: Math.min(ctx.body.limit ?? 100, 100),
							sortBy: { field: "createdAt", direction: "desc" },
						});
						return ctx.json({
							data: rows.map(serializeVerification),
						});
					} catch (err) {
						if (err && typeof err === "object" && "status" in err) throw err;
						const message = err instanceof Error ? err.message : "Unknown error";
						return ctx.json({ error: message, data: [] });
					}
				},
			),

			deleteVerification: createAuthEndpoint(
				"/banata/domains/delete",
				{
					method: "POST", requireHeaders: true,
					body: verificationIdSchema,
					/* API-key auth handled by requireProjectPermission */
				},
				async (ctx) => {
					try {
						const db = ctx.context.adapter as unknown as PluginDBAdapter;
						const scope = getProjectScope(ctx.body);
						await requireProjectPermission(ctx, {
							db,
							projectId: scope.projectId,
							permission: "sso.manage",
						});
						const record = await db.findOne<DomainVerificationRow>({
							model: "domainVerification",
							where: [
								{ field: "id", value: ctx.body.id },
								{ field: "projectId", value: scope.projectId! },
							],
						});
						if (!record) {
							throw ctx.error("NOT_FOUND", { message: "Domain verification not found" });
						}
						await db.delete({
							model: "domainVerification",
							where: [{ field: "id", value: record.id }],
						});
						await recomputeProviderDomainVerification(
							db,
							scope.projectId!,
							record.organizationId,
						);
						return ctx.json({ success: true });
					} catch (err) {
						if (err && typeof err === "object" && "status" in err) throw err;
						const message = err instanceof Error ? err.message : "Unknown error";
						return ctx.json({ error: message });
					}
				},
			),
		},
	};
}
