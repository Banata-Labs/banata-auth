import { z } from "zod";

export const phoneOtpChannels = ["sms", "whatsapp", "voice"] as const;
export type PhoneOtpChannel = (typeof phoneOtpChannels)[number];

export const phoneOtpPurposes = ["sign_in", "sign_up", "link_phone", "step_up", "recover"] as const;
export type PhoneOtpPurpose = (typeof phoneOtpPurposes)[number];

export const deviceAuthorizationStatuses = [
	"pending",
	"approved",
	"denied",
	"expired",
	"consumed",
] as const;
export type DeviceAuthorizationStatus = (typeof deviceAuthorizationStatuses)[number];

export const deviceTypes = ["browser", "mobile", "desktop", "pos_terminal", "service"] as const;
export type DeviceType = (typeof deviceTypes)[number];

export const servicePrincipalTypes = [
	"backend_worker",
	"automation_bridge",
	"pos_sync",
	"webhook_relay",
] as const;
export type ServicePrincipalType = (typeof servicePrincipalTypes)[number];

export const authClientTypes = [
	"first_party",
	"customer_app",
	"mobile_app",
	"desktop_app",
	"service",
] as const;
export type AuthClientType = (typeof authClientTypes)[number];

export const authClientAuthMethods = [
	"email_password",
	"email_otp",
	"phone_otp",
	"social_oauth",
	"passkey",
	"mfa",
	"sso",
	"linked_device",
] as const;
export type AuthClientAuthMethod = (typeof authClientAuthMethods)[number];

export const sessionClasses = [
	"web_user_session",
	"mobile_user_session",
	"linked_device_session",
	"pos_offline_device_session",
	"admin_console_session",
	"support_impersonation_session",
	"service_to_service_token",
	"api_key_session",
] as const;
export type SessionClass = (typeof sessionClasses)[number];

export const authStrengths = [
	"password",
	"email_otp",
	"phone_otp",
	"totp_mfa",
	"passkey",
	"social_oauth",
	"enterprise_sso",
	"linked_device_approval",
	"admin_step_up",
] as const;
export type AuthStrength = (typeof authStrengths)[number];

export const trustLevels = ["untrusted", "trusted", "managed", "revoked"] as const;
export type DeviceTrustLevel = (typeof trustLevels)[number];

export const e164PhoneNumberSchema = z
	.string()
	.trim()
	.regex(/^\+[1-9]\d{7,14}$/, "Phone number must be normalized to E.164 format");

export const projectIdSchema = z.string().trim().min(1);

export const requestedScopesSchema = z.array(z.string().trim().min(1).max(128)).max(50).default([]);

export const authClientSchema = z.object({
	projectId: projectIdSchema,
	clientId: z.string().trim().min(1).max(120),
	name: z.string().trim().min(1).max(120),
	type: z.enum(authClientTypes),
	allowedRedirectUris: z.array(z.string().url()).min(1).max(50),
	allowedOrigins: z.array(z.string().url()).min(1).max(50),
	allowedAudiences: z.array(z.string().trim().min(1).max(255)).min(1).max(50),
	enabledAuthMethods: z.array(z.enum(authClientAuthMethods)).min(1),
	createdAt: z.number().int().positive(),
	updatedAt: z.number().int().positive(),
});

export type AuthClientContract = z.infer<typeof authClientSchema>;

export const permissionSegmentSchema = z
	.string()
	.trim()
	.regex(/^[a-z][a-z0-9_]*$/, "Permission segments must be lowercase snake_case identifiers");

export const namespacedPermissionSchema = z
	.string()
	.trim()
	.regex(
		/^[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*\.[a-z][a-z0-9_]*$/,
		"Permissions must use app.product_surface.resource.action format",
	);

export const permissionNamespaceSchema = z.object({
	projectId: projectIdSchema,
	appAudience: permissionSegmentSchema,
	productSurface: permissionSegmentSchema,
	resource: permissionSegmentSchema,
	action: permissionSegmentSchema,
	permission: namespacedPermissionSchema,
	description: z.string().trim().min(1).max(240),
});

export const phoneOtpStartSchema = z.object({
	projectId: projectIdSchema,
	phoneNumber: e164PhoneNumberSchema,
	purpose: z.enum(phoneOtpPurposes).default("sign_in"),
	channel: z.enum(phoneOtpChannels).default("sms"),
	deviceFingerprint: z.string().trim().max(256).optional(),
});

export const phoneOtpVerifySchema = z.object({
	projectId: projectIdSchema,
	phoneNumber: e164PhoneNumberSchema,
	purpose: z.enum(phoneOtpPurposes).default("sign_in"),
	code: z
		.string()
		.trim()
		.regex(/^\d{6,8}$/, "OTP must be 6 to 8 digits"),
	verificationId: z.string().trim().min(1).optional(),
});

export const phoneOtpResendSchema = z.object({
	projectId: projectIdSchema,
	phoneNumber: e164PhoneNumberSchema,
	purpose: z.enum(phoneOtpPurposes).default("sign_in"),
	channel: z.enum(phoneOtpChannels).default("sms"),
	verificationId: z.string().trim().min(1).optional(),
});

export const phoneLinkSchema = z.object({
	projectId: projectIdSchema,
	userId: z.string().trim().min(1),
	phoneNumber: e164PhoneNumberSchema,
	verificationId: z.string().trim().min(1),
});

export const phoneUnlinkSchema = z.object({
	projectId: projectIdSchema,
	userId: z.string().trim().min(1),
	phoneNumber: e164PhoneNumberSchema.optional(),
});

export const deviceAuthorizationStartSchema = z.object({
	projectId: projectIdSchema,
	clientId: z.string().trim().min(1),
	deviceName: z.string().trim().min(1).max(120),
	deviceType: z.enum(deviceTypes),
	platform: z.string().trim().min(1).max(120),
	requestedAudience: z.string().trim().min(1).max(255),
	requestedScopes: requestedScopesSchema,
	organizationId: z.string().trim().min(1).optional(),
});

export const deviceAuthorizationPollSchema = z.object({
	projectId: projectIdSchema,
	deviceCode: z.string().trim().min(32),
});

export const deviceAuthorizationDecisionSchema = z.object({
	projectId: projectIdSchema,
	deviceCode: z.string().trim().min(32),
	approvedByUserId: z.string().trim().min(1),
	organizationId: z.string().trim().min(1).optional(),
});

export const deviceRevokeSchema = z.object({
	projectId: projectIdSchema,
	deviceId: z.string().trim().min(1),
	revokedByUserId: z.string().trim().min(1),
	reason: z.string().trim().min(1).max(500),
});

export const posOfflineSnapshotIssueSchema = z.object({
	projectId: projectIdSchema,
	deviceId: z.string().trim().min(1),
	userId: z.string().trim().min(1),
	organizationId: z.string().trim().min(1),
	sessionId: z.string().trim().min(1),
	permissions: requestedScopesSchema,
	audience: z.string().trim().min(1).max(255).default("pos"),
	expiresInSeconds: z
		.number()
		.int()
		.positive()
		.max(72 * 60 * 60)
		.default(12 * 60 * 60),
});

export const servicePrincipalSchema = z.object({
	projectId: projectIdSchema,
	principalId: z.string().trim().min(1),
	name: z.string().trim().min(1).max(120),
	type: z.enum(servicePrincipalTypes),
	audience: z.string().trim().min(1).max(255),
	scopes: requestedScopesSchema,
	credentialKeyId: z.string().trim().min(1),
	credentialHash: z.string().trim().min(32),
	rotationWindowDays: z.number().int().positive().max(90).default(30),
	lastRotatedAt: z.number().int().positive(),
	expiresAt: z.number().int().positive(),
	revokedAt: z.number().int().positive().optional(),
});

export const servicePrincipalTokenRequestSchema = z.object({
	projectId: projectIdSchema,
	principalId: z.string().trim().min(1),
	audience: z.string().trim().min(1).max(255),
	scopes: requestedScopesSchema,
});

export const supportImpersonationRequestSchema = z.object({
	projectId: projectIdSchema,
	targetUserId: z.string().trim().min(1),
	requestedByUserId: z.string().trim().min(1),
	reason: z.string().trim().min(10).max(500),
	supportTicketId: z.string().trim().min(1).max(120),
	approvedByUserId: z.string().trim().min(1).optional(),
	expiresInSeconds: z
		.number()
		.int()
		.positive()
		.max(60 * 60)
		.default(30 * 60),
	customerVisible: z.literal(true),
});

export const supportImpersonationAuditSchema = z.object({
	projectId: projectIdSchema,
	targetUserId: z.string().trim().min(1),
	impersonatedByUserId: z.string().trim().min(1),
	sessionId: z.string().trim().min(1),
	reason: z.string().trim().min(10).max(500),
	supportTicketId: z.string().trim().min(1).max(120),
	startedAt: z.number().int().positive(),
	expiresAt: z.number().int().positive(),
	stoppedAt: z.number().int().positive().optional(),
	customerVisible: z.literal(true),
});

export const tokenRevocationSubjectTypes = [
	"user",
	"organization",
	"app",
	"session_class",
	"session",
	"jti",
	"global",
] as const;
export type TokenRevocationSubjectType = (typeof tokenRevocationSubjectTypes)[number];

export const refreshTokenReuseActions = [
	"revoke_session_family",
	"revoke_user_sessions",
	"force_reauth",
	"alert_security",
] as const;
export type RefreshTokenReuseAction = (typeof refreshTokenReuseActions)[number];

export const tokenRevocationCreateSchema = z.object({
	projectId: projectIdSchema,
	subjectType: z.enum(tokenRevocationSubjectTypes),
	subjectId: z.string().trim().min(1).optional(),
	sessionId: z.string().trim().min(1).optional(),
	jti: z.string().trim().min(1).optional(),
	reason: z.string().trim().min(1).max(500),
	createdBy: z.string().trim().min(1),
	effectiveAt: z.number().int().positive().optional(),
});

export const tokenRevocationCheckSchema = z.object({
	projectId: projectIdSchema,
	subjectType: z.enum(tokenRevocationSubjectTypes).optional(),
	subjectId: z.string().trim().min(1).optional(),
	sessionId: z.string().trim().min(1).optional(),
	jti: z.string().trim().min(1).optional(),
	sessionClass: z.enum(sessionClasses).optional(),
});

export const refreshTokenRotationSchema = z.object({
	projectId: projectIdSchema,
	sessionId: z.string().trim().min(1),
	sessionFamilyId: z.string().trim().min(1),
	previousRefreshTokenHash: z.string().trim().min(32),
	nextRefreshTokenHash: z.string().trim().min(32),
	rotationCounter: z.number().int().nonnegative(),
	rotatedAt: z.number().int().positive(),
	expiresAt: z.number().int().positive(),
});

export const refreshTokenReuseDetectionSchema = z.object({
	projectId: projectIdSchema,
	sessionId: z.string().trim().min(1),
	sessionFamilyId: z.string().trim().min(1),
	reusedRefreshTokenHash: z.string().trim().min(32),
	detectedAt: z.number().int().positive(),
	ipAddress: z.string().trim().max(128).optional(),
	userAgent: z.string().trim().max(512).optional(),
	actions: z.array(z.enum(refreshTokenReuseActions)).min(1),
});

export const tokenClaimsSchema = z.object({
	iss: z.string().url(),
	sub: z.string().min(1),
	aud: z.union([z.string().min(1), z.array(z.string().min(1)).min(1)]),
	exp: z.number().int().positive(),
	iat: z.number().int().positive(),
	nbf: z.number().int().positive().optional(),
	jti: z.string().min(1),
	sid: z.string().min(1),
	project_id: z.string().min(1),
	org_id: z.string().min(1).optional(),
	session_class: z.enum(sessionClasses),
	device_id: z.string().min(1).optional(),
	auth_strength: z.enum(authStrengths),
	scope: z.string().optional(),
	token_version: z.number().int().positive(),
});

export type TokenClaims = z.infer<typeof tokenClaimsSchema>;

export interface TokenContractValidationOptions {
	expectedIssuer: string;
	expectedProjectId: string;
	expectedAudience: string;
	minTokenVersion: number;
	nowSeconds?: number;
	clockSkewSeconds?: number;
}

export interface SessionPolicy {
	projectId: string;
	sessionClass: SessionClass;
	maxLifetimeSeconds: number;
	idleTimeoutSeconds: number;
	refreshAllowed: boolean;
	requiresMfa: boolean;
	requiresTrustedDevice: boolean;
	allowedAudiences: string[];
}

export const defaultSessionPolicies: Record<SessionClass, Omit<SessionPolicy, "projectId">> = {
	web_user_session: {
		sessionClass: "web_user_session",
		maxLifetimeSeconds: 7 * 24 * 60 * 60,
		idleTimeoutSeconds: 2 * 24 * 60 * 60,
		refreshAllowed: true,
		requiresMfa: false,
		requiresTrustedDevice: false,
		allowedAudiences: ["web"],
	},
	mobile_user_session: {
		sessionClass: "mobile_user_session",
		maxLifetimeSeconds: 30 * 24 * 60 * 60,
		idleTimeoutSeconds: 7 * 24 * 60 * 60,
		refreshAllowed: true,
		requiresMfa: false,
		requiresTrustedDevice: true,
		allowedAudiences: ["mobile"],
	},
	linked_device_session: {
		sessionClass: "linked_device_session",
		maxLifetimeSeconds: 14 * 24 * 60 * 60,
		idleTimeoutSeconds: 24 * 60 * 60,
		refreshAllowed: true,
		requiresMfa: false,
		requiresTrustedDevice: true,
		allowedAudiences: ["web", "desktop"],
	},
	pos_offline_device_session: {
		sessionClass: "pos_offline_device_session",
		maxLifetimeSeconds: 72 * 60 * 60,
		idleTimeoutSeconds: 12 * 60 * 60,
		refreshAllowed: false,
		requiresMfa: false,
		requiresTrustedDevice: true,
		allowedAudiences: ["pos"],
	},
	admin_console_session: {
		sessionClass: "admin_console_session",
		maxLifetimeSeconds: 12 * 60 * 60,
		idleTimeoutSeconds: 60 * 60,
		refreshAllowed: true,
		requiresMfa: true,
		requiresTrustedDevice: false,
		allowedAudiences: ["admin"],
	},
	support_impersonation_session: {
		sessionClass: "support_impersonation_session",
		maxLifetimeSeconds: 60 * 60,
		idleTimeoutSeconds: 15 * 60,
		refreshAllowed: false,
		requiresMfa: true,
		requiresTrustedDevice: false,
		allowedAudiences: ["admin"],
	},
	service_to_service_token: {
		sessionClass: "service_to_service_token",
		maxLifetimeSeconds: 24 * 60 * 60,
		idleTimeoutSeconds: 24 * 60 * 60,
		refreshAllowed: false,
		requiresMfa: false,
		requiresTrustedDevice: false,
		allowedAudiences: ["service"],
	},
	api_key_session: {
		sessionClass: "api_key_session",
		maxLifetimeSeconds: 365 * 24 * 60 * 60,
		idleTimeoutSeconds: 30 * 24 * 60 * 60,
		refreshAllowed: false,
		requiresMfa: false,
		requiresTrustedDevice: false,
		allowedAudiences: ["api"],
	},
};

export const kasilabsPermissionPresets = {
	aiAutomation: [
		"whatsapp.instance.create",
		"whatsapp.instance.delete",
		"automation.reply.manage",
		"ecommerce.sync",
	],
	ecommercePos: [
		"merchant.organization.manage",
		"pos.terminal.approve",
		"pos.terminal.revoke",
		"pos.offline_snapshot.issue",
		"refund.create",
		"catalog.manage",
	],
	whatspoppin: [
		"business.identity.manage",
		"linked_device.approve",
		"linked_device.revoke",
		"chat.operate",
		"operator.manage",
	],
} as const;

export type PermissionNamespace = z.infer<typeof permissionNamespaceSchema>;

export function buildNamespacedPermission(params: {
	appAudience: string;
	productSurface: string;
	resource: string;
	action: string;
}): string {
	return [params.appAudience, params.productSurface, params.resource, params.action].join(".");
}

export function validatePermissionNamespaceCatalog(
	entries: PermissionNamespace[],
): PermissionNamespace[] {
	const seen = new Set<string>();
	for (const entry of entries) {
		const expected = buildNamespacedPermission(entry);
		if (entry.permission !== expected) {
			throw new Error(`Permission ${entry.permission} must match namespace ${expected}.`);
		}
		if (seen.has(entry.permission)) {
			throw new Error(`Duplicate permission namespace: ${entry.permission}.`);
		}
		seen.add(entry.permission);
	}
	return entries;
}

export function tokenHasAudience(claims: Pick<TokenClaims, "aud">, audience: string): boolean {
	return Array.isArray(claims.aud) ? claims.aud.includes(audience) : claims.aud === audience;
}

export function requireSessionClass(actual: SessionClass, allowed: SessionClass[]): void {
	if (!allowed.includes(actual)) {
		throw new Error(`Session class ${actual} is not allowed for this action.`);
	}
}

export function requireAudience(claims: Pick<TokenClaims, "aud">, audience: string): void {
	if (!tokenHasAudience(claims, audience)) {
		throw new Error(`Token audience does not include ${audience}.`);
	}
}

export function validateTokenContract(
	claims: TokenClaims,
	options: TokenContractValidationOptions,
): TokenClaims {
	const nowSeconds = options.nowSeconds ?? Math.floor(Date.now() / 1000);
	const clockSkewSeconds = options.clockSkewSeconds ?? 60;

	if (claims.iss !== options.expectedIssuer) {
		throw new Error("Token issuer does not match the expected issuer.");
	}
	if (claims.project_id !== options.expectedProjectId) {
		throw new Error("Token project does not match the expected project.");
	}
	requireAudience(claims, options.expectedAudience);
	if (claims.exp <= nowSeconds - clockSkewSeconds) {
		throw new Error("Token is expired.");
	}
	if (claims.nbf !== undefined && claims.nbf > nowSeconds + clockSkewSeconds) {
		throw new Error("Token is not valid yet.");
	}
	if (claims.token_version < options.minTokenVersion) {
		throw new Error("Token version is below the minimum accepted version.");
	}

	return claims;
}

export function requireRecentStepUp(
	lastStepUpAt: number | null | undefined,
	maxAgeSeconds: number,
): void {
	if (!lastStepUpAt || Date.now() - lastStepUpAt > maxAgeSeconds * 1000) {
		throw new Error("Recent step-up authentication is required.");
	}
}

export function requireTrustedDevice(level: DeviceTrustLevel): void {
	if (level !== "trusted" && level !== "managed") {
		throw new Error("A trusted device is required.");
	}
}
