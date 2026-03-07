/**
 * Core type definitions for Banata Auth.
 * These are the SDK-facing types (camelCase).
 * Wire types (snake_case) are separate and serializers convert between them.
 */

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface ListMetadata {
	before: string | null;
	after: string | null;
}

export interface PaginatedResult<T> {
	data: T[];
	listMetadata: ListMetadata;
}

// ─── User ────────────────────────────────────────────────────────────────────

export interface User {
	id: string;
	email: string;
	emailVerified: boolean;
	name: string;
	image: string | null;
	username: string | null;
	phoneNumber: string | null;
	phoneNumberVerified: boolean;
	role: "user" | "admin";
	banned: boolean;
	banReason: string | null;
	banExpires: Date | null;
	twoFactorEnabled: boolean;
	metadata: Record<string, unknown> | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Session {
	id: string;
	userId: string;
	token: string;
	expiresAt: Date;
	ipAddress: string | null;
	userAgent: string | null;
	activeOrganizationId: string | null;
	impersonatedBy: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface Account {
	id: string;
	userId: string;
	accountId: string;
	providerId: string;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Organization ────────────────────────────────────────────────────────────

export interface Organization {
	id: string;
	name: string;
	slug: string;
	logo: string | null;
	metadata: Record<string, unknown> | null;
	requireMfa: boolean;
	ssoEnforced: boolean;
	allowedEmailDomains: string[] | null;
	maxMembers: number | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface OrganizationMember {
	id: string;
	organizationId: string;
	userId: string;
	role: string;
	source: "manual" | "invitation" | "sso" | "scim" | "api";
	teamIds: string[];
	createdAt: Date;
	updatedAt: Date;
}

export interface OrganizationInvitation {
	id: string;
	organizationId: string;
	email: string;
	role: string;
	inviterId: string;
	status: "pending" | "accepted" | "expired" | "revoked";
	expiresAt: Date;
	createdAt: Date;
}

export interface Team {
	id: string;
	organizationId: string;
	name: string;
	description: string | null;
	metadata: Record<string, unknown> | null;
	createdAt: Date;
	updatedAt: Date;
}

// ─── SSO ─────────────────────────────────────────────────────────────────────

export type SsoConnectionType = "saml" | "oidc";
export type SsoConnectionState = "draft" | "active" | "inactive" | "validating";

export interface SsoConnection {
	id: string;
	organizationId: string;
	type: SsoConnectionType;
	state: SsoConnectionState;
	name: string;
	domains: string[];
	samlConfig: SamlConfig | null;
	oidcConfig: OidcConfig | null;
	domainVerified?: boolean;
	spMetadataUrl?: string | null;
	projectId?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface SamlConfig {
	idpEntityId: string;
	idpSsoUrl: string;
	idpSloUrl: string | null;
	idpCertificate: string;
	idpCertificateExpiresAt: Date | null;
	spEntityId: string;
	spAcsUrl: string;
	spMetadataUrl: string;
	nameIdFormat: string;
	signatureAlgorithm: "RSA-SHA256" | "RSA-SHA384" | "RSA-SHA512";
	digestAlgorithm: "SHA256" | "SHA384" | "SHA512";
	signRequest: boolean;
	allowIdpInitiated: boolean;
	attributeMapping: Record<string, string>;
}

export interface OidcConfig {
	issuer: string;
	clientId: string;
	discoveryUrl: string;
	authorizationUrl: string;
	tokenUrl: string;
	userinfoUrl: string;
	jwksUrl: string;
	scopes: string[];
	responseType: "code";
	tokenEndpointAuthMethod: "client_secret_post" | "client_secret_basic";
	claimMapping: Record<string, string>;
}

export interface SsoProfile {
	id: string;
	connectionId: string;
	connectionType: SsoConnectionType;
	organizationId: string;
	userId: string;
	idpId: string;
	email: string;
	firstName: string | null;
	lastName: string | null;
	displayName: string | null;
	groups: string[];
	rawAttributes: Record<string, string>;
	lastLoginAt: Date;
	createdAt: Date;
}

// ─── Directory Sync ──────────────────────────────────────────────────────────

export type DirectoryProvider =
	| "okta"
	| "azure_scim_v2"
	| "google_workspace"
	| "onelogin"
	| "jumpcloud"
	| "pingfederate"
	| "generic_scim_v2";

export type DirectoryState = "linked" | "unlinked" | "invalid_credentials";

export interface Directory {
	id: string;
	organizationId: string;
	type: "scim";
	state: DirectoryState;
	name: string;
	provider: DirectoryProvider;
	userCount: number;
	groupCount: number;
	lastSyncAt: Date | null;
	lastSyncStatus: "success" | "partial" | "failed" | null;
	scimConfig?: {
		baseUrl: string;
		bearerToken: string;
	};
	projectId?: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface DirectoryUser {
	id: string;
	directoryId: string;
	organizationId: string;
	userId: string | null;
	externalId: string;
	userName: string;
	emails: Array<{ value: string; type: string; primary: boolean }>;
	name: { givenName: string; familyName: string; formatted?: string };
	displayName: string;
	active: boolean;
	title: string | null;
	department: string | null;
	groups: Array<{ id: string; name: string }>;
	state: "active" | "suspended" | "deprovisioned";
	createdAt: Date;
	updatedAt: Date;
}

export interface DirectoryGroup {
	id: string;
	directoryId: string;
	organizationId: string;
	externalId: string;
	name: string;
	displayName: string;
	memberCount: number;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Audit Logs ──────────────────────────────────────────────────────────────

export interface AuditEvent {
	id: string;
	action: string;
	version: number;
	actor: {
		type: "user" | "admin" | "system" | "api_key" | "scim";
		id: string;
		name?: string;
		email?: string;
		metadata?: Record<string, string>;
	};
	targets: Array<{
		type: string;
		id: string;
		name?: string;
		metadata?: Record<string, string>;
	}>;
	context: {
		organizationId?: string;
		ipAddress?: string;
		userAgent?: string;
		location?: { city?: string; country?: string; countryCode?: string };
		requestId?: string;
	};
	changes?: {
		before?: Record<string, unknown>;
		after?: Record<string, unknown>;
	};
	idempotencyKey?: string;
	metadata?: Record<string, string>;
	occurredAt: Date;
	createdAt: Date;
}

// ─── Webhooks ────────────────────────────────────────────────────────────────

export interface WebhookEndpoint {
	id: string;
	url: string;
	eventTypes: string[];
	enabled: boolean;
	successCount: number;
	failureCount: number;
	lastDeliveryAt: Date | null;
	lastDeliveryStatus: "success" | "failure" | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface WebhookEvent {
	id: string;
	type: string;
	data: Record<string, unknown>;
	createdAt: Date;
}

// ─── Vault ───────────────────────────────────────────────────────────────────

export interface VaultSecret {
	id: string;
	name: string;
	context: string | null;
	organizationId: string | null;
	metadata: Record<string, string> | null;
	createdAt: Date;
	updatedAt: Date;
}

// ─── Portal Session ──────────────────────────────────────────────────────────

export type PortalIntent =
	| "sso"
	| "dsync"
	| "domain_verification"
	| "audit_logs"
	| "log_streams"
	| "users";

export interface PortalSession {
	link: string;
	sessionId: string;
	intent: PortalIntent;
	organizationId: string;
	expiresAt: string;
}

// ─── Domain Verification ─────────────────────────────────────────────────────

export type DomainVerificationState = "pending" | "verified" | "failed" | "expired";

export interface DomainVerification {
	id: string;
	organizationId: string;
	domain: string;
	state: DomainVerificationState;
	method: "dns_txt";
	txtRecord: { name: string; value: string };
	verifiedAt: Date | null;
	expiresAt: Date | null;
	lastCheckedAt: Date | null;
	checkCount: number;
	createdAt: Date;
	updatedAt: Date;
}

// ─── API Key ─────────────────────────────────────────────────────────────────

export interface ApiKey {
	id: string;
	name: string;
	prefix: string;
	organizationId: string | null;
	permissions: string[];
	expiresAt: Date | null;
	lastUsedAt: Date | null;
	createdAt: Date;
}

// ─── Project ─────────────────────────────────────────────────────────────────

/**
 * A project represents a fully isolated auth tenant.
 * Each product/app powered by Banata Auth is a separate project
 * with its own users, sessions, organizations, branding, etc.
 */
export interface Project {
	id: string;
	name: string;
	slug: string;
	description: string | null;
	logoUrl: string | null;
	ownerId: string;
	createdAt: Date;
	updatedAt: Date;
}
