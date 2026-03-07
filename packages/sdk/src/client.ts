import { createErrorFromStatus } from "@banata-auth/shared";
import { ApiKeys } from "./resources/api-keys";
import { AuditLogs } from "./resources/audit-logs";
import { DirectorySync } from "./resources/directory-sync";
import { Domains } from "./resources/domains";
import { Emails } from "./resources/emails";
import { Events } from "./resources/events";
import { Organizations } from "./resources/organizations";
import { Portal } from "./resources/portal";
import { Projects } from "./resources/projects";
import { Rbac } from "./resources/rbac";
import { SSO } from "./resources/sso";
import { UserManagement } from "./resources/user-management";
import { Vault } from "./resources/vault";
import { Webhooks } from "./resources/webhooks";

export interface BanataAuthOptions {
	/** API key for authentication. */
	apiKey: string;
	/** Base URL for the Banata Auth API. Defaults to Convex site URL. */
	baseUrl?: string;
	/** Request timeout in milliseconds. Default: 30000. */
	timeout?: number;
	/** Number of retries on 5xx errors. Default: 3. */
	retries?: number;
	/** Project ID to scope all operations to. */
	projectId?: string;
	/** Environment ID to scope all operations to. */
	environmentId?: string;
}

/**
 * Internal HTTP client used by all resource classes.
 */
export class HttpClient {
	private readonly apiKey: string;
	private readonly baseUrl: string;
	private readonly timeout: number;
	private readonly maxRetries: number;
	private readonly projectId?: string;

	constructor(options: BanataAuthOptions) {
		this.apiKey = options.apiKey;
		this.baseUrl = (options.baseUrl ?? "").replace(/\/$/, "");
		this.timeout = options.timeout ?? 30_000;
		this.maxRetries = options.retries ?? 3;
		this.projectId = options.projectId;

		// Warn if API key is being sent over non-HTTPS in production
		if (
			this.baseUrl &&
			!this.baseUrl.startsWith("https://") &&
			!this.baseUrl.startsWith("http://localhost") &&
			!this.baseUrl.startsWith("http://127.0.0.1")
		) {
			console.warn(
				"[BanataAuth SDK] WARNING: baseUrl does not use HTTPS. " +
					"API keys will be transmitted in plaintext. " +
					"Use HTTPS in production to protect your credentials.",
			);
		}
	}

	withProjectScope<T extends Record<string, unknown>>(
		body: T,
		projectId?: string,
	): T & {
		projectId?: string;
	} {
		const resolvedProjectId = projectId ?? this.projectId;
		if (!resolvedProjectId) {
			return body;
		}
		return {
			...body,
			projectId: resolvedProjectId,
		};
	}

	async request<T>(
		method: string,
		path: string,
		options?: {
			body?: unknown;
			query?: Record<string, string | number | boolean | undefined>;
			headers?: Record<string, string>;
		},
	): Promise<T> {
		const url = new URL(`${this.baseUrl}${path}`);

		if (options?.query) {
			for (const [key, value] of Object.entries(options.query)) {
				if (value !== undefined) {
					url.searchParams.set(key, String(value));
				}
			}
		}

		const headers: Record<string, string> = {
			Authorization: `Bearer ${this.apiKey}`,
			"Content-Type": "application/json",
			"User-Agent": "banata-auth-sdk/0.1.0",
			...options?.headers,
		};

		let lastError: Error | null = null;

		for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
			try {
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), this.timeout);

				const response = await fetch(url.toString(), {
					method,
					headers,
					body: options?.body ? JSON.stringify(options.body) : undefined,
					signal: controller.signal,
				});

				clearTimeout(timeoutId);

				const requestId = response.headers.get("x-request-id") ?? "";

				if (response.ok) {
					if (response.status === 204) {
						return undefined as T;
					}
					return (await response.json()) as T;
				}

				const errorBody = await response.json().catch(() => ({}));
				const error = createErrorFromStatus(
					response.status,
					errorBody as { message?: string; code?: string },
					requestId,
				);

				// Retry on 5xx errors and 429 (rate limited)
				if ((response.status >= 500 || response.status === 429) && attempt < this.maxRetries) {
					lastError = error;

					// Respect Retry-After header on 429, otherwise exponential backoff
					let delayMs = 200 * 2 ** attempt;
					if (response.status === 429) {
						const retryAfter = response.headers.get("retry-after");
						if (retryAfter) {
							const parsed = Number(retryAfter);
							// Retry-After can be seconds (number) or HTTP-date
							delayMs = Number.isNaN(parsed)
								? Math.max(0, new Date(retryAfter).getTime() - Date.now())
								: parsed * 1000;
							// Clamp to a reasonable max (60s) to avoid infinite waits
							delayMs = Math.min(delayMs, 60_000);
						}
					}

					await new Promise((resolve) => setTimeout(resolve, delayMs));
					continue;
				}

				throw error;
			} catch (error) {
				if (error instanceof Error && error.name === "AbortError") {
					lastError = new Error(`Request timed out after ${this.timeout}ms`);
					if (attempt < this.maxRetries) {
						await new Promise((resolve) => setTimeout(resolve, 200 * 2 ** attempt));
						continue;
					}
				}
				throw error;
			}
		}

		throw lastError ?? new Error("Request failed after all retries");
	}

	get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
		return this.request<T>("GET", path, { query });
	}

	post<T>(path: string, body?: unknown): Promise<T> {
		return this.request<T>("POST", path, { body });
	}

	put<T>(path: string, body?: unknown): Promise<T> {
		return this.request<T>("PUT", path, { body });
	}

	patch<T>(path: string, body?: unknown): Promise<T> {
		return this.request<T>("PATCH", path, { body });
	}

	delete<T>(path: string): Promise<T> {
		return this.request<T>("DELETE", path);
	}
}

/**
 * Main Banata Auth SDK client.
 *
 * @example
 * ```ts
 * import { BanataAuth } from "@banata-auth/sdk";
 *
 * const banataAuth = new BanataAuth({ apiKey: "sk_live_..." });
 *
 * // List users
 * const users = await banataAuth.userManagement.listUsers();
 *
 * // Create organization
 * const org = await banataAuth.organizations.createOrganization({
 *   name: "Acme Corp",
 * });
 * ```
 */
export class BanataAuth {
	private readonly httpClient: HttpClient;

	readonly apiKeys: ApiKeys;
	readonly userManagement: UserManagement;
	readonly organizations: Organizations;
	readonly sso: SSO;
	readonly directorySync: DirectorySync;
	readonly auditLogs: AuditLogs;
	readonly emails: Emails;
	readonly events: Events;
	readonly webhooks: Webhooks;
	readonly portal: Portal;
	readonly vault: Vault;
	readonly domains: Domains;
	readonly rbac: Rbac;
	readonly projects: Projects;

	constructor(options: string | BanataAuthOptions) {
		const opts: BanataAuthOptions = typeof options === "string" ? { apiKey: options } : options;

		if (!opts.apiKey) {
			throw new Error(
				"Banata Auth API key is required. Pass it as a string or as { apiKey: '...' }",
			);
		}

		this.httpClient = new HttpClient(opts);

		this.apiKeys = new ApiKeys(this.httpClient);
		this.userManagement = new UserManagement(this.httpClient);
		this.organizations = new Organizations(this.httpClient);
		this.sso = new SSO(this.httpClient);
		this.directorySync = new DirectorySync(this.httpClient);
		this.auditLogs = new AuditLogs(this.httpClient);
		this.emails = new Emails(this.httpClient);
		this.events = new Events(this.httpClient);
		this.webhooks = new Webhooks(this.httpClient);
		this.portal = new Portal(this.httpClient);
		this.vault = new Vault(this.httpClient);
		this.domains = new Domains(this.httpClient);
		this.rbac = new Rbac(this.httpClient);
		this.projects = new Projects(this.httpClient);
	}

	// Convenience aliases (WorkOS-compatible)
	get users(): UserManagement {
		return this.userManagement;
	}
	get directories(): DirectorySync {
		return this.directorySync;
	}
	get orgs(): Organizations {
		return this.organizations;
	}
}
