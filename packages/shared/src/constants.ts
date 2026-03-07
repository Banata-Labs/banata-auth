/**
 * ID prefixes for all Banata Auth resources.
 * Each resource type gets a unique prefix for type-safety and debuggability.
 * Follows the WorkOS pattern of prefixed identifiers.
 */
export const ID_PREFIXES = {
	user: "usr",
	session: "ses",
	account: "acc",
	organization: "org",
	organizationMember: "mem",
	organizationInvitation: "inv",
	team: "team",
	ssoConnection: "conn",
	ssoProfile: "prof",
	directory: "dir",
	directoryUser: "diru",
	directoryGroup: "dirg",
	auditEvent: "evt",
	event: "event",
	webhookEndpoint: "wh",
	webhookDelivery: "whd",
	apiKey: "ak",
	role: "role",
	vaultSecret: "vsec",
	domainVerification: "dv",
	fgaTuple: "fga",
	radarEvent: "radar",
	project: "proj",
	environment: "env",
	emailTemplate: "etpl",
} as const;

export type ResourceType = keyof typeof ID_PREFIXES;
export type IdPrefix = (typeof ID_PREFIXES)[ResourceType];

/**
 * Default rate limits per endpoint category (requests per minute).
 */
export const RATE_LIMITS = {
	general: 600,
	signIn: 30,
	signUp: 10,
	passwordReset: 10,
	emailOperations: 10,
	scim: 100,
	admin: 120,
	webhookDelivery: 0, // No limit (outbound)
} as const;

/**
 * Default token/session lifetimes in seconds.
 */
export const TOKEN_LIFETIMES = {
	/** JWT access token: 15 minutes */
	accessToken: 15 * 60,
	/** Session record: 7 days */
	session: 7 * 24 * 60 * 60,
	/** Session absolute max: 30 days */
	sessionAbsoluteMax: 30 * 24 * 60 * 60,
	/** Password reset token: 1 hour */
	passwordReset: 60 * 60,
	/** Email verification token: 24 hours */
	emailVerification: 24 * 60 * 60,
	/** Magic link: 10 minutes */
	magicLink: 10 * 60,
	/** Email OTP: 10 minutes */
	emailOtp: 10 * 60,
	/** Admin portal link (short-lived): 5 minutes */
	adminPortalShort: 5 * 60,
	/** Admin portal link (long-lived): 30 days */
	adminPortalLong: 30 * 24 * 60 * 60,
	/** Organization invitation: 7 days */
	invitation: 7 * 24 * 60 * 60,
	/** JWKS key rotation: 90 days */
	jwksRotation: 90 * 24 * 60 * 60,
} as const;

/**
 * Size limits.
 */
export const SIZE_LIMITS = {
	/** Max custom metadata size in bytes */
	metadataMaxBytes: 16 * 1024, // 16KB
	/** Max SAML response size in bytes */
	samlMaxBytes: 256 * 1024, // 256KB
	/** Max SAML XML depth */
	samlMaxDepth: 50,
	/** Max webhook payload size in bytes */
	webhookMaxBytes: 256 * 1024, // 256KB
	/** Max webhook response body stored (bytes) */
	webhookResponseMaxBytes: 10 * 1024, // 10KB
	/** Max SCIM request body size in bytes */
	scimMaxBytes: 1024 * 1024, // 1MB
	/** Max password length */
	passwordMaxLength: 128,
	/** Min password length */
	passwordMinLength: 8,
	/** Max FGA hierarchy depth */
	fgaMaxDepth: 10,
} as const;

/**
 * Webhook retry delays in milliseconds.
 */
export const WEBHOOK_RETRY_DELAYS = [
	0, // Attempt 1: immediate
	5 * 60 * 1000, // Attempt 2: 5 minutes
	30 * 60 * 1000, // Attempt 3: 30 minutes
	2 * 60 * 60 * 1000, // Attempt 4: 2 hours
	24 * 60 * 60 * 1000, // Attempt 5: 24 hours
] as const;

/**
 * Max consecutive webhook failures before auto-disabling endpoint.
 */
export const WEBHOOK_MAX_CONSECUTIVE_FAILURES = 3;

/**
 * Max number of webhook retry attempts.
 */
export const WEBHOOK_MAX_ATTEMPTS = 5;
