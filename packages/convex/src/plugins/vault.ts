/**
 * Vault plugin for Banata Auth.
 *
 * Provides envelope encryption for secrets using AES-256-GCM via the
 * Web Crypto API. Secrets are encrypted at rest in the `vaultSecret`
 * table and can only be decrypted by providing the correct context.
 *
 * The data encryption key (DEK) is derived from `BETTER_AUTH_SECRET`
 * using HKDF with a per-version salt, enabling key rotation without
 * re-deploying the application.
 *
 * @see {@link ../../component/schema.ts} for the vaultSecret table definition
 * @see {@link ../../../shared/src/types.ts} for the VaultSecret SDK type
 */

import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import {
	type PluginDBAdapter,
	type WhereClause,
	getProjectScope,
	projectScopeSchema,
	requireProjectPermission,
} from "./types";

// ─── Types ──────────────────────────────────────────────────────────

export interface VaultPluginOptions {
	/**
	 * The master secret used to derive encryption keys.
	 * Defaults to `BETTER_AUTH_SECRET` from the environment.
	 */
	masterSecret?: string;
}

interface VaultSecretRow extends Record<string, unknown> {
	id: string;
	name: string;
	encryptedValue: string;
	iv: string;
	projectId?: string;
	context?: string;
	organizationId?: string;
	version: number;
	metadata?: unknown;
	createdAt: number;
	updatedAt: number;
}

// ─── Crypto Helpers ─────────────────────────────────────────────────

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;
const IV_LENGTH = 12; // 96-bit IV for AES-GCM
const INITIAL_VERSION = 1;

/**
 * Derive an AES-256 key from the master secret using HKDF.
 * The version number is included in the info parameter so that
 * key rotation produces a different DEK for each version.
 */
/** @internal Exported for testing. */
export async function deriveKey(masterSecret: string, version: number) {
	const encoder = new TextEncoder();
	const keyMaterial = await crypto.subtle.importKey(
		"raw",
		encoder.encode(masterSecret),
		"HKDF",
		false,
		["deriveKey"],
	);
	return crypto.subtle.deriveKey(
		{
			name: "HKDF",
			hash: "SHA-256",
			salt: encoder.encode(`banata-vault-v${version}`),
			info: encoder.encode("banata-vault-encryption"),
		},
		keyMaterial,
		{ name: ALGORITHM, length: KEY_LENGTH },
		false,
		["encrypt", "decrypt"],
	);
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 * Returns the ciphertext and IV as base64-encoded strings.
 */
/** @internal Exported for testing. */
export async function encryptValue(
	plaintext: string,
	masterSecret: string,
	version: number,
): Promise<{ encryptedValue: string; iv: string }> {
	const key = await deriveKey(masterSecret, version);
	const encoder = new TextEncoder();
	const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));

	const ciphertext = await crypto.subtle.encrypt(
		{ name: ALGORITHM, iv },
		key,
		encoder.encode(plaintext),
	);

	return {
		encryptedValue: uint8ToBase64(new Uint8Array(ciphertext)),
		iv: uint8ToBase64(iv),
	};
}

/**
 * Decrypt a ciphertext string using AES-256-GCM.
 */
/** @internal Exported for testing. */
export async function decryptValue(
	encryptedValue: string,
	iv: string,
	masterSecret: string,
	version: number,
): Promise<string> {
	const key = await deriveKey(masterSecret, version);
	const decoder = new TextDecoder();

	const plaintext = await crypto.subtle.decrypt(
		{ name: ALGORITHM, iv: base64ToUint8(iv) },
		key,
		base64ToUint8(encryptedValue),
	);

	return decoder.decode(plaintext);
}

/**
 * Get the current (maximum) encryption version from the DB.
 * Falls back to INITIAL_VERSION if no secrets exist yet.
 */
async function getCurrentVersion(db: PluginDBAdapter, scopeWhere: WhereClause[]): Promise<number> {
	const rows = await db.findMany<VaultSecretRow>({
		model: "vaultSecret",
		where: [...scopeWhere],
		limit: 1,
		sortBy: { field: "version", direction: "desc" },
	});
	return rows[0] ? rows[0].version : INITIAL_VERSION;
}

/** @internal Exported for testing. */
export function uint8ToBase64(bytes: Uint8Array): string {
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary);
}

/** @internal Exported for testing. */
export function base64ToUint8(base64: string): Uint8Array {
	const binary = atob(base64);
	const bytes = new Uint8Array(binary.length);
	for (let i = 0; i < binary.length; i++) {
		bytes[i] = binary.charCodeAt(i);
	}
	return bytes;
}

// ─── Zod Schemas ────────────────────────────────────────────────────

const encryptSchema = z
	.object({
		name: z.string().min(1).max(256),
		data: z.string().min(1),
		context: z.string().max(256).optional(),
		organizationId: z.string().optional(),
		metadata: z.record(z.string()).optional(),
	})
	.merge(projectScopeSchema);

const decryptSchema = z
	.object({
		secretId: z.string(),
		context: z.string().optional(),
	})
	.merge(projectScopeSchema);

const listSecretsSchema = z
	.object({
		organizationId: z.string().optional(),
		limit: z.number().int().positive().max(200).optional(),
		before: z.string().optional(),
		after: z.string().optional(),
	})
	.merge(projectScopeSchema);

const deleteSecretSchema = z
	.object({
		id: z.string(),
	})
	.merge(projectScopeSchema);

const rotateKeySchema = z
	.object({
		/** Maximum number of secrets to re-encrypt per call. Default: 100. */
		batchSize: z.number().int().positive().max(500).optional(),
	})
	.merge(projectScopeSchema);

// ─── Plugin Factory ─────────────────────────────────────────────────

/**
 * Vault plugin for Banata Auth.
 *
 * Registers API endpoints under `/api/auth/banata/vault/` for
 * encrypting, decrypting, listing, deleting, and rotating vault secrets.
 *
 * @param options - Optional configuration
 * @returns A Better Auth plugin descriptor
 *
 * @example
 * ```ts
 * import { vaultPlugin } from "./plugins/vault";
 *
 * const plugins = [
 *   vaultPlugin(),
 *   // ... other plugins
 * ];
 * ```
 */
export function vaultPlugin(options?: VaultPluginOptions): BetterAuthPlugin {
	function getMasterSecret(): string {
		const secret = options?.masterSecret ?? process.env.BETTER_AUTH_SECRET;
		if (!secret) {
			throw new Error(
				"[BanataAuth Vault] BETTER_AUTH_SECRET is required for vault operations. " +
					"Set it as an environment variable or pass masterSecret in vault plugin options.",
			);
		}
		return secret;
	}

	return {
		id: "banata-vault",

		// ─── Schema Registration ──────────────────────────────────
		schema: {
			vaultSecret: {
				fields: {
					name: { type: "string" as const, required: true },
					encryptedValue: { type: "string" as const, required: true },
					iv: { type: "string" as const, required: true },
					projectId: { type: "string" as const, required: false },
					context: { type: "string" as const, required: false },
					organizationId: { type: "string" as const, required: false },
					version: { type: "number" as const, required: true },
					metadata: { type: "string" as const, required: false },
					createdAt: { type: "number" as const, required: true },
					updatedAt: { type: "number" as const, required: true },
				},
			},
		},

		endpoints: {
			/**
			 * Encrypt and store a secret.
			 *
			 * POST /api/auth/banata/vault/encrypt
			 */
			vaultEncrypt: createAuthEndpoint(
				"/banata/vault/encrypt",
				{
					method: "POST",
					body: encryptSchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "vault.write",
						projectId: scope.projectId,
					});

					const masterSecret = getMasterSecret();
					const now = Date.now();
					const currentVersion = await getCurrentVersion(db, scope.where);
					const { encryptedValue, iv } = await encryptValue(
						body.data,
						masterSecret,
						currentVersion,
					);

					const data: Record<string, unknown> = {
						...scope.data,
						name: body.name,
						encryptedValue,
						iv,
						version: currentVersion,
						createdAt: now,
						updatedAt: now,
					};
					if (body.context) data.context = body.context;
					if (body.organizationId) data.organizationId = body.organizationId;
					if (body.metadata) data.metadata = JSON.stringify(body.metadata);

					const secret = await db.create<VaultSecretRow>({
						model: "vaultSecret",
						data: data as VaultSecretRow,
					});

					return ctx.json({ id: secret.id });
				},
			),

			/**
			 * Decrypt and return a secret by ID.
			 *
			 * POST /api/auth/banata/vault/decrypt
			 */
			vaultDecrypt: createAuthEndpoint(
				"/banata/vault/decrypt",
				{
					method: "POST",
					body: decryptSchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "vault.read",
						projectId: scope.projectId,
					});

					const rows = await db.findMany<VaultSecretRow>({
						model: "vaultSecret",
						where: [{ field: "id", value: body.secretId }, ...scope.where],
						limit: 1,
					});
					const secret = rows[0];
					if (!secret) {
						throw ctx.error("NOT_FOUND", { message: "Secret not found" });
					}

					// Verify context matches if the secret was stored with one
					if (secret.context && body.context !== secret.context) {
						throw ctx.error("FORBIDDEN", {
							message: "Context mismatch: the provided context does not match the secret's context",
						});
					}

					const masterSecret = getMasterSecret();
					try {
						const plaintext = await decryptValue(
							secret.encryptedValue,
							secret.iv,
							masterSecret,
							secret.version,
						);
						return ctx.json({ data: plaintext });
					} catch {
						throw ctx.error("INTERNAL_SERVER_ERROR", {
							message: "Failed to decrypt secret. The master key may have changed.",
						});
					}
				},
			),

			/**
			 * List vault secrets (metadata only — no decrypted values).
			 *
			 * POST /api/auth/banata/vault/list
			 */
			vaultList: createAuthEndpoint(
				"/banata/vault/list",
				{
					method: "POST",
					body: listSecretsSchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "vault.read",
						projectId: scope.projectId,
					});

					const limit = Math.min(body.limit ?? 50, 200);
					const filters: WhereClause[] = [...scope.where];

					if (body.organizationId) {
						filters.push({ field: "organizationId", value: body.organizationId });
					}

					// Cursor-based pagination using createdAt (descending order)
					if (body.after) {
						const cursorRows = await db.findMany<VaultSecretRow>({
							model: "vaultSecret",
							where: [{ field: "id", value: body.after }, ...scope.where],
							limit: 1,
						});
						if (cursorRows[0]) {
							filters.push({
								field: "createdAt",
								operator: "lt" as const,
								value: cursorRows[0].createdAt,
							});
						}
					}
					if (body.before) {
						const cursorRows = await db.findMany<VaultSecretRow>({
							model: "vaultSecret",
							where: [{ field: "id", value: body.before }, ...scope.where],
							limit: 1,
						});
						if (cursorRows[0]) {
							filters.push({
								field: "createdAt",
								operator: "gt" as const,
								value: cursorRows[0].createdAt,
							});
						}
					}

					const rows = await db.findMany<VaultSecretRow>({
						model: "vaultSecret",
						where: filters,
						limit: limit + 1, // Fetch one extra to determine hasMore
						sortBy: { field: "createdAt", direction: "desc" },
					});

					const hasMore = rows.length > limit;
					const items = hasMore ? rows.slice(0, limit) : rows;
					const firstItem = items[0];
					const lastItem = items[items.length - 1];

					// Return metadata only — never expose encrypted values
					const data = items.map((row) => ({
						id: row.id,
						name: row.name,
						context: row.context ?? null,
						organizationId: row.organizationId ?? null,
						version: row.version,
						metadata: row.metadata
							? typeof row.metadata === "string"
								? safeJsonParse(row.metadata)
								: row.metadata
							: null,
						createdAt: row.createdAt,
						updatedAt: row.updatedAt,
					}));

					return ctx.json({
						data,
						listMetadata: {
							before: firstItem ? (firstItem.id as string) : null,
							after: hasMore && lastItem ? (lastItem.id as string) : null,
						},
					});
				},
			),

			/**
			 * Delete a vault secret by ID.
			 *
			 * POST /api/auth/banata/vault/delete
			 */
			vaultDelete: createAuthEndpoint(
				"/banata/vault/delete",
				{
					method: "POST",
					body: deleteSecretSchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "vault.write",
						projectId: scope.projectId,
					});

					const rows = await db.findMany<VaultSecretRow>({
						model: "vaultSecret",
						where: [{ field: "id", value: body.id }, ...scope.where],
						limit: 1,
					});
					if (!rows[0]) {
						throw ctx.error("NOT_FOUND", { message: "Secret not found" });
					}

					await db.delete({
						model: "vaultSecret",
						where: [{ field: "id", value: body.id }, ...scope.where],
					});

					return ctx.json({ status: "deleted" });
				},
			),

			/**
			 * Rotate the encryption key by re-encrypting all secrets
			 * with the next version's derived key.
			 *
			 * POST /api/auth/banata/vault/rotate-key
			 *
			 * This operation is idempotent — secrets already at the
			 * latest version are skipped.
			 */
			vaultRotateKey: createAuthEndpoint(
				"/banata/vault/rotate-key",
				{
					method: "POST",
					body: rotateKeySchema,
					requireHeaders: true,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "vault.manage",
						projectId: scope.projectId,
					});

					const masterSecret = getMasterSecret();
					const batchSize = body.batchSize ?? 100;
					const currentVersion = await getCurrentVersion(db, scope.where);
					const newVersion = currentVersion + 1;

					// Find secrets that aren't at the latest version
					const outdated = await db.findMany<VaultSecretRow>({
						model: "vaultSecret",
						where: [
							{ field: "version", operator: "lt" as const, value: newVersion },
							...scope.where,
						],
						limit: batchSize,
					});

					let rotated = 0;
					let failed = 0;

					for (const secret of outdated) {
						try {
							// Decrypt with old version key
							const plaintext = await decryptValue(
								secret.encryptedValue,
								secret.iv,
								masterSecret,
								secret.version,
							);

							// Re-encrypt with new version key
							const { encryptedValue, iv } = await encryptValue(
								plaintext,
								masterSecret,
								newVersion,
							);

							await db.update({
								model: "vaultSecret",
								where: [{ field: "id", value: secret.id }, ...scope.where],
								update: {
									encryptedValue,
									iv,
									version: newVersion,
									updatedAt: Date.now(),
								},
							});
							rotated++;
						} catch (err) {
							console.error(
								"[BanataAuth Vault] Failed to rotate a secret:",
								err instanceof Error ? err.message : "unknown error",
							);
							failed++;
						}
					}

					return ctx.json({
						status: outdated.length === 0 ? "up_to_date" : "rotated",
						rotated,
						failed,
						remaining: Math.max(0, outdated.length - rotated - failed),
					});
				},
			),
		},
	};
}

// ─── Helpers ────────────────────────────────────────────────────────

function safeJsonParse(value: string): unknown {
	try {
		return JSON.parse(value);
	} catch {
		return value;
	}
}
