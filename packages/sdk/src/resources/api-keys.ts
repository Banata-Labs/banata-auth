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
	 * Backwards-compatible alias for create().
	 */
	async createKey(options: Parameters<ApiKeys["create"]>[0]): Promise<ApiKey & { key: string }> {
		return this.create(options);
	}

	/**
	 * List all API keys. The raw key value is **not** included.
	 */
	async list(): Promise<ApiKey[]> {
		return this.http.get<ApiKey[]>("/api/auth/api-key/list");
	}

	/**
	 * Backwards-compatible alias for list().
	 */
	async listKeys(): Promise<ApiKey[]> {
		return this.list();
	}

	/**
	 * Delete (revoke) an API key by its ID.
	 */
	async delete(keyId: string): Promise<void> {
		return this.http.post<void>("/api/auth/api-key/delete", { keyId });
	}

	/**
	 * Backwards-compatible alias for delete().
	 */
	async deleteKey(input: { keyId: string } | string): Promise<void> {
		const keyId = typeof input === "string" ? input : input.keyId;
		return this.delete(keyId);
	}

	/**
	 * Create a replacement key and optionally revoke the old one.
	 *
	 * Production rotations should normally deploy the returned key first, verify
	 * traffic, then revoke the old key in a second step. Set `revokeOld: true`
	 * only when the caller has already moved all traffic off the old key.
	 */
	async rotate(options: {
		oldKeyId: string;
		name: string;
		organizationId?: string;
		permissions?: string[];
		expiresAt?: Date | string;
		revokeOld?: boolean;
	}): Promise<ApiKey & { key: string }> {
		const replacement = await this.create({
			name: options.name,
			organizationId: options.organizationId,
			permissions: options.permissions,
			expiresAt: options.expiresAt,
		});

		if (options.revokeOld) {
			await this.delete(options.oldKeyId);
		}

		return replacement;
	}
}
