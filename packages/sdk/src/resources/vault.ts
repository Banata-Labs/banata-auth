import type { PaginatedResult, VaultSecret } from "@banata-auth/shared";
import type { HttpClient } from "../client";

/**
 * Vault resource.
 *
 * Provides envelope encryption for secrets using AES-256-GCM.
 * Secrets are encrypted at rest and can be decrypted by providing
 * the correct context.
 */
export class Vault {
	constructor(private readonly http: HttpClient) {}

	/**
	 * Encrypt and store a secret.
	 *
	 * @returns The ID of the stored secret.
	 */
	async encrypt(options: {
		name: string;
		data: string;
		context?: string;
		organizationId?: string;
		metadata?: Record<string, string>;
	}): Promise<{ id: string }> {
		return this.http.post<{ id: string }>("/api/auth/banata/vault/encrypt", options);
	}

	/**
	 * Decrypt and return a secret by ID.
	 *
	 * @param options.context - Must match the context used during encryption.
	 */
	async decrypt(options: {
		secretId: string;
		context?: string;
	}): Promise<{ data: string }> {
		return this.http.post<{ data: string }>("/api/auth/banata/vault/decrypt", options);
	}

	/**
	 * List vault secrets (metadata only — decrypted values are never returned).
	 */
	async list(options?: {
		organizationId?: string;
		limit?: number;
		before?: string;
		after?: string;
	}): Promise<PaginatedResult<VaultSecret>> {
		return this.http.post<PaginatedResult<VaultSecret>>("/api/auth/banata/vault/list", {
			organizationId: options?.organizationId,
			limit: options?.limit,
			before: options?.before,
			after: options?.after,
		});
	}

	/**
	 * Delete a vault secret by ID.
	 */
	async delete(options: { secretId: string }): Promise<{ status: string }> {
		return this.http.post<{ status: string }>("/api/auth/banata/vault/delete", {
			id: options.secretId,
		});
	}

	/**
	 * Rotate the encryption key by re-encrypting all secrets
	 * with the next version's derived key.
	 *
	 * @returns Status and count of rotated/failed secrets.
	 */
	async rotateKey(options?: {
		batchSize?: number;
	}): Promise<{ status: string; rotated: number; failed: number; remaining: number }> {
		return this.http.post<{
			status: string;
			rotated: number;
			failed: number;
			remaining: number;
		}>("/api/auth/banata/vault/rotate-key", {
			batchSize: options?.batchSize,
		});
	}
}
