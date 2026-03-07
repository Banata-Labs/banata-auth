import type {
	ApiKey,
	AuditEvent,
	Directory,
	Organization,
	SsoConnection,
	User,
	WebhookEndpoint,
} from "@banata-auth/shared";

export { listEnabledSocialProviderIds } from "@banata-auth/shared";

type JsonObject = Record<string, unknown>;

export function isObject(value: unknown): value is JsonObject {
	return typeof value === "object" && value !== null;
}

export function getArrayFromPayload(payload: unknown): unknown[] {
	if (Array.isArray(payload)) {
		return payload;
	}
	if (!isObject(payload)) {
		return [];
	}
	const candidates = [
		payload.data,
		payload.users,
		payload.organizations,
		payload.connections,
		payload.directories,
		payload.auditLogs,
		payload.events,
		payload.keys,
		payload.webhooks,
		payload.endpoints,
		payload.templates,
		payload.projects,
		payload.roles,
		payload.permissions,
		payload.emails,
		payload.domains,
		payload.actions,
		payload.resourceTypes,
	];
	for (const candidate of candidates) {
		if (Array.isArray(candidate)) {
			return candidate;
		}
	}
	return [];
}

function asString(value: unknown): string {
	return typeof value === "string" ? value : "";
}

function asNullableString(value: unknown): string | null {
	return typeof value === "string" ? value : null;
}

function asBoolean(value: unknown): boolean {
	return typeof value === "boolean" ? value : false;
}

function asDate(value: unknown): Date {
	if (value instanceof Date) {
		return value;
	}
	if (typeof value === "string") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}
	if (typeof value === "number") {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.getTime())) {
			return parsed;
		}
	}
	return new Date(0);
}

function asStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) {
		return [];
	}
	return value.filter((entry): entry is string => typeof entry === "string");
}

function asStringRecord(value: unknown): Record<string, string> {
	if (!isObject(value)) {
		return {};
	}
	return Object.fromEntries(
		Object.entries(value).filter(
			(entry): entry is [string, string] => typeof entry[1] === "string",
		),
	);
}

export function parseUser(payload: unknown): User | null {
	if (!isObject(payload)) {
		return null;
	}
	const id = asString(payload.id);
	const email = asString(payload.email);
	if (!id || !email) {
		return null;
	}
	const role = payload.role === "admin" ? "admin" : "user";
	const result: User & { projectId?: string } = {
		id,
		email,
		emailVerified: asBoolean(payload.emailVerified),
		name: asString(payload.name),
		image: asNullableString(payload.image),
		username: asNullableString(payload.username),
		phoneNumber: asNullableString(payload.phoneNumber),
		phoneNumberVerified: asBoolean(payload.phoneNumberVerified),
		role,
		banned: asBoolean(payload.banned),
		banReason: asNullableString(payload.banReason),
		banExpires: null,
		twoFactorEnabled: asBoolean(payload.twoFactorEnabled),
		metadata: null,
		createdAt: asDate(payload.createdAt),
		updatedAt: asDate(payload.updatedAt),
	};
	// Preserve projectId for client-side project filtering
	if (typeof payload.projectId === "string") {
		result.projectId = payload.projectId;
	}
	return result;
}

export function parseOrganization(payload: unknown): Organization | null {
	if (!isObject(payload)) {
		return null;
	}
	const id = asString(payload.id);
	if (!id) {
		return null;
	}
	const result: Organization & { projectId?: string } = {
		id,
		name: asString(payload.name) || "Organization",
		slug: asString(payload.slug) || id,
		logo: asNullableString(payload.logo),
		metadata: null,
		requireMfa: asBoolean(payload.requireMfa),
		ssoEnforced: asBoolean(payload.ssoEnforced),
		allowedEmailDomains: asStringArray(payload.allowedEmailDomains),
		maxMembers: typeof payload.maxMembers === "number" ? payload.maxMembers : null,
		createdAt: asDate(payload.createdAt),
		updatedAt: asDate(payload.updatedAt),
	};
	if (typeof payload.projectId === "string") {
		result.projectId = payload.projectId;
	}
	return result;
}

export function parseConnection(payload: unknown): SsoConnection | null {
	if (!isObject(payload)) {
		return null;
	}
	const id = asString(payload.id);
	const organizationId = asString(payload.organizationId) || asString(payload.orgId) || "unknown";
	if (!id) {
		return null;
	}
	const type = payload.type === "saml" ? "saml" : "oidc";
	const active = payload.active === true;
	const state =
		payload.state === "active" || payload.state === "inactive" || payload.state === "validating"
			? payload.state
			: active
				? "active"
				: "draft";
	const result: SsoConnection & { projectId?: string } = {
		id,
		organizationId,
		type,
		state,
		name: asString(payload.name) || "Connection",
		domains:
			asStringArray(payload.domains).length > 0
				? asStringArray(payload.domains)
				: asString(payload.domain)
					? [asString(payload.domain)]
					: [],
		samlConfig:
			type === "saml" && isObject(payload.samlConfig)
				? {
						idpEntityId: asString(payload.samlConfig.idpEntityId),
						idpSsoUrl: asString(payload.samlConfig.idpSsoUrl),
						idpSloUrl: asNullableString(payload.samlConfig.idpSloUrl),
						idpCertificate: asString(payload.samlConfig.idpCertificate),
						idpCertificateExpiresAt: payload.samlConfig.idpCertificateExpiresAt
							? asDate(payload.samlConfig.idpCertificateExpiresAt)
							: null,
						spEntityId: asString(payload.samlConfig.spEntityId),
						spAcsUrl: asString(payload.samlConfig.spAcsUrl),
						spMetadataUrl:
							asString(payload.samlConfig.spMetadataUrl) || asString(payload.spMetadataUrl),
						nameIdFormat: asString(payload.samlConfig.nameIdFormat),
						signatureAlgorithm:
							payload.samlConfig.signatureAlgorithm === "RSA-SHA384"
								? "RSA-SHA384"
								: payload.samlConfig.signatureAlgorithm === "RSA-SHA512"
									? "RSA-SHA512"
									: "RSA-SHA256",
						digestAlgorithm:
							payload.samlConfig.digestAlgorithm === "SHA384"
								? "SHA384"
								: payload.samlConfig.digestAlgorithm === "SHA512"
									? "SHA512"
									: "SHA256",
						signRequest: asBoolean(payload.samlConfig.signRequest),
						allowIdpInitiated: asBoolean(payload.samlConfig.allowIdpInitiated),
						attributeMapping: asStringRecord(payload.samlConfig.attributeMapping),
					}
				: null,
		oidcConfig:
			type === "oidc" && isObject(payload.oidcConfig)
				? {
						issuer: asString(payload.oidcConfig.issuer),
						clientId: asString(payload.oidcConfig.clientId),
						discoveryUrl: asString(payload.oidcConfig.discoveryUrl),
						authorizationUrl: asString(payload.oidcConfig.authorizationUrl),
						tokenUrl: asString(payload.oidcConfig.tokenUrl),
						userinfoUrl: asString(payload.oidcConfig.userinfoUrl),
						jwksUrl: asString(payload.oidcConfig.jwksUrl),
						scopes: asStringArray(payload.oidcConfig.scopes),
						responseType: "code",
						tokenEndpointAuthMethod:
							payload.oidcConfig.tokenEndpointAuthMethod === "client_secret_basic"
								? "client_secret_basic"
								: "client_secret_post",
						claimMapping: asStringRecord(payload.oidcConfig.claimMapping),
					}
				: null,
		domainVerified: asBoolean(payload.domainVerified),
		spMetadataUrl: asNullableString(payload.spMetadataUrl),
		createdAt: asDate(payload.createdAt),
		updatedAt: asDate(payload.updatedAt),
	};
	if (typeof payload.projectId === "string") {
		result.projectId = payload.projectId;
	}
	return result;
}

export function parseDirectory(payload: unknown): Directory | null {
	if (!isObject(payload)) {
		return null;
	}
	const id = asString(payload.id);
	const organizationId = asString(payload.organizationId) || asString(payload.orgId) || "unknown";
	if (!id) {
		return null;
	}
	const result: Directory & { projectId?: string } = {
		id,
		organizationId,
		type: "scim",
		state:
			payload.state === "invalid_credentials"
				? "invalid_credentials"
				: payload.state === "unlinked"
					? "unlinked"
					: "linked",
		name: asString(payload.name),
		provider: asString(payload.provider) as Directory["provider"],
		userCount: typeof payload.userCount === "number" ? payload.userCount : 0,
		groupCount: typeof payload.groupCount === "number" ? payload.groupCount : 0,
		lastSyncAt: payload.lastSyncAt ? asDate(payload.lastSyncAt) : null,
		lastSyncStatus:
			payload.lastSyncStatus === "success" ||
			payload.lastSyncStatus === "partial" ||
			payload.lastSyncStatus === "failed"
				? payload.lastSyncStatus
				: null,
		scimConfig:
			isObject(payload.scimConfig) &&
			typeof payload.scimConfig.baseUrl === "string" &&
			typeof payload.scimConfig.bearerToken === "string"
				? {
						baseUrl: payload.scimConfig.baseUrl,
						bearerToken: payload.scimConfig.bearerToken,
					}
				: undefined,
		createdAt: asDate(payload.createdAt),
		updatedAt: asDate(payload.updatedAt),
	};
	if (typeof payload.projectId === "string") {
		result.projectId = payload.projectId;
	}
	return result;
}

export function parseAuditEvent(payload: unknown): AuditEvent | null {
	if (!isObject(payload)) {
		return null;
	}
	const id = asString(payload.id);
	if (!id) {
		return null;
	}
	const result: AuditEvent & { projectId?: string } = {
		id,
		action: asString(payload.action),
		version: typeof payload.version === "number" ? payload.version : 1,
		actor: isObject(payload.actor)
			? {
					type:
						payload.actor.type === "admin"
							? "admin"
							: payload.actor.type === "api_key"
								? "api_key"
								: payload.actor.type === "scim"
									? "scim"
									: payload.actor.type === "system"
										? "system"
										: "user",
					id: asString(payload.actor.id),
					name: asString(payload.actor.name) || undefined,
					email: asString(payload.actor.email) || undefined,
					metadata: undefined,
				}
			: { type: "system", id: "unknown" },
		targets: [],
		context: {},
		changes: undefined,
		metadata: undefined,
		occurredAt: asDate(payload.occurredAt),
		createdAt: asDate(payload.createdAt ?? payload.occurredAt),
	};
	if (typeof payload.projectId === "string") {
		result.projectId = payload.projectId;
	}
	return result;
}

export function parseApiKey(payload: unknown): ApiKey | null {
	if (!isObject(payload)) {
		return null;
	}
	const id = asString(payload.id);
	if (!id) {
		return null;
	}
	const prefix = asString(payload.prefix || payload.start);
	// Parse metadata — Better Auth stores it as JSON string or object.
	// We stash projectId in metadata on create, so we need to preserve it
	// for client-side project filtering.
	let metadata: Record<string, unknown> | null = null;
	if (typeof payload.metadata === "string") {
		try {
			const parsed = JSON.parse(payload.metadata);
			if (typeof parsed === "object" && parsed !== null) metadata = parsed;
		} catch {
			/* ignore malformed metadata */
		}
	} else if (typeof payload.metadata === "object" && payload.metadata !== null) {
		metadata = payload.metadata as Record<string, unknown>;
	}
	const result: ApiKey & { metadata?: Record<string, unknown> | null } = {
		id,
		name: asString(payload.name),
		prefix,
		organizationId: asNullableString(payload.organizationId),
		permissions: asStringArray(payload.permissions),
		expiresAt: payload.expiresAt ? asDate(payload.expiresAt) : null,
		lastUsedAt: payload.lastUsedAt ? asDate(payload.lastUsedAt) : null,
		createdAt: asDate(payload.createdAt),
	};
	if (metadata) {
		result.metadata = metadata;
	}
	return result;
}

export function parseWebhookEndpoint(payload: unknown): WebhookEndpoint | null {
	if (!isObject(payload)) {
		return null;
	}
	const id = asString(payload.id);
	const url = asString(payload.url);
	if (!id || !url) {
		return null;
	}
	const rawEventTypes = payload.eventTypes;
	const eventTypes = Array.isArray(rawEventTypes)
		? asStringArray(rawEventTypes)
		: typeof rawEventTypes === "string"
			? (() => {
					try {
						const parsed = JSON.parse(rawEventTypes);
						return Array.isArray(parsed) ? asStringArray(parsed) : [];
					} catch {
						return [];
					}
				})()
			: [];
	const result: WebhookEndpoint & { projectId?: string } = {
		id,
		url,
		eventTypes,
		enabled: asBoolean(payload.enabled),
		successCount: typeof payload.successCount === "number" ? payload.successCount : 0,
		failureCount: typeof payload.failureCount === "number" ? payload.failureCount : 0,
		lastDeliveryAt: payload.lastDeliveryAt ? asDate(payload.lastDeliveryAt) : null,
		lastDeliveryStatus:
			payload.lastDeliveryStatus === "success" || payload.lastDeliveryStatus === "failure"
				? payload.lastDeliveryStatus
				: null,
		createdAt: asDate(payload.createdAt),
		updatedAt: asDate(payload.updatedAt),
	};
	if (typeof payload.projectId === "string") {
		result.projectId = payload.projectId;
	}
	return result;
}
