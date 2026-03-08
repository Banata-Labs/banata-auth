/**
 * Dashboard configuration plugin for Banata Auth.
 *
 * Provides CRUD endpoints for dashboard configuration data that
 * doesn't exist natively in Better Auth:
 *
 * - `/banata/config/public`             â€” Read runtime auth config for public UIs
 * - `/banata/config/dashboard`          â€” Read dashboard config (with persisted overrides)
 * - `/banata/config/dashboard/save`     â€” Save partial dashboard config overrides
 * - `/banata/config/roles/list`         â€” List custom role definitions
 * - `/banata/config/roles/create`       â€” Create a role definition
 * - `/banata/config/roles/delete`       â€” Delete a role definition
 * - `/banata/config/permissions/list`   â€” List custom permission definitions
 * - `/banata/config/permissions/create` â€” Create a permission definition
 * - `/banata/config/permissions/delete` â€” Delete a permission definition
 * - `/banata/config/branding/get`       â€” Get branding config
 * - `/banata/config/branding/save`      â€” Upsert branding config
 * - `/banata/config/emails/list`        â€” List email toggles
 * - `/banata/config/emails/toggle`      â€” Toggle an email type on/off
 * - `/banata/config/project/get`        â€” Get project config (name, description, env)
 * - `/banata/config/project/save`       â€” Save project config
 *
 * All endpoints are registered under `/api/auth/banata/config/...` through
 * Better Auth's plugin system and proxied via the existing catch-all route.
 *
 * @see {@link ../../component/schema.ts} for table definitions
 * @see {@link ../auth.ts} for plugin registration
 */

import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import {
	type ActionConfigRow,
	type AddonConfigRow,
	type BrandingConfigRow,
	type DashboardConfigRow,
	type DomainConfigRow,
	type EmailConfigRow,
	type EmailProviderConfigRow,
	type PermissionDefinitionRow,
	type PluginDBAdapter,
	type ProjectConfigRow,
	type ProjectRow,
	type RadarConfigRow,
	type RedirectConfigRow,
	type ResourceTypeRow,
	type RoleDefinitionRow,
	type WhereClause,
	getEffectiveProjectPermissions,
	getProjectScope,
	projectScopeSchema,
	requireAuthenticated,
	requireProjectPermission,
} from "./types";
import {
	deleteProjectSocialProviderSecret,
	listProjectSocialProviderSecrets,
	readProjectSocialProviderSecret,
	saveProjectSocialProviderSecret,
} from "./vault";

// â”€â”€â”€ Plugin Options â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface ConfigPluginOptions {
	/**
	 * Static auth methods config â€” mirrors BanataAuthConfig.authMethods.
	 * These are read from the server environment, not stored in DB.
	 */
	authMethods?: {
		sso?: boolean;
		emailPassword?: boolean;
		passkey?: boolean;
		magicLink?: boolean;
		emailOtp?: boolean;
		twoFactor?: boolean;
		organization?: boolean;
		anonymous?: boolean;
		username?: boolean;
	};

	/**
	 * Social providers config â€” keys are provider names, values indicate
	 * whether they are enabled + whether they use demo credentials.
	 */
	socialProviders?: Record<string, { enabled: boolean; demo?: boolean }>;

	/**
	 * Static feature flags.
	 */
	features?: {
		hostedUi?: boolean;
		signUp?: boolean;
		mfa?: boolean;
		localization?: boolean;
	};

	/**
	 * Static session configuration.
	 */
	sessions?: {
		maxSessionLength?: string;
		accessTokenDuration?: string;
		inactivityTimeout?: string;
		corsOrigins?: string[];
	};
}

// â”€â”€â”€ Default email types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface DefaultEmailType {
	emailType: string;
	name: string;
	description: string;
	category: string;
}

const DEFAULT_EMAIL_TYPES: DefaultEmailType[] = [
	{
		emailType: "welcome",
		name: "Welcome email",
		description: "Sent when a new user signs up.",
		category: "auth",
	},
	{
		emailType: "verification",
		name: "Email verification",
		description: "Sent to verify the user's email address.",
		category: "auth",
	},
	{
		emailType: "password-reset",
		name: "Password reset",
		description: "Sent when a user requests a password reset.",
		category: "auth",
	},
	{
		emailType: "magic-link",
		name: "Magic link",
		description: "Sent for passwordless sign-in via magic link.",
		category: "auth",
	},
	{
		emailType: "email-otp",
		name: "Email OTP",
		description: "Sent for email-based one-time password verification.",
		category: "auth",
	},
	{
		emailType: "org-invitation",
		name: "Organization invitation",
		description: "Sent when a user is invited to join an organization.",
		category: "org",
	},
	{
		emailType: "mfa-setup",
		name: "MFA setup",
		description: "Sent with MFA setup instructions and backup codes.",
		category: "auth",
	},
];

interface BuiltInPermissionSeed {
	slug: string;
	name: string;
	description: string;
}

const BUILT_IN_PERMISSIONS: BuiltInPermissionSeed[] = [
	{
		slug: "dashboard.read",
		name: "Read dashboard",
		description: "Read dashboard and configuration data.",
	},
	{
		slug: "dashboard.manage",
		name: "Manage dashboard",
		description: "Create, update, and delete dashboard configuration.",
	},
	{
		slug: "webhook.manage",
		name: "Manage webhooks",
		description: "Create, update, and delete webhook endpoints.",
	},
	{
		slug: "email.manage",
		name: "Manage emails",
		description: "Manage email templates and provider settings.",
	},
	{
		slug: "audit.read",
		name: "Read audit logs",
		description: "View and export audit logs.",
	},
	{
		slug: "organization.read",
		name: "Read organization",
		description: "View organization details.",
	},
	{
		slug: "organization.update",
		name: "Update organization",
		description: "Update organization metadata and settings.",
	},
	{
		slug: "organization.delete",
		name: "Delete organization",
		description: "Delete an organization.",
	},
	{
		slug: "member.invite",
		name: "Invite members",
		description: "Invite users to organizations.",
	},
	{
		slug: "member.read",
		name: "Read members",
		description: "List organization members.",
	},
	{
		slug: "member.update_role",
		name: "Update member role",
		description: "Change member role assignments.",
	},
	{
		slug: "member.remove",
		name: "Remove members",
		description: "Remove members from organizations.",
	},
	{
		slug: "role.create",
		name: "Create roles",
		description: "Create custom roles.",
	},
	{
		slug: "role.read",
		name: "Read roles",
		description: "List and inspect roles.",
	},
	{
		slug: "role.update",
		name: "Update roles",
		description: "Edit custom roles.",
	},
	{
		slug: "role.delete",
		name: "Delete roles",
		description: "Delete custom roles.",
	},
	{
		slug: "permission.create",
		name: "Create permissions",
		description: "Create custom permissions.",
	},
	{
		slug: "permission.read",
		name: "Read permissions",
		description: "List and inspect permissions.",
	},
	{
		slug: "permission.delete",
		name: "Delete permissions",
		description: "Delete custom permissions.",
	},
	{
		slug: "api_key.create",
		name: "Create API keys",
		description: "Create API keys.",
	},
	{
		slug: "api_key.read",
		name: "Read API keys",
		description: "List API keys.",
	},
	{
		slug: "api_key.delete",
		name: "Delete API keys",
		description: "Revoke API keys.",
	},
	{
		slug: "sso.read",
		name: "Read SSO connections",
		description: "List and inspect enterprise SSO connections.",
	},
	{
		slug: "sso.manage",
		name: "Manage SSO connections",
		description: "Create, update, and delete enterprise SSO connections.",
	},
	{
		slug: "directory.read",
		name: "Read directories",
		description: "List and inspect SCIM directories and synced users.",
	},
	{
		slug: "directory.manage",
		name: "Manage directories",
		description: "Create and delete SCIM directories and tokens.",
	},
	{
		slug: "sandbox.create",
		name: "Create sandboxes",
		description: "Create AI/runtime sandboxes.",
	},
	{
		slug: "sandbox.read",
		name: "Read sandboxes",
		description: "View sandbox details.",
	},
	{
		slug: "sandbox.delete",
		name: "Delete sandboxes",
		description: "Delete sandboxes.",
	},
	{
		slug: "browser.launch",
		name: "Launch browser",
		description: "Launch browser sandboxes.",
	},
	{
		slug: "browser.connect",
		name: "Connect browser",
		description: "Connect to browser CDP.",
	},
	{
		slug: "billing.read",
		name: "Read billing",
		description: "View billing details.",
	},
	{
		slug: "billing.manage",
		name: "Manage billing",
		description: "Manage billing and plans.",
	},
];

const SUPER_ADMIN_ROLE_SLUG = "super_admin";
const SUPER_ADMIN_ROLE_NAME = "Super Admin";

async function ensureProjectRbacDefaults(
	db: PluginDBAdapter,
	projectId: string | undefined,
): Promise<void> {
	if (!projectId) return;

	const where: WhereClause[] = [{ field: "projectId", value: projectId }];
	const now = Date.now();

	const existingPermissions = await db.findMany<PermissionDefinitionRow>({
		model: "permissionDefinition",
		where,
		limit: 1000,
	});
	const permissionBySlug = new Map(existingPermissions.map((p) => [p.slug, p]));

	for (const def of BUILT_IN_PERMISSIONS) {
		if (permissionBySlug.has(def.slug)) continue;
		const created = await db.create<PermissionDefinitionRow>({
			model: "permissionDefinition",
			data: {
				projectId,
				name: def.name,
				slug: def.slug,
				description: def.description,
				createdAt: now,
				updatedAt: now,
			},
		});
		permissionBySlug.set(def.slug, created);
	}

	const roleRows = await db.findMany<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [{ field: "slug", value: SUPER_ADMIN_ROLE_SLUG }, ...where],
		limit: 1,
	});

	const allPermissionSlugs = Array.from(permissionBySlug.keys()).sort();
	const allPermissionsJson = JSON.stringify(allPermissionSlugs);

	if (roleRows.length === 0) {
		await db.create<RoleDefinitionRow>({
			model: "roleDefinition",
			data: {
				projectId,
				name: SUPER_ADMIN_ROLE_NAME,
				slug: SUPER_ADMIN_ROLE_SLUG,
				description: "Full access across this project and its organizations.",
				permissions: allPermissionsJson,
				isDefault: true,
				createdAt: now,
				updatedAt: now,
			},
		});
		return;
	}

	const role = roleRows[0]!;
	const existingPerms = role.permissions ? (JSON.parse(role.permissions) as string[]) : [];
	const mergedPerms = Array.from(new Set([...existingPerms, ...allPermissionSlugs])).sort();
	await db.update<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [{ field: "id", value: role.id }],
		update: {
			name: role.name || SUPER_ADMIN_ROLE_NAME,
			isDefault: true,
			permissions: JSON.stringify(mergedPerms),
			updatedAt: now,
		},
	});
}

async function addPermissionToSuperAdmin(
	db: PluginDBAdapter,
	projectId: string | undefined,
	permissionSlug: string,
): Promise<void> {
	if (!projectId) return;
	const roleRows = await db.findMany<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [
			{ field: "projectId", value: projectId },
			{ field: "slug", value: SUPER_ADMIN_ROLE_SLUG },
		],
		limit: 1,
	});
	if (roleRows.length === 0 || !roleRows[0]) return;

	const role = roleRows[0];
	const currentPerms = role.permissions ? (JSON.parse(role.permissions) as string[]) : [];
	if (currentPerms.includes(permissionSlug)) return;

	await db.update<RoleDefinitionRow>({
		model: "roleDefinition",
		where: [{ field: "id", value: role.id }],
		update: {
			permissions: JSON.stringify([...currentPerms, permissionSlug].sort()),
			updatedAt: Date.now(),
		},
	});
}

// â”€â”€â”€ CSS Sanitization â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Patterns that are dangerous in user-supplied CSS.
 *
 * - `url(` can exfiltrate data or load external resources
 * - `@import` can load external stylesheets
 * - `expression(` is an IE CSS expression (JS execution)
 * - `behavior:` loads HTC components in IE
 * - `javascript:` protocol in values
 * - `-moz-binding` can load XBL bindings in old Firefox
 */
const DANGEROUS_CSS_PATTERNS = [
	/url\s*\(/gi,
	/@import\b/gi,
	/expression\s*\(/gi,
	/behavior\s*:/gi,
	/javascript\s*:/gi,
	/-moz-binding\s*:/gi,
	/<\/?script/gi,
	/<\/?style/gi,
];

/**
 * Maximum length for customCss to prevent abuse.
 */
const MAX_CUSTOM_CSS_LENGTH = 10_000;

/**
 * Strip dangerous CSS patterns from user-supplied custom CSS.
 * Returns the sanitized string, or an empty string if the input
 * contains patterns that cannot be safely cleaned.
 */
function sanitizeCss(raw: string): string {
	if (raw.length > MAX_CUSTOM_CSS_LENGTH) {
		return raw.slice(0, MAX_CUSTOM_CSS_LENGTH);
	}
	let css = raw;
	for (const pattern of DANGEROUS_CSS_PATTERNS) {
		css = css.replace(pattern, "/* [removed] */");
	}
	return css;
}

// â”€â”€â”€ Zod Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const emptySchema = z.object({});

/** Empty body with optional projectId for project-scoped GET endpoints. */
const projectScopedEmpty = emptySchema.merge(projectScopeSchema);

const createRoleSchema = z
	.object({
		name: z.string(),
		slug: z.string(),
		description: z.string().optional(),
	})
	.merge(projectScopeSchema);

const deleteByIdSchema = z
	.object({
		id: z.string(),
	})
	.merge(projectScopeSchema);

const createPermissionSchema = z
	.object({
		name: z.string(),
		slug: z.string(),
		description: z.string().optional(),
	})
	.merge(projectScopeSchema);

const checkPermissionSchema = z
	.object({
		permission: z.string().min(1),
	})
	.merge(projectScopeSchema);

const checkPermissionsSchema = z
	.object({
		permissions: z.array(z.string().min(1)).min(1),
		operator: z.enum(["all", "any"]).optional(),
	})
	.merge(projectScopeSchema);

const saveBrandingSchema = z
	.object({
		primaryColor: z.string().optional(),
		bgColor: z.string().optional(),
		borderRadius: z.number().optional(),
		darkMode: z.boolean().optional(),
		customCss: z.string().max(MAX_CUSTOM_CSS_LENGTH).optional(),
		font: z.string().optional(),
		logoUrl: z.string().optional(),
	})
	.merge(projectScopeSchema);

const toggleEmailSchema = z
	.object({
		id: z.string(),
		enabled: z.boolean(),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Domain Config Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const saveDomainSchema = z
	.object({
		domainKey: z.string(),
		title: z.string(),
		description: z.string().optional(),
		value: z.string(),
		isDefault: z.boolean().optional(),
	})
	.merge(projectScopeSchema);

const deleteDomainSchema = z
	.object({
		domainKey: z.string(),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Redirect Config Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const saveRedirectsSchema = z
	.object({
		config: z.record(z.string(), z.union([z.string(), z.array(z.string())])),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Action Config Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const createActionSchema = z
	.object({
		name: z.string(),
		description: z.string().optional(),
		triggerEvent: z.string(),
		webhookUrl: z.string().url(),
	})
	.merge(projectScopeSchema);

const deleteActionSchema = z
	.object({
		id: z.string(),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Radar Config Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const saveRadarConfigSchema = z
	.object({
		enabled: z.boolean().optional(),
		blockImpossibleTravel: z.boolean().optional(),
		deviceFingerprinting: z.boolean().optional(),
		rateLimiting: z.boolean().optional(),
		botDetection: z.boolean().optional(),
		/** Bot detection provider: "botid" | "turnstile" | "recaptcha" | "hcaptcha" | null */
		botProvider: z.string().nullable().optional(),
		/** Provider-specific credentials (e.g. API key, site key, secret key) */
		botProviderCredentials: z
			.object({
				apiKey: z.string().optional(),
				siteKey: z.string().optional(),
				secretKey: z.string().optional(),
			})
			.optional(),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Email Provider Config Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const saveEmailProviderConfigSchema = z
	.object({
		providers: z
			.record(
				z.string(),
				z.object({
					enabled: z.boolean(),
					apiKey: z.string().optional(),
				}),
			)
			.optional(),
		activeProvider: z.string().nullable().optional(),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Resource Type Schemas â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const createResourceTypeSchema = z
	.object({
		name: z.string(),
		slug: z.string(),
		description: z.string().optional(),
	})
	.merge(projectScopeSchema);

const deleteResourceTypeSchema = z
	.object({
		id: z.string(),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Addon Config Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const saveAddonConfigSchema = z
	.object({
		addons: z.record(z.string(), z.object({ enabled: z.boolean() })),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Auth Configuration Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const saveAuthConfigSchema = z
	.object({
		roleAssignment: z.boolean().optional(),
		multipleRoles: z.boolean().optional(),
		apiKeyPermissions: z.boolean().optional(),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Project Config Schema â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const saveProjectConfigSchema = z
	.object({
		projectName: z.string().max(100).optional(),
		projectDescription: z.string().max(500).optional(),
	})
	.merge(projectScopeSchema);

const publicConfigScopeSchema = projectScopeSchema.extend({
	clientId: z.string().optional(),
});

const saveDashboardConfigSchema = z
	.object({
		authMethods: z
			.object({
				sso: z.boolean().optional(),
				emailPassword: z.boolean().optional(),
				passkey: z.boolean().optional(),
				magicLink: z.boolean().optional(),
				emailOtp: z.boolean().optional(),
				twoFactor: z.boolean().optional(),
				organization: z.boolean().optional(),
				anonymous: z.boolean().optional(),
				username: z.boolean().optional(),
			})
			.optional(),
		socialProviders: z
			.record(z.string(), z.object({ enabled: z.boolean(), demo: z.boolean().optional() }))
			.optional(),
		features: z
			.object({
				hostedUi: z.boolean().optional(),
				signUp: z.boolean().optional(),
				mfa: z.boolean().optional(),
				localization: z.boolean().optional(),
			})
			.optional(),
		sessions: z
			.object({
				maxSessionLength: z.string().optional(),
				accessTokenDuration: z.string().optional(),
				inactivityTimeout: z.string().optional(),
				corsOrigins: z.array(z.string()).optional(),
			})
			.optional(),
	})
	.merge(projectScopeSchema);

const socialProviderCredentialSchema = z
	.object({
		providerId: z.string().min(1).max(64),
	})
	.merge(projectScopeSchema);

const saveSocialProviderCredentialSchema = z
	.object({
		providerId: z.string().min(1).max(64),
		clientId: z.string().min(1).max(512),
		clientSecret: z.string().max(2048).optional(),
		tenantId: z.string().max(512).optional(),
		enabled: z.boolean().optional(),
	})
	.merge(projectScopeSchema);

// â”€â”€â”€ Static Config Builder â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface StaticDashboardConfig {
	authMethods: {
		sso: boolean;
		emailPassword: boolean;
		passkey: boolean;
		magicLink: boolean;
		emailOtp: boolean;
		twoFactor: boolean;
		organization: boolean;
		anonymous: boolean;
		username: boolean;
	};
	socialProviders: Record<string, { enabled: boolean; demo: boolean }>;
	features: {
		hostedUi: boolean;
		signUp: boolean;
		mfa: boolean;
		localization: boolean;
	};
	sessions: {
		maxSessionLength: string;
		accessTokenDuration: string;
		inactivityTimeout: string;
		corsOrigins: string[];
	};
}

function buildStaticConfig(
	options?: ConfigPluginOptions,
	scope: "global" | "project" = "global",
): StaticDashboardConfig {
	if (scope === "project") {
		return {
			authMethods: {
				sso: false,
				emailPassword: false,
				passkey: false,
				magicLink: false,
				emailOtp: false,
				twoFactor: false,
				organization: true,
				anonymous: false,
				username: false,
			},
			socialProviders: {},
			features: {
				hostedUi: false,
				signUp: true,
				mfa: false,
				localization: false,
			},
			sessions: {
				maxSessionLength: "7 days",
				accessTokenDuration: "15 minutes",
				inactivityTimeout: "2 days",
				corsOrigins: [],
			},
		};
	}

	const socialProviders: Record<string, { enabled: boolean; demo: boolean }> = {};
	if (options?.socialProviders) {
		for (const [key, value] of Object.entries(options.socialProviders)) {
			socialProviders[key] = {
				enabled: value.enabled,
				demo: value.demo ?? false,
			};
		}
	}

	return {
		authMethods: {
			sso: options?.authMethods?.sso ?? false,
			emailPassword: options?.authMethods?.emailPassword ?? true,
			passkey: options?.authMethods?.passkey ?? false,
			magicLink: options?.authMethods?.magicLink ?? false,
			emailOtp: options?.authMethods?.emailOtp ?? false,
			twoFactor: options?.authMethods?.twoFactor ?? false,
			organization: options?.authMethods?.organization ?? false,
			anonymous: options?.authMethods?.anonymous ?? false,
			username: options?.authMethods?.username ?? false,
		},
		socialProviders,
		features: {
			hostedUi: options?.features?.hostedUi ?? false,
			signUp: options?.features?.signUp ?? true,
			mfa: options?.features?.mfa ?? false,
			localization: options?.features?.localization ?? false,
		},
		sessions: {
			maxSessionLength: options?.sessions?.maxSessionLength ?? "7 days",
			accessTokenDuration: options?.sessions?.accessTokenDuration ?? "15 minutes",
			inactivityTimeout: options?.sessions?.inactivityTimeout ?? "2 days",
			corsOrigins: options?.sessions?.corsOrigins ?? [],
		},
	};
}

// â”€â”€â”€ Deep Merge Helper â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Deep-merges a partial dashboard config into a full config object.
 * Only defined keys in `partial` overwrite the target. Returns the
 * mutated `target` for convenience.
 */
function deepMergeConfig(
	target: StaticDashboardConfig,
	partial: Record<string, unknown>,
): StaticDashboardConfig {
	if (partial.authMethods && typeof partial.authMethods === "object") {
		const src = partial.authMethods as Record<string, unknown>;
		for (const key of Object.keys(src)) {
			if (key in target.authMethods && typeof src[key] === "boolean") {
				(target.authMethods as Record<string, boolean>)[key] = src[key] as boolean;
			}
		}
	}

	if (partial.socialProviders && typeof partial.socialProviders === "object") {
		const src = partial.socialProviders as Record<string, { enabled: boolean; demo?: boolean }>;
		for (const [key, value] of Object.entries(src)) {
			target.socialProviders[key] = {
				enabled: value.enabled,
				demo: value.demo ?? false,
			};
		}
	}

	if (partial.features && typeof partial.features === "object") {
		const src = partial.features as Record<string, unknown>;
		for (const key of Object.keys(src)) {
			if (key in target.features && typeof src[key] === "boolean") {
				(target.features as Record<string, boolean>)[key] = src[key] as boolean;
			}
		}
	}

	if (partial.sessions && typeof partial.sessions === "object") {
		const src = partial.sessions as Record<string, unknown>;
		if (typeof src.maxSessionLength === "string")
			target.sessions.maxSessionLength = src.maxSessionLength;
		if (typeof src.accessTokenDuration === "string")
			target.sessions.accessTokenDuration = src.accessTokenDuration;
		if (typeof src.inactivityTimeout === "string")
			target.sessions.inactivityTimeout = src.inactivityTimeout;
		if (Array.isArray(src.corsOrigins)) target.sessions.corsOrigins = src.corsOrigins as string[];
	}

	return target;
}

// â”€â”€â”€ Plugin Factory â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/**
 * Config plugin for the Banata Auth dashboard.
 *
 * Registers endpoints under `/api/auth/banata/config/...` for managing
 * dashboard configuration, roles, permissions, branding, and emails.
 *
 * @param options - Static config values sourced from environment/auth config
 * @returns A Better Auth plugin descriptor
 */
export function configPlugin(options?: ConfigPluginOptions): BetterAuthPlugin {
	/**
	 * Per-project in-memory config cache.
	 * Key format: `${projectId ?? "global"}`
	 */
	const configCache = new Map<string, StaticDashboardConfig>();
	const loadedKeys = new Set<string>();

	function cacheKey(projectId?: string): string {
		return projectId ?? "global";
	}

	function getOrCreateConfig(projectId?: string): StaticDashboardConfig {
		const key = cacheKey(projectId);
		let cfg = configCache.get(key);
		if (!cfg) {
			cfg = buildStaticConfig(options, projectId ? "project" : "global");
			configCache.set(key, cfg);
		}
		return cfg;
	}

	function requireScopedProjectId(ctx: any, scope: { projectId?: string }): string {
		if (!scope.projectId) {
			throw ctx.error("BAD_REQUEST", { message: "Project scope is required" });
		}
		return scope.projectId;
	}

	async function persistScopedDashboardConfig(
		db: PluginDBAdapter,
		scope: { where: WhereClause[]; data: Record<string, unknown> },
		config: StaticDashboardConfig,
		now: number,
	): Promise<void> {
		const configJson = JSON.stringify(config);
		const rows = await db.findMany<DashboardConfigRow>({
			model: "dashboardConfig",
			where: scope.where,
			limit: 1,
		});

		if (rows.length > 0 && rows[0]) {
			await db.update<DashboardConfigRow>({
				model: "dashboardConfig",
				where: [{ field: "id", operator: "eq", value: rows[0].id }],
				update: { configJson, updatedAt: now },
			});
			return;
		}

		await db.create<DashboardConfigRow>({
			model: "dashboardConfig",
			data: {
				...scope.data,
				configJson,
				createdAt: now,
				updatedAt: now,
			},
		});
	}

	async function syncConfiguredSocialProviders(
		db: PluginDBAdapter,
		projectId: string | undefined,
		cfg: StaticDashboardConfig,
	): Promise<StaticDashboardConfig> {
		if (!projectId) {
			return cfg;
		}

		const configuredProviders = await listProjectSocialProviderSecrets(db, projectId).catch(() => []);
		const nextProviders: Record<string, { enabled: boolean; demo: boolean }> = {};
		for (const provider of configuredProviders) {
			nextProviders[provider.name] = {
				enabled: cfg.socialProviders[provider.name]?.enabled ?? false,
				demo: false,
			};
		}
		cfg.socialProviders = nextProviders;
		return cfg;
	}

	async function getResolvedDashboardConfig(
		db: PluginDBAdapter,
		projectId?: string,
	): Promise<StaticDashboardConfig> {
		const cfg = await ensurePersistedOverrides(db, projectId);
		return syncConfiguredSocialProviders(db, projectId, cfg);
	}

	async function listSocialProviderCredentialSummary(
		db: PluginDBAdapter,
		projectId: string,
		cfg: StaticDashboardConfig,
	): Promise<
		Record<
			string,
			{
				clientId: string;
				tenantId: string | null;
				hasClientSecret: boolean;
				enabled: boolean;
				updatedAt: number;
			}
		>
	> {
		const providers = await listProjectSocialProviderSecrets(db, projectId);
		return Object.fromEntries(
			providers.map((provider) => [
				provider.name,
				{
					clientId: provider.data.clientId,
					tenantId: provider.data.tenantId ?? null,
					hasClientSecret: provider.data.clientSecret.length > 0,
					enabled: cfg.socialProviders[provider.name]?.enabled ?? false,
					updatedAt: provider.updatedAt,
				},
			]),
		);
	}

	/**
	 * Loads any persisted config overrides from the DB and merges them
	 * into the in-memory config for the given project scope.
	 * Only runs once per scope key per process.
	 */
	async function ensurePersistedOverrides(
		db: PluginDBAdapter,
		projectId?: string,
	): Promise<StaticDashboardConfig> {
		const key = cacheKey(projectId);
		const cfg = getOrCreateConfig(projectId);
		if (loadedKeys.has(key)) return cfg;
		loadedKeys.add(key);
		try {
			const scopeWhere: WhereClause[] = [];
			if (projectId) scopeWhere.push({ field: "projectId", value: projectId });

			const rows = await db.findMany<DashboardConfigRow>({
				model: "dashboardConfig",
				where: scopeWhere,
				limit: 1,
			});
			if (rows.length > 0 && rows[0]?.configJson) {
				const overrides = JSON.parse(rows[0].configJson) as Record<string, unknown>;
				deepMergeConfig(cfg, overrides);
			}
		} catch {
			// If the table doesn't exist yet or is empty, continue with defaults
		}
		return cfg;
	}

	async function requireScopedPermission(
		ctx: any,
		db: PluginDBAdapter,
		body: Record<string, unknown>,
		permission: string,
	) {
		const scope = getProjectScope(body);
		await requireProjectPermission(ctx, {
			db,
			permission,
			projectId: scope.projectId,
		});
		return scope;
	}

	async function findProjectByScope(
		db: PluginDBAdapter,
		scope: { projectId?: string; clientId?: string },
	): Promise<ProjectRow | null> {
		if (scope.projectId) {
			const rows = await db.findMany<ProjectRow>({
				model: "project",
				where: [{ field: "id", value: scope.projectId }],
				limit: 1,
			});
			return rows[0] ?? null;
		}

		if (scope.clientId) {
			const rows = await db.findMany<ProjectRow>({
				model: "project",
				where: [{ field: "slug", value: scope.clientId }],
				limit: 1,
			});
			return rows[0] ?? null;
		}

		return null;
	}

	async function resolveReadableProjectId(
		ctx: any,
		db: PluginDBAdapter,
		body: Record<string, unknown>,
	): Promise<string | undefined> {
		const clientId =
			typeof body.clientId === "string" && body.clientId.trim().length > 0
				? body.clientId.trim()
				: undefined;
		const scope = getProjectScope(body, { optional: true });
		const hasExplicitScope = Boolean(scope.projectId || clientId);
		if (!hasExplicitScope) {
			return undefined;
		}

		const project = await findProjectByScope(db, {
			projectId: scope.projectId,
			clientId,
		});
		if (!project) {
			throw ctx.error("NOT_FOUND", {
				message: "Project not found for the supplied Banata scope",
			});
		}

		return project.id;
	}

	return {
		id: "banata-config",

		// â”€â”€â”€ Schema Registration â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
		// Declare all custom models so Better Auth's adapter recognises them.
		// projectId = per-project scoping.
		schema: {
			dashboardConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					configJson: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			roleDefinition: {
				fields: {
					projectId: { type: "string" as const, required: false },
					name: { type: "string", required: true },
					slug: { type: "string", required: true },
					description: { type: "string", required: false },
					permissions: { type: "string", required: false },
					isDefault: { type: "boolean", required: false, defaultValue: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			permissionDefinition: {
				fields: {
					projectId: { type: "string" as const, required: false },
					name: { type: "string", required: true },
					slug: { type: "string", required: true },
					description: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			brandingConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					primaryColor: { type: "string", required: false },
					bgColor: { type: "string", required: false },
					borderRadius: { type: "number", required: false },
					darkMode: { type: "boolean", required: false },
					customCss: { type: "string", required: false },
					font: { type: "string", required: false },
					logoUrl: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			emailConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					emailType: { type: "string", required: true },
					name: { type: "string", required: true },
					description: { type: "string", required: false },
					enabled: { type: "boolean", required: true },
					category: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			domainConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					domainKey: { type: "string", required: true },
					title: { type: "string", required: true },
					description: { type: "string", required: false },
					value: { type: "string", required: true },
					isDefault: { type: "boolean", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			redirectConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					configJson: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			actionConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					name: { type: "string", required: true },
					description: { type: "string", required: false },
					triggerEvent: { type: "string", required: true },
					webhookUrl: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			radarConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					configJson: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			emailProviderConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					configJson: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			resourceType: {
				fields: {
					projectId: { type: "string" as const, required: false },
					name: { type: "string", required: true },
					slug: { type: "string", required: true },
					description: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			addonConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					configJson: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			projectConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					configJson: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
		},

		endpoints: {
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Dashboard Config
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			getPublicConfig: createAuthEndpoint(
				"/banata/config/public",
				{
					method: "POST",
					requireHeaders: true,
					body: publicConfigScopeSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const projectId = await resolveReadableProjectId(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
					);
					const cfg = await getResolvedDashboardConfig(db, projectId);
					return ctx.json(cfg);
				},
			),

			getDashboardConfig: createAuthEndpoint(
				"/banata/config/dashboard",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body as Record<string, unknown>;
					const scope = await requireScopedPermission(ctx, db, body, "dashboard.read");
					const cfg = await getResolvedDashboardConfig(db, scope.projectId);
					return ctx.json(cfg);
				},
			),

			saveDashboardConfig: createAuthEndpoint(
				"/banata/config/dashboard/save",
				{
					method: "POST", requireHeaders: true,
					body: saveDashboardConfigSchema,
				},
				async (ctx) => {
					const body = ctx.body as Record<string, unknown>;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(ctx, db, body, "dashboard.manage");

					// Ensure we have the latest persisted state before merging
					const cfg = await getResolvedDashboardConfig(db, scope.projectId);

					// Deep-merge the incoming partial config into the in-memory config
					deepMergeConfig(cfg, body);
					await syncConfiguredSocialProviders(db, scope.projectId, cfg);

					// Persist the full config to DB (scoped upsert)
					try {
						await persistScopedDashboardConfig(db, scope, cfg, now);
					} catch {
						// Persistence failed â€” in-memory config is still updated.
						// The next GET will return the updated config for this process lifetime.
					}

					return ctx.json(cfg);
				},
			),

			getSocialProviderCredentials: createAuthEndpoint(
				"/banata/config/social-providers/get",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body as Record<string, unknown>;
					const scope = await requireScopedPermission(ctx, db, body, "dashboard.read");
					const projectId = requireScopedProjectId(ctx, scope);
					const cfg = await getResolvedDashboardConfig(db, projectId);
					return ctx.json({
						providers: await listSocialProviderCredentialSummary(db, projectId, cfg),
					});
				},
			),

			saveSocialProviderCredential: createAuthEndpoint(
				"/banata/config/social-providers/save",
				{
					method: "POST", requireHeaders: true,
					body: saveSocialProviderCredentialSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);
					const projectId = requireScopedProjectId(ctx, scope);
					const providerId = body.providerId.trim().toLowerCase();
					const existing = await readProjectSocialProviderSecret(db, projectId, providerId);
					const clientSecret = body.clientSecret?.trim() || existing?.data.clientSecret || "";
					if (!clientSecret) {
						throw ctx.error("BAD_REQUEST", {
							message: "Client secret is required when configuring a social provider",
						});
					}

					await saveProjectSocialProviderSecret(db, {
						projectId,
						providerId,
						credentials: {
							clientId: body.clientId.trim(),
							clientSecret,
							...(body.tenantId?.trim() ? { tenantId: body.tenantId.trim() } : {}),
						},
					});

					const cfg = await getResolvedDashboardConfig(db, projectId);
					cfg.socialProviders[providerId] = {
						enabled: body.enabled ?? cfg.socialProviders[providerId]?.enabled ?? false,
						demo: false,
					};
					await persistScopedDashboardConfig(db, scope, cfg, Date.now());

					return ctx.json({
						providers: await listSocialProviderCredentialSummary(db, projectId, cfg),
						config: cfg,
					});
				},
			),

			deleteSocialProviderCredential: createAuthEndpoint(
				"/banata/config/social-providers/delete",
				{
					method: "POST", requireHeaders: true,
					body: socialProviderCredentialSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body as Record<string, unknown>;
					const scope = await requireScopedPermission(ctx, db, body, "dashboard.manage");
					const projectId = requireScopedProjectId(ctx, scope);
					const providerId = String(body.providerId).trim().toLowerCase();
					await deleteProjectSocialProviderSecret(db, projectId, providerId);

					const cfg = await getResolvedDashboardConfig(db, projectId);
					delete cfg.socialProviders[providerId];
					await persistScopedDashboardConfig(db, scope, cfg, Date.now());

					return ctx.json({
						providers: await listSocialProviderCredentialSummary(db, projectId, cfg),
						config: cfg,
					});
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Roles CRUD
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			listRoles: createAuthEndpoint(
				"/banata/config/roles/list",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "role.read",
						projectId: scope.projectId,
					});
					await ensureProjectRbacDefaults(db, scope.data.projectId);

					const roles = await db.findMany<RoleDefinitionRow>({
						model: "roleDefinition",
						where: [...scope.where],
						limit: 200,
						sortBy: { field: "createdAt", direction: "asc" },
					});

					const parsed = roles.map((r) => ({
						id: r.id,
						name: r.name,
						slug: r.slug,
						description: r.description ?? "",
						permissions: r.permissions ? (JSON.parse(r.permissions) as string[]) : [],
						isDefault: r.isDefault ?? false,
						createdAt: new Date(r.createdAt).toISOString(),
					}));

					return ctx.json({ roles: parsed });
				},
			),

			createRole: createAuthEndpoint(
				"/banata/config/roles/create",
				{
					method: "POST", requireHeaders: true,
					body: createRoleSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "role.create",
						projectId: scope.projectId,
					});
					await ensureProjectRbacDefaults(db, scope.data.projectId);
					const reservedRoleSlugs = new Set([SUPER_ADMIN_ROLE_SLUG]);
					if (reservedRoleSlugs.has(body.slug)) {
						throw ctx.error("BAD_REQUEST", {
							message: `Role slug \"${body.slug}\" is reserved`,
						});
					}

					// Check for duplicate slug (within project scope)
					const existing = await db.findMany<RoleDefinitionRow>({
						model: "roleDefinition",
						where: [{ field: "slug", value: body.slug }, ...scope.where],
						limit: 1,
					});
					if (existing.length > 0) {
						throw ctx.error("CONFLICT", {
							message: "A role with this slug already exists",
						});
					}

					const role = await db.create<RoleDefinitionRow>({
						model: "roleDefinition",
						data: {
							...scope.data,
							name: body.name,
							slug: body.slug,
							description: body.description ?? "",
							permissions: JSON.stringify([]),
							isDefault: false,
							createdAt: now,
							updatedAt: now,
						},
					});

					return ctx.json({
						role: {
							id: role.id,
							name: role.name,
							slug: role.slug,
							description: role.description ?? "",
							permissions: [] as string[],
							isDefault: false,
							createdAt: new Date(now).toISOString(),
						},
					});
				},
			),

			deleteRole: createAuthEndpoint(
				"/banata/config/roles/delete",
				{
					method: "POST", requireHeaders: true,
					body: deleteByIdSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "role.delete",
						projectId: scope.projectId,
					});
					await ensureProjectRbacDefaults(db, scope.data.projectId);

					const existing = await db.findMany<RoleDefinitionRow>({
						model: "roleDefinition",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
						limit: 1,
					});
					if (
						existing.length > 0 &&
						(existing[0]?.slug === SUPER_ADMIN_ROLE_SLUG || existing[0]?.isDefault)
					) {
						throw ctx.error("FORBIDDEN", {
							message: "Default system roles cannot be deleted",
						});
					}

					await db.delete({
						model: "roleDefinition",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
					});

					return ctx.json({ success: true });
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Permissions CRUD
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			listPermissions: createAuthEndpoint(
				"/banata/config/permissions/list",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "permission.read",
						projectId: scope.projectId,
					});
					await ensureProjectRbacDefaults(db, scope.data.projectId);

					const permissions = await db.findMany<PermissionDefinitionRow>({
						model: "permissionDefinition",
						where: [...scope.where],
						limit: 500,
						sortBy: { field: "createdAt", direction: "asc" },
					});

					const parsed = permissions.map((p) => ({
						id: p.id,
						name: p.name,
						slug: p.slug,
						description: p.description ?? "",
						createdAt: new Date(p.createdAt).toISOString(),
					}));

					return ctx.json({ permissions: parsed });
				},
			),

			createPermission: createAuthEndpoint(
				"/banata/config/permissions/create",
				{
					method: "POST", requireHeaders: true,
					body: createPermissionSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "permission.create",
						projectId: scope.projectId,
					});
					await ensureProjectRbacDefaults(db, scope.data.projectId);

					// Check for duplicate slug (within project scope)
					const existing = await db.findMany<PermissionDefinitionRow>({
						model: "permissionDefinition",
						where: [{ field: "slug", value: body.slug }, ...scope.where],
						limit: 1,
					});
					if (existing.length > 0) {
						throw ctx.error("CONFLICT", {
							message: "A permission with this slug already exists",
						});
					}

					const permission = await db.create<PermissionDefinitionRow>({
						model: "permissionDefinition",
						data: {
							...scope.data,
							name: body.name,
							slug: body.slug,
							description: body.description ?? "",
							createdAt: now,
							updatedAt: now,
						},
					});
					await addPermissionToSuperAdmin(db, scope.data.projectId, permission.slug);

					return ctx.json({
						permission: {
							id: permission.id,
							name: permission.name,
							slug: permission.slug,
							description: permission.description ?? "",
							createdAt: new Date(now).toISOString(),
						},
					});
				},
			),

			deletePermission: createAuthEndpoint(
				"/banata/config/permissions/delete",
				{
					method: "POST", requireHeaders: true,
					body: deleteByIdSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "permission.delete",
						projectId: scope.projectId,
					});
					await ensureProjectRbacDefaults(db, scope.data.projectId);

					const existing = await db.findMany<PermissionDefinitionRow>({
						model: "permissionDefinition",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
						limit: 1,
					});
					if (existing.length > 0) {
						const builtInSlugs = new Set(BUILT_IN_PERMISSIONS.map((p) => p.slug));
						const permissionSlug = existing[0]!.slug;
						if (builtInSlugs.has(permissionSlug)) {
							throw ctx.error("FORBIDDEN", {
								message: "Built-in permissions cannot be deleted",
							});
						}

						const roles = await db.findMany<RoleDefinitionRow>({
							model: "roleDefinition",
							where: [...scope.where],
							limit: 500,
						});
						for (const role of roles) {
							const rolePerms = role.permissions ? (JSON.parse(role.permissions) as string[]) : [];
							if (!rolePerms.includes(permissionSlug)) continue;
							await db.update<RoleDefinitionRow>({
								model: "roleDefinition",
								where: [{ field: "id", value: role.id }],
								update: {
									permissions: JSON.stringify(rolePerms.filter((p) => p !== permissionSlug).sort()),
									updatedAt: Date.now(),
								},
							});
						}
					}

					await db.delete({
						model: "permissionDefinition",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
					});

					return ctx.json({ success: true });
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// RBAC Helpers (customer-facing)
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			myPermissions: createAuthEndpoint(
				"/banata/rbac/my-permissions",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const { user } = await requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);

					const permissions = await getEffectiveProjectPermissions(db, {
						userId: user.id,
						projectId: scope.projectId,
					});

					return ctx.json({
						permissions: Array.from(permissions).sort(),
					});
				},
			),

			checkPermission: createAuthEndpoint(
				"/banata/rbac/check-permission",
				{
					method: "POST", requireHeaders: true,
					body: checkPermissionSchema,
				},
				async (ctx) => {
					const { user } = await requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const permissions = await getEffectiveProjectPermissions(db, {
						userId: user.id,
						projectId: scope.projectId,
					});

					return ctx.json({
						allowed: permissions.has("*") || permissions.has(ctx.body.permission),
					});
				},
			),

			checkPermissions: createAuthEndpoint(
				"/banata/rbac/check-permissions",
				{
					method: "POST", requireHeaders: true,
					body: checkPermissionsSchema,
				},
				async (ctx) => {
					const { user } = await requireAuthenticated(ctx);
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(ctx.body as Record<string, unknown>);
					const permissions = await getEffectiveProjectPermissions(db, {
						userId: user.id,
						projectId: scope.projectId,
					});
					const operator = ctx.body.operator ?? "all";
					const hasAny = ctx.body.permissions.some(
						(permission) => permissions.has("*") || permissions.has(permission),
					);
					const hasAll = ctx.body.permissions.every(
						(permission) => permissions.has("*") || permissions.has(permission),
					);

					return ctx.json({
						allowed: operator === "any" ? hasAny : hasAll,
					});
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Branding Config
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			getBrandingConfig: createAuthEndpoint(
				"/banata/config/branding/get",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"dashboard.read",
					);

					const rows = await db.findMany<BrandingConfigRow>({
						model: "brandingConfig",
						where: [...scope.where],
						limit: 1,
					});

					const row = rows.length > 0 ? rows[0] : null;
					const config = {
						primaryColor: row?.primaryColor ?? "#6366f1",
						bgColor: row?.bgColor ?? "#09090b",
						borderRadius: row?.borderRadius ?? 8,
						darkMode: row?.darkMode ?? true,
						customCss: row?.customCss ?? "",
						font: row?.font ?? "inter",
						logoUrl: row?.logoUrl ?? "",
					};

					return ctx.json(config);
				},
			),

			saveBrandingConfig: createAuthEndpoint(
				"/banata/config/branding/save",
				{
					method: "POST", requireHeaders: true,
					body: saveBrandingSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					// Try to find existing config row (scoped singleton)
					const rows = await db.findMany<BrandingConfigRow>({
						model: "brandingConfig",
						where: [...scope.where],
						limit: 1,
					});

					const updates: Record<string, unknown> = { updatedAt: now };
					if (body.primaryColor !== undefined) updates.primaryColor = body.primaryColor;
					if (body.bgColor !== undefined) updates.bgColor = body.bgColor;
					if (body.borderRadius !== undefined) updates.borderRadius = body.borderRadius;
					if (body.darkMode !== undefined) updates.darkMode = body.darkMode;
					if (body.customCss !== undefined) updates.customCss = sanitizeCss(body.customCss);
					if (body.font !== undefined) updates.font = body.font;
					if (body.logoUrl !== undefined) updates.logoUrl = body.logoUrl;

					let result: BrandingConfigRow | null;

					if (rows.length > 0 && rows[0]) {
						// Update existing
						result = await db.update<BrandingConfigRow>({
							model: "brandingConfig",
							where: [{ field: "id", operator: "eq", value: rows[0].id }],
							update: updates,
						});
					} else {
						// Create new
						result = await db.create<BrandingConfigRow>({
							model: "brandingConfig",
							data: {
								...scope.data,
								primaryColor: body.primaryColor ?? "#6366f1",
								bgColor: body.bgColor ?? "#09090b",
								borderRadius: body.borderRadius ?? 8,
								darkMode: body.darkMode ?? true,
								customCss: body.customCss ? sanitizeCss(body.customCss) : "",
								font: body.font ?? "inter",
								logoUrl: body.logoUrl ?? "",
								createdAt: now,
								updatedAt: now,
							},
						});
					}

					return ctx.json({
						primaryColor: result?.primaryColor ?? "#6366f1",
						bgColor: result?.bgColor ?? "#09090b",
						borderRadius: result?.borderRadius ?? 8,
						darkMode: result?.darkMode ?? true,
						customCss: result?.customCss ?? "",
						font: result?.font ?? "inter",
						logoUrl: result?.logoUrl ?? "",
					});
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Email Config
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			listEmailConfig: createAuthEndpoint(
				"/banata/config/emails/list",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"email.manage",
					);

					let emails = await db.findMany<EmailConfigRow>({
						model: "emailConfig",
						where: [...scope.where],
						limit: 100,
						sortBy: { field: "createdAt", direction: "asc" },
					});

					// Seed defaults on first access (scoped to project)
					if (emails.length === 0) {
						const now = Date.now();
						for (const def of DEFAULT_EMAIL_TYPES) {
							await db.create<EmailConfigRow>({
								model: "emailConfig",
								data: {
									...scope.data,
									emailType: def.emailType,
									name: def.name,
									description: def.description,
									enabled: true,
									category: def.category,
									createdAt: now,
									updatedAt: now,
								},
							});
						}
						emails = await db.findMany<EmailConfigRow>({
							model: "emailConfig",
							where: [...scope.where],
							limit: 100,
							sortBy: { field: "createdAt", direction: "asc" },
						});
					}

					const parsed = emails.map((e) => ({
						id: e.id,
						name: e.name,
						description: e.description ?? "",
						enabled: e.enabled,
						category: e.category,
					}));

					return ctx.json({ emails: parsed });
				},
			),

			toggleEmailConfig: createAuthEndpoint(
				"/banata/config/emails/toggle",
				{
					method: "POST", requireHeaders: true,
					body: toggleEmailSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"email.manage",
					);

					await db.update<EmailConfigRow>({
						model: "emailConfig",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
						update: {
							enabled: body.enabled,
							updatedAt: now,
						},
					});

					// Return updated list (scoped to project)
					const emails = await db.findMany<EmailConfigRow>({
						model: "emailConfig",
						where: [...scope.where],
						limit: 100,
						sortBy: { field: "createdAt", direction: "asc" },
					});

					const parsed = emails.map((e) => ({
						id: e.id,
						name: e.name,
						description: e.description ?? "",
						enabled: e.enabled,
						category: e.category,
					}));

					return ctx.json({ emails: parsed });
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Domain Config CRUD
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			listDomains: createAuthEndpoint(
				"/banata/config/domains/list",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"dashboard.read",
					);

					const rows = await db.findMany<DomainConfigRow>({
						model: "domainConfig",
						where: [...scope.where],
						limit: 100,
						sortBy: { field: "createdAt", direction: "asc" },
					});

					const domains = rows.map((r) => ({
						id: r.id,
						domainKey: r.domainKey,
						title: r.title,
						description: r.description ?? "",
						value: r.value,
						isDefault: r.isDefault ?? false,
					}));

					return ctx.json({ domains });
				},
			),

			saveDomain: createAuthEndpoint(
				"/banata/config/domains/save",
				{
					method: "POST", requireHeaders: true,
					body: saveDomainSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					// Upsert by domainKey (scoped)
					const existing = await db.findMany<DomainConfigRow>({
						model: "domainConfig",
						where: [{ field: "domainKey", value: body.domainKey }, ...scope.where],
						limit: 1,
					});

					if (existing.length > 0 && existing[0]) {
						await db.update<DomainConfigRow>({
							model: "domainConfig",
							where: [{ field: "id", operator: "eq", value: existing[0].id }],
							update: {
								title: body.title,
								description: body.description ?? "",
								value: body.value,
								isDefault: body.isDefault ?? existing[0].isDefault,
								updatedAt: now,
							},
						});
					} else {
						await db.create<DomainConfigRow>({
							model: "domainConfig",
							data: {
								...scope.data,
								domainKey: body.domainKey,
								title: body.title,
								description: body.description ?? "",
								value: body.value,
								isDefault: body.isDefault ?? false,
								createdAt: now,
								updatedAt: now,
							},
						});
					}

					return ctx.json({ success: true });
				},
			),

			deleteDomain: createAuthEndpoint(
				"/banata/config/domains/delete",
				{
					method: "POST", requireHeaders: true,
					body: deleteDomainSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					await db.delete({
						model: "domainConfig",
						where: [{ field: "domainKey", value: body.domainKey }, ...scope.where],
					});

					return ctx.json({ success: true });
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Redirect Config
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			getRedirects: createAuthEndpoint(
				"/banata/config/redirects/get",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"dashboard.read",
					);

					const rows = await db.findMany<RedirectConfigRow>({
						model: "redirectConfig",
						where: [...scope.where],
						limit: 1,
					});

					if (rows.length > 0 && rows[0]?.configJson) {
						return ctx.json(JSON.parse(rows[0].configJson));
					}

					return ctx.json({});
				},
			),

			saveRedirects: createAuthEndpoint(
				"/banata/config/redirects/save",
				{
					method: "POST", requireHeaders: true,
					body: saveRedirectsSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const configJson = JSON.stringify(body.config);
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					const rows = await db.findMany<RedirectConfigRow>({
						model: "redirectConfig",
						where: [...scope.where],
						limit: 1,
					});

					if (rows.length > 0 && rows[0]) {
						await db.update<RedirectConfigRow>({
							model: "redirectConfig",
							where: [{ field: "id", operator: "eq", value: rows[0].id }],
							update: { configJson, updatedAt: now },
						});
					} else {
						await db.create<RedirectConfigRow>({
							model: "redirectConfig",
							data: {
								...scope.data,
								configJson,
								createdAt: now,
								updatedAt: now,
							},
						});
					}

					return ctx.json(body.config);
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Actions CRUD
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			listActions: createAuthEndpoint(
				"/banata/config/actions/list",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"dashboard.read",
					);

					const rows = await db.findMany<ActionConfigRow>({
						model: "actionConfig",
						where: [...scope.where],
						limit: 200,
						sortBy: { field: "createdAt", direction: "asc" },
					});

					const actions = rows.map((r) => ({
						id: r.id,
						name: r.name,
						description: r.description ?? "",
						triggerEvent: r.triggerEvent,
						webhookUrl: r.webhookUrl,
						createdAt: new Date(r.createdAt).toISOString(),
					}));

					return ctx.json({ actions });
				},
			),

			createAction: createAuthEndpoint(
				"/banata/config/actions/create",
				{
					method: "POST", requireHeaders: true,
					body: createActionSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					const action = await db.create<ActionConfigRow>({
						model: "actionConfig",
						data: {
							...scope.data,
							name: body.name,
							description: body.description ?? "",
							triggerEvent: body.triggerEvent,
							webhookUrl: body.webhookUrl,
							createdAt: now,
							updatedAt: now,
						},
					});

					return ctx.json({
						action: {
							id: action.id,
							name: action.name,
							description: action.description ?? "",
							triggerEvent: action.triggerEvent,
							webhookUrl: action.webhookUrl,
							createdAt: new Date(now).toISOString(),
						},
					});
				},
			),

			deleteAction: createAuthEndpoint(
				"/banata/config/actions/delete",
				{
					method: "POST", requireHeaders: true,
					body: deleteActionSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					await db.delete({
						model: "actionConfig",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
					});

					return ctx.json({ success: true });
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Radar / Bot Protection Config
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			getRadarConfig: createAuthEndpoint(
				"/banata/config/radar/get",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"dashboard.read",
					);

					const rows = await db.findMany<RadarConfigRow>({
						model: "radarConfig",
						where: [...scope.where],
						limit: 1,
					});

					const defaults = {
						enabled: false,
						blockImpossibleTravel: true,
						deviceFingerprinting: true,
						rateLimiting: false,
						botDetection: false,
						botProvider: null as string | null,
						botProviderCredentials: {} as Record<string, string>,
					};

					if (rows.length > 0 && rows[0]?.configJson) {
						return ctx.json({ ...defaults, ...JSON.parse(rows[0].configJson) });
					}

					return ctx.json(defaults);
				},
			),

			saveRadarConfig: createAuthEndpoint(
				"/banata/config/radar/save",
				{
					method: "POST", requireHeaders: true,
					body: saveRadarConfigSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					// Read existing and merge (scoped)
					const rows = await db.findMany<RadarConfigRow>({
						model: "radarConfig",
						where: [...scope.where],
						limit: 1,
					});

					const existing =
						rows.length > 0 && rows[0]?.configJson
							? (JSON.parse(rows[0].configJson) as Record<string, unknown>)
							: {};

					// Strip scope keys from the merge to avoid storing them in configJson
					const { projectId: _p, ...bodyData } = body as Record<string, unknown>;
					const merged = { ...existing, ...bodyData };
					const configJson = JSON.stringify(merged);

					if (rows.length > 0 && rows[0]) {
						await db.update<RadarConfigRow>({
							model: "radarConfig",
							where: [{ field: "id", operator: "eq", value: rows[0].id }],
							update: { configJson, updatedAt: now },
						});
					} else {
						await db.create<RadarConfigRow>({
							model: "radarConfig",
							data: {
								...scope.data,
								configJson,
								createdAt: now,
								updatedAt: now,
							},
						});
					}

					return ctx.json(merged);
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Email Provider Config
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			getEmailProviderConfig: createAuthEndpoint(
				"/banata/config/email-providers/get",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"email.manage",
					);

					const rows = await db.findMany<EmailProviderConfigRow>({
						model: "emailProviderConfig",
						where: [...scope.where],
						limit: 1,
					});

					if (rows.length > 0 && rows[0]?.configJson) {
						return ctx.json(JSON.parse(rows[0].configJson));
					}

					return ctx.json({ providers: {}, activeProvider: null });
				},
			),

			saveEmailProviderConfig: createAuthEndpoint(
				"/banata/config/email-providers/save",
				{
					method: "POST", requireHeaders: true,
					body: saveEmailProviderConfigSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"email.manage",
					);

					// Read existing and merge (scoped)
					const rows = await db.findMany<EmailProviderConfigRow>({
						model: "emailProviderConfig",
						where: [...scope.where],
						limit: 1,
					});

					const existing =
						rows.length > 0 && rows[0]?.configJson
							? (JSON.parse(rows[0].configJson) as Record<string, unknown>)
							: { providers: {}, activeProvider: null };

					// Merge providers
					const existingProviders = (existing.providers ?? {}) as Record<string, unknown>;
					const mergedProviders = {
						...existingProviders,
						...(body.providers ?? {}),
					};
					const merged = {
						...existing,
						providers: mergedProviders,
						activeProvider:
							body.activeProvider !== undefined ? body.activeProvider : existing.activeProvider,
					};
					const configJson = JSON.stringify(merged);

					if (rows.length > 0 && rows[0]) {
						await db.update<EmailProviderConfigRow>({
							model: "emailProviderConfig",
							where: [{ field: "id", operator: "eq", value: rows[0].id }],
							update: { configJson, updatedAt: now },
						});
					} else {
						await db.create<EmailProviderConfigRow>({
							model: "emailProviderConfig",
							data: {
								...scope.data,
								configJson,
								createdAt: now,
								updatedAt: now,
							},
						});
					}

					return ctx.json(merged);
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Resource Types CRUD
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			listResourceTypes: createAuthEndpoint(
				"/banata/config/resource-types/list",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"dashboard.read",
					);

					const rows = await db.findMany<ResourceTypeRow>({
						model: "resourceType",
						where: [...scope.where],
						limit: 200,
						sortBy: { field: "createdAt", direction: "asc" },
					});

					const resourceTypes = rows.map((r) => ({
						id: r.id,
						name: r.name,
						slug: r.slug,
						description: r.description ?? "",
						createdAt: new Date(r.createdAt).toISOString(),
					}));

					return ctx.json({ resourceTypes });
				},
			),

			createResourceType: createAuthEndpoint(
				"/banata/config/resource-types/create",
				{
					method: "POST", requireHeaders: true,
					body: createResourceTypeSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					// Check for duplicate slug (within project scope)
					const existing = await db.findMany<ResourceTypeRow>({
						model: "resourceType",
						where: [{ field: "slug", value: body.slug }, ...scope.where],
						limit: 1,
					});
					if (existing.length > 0) {
						throw ctx.error("CONFLICT", {
							message: "A resource type with this slug already exists",
						});
					}

					const resourceType = await db.create<ResourceTypeRow>({
						model: "resourceType",
						data: {
							...scope.data,
							name: body.name,
							slug: body.slug,
							description: body.description ?? "",
							createdAt: now,
							updatedAt: now,
						},
					});

					return ctx.json({
						resourceType: {
							id: resourceType.id,
							name: resourceType.name,
							slug: resourceType.slug,
							description: resourceType.description ?? "",
							createdAt: new Date(now).toISOString(),
						},
					});
				},
			),

			deleteResourceType: createAuthEndpoint(
				"/banata/config/resource-types/delete",
				{
					method: "POST", requireHeaders: true,
					body: deleteResourceTypeSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					await db.delete({
						model: "resourceType",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
					});

					return ctx.json({ success: true });
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Addon Config
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			getAddonConfig: createAuthEndpoint(
				"/banata/config/addons/get",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"dashboard.read",
					);

					const rows = await db.findMany<AddonConfigRow>({
						model: "addonConfig",
						where: [...scope.where],
						limit: 1,
					});

					if (rows.length > 0 && rows[0]?.configJson) {
						return ctx.json(JSON.parse(rows[0].configJson));
					}

					return ctx.json({ addons: {} });
				},
			),

			saveAddonConfig: createAuthEndpoint(
				"/banata/config/addons/save",
				{
					method: "POST", requireHeaders: true,
					body: saveAddonConfigSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					const rows = await db.findMany<AddonConfigRow>({
						model: "addonConfig",
						where: [...scope.where],
						limit: 1,
					});

					const existing =
						rows.length > 0 && rows[0]?.configJson
							? (JSON.parse(rows[0].configJson) as {
									addons?: Record<string, unknown>;
								})
							: { addons: {} };

					const merged = {
						addons: { ...(existing.addons ?? {}), ...body.addons },
					};
					const configJson = JSON.stringify(merged);

					if (rows.length > 0 && rows[0]) {
						await db.update<AddonConfigRow>({
							model: "addonConfig",
							where: [{ field: "id", operator: "eq", value: rows[0].id }],
							update: { configJson, updatedAt: now },
						});
					} else {
						await db.create<AddonConfigRow>({
							model: "addonConfig",
							data: {
								...scope.data,
								configJson,
								createdAt: now,
								updatedAt: now,
							},
						});
					}

					return ctx.json(merged);
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Auth Configuration (authorization config page)
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			getAuthConfiguration: createAuthEndpoint(
				"/banata/config/auth-config/get",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body as Record<string, unknown>;
					const scope = await requireScopedPermission(ctx, db, body, "dashboard.read");

					const cfg = await ensurePersistedOverrides(db, scope.projectId);

					// Auth configuration is stored as part of dashboardConfig
					const configAny = cfg as unknown as Record<string, unknown>;
					const authConfig = (configAny.authConfiguration ?? {
						roleAssignment: false,
						multipleRoles: false,
						apiKeyPermissions: false,
					}) as Record<string, boolean>;

					return ctx.json(authConfig);
				},
			),

			saveAuthConfiguration: createAuthEndpoint(
				"/banata/config/auth-config/save",
				{
					method: "POST", requireHeaders: true,
					body: saveAuthConfigSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);

					const cfg = await ensurePersistedOverrides(db, scope.projectId);

					// Store in dashboardConfig as authConfiguration key
					const configAny = cfg as unknown as Record<string, unknown>;
					const existing = (configAny.authConfiguration ?? {
						roleAssignment: false,
						multipleRoles: false,
						apiKeyPermissions: false,
					}) as Record<string, boolean>;

					const merged = { ...existing };
					if (body.roleAssignment !== undefined) merged.roleAssignment = body.roleAssignment;
					if (body.multipleRoles !== undefined) merged.multipleRoles = body.multipleRoles;
					if (body.apiKeyPermissions !== undefined)
						merged.apiKeyPermissions = body.apiKeyPermissions;

					configAny.authConfiguration = merged;

					// Persist (scoped)
					try {
						const configJson = JSON.stringify(cfg);
						const rows = await db.findMany<DashboardConfigRow>({
							model: "dashboardConfig",
							where: [...scope.where],
							limit: 1,
						});

						if (rows.length > 0 && rows[0]) {
							await db.update<DashboardConfigRow>({
								model: "dashboardConfig",
								where: [{ field: "id", operator: "eq", value: rows[0].id }],
								update: { configJson, updatedAt: now },
							});
						} else {
							await db.create<DashboardConfigRow>({
								model: "dashboardConfig",
								data: {
									...scope.data,
									configJson,
									createdAt: now,
									updatedAt: now,
								},
							});
						}
					} catch {
						// In-memory state updated even if persistence fails
					}

					return ctx.json(merged);
				},
			),

			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
			// Project Config
			// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

			getProjectConfig: createAuthEndpoint(
				"/banata/config/project/get",
				{
					method: "POST", requireHeaders: true,
					body: projectScopedEmpty,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = await requireScopedPermission(
						ctx,
						db,
						ctx.body as Record<string, unknown>,
						"dashboard.read",
					);
					if (!scope.projectId) {
						throw ctx.error("BAD_REQUEST", {
							message: "projectId is required for project configuration",
						});
					}

					const rows = await db.findMany<ProjectConfigRow>({
						model: "projectConfig",
						where: [...scope.where],
						limit: 1,
					});
					const projectRows = await db.findMany<ProjectRow>({
						model: "project",
						where: [{ field: "id", value: scope.projectId }],
						limit: 1,
					});
					const project = projectRows[0] ?? null;

					const defaults = {
						projectName: project?.name ?? "My Banata Project",
						projectDescription: "",
						clientId: project?.slug ?? "banata-auth",
					};

					if (rows.length > 0 && rows[0]?.configJson) {
						const saved = JSON.parse(rows[0].configJson) as Record<string, unknown>;
						return ctx.json({
							projectName: (saved.projectName as string) ?? defaults.projectName,
							projectDescription:
								(saved.projectDescription as string) ?? defaults.projectDescription,
							clientId: defaults.clientId,
						});
					}

					return ctx.json(defaults);
				},
			),

			saveProjectConfig: createAuthEndpoint(
				"/banata/config/project/save",
				{
					method: "POST", requireHeaders: true,
					body: saveProjectConfigSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = await requireScopedPermission(
						ctx,
						db,
						body as Record<string, unknown>,
						"dashboard.manage",
					);
					if (!scope.projectId) {
						throw ctx.error("BAD_REQUEST", {
							message: "projectId is required for project configuration",
						});
					}
					const projectRows = await db.findMany<ProjectRow>({
						model: "project",
						where: [{ field: "id", value: scope.projectId }],
						limit: 1,
					});
					const project = projectRows[0] ?? null;

					// Read existing (scoped)
					const rows = await db.findMany<ProjectConfigRow>({
						model: "projectConfig",
						where: [...scope.where],
						limit: 1,
					});

					const existing =
						rows.length > 0 && rows[0]?.configJson
							? (JSON.parse(rows[0].configJson) as Record<string, unknown>)
							: {};

					const merged = { ...existing };
					if (body.projectName !== undefined) merged.projectName = body.projectName;
					if (body.projectDescription !== undefined)
						merged.projectDescription = body.projectDescription;

					const configJson = JSON.stringify(merged);

					if (rows.length > 0 && rows[0]) {
						await db.update<ProjectConfigRow>({
							model: "projectConfig",
							where: [{ field: "id", operator: "eq", value: rows[0].id }],
							update: { configJson, updatedAt: now },
						});
					} else {
						await db.create<ProjectConfigRow>({
							model: "projectConfig",
							data: {
								...scope.data,
								configJson,
								createdAt: now,
								updatedAt: now,
							},
						});
					}

					return ctx.json({
						projectName: (merged.projectName as string) ?? project?.name ?? "My Banata Project",
						projectDescription: (merged.projectDescription as string) ?? "",
						clientId: project?.slug ?? "banata-auth",
					});
				},
			),
		},
	};
}



