import type { ApiKey } from "@banata-auth/shared";
import type { HttpClient } from "../client";

/**
 * API Keys resource.
 * Manages API key lifecycle — creation, listing, and deletion.
 */
export class ApiKeys {
	constructor(private readonly http: HttpClient) {}

	/**
	 * Create a new API key.
	 *
	 * @returns The created key metadata **plus** the raw `key` value.
	 *   The raw key is only returned at creation time and cannot be retrieved later.
	 */
	async create(options: {
		name: string;
		/** Restrict the key to a specific organization. */
		organizationId?: string;
		/** Scoped permissions for this key. */
		permissions?: string[];
		/** When the key should expire (ISO 8601 or Date). */
		expiresAt?: Date | string;
	}): Promise<ApiKey & { key: string }> {
		return this.http.post<ApiKey & { key: string }>("/api/auth/api-key/create", {
			name: options.name,
			organizationId: options.organizationId,
			permissions: options.permissions,
			expiresAt:
				options.expiresAt instanceof Date ? options.expiresAt.toISOString() : options.expiresAt,
		});
	}

	/**
	 * List all API keys. The raw key value is **not** included.
	 */
	async list(): Promise<ApiKey[]> {
		return this.http.get<ApiKey[]>("/api/auth/api-key/list");
	}

	/**
	 * Delete (revoke) an API key by its ID.
	 */
	async delete(keyId: string): Promise<void> {
		return this.http.post<void>("/api/auth/api-key/delete", { keyId });
	}
}
