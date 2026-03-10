import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint, sessionMiddleware } from "better-auth/api";
import { generateRandomString } from "better-auth/crypto";
import { base64Url } from "@better-auth/utils/base64";
import { defaultKeyHasher } from "better-auth/plugins";
import { z } from "zod";
import {
	type PluginDBAdapter,
	getProjectScope,
	projectScopeSchema,
	requireAuthenticated,
	requireProjectPermission,
} from "./types";

type ConnectionType = "oidc" | "saml";
type DirectoryProvider =
	| "okta"
	| "azure_scim_v2"
	| "google_workspace"
	| "onelogin"
	| "jumpcloud"
	| "pingfederate"
	| "generic_scim_v2";

interface OrganizationRow extends Record<string, unknown> {
	id: string;
	projectId?: string | null;
}

interface SSOProviderRow extends Record<string, unknown> {
	id: string;
	providerId: string;
	issuer: string;
	domain: string;
	organizationId?: string | null;
	projectId?: string | null;
	name?: string | null;
	oidcConfig?: string | null;
	samlConfig?: string | null;
	providerType?: string | null;
	active?: boolean | null;
	domainVerified?: boolean | null;
	userId?: string | null;
	createdAt: number;
	updatedAt: number;
}

interface SCIMProviderRow extends Record<string, unknown> {
	id: string;
	providerId: string;
	scimToken?: string | null;
	tokenHash?: string | null;
	organizationId?: string | null;
	projectId?: string | null;
	name?: string | null;
	provider?: string | null;
	endpointUrl?: string | null;
	active?: boolean | null;
	lastSyncAt?: number | null;
	lastSyncStatus?: string | null;
	userId?: string | null;
	createdAt: number;
	updatedAt: number;
}

interface AccountRow extends Record<string, unknown> {
	id: string;
	userId: string;
	accountId: string;
	providerId: string;
}

interface UserRow extends Record<string, unknown> {
	id: string;
	email: string;
	name: string;
	banned?: boolean | null;
	metadata?: unknown;
	createdAt: number;
	updatedAt: number;
}

interface BetterAuthOidcConfig {
	issuer: string;
	pkce: boolean;
	clientId: string;
	clientSecret: string;
	discoveryEndpoint: string;
	authorizationEndpoint?: string;
	tokenEndpoint?: string;
	userInfoEndpoint?: string;
	jwksEndpoint?: string;
	tokenEndpointAuthentication?: "client_secret_post" | "client_secret_basic";
	scopes?: string[];
	mapping?: {
		id?: string;
		email?: string;
		emailVerified?: string;
		name?: string;
		image?: string;
		extraFields?: Record<string, string>;
	};
}

interface BetterAuthSamlConfig {
	issuer: string;
	entryPoint: string;
	cert: string;
	callbackUrl: string;
	audience?: string;
	wantAssertionsSigned?: boolean;
	authnRequestsSigned?: boolean;
	identifierFormat?: string;
	mapping?: {
		id?: string;
		email?: string;
		emailVerified?: string;
		name?: string;
		firstName?: string;
		lastName?: string;
		extraFields?: Record<string, string>;
	};
	spMetadata: {
		entityID?: string;
	};
}

const oidcConfigSchema = z.object({
	issuer: z.string().url(),
	clientId: z.string().min(1),
	clientSecret: z.string().min(1),
	scopes: z.array(z.string()).optional(),
	discoveryUrl: z.string().url().optional(),
	authorizationUrl: z.string().url().optional(),
	tokenUrl: z.string().url().optional(),
	userinfoUrl: z.string().url().optional(),
	jwksUrl: z.string().url().optional(),
	tokenEndpointAuthMethod: z.enum(["client_secret_post", "client_secret_basic"]).optional(),
	claimMapping: z.record(z.string(), z.string()).optional(),
});

const samlConfigSchema = z.object({
	idpEntityId: z.string().min(1),
	idpSsoUrl: z.string().url(),
	idpCertificate: z.string().min(1),
	nameIdFormat: z.string().optional(),
	signRequest: z.boolean().optional(),
	allowIdpInitiated: z.boolean().optional(),
	attributeMapping: z.record(z.string(), z.string()).optional(),
	spEntityId: z.string().optional(),
	spAcsUrl: z.string().url().optional(),
});

const partialOidcConfigSchema = oidcConfigSchema.partial();
const partialSamlConfigSchema = samlConfigSchema.partial();

const createSsoProviderSchema = z
	.object({
		organizationId: z.string().min(1),
		type: z.enum(["oidc", "saml"]),
		name: z.string().min(1),
		domain: z.string().optional(),
		domains: z.array(z.string()).optional(),
		active: z.boolean().optional(),
		oidcConfig: oidcConfigSchema.optional(),
		samlConfig: samlConfigSchema.optional(),
	})
	.merge(projectScopeSchema);

const updateSsoProviderSchema = z
	.object({
		providerId: z.string().min(1),
		name: z.string().min(1).optional(),
		domain: z.string().optional(),
		domains: z.array(z.string()).optional(),
		active: z.boolean().optional(),
		oidcConfig: oidcConfigSchema.partial().optional(),
		samlConfig: samlConfigSchema.partial().optional(),
	})
	.merge(projectScopeSchema);

const listSsoProvidersSchema = z
	.object({
		organizationId: z.string().optional(),
		connectionType: z.enum(["oidc", "saml"]).optional(),
		limit: z.number().optional(),
	})
	.merge(projectScopeSchema);

const getSsoProviderSchema = z
	.object({
		providerId: z.string().min(1),
	})
	.merge(projectScopeSchema);

const deleteSsoProviderSchema = getSsoProviderSchema;

const createDirectorySchema = z
	.object({
		organizationId: z.string().min(1),
		name: z.string().min(1),
		provider: z.enum([
			"okta",
			"azure_scim_v2",
			"google_workspace",
			"onelogin",
			"jumpcloud",
			"pingfederate",
			"generic_scim_v2",
		]),
	})
	.merge(projectScopeSchema);

const listDirectoriesSchema = z
	.object({
		organizationId: z.string().optional(),
		limit: z.number().optional(),
	})
	.merge(projectScopeSchema);

const getDirectorySchema = z
	.object({
		providerId: z.string().min(1),
	})
	.merge(projectScopeSchema);

const deleteDirectorySchema = getDirectorySchema;

const listDirectoryUsersSchema = z
	.object({
		providerId: z.string().min(1),
		state: z.enum(["active", "suspended", "deprovisioned"]).optional(),
		limit: z.number().optional(),
	})
	.merge(projectScopeSchema);

const getDirectoryUserSchema = z
	.object({
		providerId: z.string().optional(),
		userId: z.string().min(1),
	})
	.merge(projectScopeSchema);

const listDirectoryGroupsSchema = getDirectorySchema.extend({
	limit: z.number().optional(),
});

const getDirectoryGroupSchema = z
	.object({
		groupId: z.string().min(1),
	})
	.merge(projectScopeSchema);

function randomId(prefix: string) {
	return `${prefix}_${crypto.randomUUID().replace(/-/g, "")}`;
}

function parseJson<T>(value: unknown): T | null {
	if (typeof value !== "string" || value.length === 0) return null;
	try {
		return JSON.parse(value) as T;
	} catch {
		return null;
	}
}

function normalizeDomains(domains?: string[], domain?: string): string[] {
	const values = [...(domains ?? []), ...(domain ? [domain] : [])]
		.map((value) => value.trim().toLowerCase())
		.filter((value) => value.length > 0);
	return Array.from(new Set(values));
}

function defaultOidcDiscoveryUrl(issuer: string): string {
	return `${issuer.replace(/\/$/, "")}/.well-known/openid-configuration`;
}

function buildOidcConfig(input: z.infer<typeof oidcConfigSchema>): BetterAuthOidcConfig {
	return {
		issuer: input.issuer,
		pkce: true,
		clientId: input.clientId,
		clientSecret: input.clientSecret,
		discoveryEndpoint: input.discoveryUrl ?? defaultOidcDiscoveryUrl(input.issuer),
		authorizationEndpoint: input.authorizationUrl,
		tokenEndpoint: input.tokenUrl,
		userInfoEndpoint: input.userinfoUrl,
		jwksEndpoint: input.jwksUrl,
		tokenEndpointAuthentication: input.tokenEndpointAuthMethod ?? "client_secret_post",
		scopes: input.scopes,
		mapping: input.claimMapping
			? {
					id: input.claimMapping.id,
					email: input.claimMapping.email,
					emailVerified: input.claimMapping.emailVerified,
					name: input.claimMapping.name,
					image: input.claimMapping.image,
					extraFields: input.claimMapping,
				}
			: undefined,
	};
}

function mergeOidcConfig(
	current: BetterAuthOidcConfig | null,
	partial: z.infer<typeof partialOidcConfigSchema>,
): BetterAuthOidcConfig {
	const issuer = partial.issuer ?? current?.issuer;
	if (!issuer) {
		throw new Error("OIDC issuer is required");
	}
	return {
		issuer,
		pkce: true,
		clientId: partial.clientId ?? current?.clientId ?? "",
		clientSecret: partial.clientSecret ?? current?.clientSecret ?? "",
		discoveryEndpoint:
			partial.discoveryUrl ??
			current?.discoveryEndpoint ??
			defaultOidcDiscoveryUrl(issuer),
		authorizationEndpoint: partial.authorizationUrl ?? current?.authorizationEndpoint,
		tokenEndpoint: partial.tokenUrl ?? current?.tokenEndpoint,
		userInfoEndpoint: partial.userinfoUrl ?? current?.userInfoEndpoint,
		jwksEndpoint: partial.jwksUrl ?? current?.jwksEndpoint,
		tokenEndpointAuthentication:
			partial.tokenEndpointAuthMethod ??
			current?.tokenEndpointAuthentication ??
			"client_secret_post",
		scopes: partial.scopes ?? current?.scopes,
		mapping:
			partial.claimMapping != null
				? {
						id: partial.claimMapping.id,
						email: partial.claimMapping.email,
						emailVerified: partial.claimMapping.emailVerified,
						name: partial.claimMapping.name,
						image: partial.claimMapping.image,
						extraFields: partial.claimMapping,
					}
				: current?.mapping,
	};
}

function buildSamlConfig(
	input: z.infer<typeof samlConfigSchema>,
	providerId: string,
	baseURL: string,
): BetterAuthSamlConfig {
	return {
		issuer: input.idpEntityId,
		entryPoint: input.idpSsoUrl,
		cert: input.idpCertificate,
		callbackUrl: input.spAcsUrl ?? `${baseURL}/sso/saml2/sp/acs/${providerId}`,
		audience: input.spEntityId,
		wantAssertionsSigned: true,
		authnRequestsSigned: input.signRequest ?? false,
		identifierFormat: input.nameIdFormat,
		mapping: input.attributeMapping
			? {
					id: input.attributeMapping.id,
					email: input.attributeMapping.email,
					emailVerified: input.attributeMapping.emailVerified,
					name: input.attributeMapping.name,
					firstName: input.attributeMapping.firstName,
					lastName: input.attributeMapping.lastName,
					extraFields: input.attributeMapping,
				}
			: undefined,
		spMetadata: {
			entityID: input.spEntityId,
		},
	};
}

function mergeSamlConfig(
	current: BetterAuthSamlConfig | null,
	partial: z.infer<typeof partialSamlConfigSchema>,
	providerId: string,
	baseURL: string,
): BetterAuthSamlConfig {
	const issuer = partial.idpEntityId ?? current?.issuer;
	const entryPoint = partial.idpSsoUrl ?? current?.entryPoint;
	const cert = partial.idpCertificate ?? current?.cert;
	if (!issuer || !entryPoint || !cert) {
		throw new Error("SAML issuer, entry point, and certificate are required");
	}
	return {
		issuer,
		entryPoint,
		cert,
		callbackUrl:
			partial.spAcsUrl ??
			current?.callbackUrl ??
			`${baseURL}/sso/saml2/sp/acs/${providerId}`,
		audience: partial.spEntityId ?? current?.audience,
		wantAssertionsSigned: current?.wantAssertionsSigned ?? true,
		authnRequestsSigned: partial.signRequest ?? current?.authnRequestsSigned ?? false,
		identifierFormat: partial.nameIdFormat ?? current?.identifierFormat,
		mapping:
			partial.attributeMapping != null
				? {
						id: partial.attributeMapping.id,
						email: partial.attributeMapping.email,
						emailVerified: partial.attributeMapping.emailVerified,
						name: partial.attributeMapping.name,
						firstName: partial.attributeMapping.firstName,
						lastName: partial.attributeMapping.lastName,
						extraFields: partial.attributeMapping,
					}
				: current?.mapping,
		spMetadata: {
			entityID: partial.spEntityId ?? current?.spMetadata?.entityID,
		},
	};
}

function serializeConnection(row: SSOProviderRow, baseURL: string) {
	const oidcConfig = parseJson<BetterAuthOidcConfig>(row.oidcConfig);
	const samlConfig = parseJson<BetterAuthSamlConfig>(row.samlConfig);
	const type = (row.providerType === "saml"
		? "saml"
		: row.providerType === "oidc"
			? "oidc"
			: samlConfig
				? "saml"
				: "oidc") as ConnectionType;
	return {
		id: row.providerId,
		providerId: row.providerId,
		projectId: row.projectId ?? null,
		organizationId: row.organizationId ?? null,
		type,
		name: row.name ?? row.providerId,
		domain: row.domain,
		domains: row.domain?.split(",").map((value) => value.trim()).filter(Boolean) ?? [],
		active: row.active !== false,
		state: row.active === false ? "inactive" : "active",
		domainVerified: row.domainVerified === true,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		oidcConfig:
			type === "oidc" && oidcConfig
				? {
						issuer: oidcConfig.issuer,
						clientId: oidcConfig.clientId,
						scopes: oidcConfig.scopes ?? [],
						discoveryUrl: oidcConfig.discoveryEndpoint,
						authorizationUrl: oidcConfig.authorizationEndpoint,
						tokenUrl: oidcConfig.tokenEndpoint,
						userinfoUrl: oidcConfig.userInfoEndpoint,
						jwksUrl: oidcConfig.jwksEndpoint,
						tokenEndpointAuthMethod: oidcConfig.tokenEndpointAuthentication,
					}
				: null,
		samlConfig:
			type === "saml" && samlConfig
				? {
						idpEntityId: samlConfig.issuer,
						idpSsoUrl: samlConfig.entryPoint,
						idpCertificate: samlConfig.cert,
						nameIdFormat: samlConfig.identifierFormat ?? null,
						signRequest: samlConfig.authnRequestsSigned ?? false,
						spEntityId: samlConfig.spMetadata.entityID ?? null,
						spAcsUrl: samlConfig.callbackUrl,
					}
				: null,
		spMetadataUrl: `${baseURL}/sso/saml2/sp/metadata?providerId=${encodeURIComponent(row.providerId)}`,
	};
}

function serializeDirectory(
	row: SCIMProviderRow,
	userCount: number,
	override?: { bearerToken?: string },
) {
	return {
		id: row.providerId,
		providerId: row.providerId,
		projectId: row.projectId ?? null,
		organizationId: row.organizationId ?? null,
		type: "scim" as const,
		state: row.active === false ? "unlinked" : "linked",
		name: row.name ?? row.providerId,
		provider: (row.provider ?? "generic_scim_v2") as DirectoryProvider,
		userCount,
		groupCount: 0,
		lastSyncAt: row.lastSyncAt ?? null,
		lastSyncStatus:
			row.lastSyncStatus === "success" ||
			row.lastSyncStatus === "partial" ||
			row.lastSyncStatus === "failed"
				? row.lastSyncStatus
				: null,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
		scimConfig:
			override?.bearerToken != null
				? {
						baseUrl: row.endpointUrl ?? "",
						bearerToken: override.bearerToken,
					}
				: undefined,
	};
}

function splitName(name: string) {
	const trimmed = name.trim();
	if (!trimmed) return { givenName: "", familyName: "" };
	const [givenName, ...rest] = trimmed.split(/\s+/);
	return { givenName, familyName: rest.join(" ") };
}

function serializeDirectoryUser(
	directory: SCIMProviderRow,
	user: UserRow,
	account: AccountRow,
) {
	const name = splitName(user.name);
	return {
		id: user.id,
		directoryId: directory.providerId,
		organizationId: directory.organizationId ?? null,
		userId: user.id,
		externalId: account.accountId,
		userName: user.email,
		emails: [{ value: user.email, type: "work", primary: true }],
		name: {
			givenName: name.givenName,
			familyName: name.familyName,
			formatted: user.name,
		},
		displayName: user.name,
		active: user.banned !== true,
		title: null,
		department: null,
		groups: [],
		state: user.banned === true ? "suspended" : "active",
		createdAt: user.createdAt,
		updatedAt: user.updatedAt,
	};
}

async function ensureOrganizationInProject(
	ctx: any,
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
		throw ctx.error("BAD_REQUEST", {
			message: "Organization not found in the requested project",
		});
	}
}

async function findSsoProvider(
	db: PluginDBAdapter,
	providerId: string,
	projectId: string,
) {
	return db.findOne<SSOProviderRow>({
		model: "ssoProvider",
		where: [
			{ field: "providerId", value: providerId },
			{ field: "projectId", value: projectId },
		],
	});
}

async function findDirectory(
	db: PluginDBAdapter,
	providerId: string,
	projectId: string,
) {
	return db.findOne<SCIMProviderRow>({
		model: "scimProvider",
		where: [
			{ field: "providerId", value: providerId },
			{ field: "projectId", value: projectId },
		],
	});
}

async function countDirectoryUsers(db: PluginDBAdapter, providerId: string) {
	return db.count({
		model: "account",
		where: [{ field: "providerId", value: providerId }],
	});
}

export function enterpriseProvisioningPlugin(): BetterAuthPlugin {
	return {
		id: "banata-enterprise",
		schema: {
			ssoProvider: {
				fields: {
					organizationId: { type: "string" as const, required: false },
					providerId: { type: "string" as const, required: true },
					issuer: { type: "string" as const, required: true },
					domain: { type: "string" as const, required: true },
					name: { type: "string" as const, required: false },
					domainVerified: { type: "boolean" as const, required: false },
					projectId: { type: "string" as const, required: false },
					oidcConfig: { type: "string" as const, required: false },
					samlConfig: { type: "string" as const, required: false },
					providerType: { type: "string" as const, required: true },
					active: { type: "boolean" as const, required: false },
					userId: { type: "string" as const, required: false },
					createdAt: { type: "number" as const, required: true },
					updatedAt: { type: "number" as const, required: true },
				},
			},
			scimProvider: {
				fields: {
					organizationId: { type: "string" as const, required: false },
					providerId: { type: "string" as const, required: true },
					scimToken: { type: "string" as const, required: false },
					name: { type: "string" as const, required: false },
					provider: { type: "string" as const, required: false },
					projectId: { type: "string" as const, required: false },
					endpointUrl: { type: "string" as const, required: false },
					tokenHash: { type: "string" as const, required: false },
					active: { type: "boolean" as const, required: false },
					lastSyncAt: { type: "number" as const, required: false },
					lastSyncStatus: { type: "string" as const, required: false },
					userId: { type: "string" as const, required: false },
					createdAt: { type: "number" as const, required: true },
					updatedAt: { type: "number" as const, required: true },
				},
			},
		},
		endpoints: {
			listSsoProviders: createAuthEndpoint(
				"/banata/sso/list-providers",
				{
					method: "POST", requireHeaders: true,
					body: listSsoProvidersSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId, where } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "sso.read",
					});

					const rows = await db.findMany<SSOProviderRow>({
						model: "ssoProvider",
						where: [
							...where,
							...(ctx.body.organizationId
								? [{ field: "organizationId", value: ctx.body.organizationId }]
								: []),
							...(ctx.body.connectionType
								? [{ field: "providerType", value: ctx.body.connectionType }]
								: []),
						],
						limit: Math.min(ctx.body.limit ?? 100, 100),
					});
					const data = rows.map((row) => serializeConnection(row, ctx.context.baseURL));
					return ctx.json({ data, connections: data });
				},
			),

			getSsoProvider: createAuthEndpoint(
				"/banata/sso/get-provider",
				{
					method: "POST", requireHeaders: true,
					body: getSsoProviderSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "sso.read",
					});

					const row = await findSsoProvider(db, ctx.body.providerId, projectId!);
					if (!row) {
						throw ctx.error("NOT_FOUND", { message: "SSO provider not found" });
					}
					return ctx.json(serializeConnection(row, ctx.context.baseURL));
				},
			),

			registerSsoProvider: createAuthEndpoint(
				"/banata/sso/register",
				{
					method: "POST", requireHeaders: true,
					body: createSsoProviderSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { user } = await requireAuthenticated(ctx);
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "sso.manage",
					});
					await ensureOrganizationInProject(ctx, db, ctx.body.organizationId, projectId!);

					const domains = normalizeDomains(ctx.body.domains, ctx.body.domain);
					if (domains.length === 0) {
						throw ctx.error("BAD_REQUEST", { message: "At least one routing domain is required" });
					}

					const providerId = randomId("sso");
					const now = Date.now();
					let oidcConfig: BetterAuthOidcConfig | null = null;
					let samlConfig: BetterAuthSamlConfig | null = null;
					if (ctx.body.type === "oidc") {
						if (!ctx.body.oidcConfig) {
							throw ctx.error("BAD_REQUEST", { message: "OIDC config is required" });
						}
						oidcConfig = buildOidcConfig(ctx.body.oidcConfig);
					} else {
						if (!ctx.body.samlConfig) {
							throw ctx.error("BAD_REQUEST", { message: "SAML config is required" });
						}
						samlConfig = buildSamlConfig(ctx.body.samlConfig, providerId, ctx.context.baseURL);
					}

					const row = await db.create<SSOProviderRow>({
						model: "ssoProvider",
						data: {
							providerId,
							projectId,
							organizationId: ctx.body.organizationId,
							name: ctx.body.name,
							issuer: oidcConfig?.issuer ?? samlConfig?.issuer ?? providerId,
							domain: domains.join(","),
							providerType: ctx.body.type,
							active: ctx.body.active ?? true,
							domainVerified: false,
							oidcConfig: oidcConfig ? JSON.stringify(oidcConfig) : null,
							samlConfig: samlConfig ? JSON.stringify(samlConfig) : null,
							userId: user.id,
							createdAt: now,
							updatedAt: now,
						},
					});

					return ctx.json(serializeConnection(row, ctx.context.baseURL));
				},
			),

			updateSsoProvider: createAuthEndpoint(
				"/banata/sso/update-provider",
				{
					method: "POST", requireHeaders: true,
					body: updateSsoProviderSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "sso.manage",
					});

					const current = await findSsoProvider(db, ctx.body.providerId, projectId!);
					if (!current) {
						throw ctx.error("NOT_FOUND", { message: "SSO provider not found" });
					}

					const update: Record<string, unknown> = {
						updatedAt: Date.now(),
					};
					if (ctx.body.name !== undefined) update.name = ctx.body.name;
					if (ctx.body.active !== undefined) update.active = ctx.body.active;
					if (ctx.body.domains !== undefined || ctx.body.domain !== undefined) {
						const domains = normalizeDomains(ctx.body.domains, ctx.body.domain);
						if (domains.length === 0) {
							throw ctx.error("BAD_REQUEST", { message: "At least one routing domain is required" });
						}
						update.domain = domains.join(",");
						update.domainVerified = false;
					}

					if (ctx.body.oidcConfig) {
						const merged = mergeOidcConfig(
							parseJson<BetterAuthOidcConfig>(current.oidcConfig),
							ctx.body.oidcConfig,
						);
						update.issuer = merged.issuer;
						update.providerType = "oidc";
						update.oidcConfig = JSON.stringify(merged);
						update.samlConfig = null;
					}

					if (ctx.body.samlConfig) {
						const merged = mergeSamlConfig(
							parseJson<BetterAuthSamlConfig>(current.samlConfig),
							ctx.body.samlConfig,
							current.providerId,
							ctx.context.baseURL,
						);
						update.issuer = merged.issuer;
						update.providerType = "saml";
						update.samlConfig = JSON.stringify(merged);
						update.oidcConfig = null;
					}

					const updated = await db.update<SSOProviderRow>({
						model: "ssoProvider",
						where: [
							{ field: "providerId", value: ctx.body.providerId },
							{ field: "projectId", value: projectId! },
						],
						update,
					});
					if (!updated) {
						throw ctx.error("NOT_FOUND", { message: "SSO provider not found" });
					}
					return ctx.json(serializeConnection(updated, ctx.context.baseURL));
				},
			),

			deleteSsoProvider: createAuthEndpoint(
				"/banata/sso/delete-provider",
				{
					method: "POST", requireHeaders: true,
					body: deleteSsoProviderSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "sso.manage",
					});
					await db.delete({
						model: "ssoProvider",
						where: [
							{ field: "providerId", value: ctx.body.providerId },
							{ field: "projectId", value: projectId! },
						],
					});
					return ctx.json({ success: true });
				},
			),

			listDirectories: createAuthEndpoint(
				"/banata/scim/list-providers",
				{
					method: "POST", requireHeaders: true,
					body: listDirectoriesSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId, where } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "directory.read",
					});

					const rows = await db.findMany<SCIMProviderRow>({
						model: "scimProvider",
						where: [
							...where,
							...(ctx.body.organizationId
								? [{ field: "organizationId", value: ctx.body.organizationId }]
								: []),
						],
						limit: Math.min(ctx.body.limit ?? 100, 100),
					});
					const data = await Promise.all(
						rows.map(async (row) =>
							serializeDirectory(row, await countDirectoryUsers(db, row.providerId)),
						),
					);
					return ctx.json({ data, directories: data });
				},
			),

			getDirectory: createAuthEndpoint(
				"/banata/scim/get-provider",
				{
					method: "POST", requireHeaders: true,
					body: getDirectorySchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "directory.read",
					});
					const row = await findDirectory(db, ctx.body.providerId, projectId!);
					if (!row) {
						throw ctx.error("NOT_FOUND", { message: "SCIM directory not found" });
					}
					return ctx.json(
						serializeDirectory(row, await countDirectoryUsers(db, row.providerId)),
					);
				},
			),

			registerDirectory: createAuthEndpoint(
				"/banata/scim/register",
				{
					method: "POST", requireHeaders: true,
					body: createDirectorySchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { user } = await requireAuthenticated(ctx);
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "directory.manage",
					});
					await ensureOrganizationInProject(ctx, db, ctx.body.organizationId, projectId!);

					const existing = await db.findOne<SCIMProviderRow>({
						model: "scimProvider",
						where: [
							{ field: "organizationId", value: ctx.body.organizationId },
							{ field: "projectId", value: projectId! },
						],
					});
					const providerId = existing?.providerId ?? randomId("dir");
					const now = Date.now();
					const baseToken = generateRandomString(24);
					const bearerToken = base64Url.encode(
						`${baseToken}:${providerId}:${ctx.body.organizationId}`,
					);
					const storedToken = await defaultKeyHasher(baseToken);
					const endpointUrl = `${ctx.context.baseURL}/scim/v2`;
					const directoryData = {
						providerId,
						projectId,
						organizationId: ctx.body.organizationId,
						name: ctx.body.name,
						provider: ctx.body.provider,
						scimToken: storedToken,
						tokenHash: storedToken,
						endpointUrl,
						active: true,
						userId: user.id,
						lastSyncAt: existing?.lastSyncAt ?? null,
						lastSyncStatus: existing?.lastSyncStatus ?? null,
						updatedAt: now,
					};

					const row = existing
						? await db.update<SCIMProviderRow>({
								model: "scimProvider",
								where: [
									{ field: "providerId", value: providerId },
									{ field: "projectId", value: projectId! },
								],
								update: directoryData,
							})
						: await db.create<SCIMProviderRow>({
								model: "scimProvider",
								data: {
									...directoryData,
									createdAt: now,
								},
							});
					if (!row) {
						throw ctx.error("INTERNAL_SERVER_ERROR", {
							message: "Failed to create SCIM directory",
						});
					}
					return ctx.json(
						serializeDirectory(row, await countDirectoryUsers(db, row.providerId), {
							bearerToken,
						}),
					);
				},
			),

			deleteDirectory: createAuthEndpoint(
				"/banata/scim/delete-provider",
				{
					method: "POST", requireHeaders: true,
					body: deleteDirectorySchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "directory.manage",
					});
					await db.delete({
						model: "scimProvider",
						where: [
							{ field: "providerId", value: ctx.body.providerId },
							{ field: "projectId", value: projectId! },
						],
					});
					return ctx.json({ success: true });
				},
			),

			listDirectoryUsers: createAuthEndpoint(
				"/banata/scim/list-users",
				{
					method: "POST", requireHeaders: true,
					body: listDirectoryUsersSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "directory.read",
					});
					const directory = await findDirectory(db, ctx.body.providerId, projectId!);
					if (!directory) {
						throw ctx.error("NOT_FOUND", { message: "SCIM directory not found" });
					}
					const accounts = await db.findMany<AccountRow>({
						model: "account",
						where: [{ field: "providerId", value: directory.providerId }],
						limit: Math.min(ctx.body.limit ?? 100, 100),
					});
					const userIds = Array.from(new Set(accounts.map((account) => account.userId)));
					const users =
						userIds.length > 0
							? await db.findMany<UserRow>({
									model: "user",
									where: [{ field: "id", value: userIds, operator: "in" }],
									limit: userIds.length,
								})
							: [];
					const usersById = new Map(users.map((user) => [user.id, user]));
					const data = accounts
						.map((account) => {
							const user = usersById.get(account.userId);
							return user ? serializeDirectoryUser(directory, user, account) : null;
						})
						.filter((entry): entry is NonNullable<typeof entry> => entry !== null)
						.filter((entry) => (ctx.body.state ? entry.state === ctx.body.state : true));
					return ctx.json({ data, users: data });
				},
			),

			getDirectoryUser: createAuthEndpoint(
				"/banata/scim/get-user",
				{
					method: "POST", requireHeaders: true,
					body: getDirectoryUserSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "directory.read",
					});

					const account = await db.findOne<AccountRow>({
						model: "account",
						where: [
							{ field: "userId", value: ctx.body.userId },
							...(ctx.body.providerId
								? [{ field: "providerId", value: ctx.body.providerId }]
								: []),
						],
					});
					if (!account) {
						throw ctx.error("NOT_FOUND", { message: "Directory user not found" });
					}
					const directory = await findDirectory(db, account.providerId, projectId!);
					if (!directory) {
						throw ctx.error("NOT_FOUND", { message: "SCIM directory not found" });
					}
					const user = await db.findOne<UserRow>({
						model: "user",
						where: [{ field: "id", value: ctx.body.userId }],
					});
					if (!user) {
						throw ctx.error("NOT_FOUND", { message: "User not found" });
					}
					return ctx.json(serializeDirectoryUser(directory, user, account));
				},
			),

			listDirectoryGroups: createAuthEndpoint(
				"/banata/scim/list-groups",
				{
					method: "POST", requireHeaders: true,
					body: listDirectoryGroupsSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "directory.read",
					});
					return ctx.json({ data: [], groups: [] });
				},
			),

			getDirectoryGroup: createAuthEndpoint(
				"/banata/scim/get-group",
				{
					method: "POST", requireHeaders: true,
					body: getDirectoryGroupSchema,
					use: [sessionMiddleware],
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { projectId } = getProjectScope(ctx.body);
					await requireProjectPermission(ctx, {
						db,
						projectId,
						permission: "directory.read",
					});
					throw ctx.error("NOT_FOUND", {
						message: "SCIM groups are not implemented in this release",
					});
				},
			),
		},
	};
}
