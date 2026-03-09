import {
	type BanataAuthConfig,
	type BanataAuthSocialProviders,
	type PluginDBAdapter,
	createBanataAuth,
	createBanataAuthComponent,
	createBanataAuthOptions,
	ensureProjectAuthSecret,
	listProjectSocialProviderSecrets,
	banataAuthSchema,
} from "@banata-auth/convex";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";

interface PersistedSocialProviderStatus {
	enabled?: boolean;
}

interface PersistedDashboardConfig {
	authMethods?: NonNullable<BanataAuthConfig["authMethods"]>;
	socialProviders?: Record<string, PersistedSocialProviderStatus>;
}

interface DashboardConfigRow {
	configJson: string;
	projectId?: string | null;
}

interface DashboardProjectRow {
	id: string;
	slug: string;
	name?: string | null;
}

interface RuntimeApiKeyRow extends Record<string, unknown> {
	id: string;
	key: string;
	userId: string;
	projectId?: string | null;
	metadata?: unknown;
}

interface RuntimeProjectLookupAdapter {
	findMany<T = Record<string, unknown>>(data: {
		model: string;
		where?: Array<{ field: string; value: string | null }>;
		limit?: number;
	}): Promise<T[]>;
}

export interface RuntimeProjectScope {
	projectId?: string | null;
	clientId?: string | null;
}

export interface ResolvedRuntimeProjectScope {
	projectId: string | null;
	explicitProjectId: string | null;
	apiKeyProjectId: string | null;
}

export const authComponent = createBanataAuthComponent<DataModel, typeof banataAuthSchema>(
	components.banataAuth,
	banataAuthSchema,
);

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.RESEND_FROM_EMAIL ?? "Banata Auth <noreply@banata.dev>";

	if (!apiKey) {
		console.warn(
			`[banata-auth] RESEND_API_KEY is not set — email to ${to} ("${subject}") was NOT delivered. Set RESEND_API_KEY via npx convex env set RESEND_API_KEY re_xxx to enable email delivery.`,
		);
		return;
	}

	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ from, to, subject, html }),
	});

	if (!res.ok) {
		const error = await res.text();
		console.error(`[email] Failed to send to ${to}: ${error}`);
	}
}

function getTrustedOrigins(): string[] {
	return [
		"http://localhost:3000",
		"http://localhost:3001",
		"http://localhost:3002",
		"http://localhost:3003",
		...(process.env.TRUSTED_ORIGINS
			? process.env.TRUSTED_ORIGINS.split(",").map((origin) => origin.trim())
			: []),
	];
}

function getPlatformSocialProviders(): BanataAuthSocialProviders | undefined {
	if (!process.env.GITHUB_CLIENT_ID || !process.env.GITHUB_CLIENT_SECRET) {
		return undefined;
	}

	return {
		github: {
			clientId: process.env.GITHUB_CLIENT_ID,
			clientSecret: process.env.GITHUB_CLIENT_SECRET,
			enabled: true,
		},
	};
}

function getPlatformConfig(): BanataAuthConfig {
	const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

	return {
		appName: "Banata Auth Dashboard",
		siteUrl,
		secret: process.env.BETTER_AUTH_SECRET ?? "placeholder-for-module-analysis",
		trustedOrigins: getTrustedOrigins(),
		authMethods: {
			emailPassword: false,
			magicLink: false,
			emailOtp: false,
			passkey: false,
			twoFactor: false,
			organization: true,
		},
		email: {
			sendVerificationEmail: async ({
				user,
				url,
			}: { user: { email: string; name: string }; url: string; token: string }) => {
				await sendEmail(
					user.email,
					"Verify your email - Banata Auth",
					`<h2>Verify your email</h2><p>Click the link below to verify your email address:</p><p><a href="${url}">${url}</a></p>`,
				);
			},
			sendResetPassword: async ({
				user,
				url,
			}: { user: { email: string; name: string }; url: string; token: string }) => {
				await sendEmail(
					user.email,
					"Reset your password - Banata Auth",
					`<h2>Reset your password</h2><p>Click the link below to reset your password:</p><p><a href="${url}">${url}</a></p>`,
				);
			},
			sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
				await sendEmail(
					email,
					"Sign in to Banata Auth",
					`<h2>Sign in</h2><p>Click the link below to sign in:</p><p><a href="${url}">${url}</a></p>`,
				);
			},
			sendOtp: async ({ email, otp }: { email: string; otp: string }) => {
				await sendEmail(
					email,
					"Your verification code - Banata Auth",
					`<h2>Your verification code</h2><p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p><p>This code expires in 10 minutes.</p>`,
				);
			},
			sendInvitationEmail: async ({
				email,
				organizationName,
				inviterName,
			}: { email: string; organizationName: string; inviterName: string }) => {
				await sendEmail(
					email,
					`You've been invited to ${organizationName}`,
					`<h2>Organization Invitation</h2><p>${inviterName} has invited you to join <strong>${organizationName}</strong>.</p><p>Sign in to your dashboard to accept the invitation.</p>`,
				);
			},
		},
		socialProviders: getPlatformSocialProviders(),
	};
}

export function getConfig(): BanataAuthConfig {
	return getPlatformConfig();
}

function buildProjectConfig(projectName: string, secret: string): BanataAuthConfig {
	return {
		appName: projectName,
		siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
		secret,
		trustedOrigins: getTrustedOrigins(),
		authMethods: {
			emailPassword: false,
			magicLink: false,
			emailOtp: false,
			passkey: false,
			twoFactor: false,
			sso: false,
			username: false,
			anonymous: false,
			organization: true,
		},
		emailOptions: {
			appName: projectName,
		},
	};
}

function mergeRuntimeConfig(
	baseConfig: BanataAuthConfig,
	overrides: PersistedDashboardConfig | null,
	socialProviders: BanataAuthSocialProviders | undefined = baseConfig.socialProviders,
): BanataAuthConfig {
	if (!overrides) {
		if (!socialProviders || Object.keys(socialProviders).length === 0) {
			const config = { ...baseConfig };
			delete config.socialProviders;
			return config;
		}
		return { ...baseConfig, socialProviders };
	}

	const authMethods = {
		...(baseConfig.authMethods ?? {}),
		...(overrides.authMethods ?? {}),
	};
	const config: BanataAuthConfig = {
		...baseConfig,
		authMethods,
	};

	if (socialProviders && Object.keys(socialProviders).length > 0) {
		config.socialProviders = socialProviders;
	} else {
		delete config.socialProviders;
	}

	return config;
}

function normalizeRuntimeScopeValue(value: unknown): string | null {
	return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = "";
	for (const value of bytes) {
		binary += String.fromCharCode(value);
	}
	return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
}

async function hashApiKeyValue(value: string): Promise<string> {
	const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
	return toBase64Url(new Uint8Array(digest));
}

function readProjectIdFromApiKeyMetadata(metadata: unknown): string | null {
	if (!metadata) {
		return null;
	}

	if (typeof metadata === "string") {
		try {
			return readProjectIdFromApiKeyMetadata(JSON.parse(metadata));
		} catch {
			return null;
		}
	}

	if (typeof metadata === "object" && metadata !== null) {
		return normalizeRuntimeScopeValue(
			(metadata as Record<string, unknown>).projectId ??
				(metadata as Record<string, unknown>).project_id,
		);
	}

	return null;
}

function readProjectIdFromApiKeyRow(row: RuntimeApiKeyRow | null | undefined): string | null {
	if (!row) {
		return null;
	}

	return normalizeRuntimeScopeValue(row.projectId) ?? readProjectIdFromApiKeyMetadata(row.metadata);
}

async function loadPersistedDashboardConfig(
	ctx: GenericCtx<DataModel>,
	projectId?: string | null,
): Promise<PersistedDashboardConfig | null> {
	if (!projectId) {
		return null;
	}

	const adapter = authComponent.adapter(ctx) as unknown as RuntimeProjectLookupAdapter;
	try {
		const scopedRows = await adapter.findMany<DashboardConfigRow>({
			model: "dashboardConfig",
			where: [{ field: "projectId", value: projectId }],
			limit: 1,
		});
		const scopedRow = scopedRows[0];
		if (scopedRow?.configJson) {
			return JSON.parse(scopedRow.configJson) as PersistedDashboardConfig;
		}
		return null;
	} catch {
		return null;
	}
}

async function loadProjectById(
	ctx: GenericCtx<DataModel>,
	projectId: string,
): Promise<DashboardProjectRow | null> {
	const adapter = authComponent.adapter(ctx) as unknown as RuntimeProjectLookupAdapter;
	try {
		const rows = await adapter.findMany<DashboardProjectRow>({
			model: "project",
			where: [{ field: "id", value: projectId }],
			limit: 1,
		});
		return rows[0] ?? null;
	} catch {
		return null;
	}
}

async function loadProjectSocialProviders(
	db: PluginDBAdapter,
	projectId: string,
	overrides: PersistedDashboardConfig | null,
): Promise<BanataAuthSocialProviders | undefined> {
	const storedProviders = await listProjectSocialProviderSecrets(db, projectId).catch(() => []);
	if (storedProviders.length === 0) {
		return undefined;
	}

	const providers = Object.fromEntries(
		storedProviders.map((provider) => [
			provider.name,
			{
				clientId: provider.data.clientId,
				clientSecret: provider.data.clientSecret,
				...(provider.data.tenantId ? { tenantId: provider.data.tenantId } : {}),
				enabled: overrides?.socialProviders?.[provider.name]?.enabled ?? false,
			},
		]),
	) as BanataAuthSocialProviders;

	return Object.keys(providers).length > 0 ? providers : undefined;
}

export async function resolveRuntimeProjectId(
	ctx: GenericCtx<DataModel>,
	scope: RuntimeProjectScope | null | undefined,
): Promise<string | null> {
	const adapter = authComponent.adapter(ctx) as unknown as RuntimeProjectLookupAdapter;
	return resolveExplicitRuntimeProjectId(adapter, scope);
}

async function resolveExplicitRuntimeProjectId(
	adapter: RuntimeProjectLookupAdapter,
	scope: RuntimeProjectScope | null | undefined,
): Promise<string | null> {
	const projectId =
		typeof scope?.projectId === "string" && scope.projectId.trim().length > 0
			? scope.projectId.trim()
			: null;
	if (projectId) {
		try {
			const rows = await adapter.findMany<DashboardProjectRow>({
				model: "project",
				where: [{ field: "id", value: projectId }],
				limit: 1,
			});
			return rows[0]?.id ?? null;
		} catch {
			return null;
		}
	}

	const clientId =
		typeof scope?.clientId === "string" && scope.clientId.trim().length > 0
			? scope.clientId.trim()
			: null;
	if (!clientId) {
		return null;
	}

	try {
		const rows = await adapter.findMany<DashboardProjectRow>({
			model: "project",
			where: [{ field: "slug", value: clientId }],
			limit: 1,
		});
		return rows[0]?.id ?? null;
	} catch {
		return null;
	}
}

async function resolveApiKeyProjectId(
	adapter: RuntimeProjectLookupAdapter,
	apiKey: string | null | undefined,
): Promise<string | null> {
	const normalizedApiKey = normalizeRuntimeScopeValue(apiKey);
	if (!normalizedApiKey) {
		return null;
	}

	const lookupCandidates = Array.from(
		new Set([await hashApiKeyValue(normalizedApiKey), normalizedApiKey]),
	);

	for (const candidate of lookupCandidates) {
		try {
			const rows = await adapter.findMany<RuntimeApiKeyRow>({
				model: "apikey",
				where: [{ field: "key", value: candidate }],
				limit: 1,
			});
			const projectId = readProjectIdFromApiKeyRow(rows[0]);
			if (projectId) {
				return projectId;
			}
		} catch {
			// Keep iterating so older raw-key rows or partially migrated rows still resolve.
		}
	}

	return null;
}

export async function resolveRuntimeProjectScope(
	ctx: GenericCtx<DataModel>,
	params: {
		scope?: RuntimeProjectScope | null;
		apiKey?: string | null;
	},
): Promise<ResolvedRuntimeProjectScope> {
	const adapter = authComponent.adapter(ctx) as unknown as RuntimeProjectLookupAdapter;
	const [explicitProjectId, apiKeyProjectId] = await Promise.all([
		resolveExplicitRuntimeProjectId(adapter, params.scope),
		resolveApiKeyProjectId(adapter, params.apiKey),
	]);

	return {
		projectId: apiKeyProjectId ?? explicitProjectId ?? null,
		explicitProjectId,
		apiKeyProjectId,
	};
}

async function buildProjectRequestConfig(
	ctx: GenericCtx<DataModel>,
	projectId: string,
): Promise<BanataAuthConfig> {
	const db = authComponent.adapter(ctx) as unknown as PluginDBAdapter;
	const [project, overrides, secret] = await Promise.all([
		loadProjectById(ctx, projectId),
		loadPersistedDashboardConfig(ctx, projectId),
		ensureProjectAuthSecret(db, projectId),
	]);
	const socialProviders = await loadProjectSocialProviders(db, projectId, overrides);
	const projectName = project?.name?.trim() || "Banata Project";
	return mergeRuntimeConfig(buildProjectConfig(projectName, secret), overrides, socialProviders);
}

export async function getRequestConfig(
	ctx: GenericCtx<DataModel>,
	scope?: RuntimeProjectScope | null,
	options?: {
		apiKey?: string | null;
	},
): Promise<BanataAuthConfig> {
	const resolvedScope = await resolveRuntimeProjectScope(ctx, {
		scope,
		apiKey: options?.apiKey,
	});
	const projectId = resolvedScope.projectId;
	if (!projectId) {
		return getPlatformConfig();
	}

	return buildProjectRequestConfig(ctx, projectId);
}

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
	createBanataAuthOptions(ctx, {
		authComponent,
		authConfig,
		config: getPlatformConfig(),
	});

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	createBanataAuth(ctx, {
		authComponent,
		authConfig,
		config: getPlatformConfig(),
	});
