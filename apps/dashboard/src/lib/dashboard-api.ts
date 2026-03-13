"use client";

import type {
	ApiKey,
	AuditEvent,
	Directory,
	Organization,
	RuntimeAuthConfig,
	SsoConnection,
	User,
	WebhookEndpoint,
} from "@banata-auth/shared";
import {
	getArrayFromPayload,
	listEnabledSocialProviderIds,
	parseApiKey,
	parseAuditEvent,
	parseConnection,
	parseDirectory,
	parseOrganization,
	parseUser,
	parseWebhookEndpoint,
} from "./normalizers";

// ── Scope Injection ──────────────────────────────────────────────────
// Module-level scope that gets auto-injected into every API call body.
// The ProjectEnvironmentProvider calls `setActiveScope` whenever the
// active project changes.

let _activeProjectId: string | null = null;
const ACTIVE_PROJECT_STORAGE_KEY = "banata-active-project-id";

function getPersistedActiveProjectId(): string | null {
	if (typeof window === "undefined") return null;
	const stored = window.localStorage.getItem(ACTIVE_PROJECT_STORAGE_KEY);
	return typeof stored === "string" && stored.trim().length > 0 ? stored.trim() : null;
}

function getEffectiveActiveProjectId(): string | null {
	return _activeProjectId ?? getPersistedActiveProjectId();
}

/**
 * Set the active project scope for all API calls.
 * Called by ProjectEnvironmentProvider when the selection changes.
 */
export function setActiveScope(projectId: string | null) {
	if (_activeProjectId !== projectId) {
		// Project changed — flush cached data so stale cross-project data is never shown
		invalidateCache();
		permissionCheckCache.clear();
	}
	_activeProjectId = projectId;
}

/** Get the current active scope (for components that need to read it). */
export function getActiveScope(): { projectId: string | null } {
	return { projectId: getEffectiveActiveProjectId() };
}

// ── Client-side project filter ───────────────────────────────────────
// The dashboard still filters certain responses client-side as a defense-in-depth
// layer. The server now scopes managed API-key traffic by project, but this
// keeps stale or legacy unscoped rows from leaking into the active project UI.

/**
 * Client-side project filter. Only returns records that belong to the
 * active project. Records without any projectId are EXCLUDED — a new
 * project is a clean slate with zero inherited data.
 */
function filterByActiveProject<T>(items: T[]): T[] {
	const activeProjectId = getEffectiveActiveProjectId();
	if (!activeProjectId) return items;
	return items.filter((item) => {
		const obj = item as Record<string, unknown>;
		// Direct projectId field (most tables)
		if (obj.projectId === activeProjectId) return true;
		// Check metadata.projectId (used by API keys — Better Auth stores
		// arbitrary metadata but ignores top-level projectId)
		if (typeof obj.metadata === "object" && obj.metadata !== null) {
			const meta = obj.metadata as Record<string, unknown>;
			if (meta.projectId === activeProjectId) return true;
		}
		// Everything else is excluded — no spillovers between projects
		return false;
	});
}

/**
 * Custom error class to distinguish network/connectivity errors from
 * server-side errors. Pages use this to decide whether to show a toast
 * (server error on user action) or silently degrade (backend unreachable).
 */
export class ApiError extends Error {
	/** True when the request failed due to network issues (backend unreachable). */
	readonly isNetworkError: boolean;
	readonly status: number | null;

	constructor(message: string, opts: { isNetworkError?: boolean; status?: number } = {}) {
		super(message);
		this.name = "ApiError";
		this.isNetworkError = opts.isNetworkError ?? false;
		this.status = opts.status ?? null;
	}
}

function redirectToSignIn(): void {
	if (typeof window === "undefined") return;
	const pathname = window.location.pathname;
	if (pathname === "/sign-in") return;
	const redirectUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
	window.location.replace(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
}

// ── Client-side in-memory cache ──────────────────────────────────────
// Caches GET-style (read-only) API responses to eliminate redundant network
// requests when navigating back to previously visited pages.

const apiCache = new Map<string, { data: unknown; expiry: number }>();

const DEFAULT_CACHE_TTL = 30_000; // 30 seconds

async function cachedPostJson(
	path: string,
	body: Record<string, unknown>,
	ttlMs = DEFAULT_CACHE_TTL,
): Promise<unknown> {
	// Include active scope in cache key so different projects don't share cached data
	const scopeKey = getEffectiveActiveProjectId() ?? "";
	const key = `${scopeKey}|${path}:${JSON.stringify(body)}`;
	const cached = apiCache.get(key);
	if (cached && Date.now() < cached.expiry) {
		return cached.data;
	}
	const data = await postJson(path, body);
	apiCache.set(key, { data, expiry: Date.now() + ttlMs });
	return data;
}

/**
 * Invalidate cached API responses. Call after mutations to ensure
 * subsequent reads fetch fresh data.
 *
 * @param pathPrefix - If provided, only clears entries whose path starts with this prefix.
 *                     If omitted, clears the entire cache.
 */
export function invalidateCache(pathPrefix?: string) {
	if (!pathPrefix) {
		apiCache.clear();
		return;
	}
	for (const key of apiCache.keys()) {
		if (key.startsWith(pathPrefix)) apiCache.delete(key);
	}
}

/**
 * Speculatively pre-fetch common dashboard data endpoints after login.
 * Fire-and-forget: failures are silently ignored.
 */
export function prefetchDashboardData() {
	const endpoints = [
		"/api/auth/admin/list-users",
		"/api/auth/organization/list",
		"/api/auth/banata/config/dashboard",
		"/api/auth/banata/audit-logs/list",
		"/api/auth/banata/config/branding/get",
	];
	for (const path of endpoints) {
		cachedPostJson(path, {}).catch(() => {});
	}
}

/**
 * Paths that should NOT have scope auto-injected (e.g., project management
 * endpoints themselves, or endpoints that handle scoping differently).
 */
const SCOPE_EXEMPT_PATHS = new Set([
	"/api/auth/banata/projects/list",
	"/api/auth/banata/projects/get",
	"/api/auth/banata/projects/create",
	"/api/auth/banata/projects/update",
	"/api/auth/banata/projects/delete",
	"/api/auth/banata/projects/ensure-default",
	"/api/auth/banata/rbac/check-permission",
	"/api/auth/banata/rbac/check-permissions",
	"/api/auth/banata/rbac/my-permissions",
]);

const permissionCheckCache = new Map<string, { allowed: boolean; expiry: number }>();
const PERMISSION_CHECK_TTL = 10_000;

function resolvePermissionForPath(path: string): string | null {
	if (path.startsWith("/api/auth/banata/config/roles/list")) return "role.read";
	if (path.startsWith("/api/auth/banata/config/roles/create")) return "role.create";
	if (path.startsWith("/api/auth/banata/config/roles/update")) return "role.update";
	if (path.startsWith("/api/auth/banata/config/roles/delete")) return "role.delete";
	if (path.startsWith("/api/auth/banata/config/permissions/list")) return "permission.read";
	if (path.startsWith("/api/auth/banata/config/permissions/create")) return "permission.create";
	if (path.startsWith("/api/auth/banata/config/permissions/update")) return "permission.update";
	if (path.startsWith("/api/auth/banata/config/permissions/delete")) return "permission.delete";
	if (path.startsWith("/api/auth/banata/webhooks/")) return "webhook.manage";
	if (path.startsWith("/api/auth/banata/audit-logs/")) return "audit.read";
	if (
		path.startsWith("/api/auth/banata/sso/list-providers") ||
		path.startsWith("/api/auth/banata/sso/get-provider")
	) {
		return "sso.read";
	}
	if (
		path.startsWith("/api/auth/banata/sso/register") ||
		path.startsWith("/api/auth/banata/sso/update-provider") ||
		path.startsWith("/api/auth/banata/sso/delete-provider")
	) {
		return "sso.manage";
	}
	if (
		path.startsWith("/api/auth/banata/scim/list-providers") ||
		path.startsWith("/api/auth/banata/scim/get-provider") ||
		path.startsWith("/api/auth/banata/scim/list-users") ||
		path.startsWith("/api/auth/banata/scim/get-user") ||
		path.startsWith("/api/auth/banata/scim/list-groups") ||
		path.startsWith("/api/auth/banata/scim/get-group")
	) {
		return "directory.read";
	}
	if (
		path.startsWith("/api/auth/banata/scim/register") ||
		path.startsWith("/api/auth/banata/scim/delete-provider")
	) {
		return "directory.manage";
	}
	if (
		path.startsWith("/api/auth/banata/domains/get") ||
		path.startsWith("/api/auth/banata/domains/list")
	) {
		return "sso.read";
	}
	if (
		path.startsWith("/api/auth/banata/domains/create") ||
		path.startsWith("/api/auth/banata/domains/verify") ||
		path.startsWith("/api/auth/banata/domains/delete")
	) {
		return "sso.manage";
	}
	if (
		path.startsWith("/api/auth/banata/emails/") ||
		path.startsWith("/api/auth/banata/test-email")
	) {
		return "email.manage";
	}
	if (path.startsWith("/api/auth/banata/config/")) return "dashboard.manage";
	return null;
}

async function ensurePermission(permission: string, projectId: string): Promise<void> {
	const key = `${projectId}:${permission}`;
	const cached = permissionCheckCache.get(key);
	if (cached && Date.now() < cached.expiry) {
		if (cached.allowed) return;
		throw new ApiError(`Missing permission: ${permission}`, { status: 403 });
	}

	let response: Response;
	try {
		response = await fetch("/api/auth/banata/rbac/check-permission", {
			method: "POST",
			credentials: "include",
			headers: { "content-type": "application/json" },
			body: JSON.stringify({ projectId, permission }),
		});
	} catch {
		throw new ApiError("Backend is unreachable — is your Convex dev server running?", {
			isNetworkError: true,
		});
	}

	if (!response.ok) {
		const text = await response.text().catch(() => "");
		if (response.status === 401) {
			redirectToSignIn();
		}
		throw new ApiError(
			`Permission check failed: ${response.status} ${response.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`,
			{ status: response.status },
		);
	}

	const payload = (await response.json()) as { allowed?: boolean };
	const allowed = payload.allowed === true;
	permissionCheckCache.set(key, { allowed, expiry: Date.now() + PERMISSION_CHECK_TTL });
	if (!allowed) {
		throw new ApiError(`Missing permission: ${permission}`, { status: 403 });
	}
}

async function postJson(path: string, body: Record<string, unknown>): Promise<unknown> {
	// Auto-inject projectId unless exempt or already provided
	const mergedBody = { ...body };
	const headers: Record<string, string> = { "content-type": "application/json" };
	const activeProjectId = getEffectiveActiveProjectId();
	if (!SCOPE_EXEMPT_PATHS.has(path)) {
		if (activeProjectId && !mergedBody.projectId) {
			mergedBody.projectId = activeProjectId;
		}
		if (activeProjectId) {
			headers["x-banata-project-id"] = activeProjectId;
		}
	}

	if (activeProjectId && !SCOPE_EXEMPT_PATHS.has(path)) {
		const permission = resolvePermissionForPath(path);
		if (permission) {
			await ensurePermission(permission, activeProjectId);
		}
	}

	let response: Response;
	try {
		response = await fetch(path, {
			method: "POST",
			credentials: "include",
			headers,
			body: JSON.stringify(mergedBody),
		});
	} catch {
		throw new ApiError("Backend is unreachable — is your Convex dev server running?", {
			isNetworkError: true,
		});
	}
	if (!response.ok) {
		const text = await response.text().catch(() => "");
		if (response.status === 401) {
			redirectToSignIn();
		}
		throw new ApiError(
			`Request failed: ${response.status} ${response.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`,
			{ status: response.status },
		);
	}
	if (response.status === 204) {
		return null;
	}
	return response.json();
}

async function getJson(path: string): Promise<unknown> {
	const headers: Record<string, string> = { "content-type": "application/json" };
	const activeProjectId = getEffectiveActiveProjectId();
	if (activeProjectId && !SCOPE_EXEMPT_PATHS.has(path)) {
		headers["x-banata-project-id"] = activeProjectId;
	}
	let response: Response;
	try {
		response = await fetch(path, {
			method: "GET",
			credentials: "include",
			headers,
		});
	} catch {
		throw new ApiError("Backend is unreachable — is your Convex dev server running?", {
			isNetworkError: true,
		});
	}
	if (!response.ok) {
		const text = await response.text().catch(() => "");
		if (response.status === 401) {
			redirectToSignIn();
		}
		throw new ApiError(
			`Request failed: ${response.status} ${response.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`,
			{ status: response.status },
		);
	}
	if (response.status === 204) {
		return null;
	}
	return response.json();
}

async function publicPostJson(path: string, body: Record<string, unknown>): Promise<unknown> {
	let response: Response;
	try {
		response = await fetch(path, {
			method: "POST",
			headers: { "content-type": "application/json" },
			body: JSON.stringify(body),
		});
	} catch {
		throw new ApiError("Backend is unreachable — is your Convex dev server running?", {
			isNetworkError: true,
		});
	}
	if (!response.ok) {
		const text = await response.text().catch(() => "");
		throw new ApiError(
			`Request failed: ${response.status} ${response.statusText}${text ? ` — ${text.slice(0, 200)}` : ""}`,
			{ status: response.status },
		);
	}
	if (response.status === 204) {
		return null;
	}
	return response.json();
}

export async function listUsers(): Promise<User[]> {
	const payload = await cachedPostJson("/api/auth/admin/list-users", {});
	const users = getArrayFromPayload(payload)
		.map(parseUser)
		.filter((user): user is User => user !== null);
	return filterByActiveProject(users);
}

export async function listOrganizations(): Promise<Organization[]> {
	const payload = await cachedPostJson("/api/auth/organization/list", {});
	const orgs = getArrayFromPayload(payload)
		.map(parseOrganization)
		.filter((organization): organization is Organization => organization !== null);
	return filterByActiveProject(orgs);
}

export async function listConnections(): Promise<SsoConnection[]> {
	const payload = await cachedPostJson("/api/auth/banata/sso/list-providers", {});
	const connections = getArrayFromPayload(payload)
		.map(parseConnection)
		.filter((connection): connection is SsoConnection => connection !== null);
	return filterByActiveProject(connections);
}

export async function listDirectories(): Promise<Directory[]> {
	const payload = await cachedPostJson("/api/auth/banata/scim/list-providers", {});
	const directories = getArrayFromPayload(payload)
		.map(parseDirectory)
		.filter((directory): directory is Directory => directory !== null);
	return filterByActiveProject(directories);
}

export async function listAuditEvents(): Promise<AuditEvent[]> {
	const payload = await cachedPostJson("/api/auth/banata/audit-logs/list", {});
	return getArrayFromPayload(payload)
		.map(parseAuditEvent)
		.filter((event): event is AuditEvent => event !== null);
}

export async function listApiKeys(): Promise<ApiKey[]> {
	const payload = await getJson("/api/auth/api-key/list");
	const keys = getArrayFromPayload(payload)
		.map(parseApiKey)
		.filter((key): key is ApiKey => key !== null);
	return filterByActiveProject(keys);
}

export async function createApiKey(name: string, prefix?: string): Promise<{ key: string }> {
	const body: Record<string, unknown> = { name };
	const normalizedPrefix = typeof prefix === "string" ? prefix.trim() : "";
	if (normalizedPrefix) {
		body.prefix = normalizedPrefix;
	}
	const activeProjectId = getEffectiveActiveProjectId();
	// API keys are scoped per project. Better Auth persists `metadata`, so we
	// stamp the active project there and the runtime resolves project scope from it.
	if (activeProjectId) {
		body.metadata = { projectId: activeProjectId };
	}
	const payload = await postJson("/api/auth/api-key/create", body);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Unexpected API key response");
	}
	const key =
		typeof (payload as Record<string, unknown>).key === "string"
			? ((payload as Record<string, unknown>).key as string)
			: "";
	if (!key) {
		throw new Error("Missing API key value in response");
	}
	invalidateCache();
	return { key };
}

export async function listWebhookEndpoints(): Promise<WebhookEndpoint[]> {
	const payload = await cachedPostJson("/api/auth/banata/webhooks/list", {});
	return getArrayFromPayload(payload)
		.map(parseWebhookEndpoint)
		.filter((endpoint): endpoint is WebhookEndpoint => endpoint !== null);
}

export async function createWebhookEndpoint(url: string, eventTypes: string[] = []): Promise<void> {
	await postJson("/api/auth/banata/webhooks/create", {
		url,
		eventTypes,
		enabled: true,
	});
	invalidateCache();
}

export async function updateWebhookEndpoint(input: {
	id: string;
	url?: string;
	eventTypes?: string[];
	enabled?: boolean;
}): Promise<void> {
	await postJson("/api/auth/banata/webhooks/update", input as Record<string, unknown>);
	invalidateCache();
}

export async function banUser(userId: string): Promise<void> {
	await postJson("/api/auth/admin/ban-user", { userId, banReason: "Disabled by admin" });
	invalidateCache();
}

export async function unbanUser(userId: string): Promise<void> {
	await postJson("/api/auth/admin/unban-user", { userId });
	invalidateCache();
}

export async function createOrganization(input: {
	name: string;
	slug: string;
}): Promise<void> {
	await postJson("/api/auth/organization/create", {
		name: input.name,
		slug: input.slug,
	});
	invalidateCache();
}

export async function inviteOrganizationMember(input: {
	organizationId: string;
	email: string;
	role: string;
}): Promise<void> {
	await postJson("/api/auth/organization/invite-member", input);
	invalidateCache();
}

export interface SsoOidcSetupInput {
	issuer: string;
	clientId: string;
	clientSecret: string;
	scopes?: string[];
	discoveryUrl?: string;
	authorizationUrl?: string;
	tokenUrl?: string;
	userinfoUrl?: string;
	jwksUrl?: string;
	tokenEndpointAuthMethod?: "client_secret_post" | "client_secret_basic";
	claimMapping?: Record<string, string>;
}

export interface SsoSamlSetupInput {
	idpEntityId: string;
	idpSsoUrl: string;
	idpCertificate: string;
	nameIdFormat?: string;
	signRequest?: boolean;
	allowIdpInitiated?: boolean;
	attributeMapping?: Record<string, string>;
	spEntityId?: string;
	spAcsUrl?: string;
}

export async function createSsoConnection(
	input:
		| {
				organizationId: string;
				type: "oidc";
				name: string;
				domains: string[];
				oidcConfig: SsoOidcSetupInput;
		  }
		| {
				organizationId: string;
				type: "saml";
				name: string;
				domains: string[];
				samlConfig: SsoSamlSetupInput;
		  },
): Promise<SsoConnection> {
	const payload = await postJson("/api/auth/banata/sso/register", {
		organizationId: input.organizationId,
		type: input.type,
		name: input.name,
		domain: input.domains[0] ?? "",
		domains: input.domains,
		oidcConfig: input.type === "oidc" ? input.oidcConfig : undefined,
		samlConfig: input.type === "saml" ? input.samlConfig : undefined,
	});
	const connection = parseConnection(payload);
	if (!connection) {
		throw new Error("Unexpected SSO connection response");
	}
	invalidateCache();
	return connection;
}

export async function setSsoConnectionActive(
	connectionId: string,
	active: boolean,
): Promise<SsoConnection> {
	const payload = await postJson("/api/auth/banata/sso/update-provider", {
		providerId: connectionId,
		active,
	});
	const connection = parseConnection(payload);
	if (!connection) {
		throw new Error("Unexpected SSO connection update response");
	}
	invalidateCache();
	return connection;
}

export async function deleteSsoConnection(connectionId: string): Promise<void> {
	await postJson("/api/auth/banata/sso/delete-provider", {
		providerId: connectionId,
	});
	invalidateCache();
}

export async function createDirectory(input: {
	organizationId: string;
	name: string;
	provider: Directory["provider"];
}): Promise<Directory> {
	const payload = await postJson("/api/auth/banata/scim/register", input);
	const directory = parseDirectory(payload);
	if (!directory) {
		throw new Error("Unexpected directory response");
	}
	invalidateCache();
	return directory;
}

export async function deleteDirectory(directoryId: string): Promise<void> {
	await postJson("/api/auth/banata/scim/delete-provider", {
		providerId: directoryId,
	});
	invalidateCache();
}

// ── User management ──────────────────────────────────────────────────

export async function getUser(userId: string): Promise<User | null> {
	try {
		const payload = await cachedPostJson("/api/auth/admin/get-user", { userId });
		const user = parseUser(payload);
		if (user) return user;
		if (isObject(payload) && isObject((payload as JsonRecord).user)) {
			return parseUser((payload as JsonRecord).user);
		}
		return null;
	} catch {
		return null;
	}
}

export async function createUser(input: {
	email: string;
	password: string;
	name?: string;
	role?: string | string[];
}): Promise<User | null> {
	const payload = await postJson("/api/auth/admin/create-user", {
		email: input.email,
		password: input.password,
		name: input.name ?? "",
		role: input.role ?? "user",
	});
	if (isObject(payload)) {
		const user = (payload as JsonRecord).user ?? payload;
		invalidateCache();
		return parseUser(user);
	}
	invalidateCache();
	return null;
}

export async function deleteUser(userId: string): Promise<void> {
	await postJson("/api/auth/admin/remove-user", { userId });
	invalidateCache();
}

export async function setUserRole(userId: string, role: string | string[]): Promise<void> {
	await postJson("/api/auth/admin/set-role", { userId, role });
	invalidateCache();
}

// ── User accounts (auth methods) ─────────────────────────────────────

export interface UserAccount {
	id: string;
	userId: string;
	accountId: string;
	providerId: string;
	createdAt: Date;
	updatedAt: Date;
}

function parseAccount(payload: unknown): UserAccount | null {
	if (!isObject(payload)) return null;
	const obj = payload as JsonRecord;
	const id = typeof obj.id === "string" ? obj.id : "";
	if (!id) return null;
	return {
		id,
		userId: typeof obj.userId === "string" ? obj.userId : "",
		accountId: typeof obj.accountId === "string" ? obj.accountId : "",
		providerId: typeof obj.providerId === "string" ? obj.providerId : "",
		createdAt: asDate(obj.createdAt),
		updatedAt: asDate(obj.updatedAt),
	};
}

export async function listUserAccounts(userId: string): Promise<UserAccount[]> {
	try {
		const payload = await cachedPostJson("/api/auth/admin/list-user-accounts", { userId });
		return getArrayFromPayload(payload)
			.map(parseAccount)
			.filter((a): a is UserAccount => a !== null);
	} catch {
		return [];
	}
}

// ── Session management ───────────────────────────────────────────────

export interface SessionInfo {
	id: string;
	userId: string;
	ipAddress: string | null;
	userAgent: string | null;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

function parseSession(payload: unknown): SessionInfo | null {
	if (!isObject(payload)) return null;
	const obj = payload as JsonRecord;
	const id = typeof obj.id === "string" ? obj.id : "";
	if (!id) return null;
	return {
		id,
		userId: typeof obj.userId === "string" ? obj.userId : "",
		ipAddress: typeof obj.ipAddress === "string" ? obj.ipAddress : null,
		userAgent: typeof obj.userAgent === "string" ? obj.userAgent : null,
		expiresAt: asDate(obj.expiresAt),
		createdAt: asDate(obj.createdAt),
		updatedAt: asDate(obj.updatedAt),
	};
}

function asDate(value: unknown): Date {
	if (value instanceof Date) return value;
	if (typeof value === "string" || typeof value === "number") {
		const d = new Date(value);
		if (!Number.isNaN(d.getTime())) return d;
	}
	return new Date(0);
}

export async function listUserSessions(userId: string): Promise<SessionInfo[]> {
	const payload = await cachedPostJson("/api/auth/admin/list-user-sessions", { userId });
	const arr = getArrayFromPayload(payload);
	return arr.map(parseSession).filter((s): s is SessionInfo => s !== null);
}

export async function revokeUserSession(sessionId: string): Promise<void> {
	await postJson("/api/auth/admin/revoke-user-session", { sessionId });
	invalidateCache();
}

export async function revokeAllUserSessions(userId: string): Promise<void> {
	await postJson("/api/auth/admin/revoke-user-sessions", { userId });
	invalidateCache();
}

// ── Organization members ─────────────────────────────────────────────

export interface OrgMember {
	id: string;
	userId: string;
	organizationId: string;
	role: string;
	email: string;
	name: string;
	image: string | null;
	createdAt: Date;
}

function parseMember(payload: unknown): OrgMember | null {
	if (!isObject(payload)) return null;
	const obj = payload as JsonRecord;
	const id = typeof obj.id === "string" ? obj.id : "";
	if (!id) return null;
	// Better Auth nests user info inside the member or flattens it
	const user = isObject(obj.user) ? (obj.user as JsonRecord) : obj;
	return {
		id,
		userId:
			typeof obj.userId === "string" ? obj.userId : typeof user.id === "string" ? user.id : "",
		organizationId: typeof obj.organizationId === "string" ? obj.organizationId : "",
		role: typeof obj.role === "string" ? obj.role : "super_admin",
		email: typeof user.email === "string" ? user.email : "",
		name: typeof user.name === "string" ? user.name : "",
		image: typeof user.image === "string" ? user.image : null,
		createdAt: asDate(obj.createdAt),
	};
}

export async function listOrganizationMembers(organizationId: string): Promise<OrgMember[]> {
	const payload = await cachedPostJson("/api/auth/organization/get-full-organization", {
		organizationId,
	});
	if (!isObject(payload)) return [];
	const obj = payload as JsonRecord;
	// get-full-organization returns { members: [...], ...org }
	const members = Array.isArray(obj.members)
		? obj.members
		: Array.isArray((obj as JsonRecord).data)
			? (obj as JsonRecord).data
			: [];
	return (members as unknown[]).map(parseMember).filter((m): m is OrgMember => m !== null);
}

export async function removeOrganizationMember(input: {
	organizationId: string;
	memberIdOrUserId: string;
}): Promise<void> {
	await postJson("/api/auth/organization/remove-member", {
		organizationId: input.organizationId,
		memberIdOrEmail: input.memberIdOrUserId,
	});
	invalidateCache();
}

export async function updateMemberRole(input: {
	organizationId: string;
	memberIdOrUserId: string;
	role: string;
}): Promise<void> {
	await postJson("/api/auth/organization/update-member-role", {
		organizationId: input.organizationId,
		memberId: input.memberIdOrUserId,
		role: input.role,
	});
	invalidateCache();
}

// ── Roles & Permissions ──────────────────────────────────────────────

export interface RoleItem {
	id: string;
	name: string;
	slug: string;
	description: string;
	permissions: string[];
	isDefault: boolean;
	createdAt: string;
}

export interface PermissionItem {
	id: string;
	name: string;
	slug: string;
	description: string;
	isBuiltIn: boolean;
	createdAt: string;
}

export async function listRoles(): Promise<RoleItem[]> {
	const payload = await cachedPostJson("/api/auth/banata/config/roles/list", {});
	if (typeof payload !== "object" || payload === null) return [];
	const data = payload as { roles?: unknown[] };
	return (data.roles ?? []) as RoleItem[];
}

export async function createRole(input: {
	name: string;
	slug: string;
	description?: string;
	permissions?: string[];
}): Promise<RoleItem> {
	const payload = await postJson("/api/auth/banata/config/roles/create", input);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Unexpected create role response");
	}
	invalidateCache();
	return (payload as { role: RoleItem }).role;
}

export async function updateRole(input: {
	id: string;
	name?: string;
	slug?: string;
	description?: string;
	permissions?: string[];
}): Promise<RoleItem> {
	const payload = await postJson("/api/auth/banata/config/roles/update", input);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Unexpected update role response");
	}
	invalidateCache();
	return (payload as { role: RoleItem }).role;
}

export async function deleteRole(id: string): Promise<void> {
	await postJson("/api/auth/banata/config/roles/delete", { id });
	invalidateCache();
}

export async function listPermissions(): Promise<PermissionItem[]> {
	const payload = await cachedPostJson("/api/auth/banata/config/permissions/list", {});
	if (typeof payload !== "object" || payload === null) return [];
	const data = payload as { permissions?: unknown[] };
	return (data.permissions ?? []) as PermissionItem[];
}

export async function createPermission(input: {
	name: string;
	slug: string;
	description?: string;
}): Promise<PermissionItem> {
	const payload = await postJson("/api/auth/banata/config/permissions/create", input);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Unexpected create permission response");
	}
	invalidateCache();
	return (payload as { permission: PermissionItem }).permission;
}

export async function updatePermission(input: {
	id: string;
	name?: string;
	slug?: string;
	description?: string;
}): Promise<PermissionItem> {
	const payload = await postJson("/api/auth/banata/config/permissions/update", input);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Unexpected update permission response");
	}
	invalidateCache();
	return (payload as { permission: PermissionItem }).permission;
}

export async function deletePermission(id: string): Promise<void> {
	await postJson("/api/auth/banata/config/permissions/delete", { id });
	invalidateCache();
}

// ── Branding config ──────────────────────────────────────────────────

export interface BrandingConfig {
	primaryColor: string;
	bgColor: string;
	borderRadius: number;
	darkMode: boolean;
	customCss: string;
	font: string;
	logoUrl: string;
	cardWidth?: number;
}

export async function getBrandingConfig(): Promise<BrandingConfig> {
	const payload = await cachedPostJson("/api/auth/banata/config/branding/get", {});
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to fetch branding config");
	}
	return payload as BrandingConfig;
}

export async function saveBrandingConfig(config: Partial<BrandingConfig>): Promise<BrandingConfig> {
	const payload = await postJson("/api/auth/banata/config/branding/save", config);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to save branding config");
	}
	invalidateCache();
	return payload as BrandingConfig;
}

// ── Email config ─────────────────────────────────────────────────────

export interface EmailToggle {
	id: string;
	name: string;
	description: string;
	enabled: boolean;
	category: "auth" | "org";
}

export async function getEmailConfig(): Promise<EmailToggle[]> {
	const payload = await cachedPostJson("/api/auth/banata/config/emails/list", {});
	if (typeof payload !== "object" || payload === null) return [];
	const data = payload as { emails?: unknown[] };
	return (data.emails ?? []) as EmailToggle[];
}

export async function toggleEmail(id: string, enabled: boolean): Promise<EmailToggle[]> {
	const payload = await postJson("/api/auth/banata/config/emails/toggle", { id, enabled });
	if (typeof payload !== "object" || payload === null) return [];
	const data = payload as { emails?: unknown[] };
	invalidateCache();
	return (data.emails ?? []) as EmailToggle[];
}

// ── Dashboard config ─────────────────────────────────────────────────

export type DashboardConfig = RuntimeAuthConfig;

export async function getDashboardConfig(): Promise<DashboardConfig> {
	const payload = await cachedPostJson("/api/auth/banata/config/dashboard", {});
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to fetch config");
	}
	return payload as DashboardConfig;
}

export async function getPublicAuthConfig(): Promise<RuntimeAuthConfig> {
	const payload = await publicPostJson("/api/auth/banata/config/public", {});
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to fetch public auth config");
	}
	return payload as RuntimeAuthConfig;
}

export function getEnabledPublicSocialProviders(
	config: Pick<RuntimeAuthConfig, "socialProviders"> | null | undefined,
): Array<{ id: string }> {
	return listEnabledSocialProviderIds(config).map((id) => ({ id }));
}

export async function saveDashboardConfig(
	config: Partial<DashboardConfig>,
): Promise<DashboardConfig> {
	const payload = await postJson("/api/auth/banata/config/dashboard/save", config);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to save config");
	}
	invalidateCache();
	return payload as DashboardConfig;
}

export async function resetDashboardConfiguration(): Promise<void> {
	const payload = await postJson("/api/auth/banata/config/dashboard/reset", {});
	if (
		typeof payload !== "object" ||
		payload === null ||
		(payload as { success?: boolean }).success !== true
	) {
		throw new Error("Failed to reset dashboard configuration");
	}
	invalidateCache();
}

export async function toggleAuthMethod(
	method: keyof DashboardConfig["authMethods"],
	enabled: boolean,
): Promise<DashboardConfig> {
	return saveDashboardConfig({
		authMethods: { [method]: enabled } as Partial<
			DashboardConfig["authMethods"]
		> as DashboardConfig["authMethods"],
	});
}

export async function toggleSocialProvider(
	providerId: string,
	enabled: boolean,
): Promise<DashboardConfig> {
	const currentConfig = await getDashboardConfig();
	return saveDashboardConfig({
		socialProviders: {
			[providerId]: {
				enabled,
				demo: currentConfig.socialProviders[providerId]?.demo ?? false,
			},
		},
	});
}

export interface SocialProviderCredentialRecord {
	clientId: string;
	tenantId: string | null;
	hasClientSecret: boolean;
	enabled: boolean;
	updatedAt: number;
}

export type SocialProviderCredentials = Record<string, SocialProviderCredentialRecord>;

export async function getSocialProviderCredentials(): Promise<SocialProviderCredentials> {
	const payload = await cachedPostJson("/api/auth/banata/config/social-providers/get", {});
	if (!isObject(payload) || !isObject((payload as { providers?: unknown }).providers)) {
		return {};
	}
	return (payload as { providers: SocialProviderCredentials }).providers;
}

export async function saveSocialProviderCredential(data: {
	providerId: string;
	clientId: string;
	clientSecret?: string;
	tenantId?: string;
	enabled?: boolean;
}): Promise<{ providers: SocialProviderCredentials; config: DashboardConfig }> {
	const payload = await postJson("/api/auth/banata/config/social-providers/save", data);
	if (
		!isObject(payload) ||
		!isObject((payload as { providers?: unknown }).providers) ||
		!isObject((payload as { config?: unknown }).config)
	) {
		throw new Error("Failed to save social provider credentials");
	}
	invalidateCache();
	return payload as { providers: SocialProviderCredentials; config: DashboardConfig };
}

export async function deleteSocialProviderCredential(providerId: string): Promise<{
	providers: SocialProviderCredentials;
	config: DashboardConfig;
}> {
	const payload = await postJson("/api/auth/banata/config/social-providers/delete", { providerId });
	if (
		!isObject(payload) ||
		!isObject((payload as { providers?: unknown }).providers) ||
		!isObject((payload as { config?: unknown }).config)
	) {
		throw new Error("Failed to delete social provider credentials");
	}
	invalidateCache();
	return payload as { providers: SocialProviderCredentials; config: DashboardConfig };
}

export async function toggleFeature(
	feature: keyof DashboardConfig["features"],
	enabled: boolean,
): Promise<DashboardConfig> {
	return saveDashboardConfig({
		features: { [feature]: enabled } as Partial<
			DashboardConfig["features"]
		> as DashboardConfig["features"],
	});
}

export async function deleteApiKey(keyId: string): Promise<void> {
	await postJson("/api/auth/api-key/delete", { keyId });
	invalidateCache();
}

export async function deleteWebhookEndpoint(id: string): Promise<void> {
	await postJson("/api/auth/banata/webhooks/delete", { id });
	invalidateCache();
}

// ── Domain Config ────────────────────────────────────────────────────

export interface DomainConfigItem {
	id: string;
	domainKey: string;
	title: string;
	description: string;
	value: string;
	isDefault: boolean;
}

export async function listDomains(): Promise<DomainConfigItem[]> {
	const payload = await cachedPostJson("/api/auth/banata/config/domains/list", {});
	if (typeof payload !== "object" || payload === null) return [];
	const data = payload as { domains?: unknown[] };
	return (data.domains ?? []) as DomainConfigItem[];
}

export async function saveDomain(domain: {
	domainKey: string;
	title: string;
	description?: string;
	value: string;
	isDefault?: boolean;
}): Promise<void> {
	await postJson("/api/auth/banata/config/domains/save", domain);
	invalidateCache();
}

export async function deleteDomain(domainKey: string): Promise<void> {
	await postJson("/api/auth/banata/config/domains/delete", { domainKey });
	invalidateCache();
}

// ── Redirect Config ──────────────────────────────────────────────────

export type RedirectsData = Record<string, string | string[]>;

export async function getRedirects(): Promise<RedirectsData> {
	const payload = await cachedPostJson("/api/auth/banata/config/redirects/get", {});
	if (typeof payload !== "object" || payload === null) return {};
	return payload as RedirectsData;
}

export async function saveRedirects(config: RedirectsData): Promise<RedirectsData> {
	const payload = await postJson("/api/auth/banata/config/redirects/save", { config });
	if (typeof payload !== "object" || payload === null) return {};
	invalidateCache();
	return payload as RedirectsData;
}

// ── Actions Config ───────────────────────────────────────────────────

export interface ActionItem {
	id: string;
	name: string;
	description: string;
	triggerEvent: string;
	webhookUrl: string;
	createdAt: string;
}

export async function listActions(): Promise<ActionItem[]> {
	const payload = await cachedPostJson("/api/auth/banata/config/actions/list", {});
	if (typeof payload !== "object" || payload === null) return [];
	const data = payload as { actions?: unknown[] };
	return (data.actions ?? []) as ActionItem[];
}

export async function createAction(input: {
	name: string;
	description?: string;
	triggerEvent: string;
	webhookUrl: string;
}): Promise<ActionItem> {
	const payload = await postJson("/api/auth/banata/config/actions/create", input);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Unexpected create action response");
	}
	invalidateCache();
	return (payload as { action: ActionItem }).action;
}

export async function deleteAction(id: string): Promise<void> {
	await postJson("/api/auth/banata/config/actions/delete", { id });
	invalidateCache();
}

// ── Radar / Bot Protection Config ────────────────────────────────────

export interface BotProviderCredentials {
	apiKey?: string;
	siteKey?: string;
	secretKey?: string;
}

export type BotProvider = "botid" | "turnstile" | "recaptcha" | "hcaptcha" | null;

export interface RadarConfig {
	enabled: boolean;
	blockImpossibleTravel: boolean;
	deviceFingerprinting: boolean;
	rateLimiting: boolean;
	botDetection: boolean;
	botProvider: BotProvider;
	botProviderCredentials: BotProviderCredentials;
}

export async function getRadarConfig(): Promise<RadarConfig> {
	const payload = await cachedPostJson("/api/auth/banata/config/radar/get", {});
	if (typeof payload !== "object" || payload === null) {
		return {
			enabled: false,
			blockImpossibleTravel: true,
			deviceFingerprinting: true,
			rateLimiting: false,
			botDetection: false,
			botProvider: null,
			botProviderCredentials: {},
		};
	}
	return payload as RadarConfig;
}

export async function saveRadarConfig(config: Partial<RadarConfig>): Promise<RadarConfig> {
	const payload = await postJson("/api/auth/banata/config/radar/save", config);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to save radar config");
	}
	invalidateCache();
	return payload as RadarConfig;
}

// ── Email Provider Config ────────────────────────────────────────────

export interface EmailProviderConfig {
	providers: Record<
		string,
		{
			enabled: boolean;
			apiKey?: string;
			domain?: string;
			region?: string;
			accessKeyId?: string;
			secretAccessKey?: string;
		}
	>;
	activeProvider: string | null;
	fromAddress?: string;
	replyTo?: string;
}

export async function getEmailProviderConfig(): Promise<EmailProviderConfig> {
	const payload = await cachedPostJson("/api/auth/banata/config/email-providers/get", {});
	if (typeof payload !== "object" || payload === null) {
		return { providers: {}, activeProvider: null };
	}
	return payload as EmailProviderConfig;
}

export async function saveEmailProviderConfig(
	config: Partial<EmailProviderConfig>,
): Promise<EmailProviderConfig> {
	const payload = await postJson("/api/auth/banata/config/email-providers/save", config);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to save email provider config");
	}
	invalidateCache();
	return payload as EmailProviderConfig;
}

// ── Resource Types ───────────────────────────────────────────────────

export interface ResourceTypeItem {
	id: string;
	name: string;
	slug: string;
	description: string;
	createdAt: string;
}

export async function listResourceTypes(): Promise<ResourceTypeItem[]> {
	const payload = await cachedPostJson("/api/auth/banata/config/resource-types/list", {});
	if (typeof payload !== "object" || payload === null) return [];
	const data = payload as { resourceTypes?: unknown[] };
	return (data.resourceTypes ?? []) as ResourceTypeItem[];
}

export async function createResourceType(input: {
	name: string;
	slug: string;
	description?: string;
}): Promise<ResourceTypeItem> {
	const payload = await postJson("/api/auth/banata/config/resource-types/create", input);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Unexpected create resource type response");
	}
	invalidateCache();
	return (payload as { resourceType: ResourceTypeItem }).resourceType;
}

export async function deleteResourceType(id: string): Promise<void> {
	await postJson("/api/auth/banata/config/resource-types/delete", { id });
	invalidateCache();
}

// ── Addon Config ─────────────────────────────────────────────────────

export interface AddonConfig {
	addons: Record<string, { enabled: boolean }>;
}

export async function getAddonConfig(): Promise<AddonConfig> {
	const payload = await cachedPostJson("/api/auth/banata/config/addons/get", {});
	if (typeof payload !== "object" || payload === null) {
		return { addons: {} };
	}
	return payload as AddonConfig;
}

export async function saveAddonConfig(
	addons: Record<string, { enabled: boolean }>,
): Promise<AddonConfig> {
	const payload = await postJson("/api/auth/banata/config/addons/save", { addons });
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to save addon config");
	}
	invalidateCache();
	return payload as AddonConfig;
}

// ── Auth Configuration ───────────────────────────────────────────────

export interface AuthConfigSettings {
	roleAssignment: boolean;
	multipleRoles: boolean;
	apiKeyPermissions: boolean;
}

export async function getAuthConfiguration(): Promise<AuthConfigSettings> {
	const payload = await cachedPostJson("/api/auth/banata/config/auth-config/get", {});
	if (typeof payload !== "object" || payload === null) {
		return { roleAssignment: false, multipleRoles: false, apiKeyPermissions: false };
	}
	return payload as AuthConfigSettings;
}

export async function saveAuthConfiguration(
	config: Partial<AuthConfigSettings>,
): Promise<AuthConfigSettings> {
	const payload = await postJson("/api/auth/banata/config/auth-config/save", config);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to save auth configuration");
	}
	invalidateCache();
	return payload as AuthConfigSettings;
}

// ── Project Config ───────────────────────────────────────────────────

export interface ProjectConfig {
	projectName: string;
	projectDescription: string;
	clientId: string;
}

export async function getProjectConfig(): Promise<ProjectConfig> {
	const payload = await cachedPostJson("/api/auth/banata/config/project/get", {});
	if (typeof payload !== "object" || payload === null) {
		return {
			projectName: "My Banata Project",
			projectDescription: "",
			clientId: "banata-auth",
		};
	}
	return payload as ProjectConfig;
}

export async function saveProjectConfig(
	config: Partial<Omit<ProjectConfig, "clientId">>,
): Promise<ProjectConfig> {
	const payload = await postJson("/api/auth/banata/config/project/save", config);
	if (typeof payload !== "object" || payload === null) {
		throw new Error("Failed to save project config");
	}
	invalidateCache();
	return payload as ProjectConfig;
}

// ── Email Templates ──────────────────────────────────────────────────

export interface EmailTemplate {
	id: string;
	name: string;
	slug: string;
	subject: string;
	previewText?: string | null;
	category: string;
	description?: string | null;
	blocksJson: string;
	variablesJson?: string | null;
	builtIn: boolean;
	builtInType?: string | null;
	createdAt: number;
	updatedAt: number;
}

export async function listEmailTemplates(category?: string): Promise<EmailTemplate[]> {
	const body: Record<string, unknown> = {};
	if (category) body.category = category;

	const payload = await postJson("/api/auth/banata/emails/templates/list", body);
	if (!isObject(payload) || !Array.isArray((payload as JsonRecord).templates)) {
		return [];
	}
	return (payload as { templates: EmailTemplate[] }).templates;
}

export async function getEmailTemplate(idOrSlug: string): Promise<EmailTemplate | null> {
	const payload = await postJson("/api/auth/banata/emails/templates/get", { idOrSlug });
	if (!isObject(payload)) return null;
	return (payload as { template: EmailTemplate | null }).template ?? null;
}

export async function createEmailTemplate(
	template: Omit<EmailTemplate, "id" | "createdAt" | "updatedAt" | "builtIn">,
): Promise<EmailTemplate> {
	const payload = await postJson("/api/auth/banata/emails/templates/create", {
		...template,
	});
	if (!isObject(payload) || !(payload as { success?: boolean }).success) {
		const errMsg = (payload as { error?: string }).error ?? "Failed to create template";
		throw new Error(errMsg);
	}
	invalidateCache();
	return (payload as { template: EmailTemplate }).template;
}

export async function updateEmailTemplate(
	id: string,
	update: Partial<
		Omit<EmailTemplate, "id" | "createdAt" | "updatedAt" | "builtIn" | "builtInType">
	>,
): Promise<EmailTemplate> {
	const payload = await postJson("/api/auth/banata/emails/templates/update", {
		id,
		...update,
	});
	if (!isObject(payload) || !(payload as { success?: boolean }).success) {
		const errMsg = (payload as { error?: string }).error ?? "Failed to update template";
		throw new Error(errMsg);
	}
	invalidateCache();
	return (payload as { template: EmailTemplate }).template;
}

export async function deleteEmailTemplate(id: string): Promise<void> {
	const payload = await postJson("/api/auth/banata/emails/templates/delete", { id });
	if (!isObject(payload) || !(payload as { success?: boolean }).success) {
		const errMsg = (payload as { error?: string }).error ?? "Failed to delete template";
		throw new Error(errMsg);
	}
	invalidateCache();
}

// ── Projects ─────────────────────────────────────────────────────────

export interface DashboardProject {
	id: string;
	name: string;
	slug: string;
	description?: string;
	logoUrl?: string;
	ownerId: string;
	createdAt: number;
	updatedAt: number;
}

/** List all projects. */
export async function listProjects(): Promise<DashboardProject[]> {
	const payload = await cachedPostJson("/api/auth/banata/projects/list", {});
	if (!isObject(payload) || !Array.isArray((payload as JsonRecord).projects)) {
		return [];
	}
	return (payload as { projects: DashboardProject[] }).projects;
}

/** Get a single project by ID. */
export async function getProject(id: string): Promise<DashboardProject | null> {
	const payload = await postJson("/api/auth/banata/projects/get", { id });
	if (!isObject(payload)) return null;
	return (payload as { project: DashboardProject | null }).project ?? null;
}

/** Create a new project. Returns the project. */
export async function createProject(data: {
	name: string;
	slug: string;
	description?: string;
	logoUrl?: string;
}): Promise<{ project: DashboardProject }> {
	const payload = await postJson("/api/auth/banata/projects/create", data);
	if (!isObject(payload) || !(payload as { success?: boolean }).success) {
		const errMsg = (payload as { error?: string }).error ?? "Failed to create project";
		throw new Error(errMsg);
	}
	invalidateCache();
	return { project: (payload as { project: DashboardProject }).project };
}

/** Update a project's metadata. */
export async function updateProject(
	id: string,
	update: Partial<Pick<DashboardProject, "name" | "slug" | "description" | "logoUrl">>,
): Promise<DashboardProject> {
	const payload = await postJson("/api/auth/banata/projects/update", {
		id,
		...update,
	});
	if (!isObject(payload) || !(payload as { success?: boolean }).success) {
		const errMsg = (payload as { error?: string }).error ?? "Failed to update project";
		throw new Error(errMsg);
	}
	invalidateCache();
	return (payload as { project: DashboardProject }).project;
}

/** Delete a project and all its associated data. */
export async function deleteProject(id: string): Promise<void> {
	const payload = await postJson("/api/auth/banata/projects/delete", { id });
	if (!isObject(payload) || !(payload as { success?: boolean }).success) {
		const errMsg = (payload as { error?: string }).error ?? "Failed to delete project";
		throw new Error(errMsg);
	}
	invalidateCache();
}

/**
 * Ensure at least one project exists. If none exist, auto-creates a "Default Project".
 * Called by the dashboard on first load.
 */
export async function ensureDefaultProject(): Promise<{
	created: boolean;
	project: DashboardProject | null;
}> {
	const payload = await postJson("/api/auth/banata/projects/ensure-default", {});
	if (!isObject(payload)) {
		return { created: false, project: null };
	}
	if ((payload as { created: boolean }).created) {
		invalidateCache();
	}
	return payload as {
		created: boolean;
		project: DashboardProject | null;
	};
}

// ── Helper types ─────────────────────────────────────────────────────

type JsonRecord = Record<string, unknown>;

function isObject(value: unknown): value is JsonRecord {
	return typeof value === "object" && value !== null;
}
