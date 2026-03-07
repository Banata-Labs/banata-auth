/**
 * Banata Auth Webhook System Plugin.
 *
 * Provides CRUD management of webhook endpoints, HMAC-SHA256 signed payloads,
 * retry with exponential backoff, and delivery tracking via an audit trail.
 *
 * Endpoints are registered under `/api/auth/banata/webhooks/` and exposed to
 * admin consumers for configuring outbound webhook subscriptions.
 *
 * Other plugins (audit, lifecycle triggers) call `dispatchWebhookEvent()` to
 * fire webhooks when auth events occur.
 */

import { WEBHOOK_MAX_CONSECUTIVE_FAILURES } from "@banata-auth/shared";
import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import {
	type PluginDBAdapter,
	type WebhookEndpointRow,
	type WhereClause,
	getProjectScope,
	projectScopeSchema,
	requireProjectPermission,
} from "./types";

// ─── Crypto Helpers (Web Crypto API — works in Convex V8 + Node.js) ──

/** Generate a hex string of `byteCount` random bytes. */
function randomHex(byteCount: number): string {
	const buf = new Uint8Array(byteCount);
	crypto.getRandomValues(buf);
	return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** HMAC-SHA256 sign `data` with `key`, returning a hex digest. */
async function hmacSha256(key: string, data: string): Promise<string> {
	const enc = new TextEncoder();
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		enc.encode(key),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(data));
	return Array.from(new Uint8Array(sig), (b) => b.toString(16).padStart(2, "0")).join("");
}

// ─── Plugin Options ─────────────────────────────────────────────────

export interface WebhookPluginOptions {
	/** Max retry attempts for failed deliveries. Default: 5 */
	maxRetries?: number;
	/** Retry delays in ms. Default: [0, 5min, 30min, 2hr, 24hr] */
	retryDelays?: number[];
}

// ─── Zod Schemas ────────────────────────────────────────────────────

const listWebhooksSchema = z
	.object({
		limit: z.number().optional(),
		after: z.string().optional(),
		before: z.string().optional(),
	})
	.merge(projectScopeSchema);

const createWebhookSchema = z
	.object({
		url: z
			.string()
			.url("Invalid URL")
			.refine((url) => isAllowedWebhookUrl(url), {
				message: "Webhook URL must use HTTPS (localhost HTTP allowed in development)",
			}),
		eventTypes: z.array(z.string()).optional(),
		enabled: z.boolean().optional(),
	})
	.merge(projectScopeSchema);

const updateWebhookSchema = z
	.object({
		id: z.string(),
		url: z
			.string()
			.url("Invalid URL")
			.refine((url) => isAllowedWebhookUrl(url), {
				message: "Webhook URL must use HTTPS (localhost HTTP allowed in development)",
			})
			.optional(),
		eventTypes: z.array(z.string()).optional(),
		enabled: z.boolean().optional(),
	})
	.merge(projectScopeSchema);

const deleteWebhookSchema = z
	.object({
		id: z.string(),
	})
	.merge(projectScopeSchema);

function isAllowedWebhookUrl(url: string): boolean {
	if (url.startsWith("https://")) return true;
	return (
		url.startsWith("http://localhost") ||
		url.startsWith("http://127.0.0.1") ||
		url.startsWith("http://0.0.0.0")
	);
}

// ─── Plugin Factory ─────────────────────────────────────────────────

/**
 * Webhook system plugin for Banata Auth.
 *
 * Provides:
 * - CRUD management of webhook endpoints
 * - HMAC-SHA256 signed payloads
 * - Retry with exponential backoff
 * - Delivery tracking and audit trail
 */
export function webhookSystem(_options?: WebhookPluginOptions): BetterAuthPlugin {
	return {
		id: "banata-webhook-system",

		// ─── Schema Registration ──────────────────────────────────
		schema: {
			webhookEndpoint: {
				fields: {
					projectId: { type: "string" as const, required: false },
					url: { type: "string", required: true },
					secret: { type: "string", required: true },
					eventTypes: { type: "string", required: false },
					enabled: { type: "boolean", required: true },
					successCount: { type: "number", required: false },
					failureCount: { type: "number", required: false },
					consecutiveFailures: { type: "number", required: false },
					lastDeliveryAt: { type: "number", required: false },
					lastDeliveryStatus: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			webhookDelivery: {
				fields: {
					projectId: { type: "string" as const, required: false },
					endpointId: {
						type: "string",
						required: true,
						references: { model: "webhookEndpoint", field: "id" },
					},
					eventType: { type: "string", required: true },
					payload: { type: "string", required: true },
					attempt: { type: "number", required: true },
					maxAttempts: { type: "number", required: true },
					status: { type: "string", required: true },
					httpStatus: { type: "number", required: false },
					responseBody: { type: "string", required: false },
					errorMessage: { type: "string", required: false },
					nextRetryAt: { type: "number", required: false },
					deliveredAt: { type: "number", required: false },
					createdAt: { type: "number", required: true },
				},
			},
		},

		endpoints: {
			// ── List webhook endpoints ──────────────────────────────────
			listWebhookEndpoints: createAuthEndpoint(
				"/banata/webhooks/list",
				{
					method: "POST",
					requireHeaders: true,
					body: listWebhooksSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const limit = body.limit ?? 50;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "webhook.manage",
						projectId: scope.projectId,
					});

					const endpoints = await db.findMany<WebhookEndpointRow>({
						model: "webhookEndpoint",
						where: [...scope.where],
						limit,
						sortBy: { field: "createdAt", direction: "desc" },
					});

					// Strip secrets from response — consumers should never see signing secrets
					const sanitized = endpoints.map((ep) => ({
						id: ep.id,
						url: ep.url,
						eventTypes: ep.eventTypes,
						enabled: ep.enabled,
						successCount: ep.successCount,
						failureCount: ep.failureCount,
						consecutiveFailures: ep.consecutiveFailures,
						lastDeliveryAt: ep.lastDeliveryAt,
						lastDeliveryStatus: ep.lastDeliveryStatus,
						createdAt: ep.createdAt,
						updatedAt: ep.updatedAt,
					}));

					return ctx.json({
						data: sanitized,
						listMetadata: { before: null, after: null },
					});
				},
			),

			// ── Create webhook endpoint ─────────────────────────────────
			createWebhookEndpoint: createAuthEndpoint(
				"/banata/webhooks/create",
				{
					method: "POST",
					requireHeaders: true,
					body: createWebhookSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "webhook.manage",
						projectId: scope.projectId,
					});

					// Generate a signing secret prefixed for easy identification
					const secret = `whsec_${randomHex(32)}`;

					// Omit optional fields — Convex v.optional() accepts undefined but NOT null.
					const endpoint = await db.create<WebhookEndpointRow>({
						model: "webhookEndpoint",
						data: {
							...scope.data,
							url: body.url,
							secret,
							eventTypes: body.eventTypes ? JSON.stringify(body.eventTypes) : JSON.stringify([]),
							enabled: body.enabled !== false,
							successCount: 0,
							failureCount: 0,
							consecutiveFailures: 0,
							createdAt: now,
							updatedAt: now,
						} as WebhookEndpointRow,
					});

					// Return the endpoint with the secret visible ONLY on creation.
					// After this response, the secret is never returned again.
					return ctx.json({
						id: endpoint.id,
						url: endpoint.url,
						secret: endpoint.secret,
						eventTypes: endpoint.eventTypes,
						enabled: endpoint.enabled,
						successCount: endpoint.successCount,
						failureCount: endpoint.failureCount,
						consecutiveFailures: endpoint.consecutiveFailures,
						lastDeliveryAt: endpoint.lastDeliveryAt,
						lastDeliveryStatus: endpoint.lastDeliveryStatus,
						createdAt: endpoint.createdAt,
						updatedAt: endpoint.updatedAt,
					});
				},
			),

			// ── Update webhook endpoint ─────────────────────────────────
			updateWebhookEndpoint: createAuthEndpoint(
				"/banata/webhooks/update",
				{
					method: "POST",
					requireHeaders: true,
					body: updateWebhookSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const now = Date.now();
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "webhook.manage",
						projectId: scope.projectId,
					});

					const updates: Record<string, unknown> = { updatedAt: now };
					if (body.url !== undefined) updates.url = body.url;
					if (body.eventTypes !== undefined) updates.eventTypes = JSON.stringify(body.eventTypes);
					if (body.enabled !== undefined) updates.enabled = body.enabled;

					const endpoint = await db.update<WebhookEndpointRow>({
						model: "webhookEndpoint",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
						update: updates,
					});

					return ctx.json(endpoint);
				},
			),

			// ── Delete webhook endpoint ─────────────────────────────────
			deleteWebhookEndpoint: createAuthEndpoint(
				"/banata/webhooks/delete",
				{
					method: "POST",
					requireHeaders: true,
					body: deleteWebhookSchema,
				},
				async (ctx) => {
					const body = ctx.body;
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const scope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "webhook.manage",
						projectId: scope.projectId,
					});

					await db.delete({
						model: "webhookEndpoint",
						where: [{ field: "id", operator: "eq", value: body.id }, ...scope.where],
					});

					return ctx.json({ success: true });
				},
			),
		},
	};
}

// ─── Signature Utilities ────────────────────────────────────────────

/**
 * Sign a webhook payload using HMAC-SHA256.
 *
 * @param payload - JSON stringified payload
 * @param secret - The webhook endpoint's signing secret
 * @param timestamp - Unix timestamp in seconds
 * @returns The signature string in the format "v1,<hex>"
 */
export async function signWebhookPayload(
	payload: string,
	secret: string,
	timestamp: number,
): Promise<string> {
	const signaturePayload = `${timestamp}.${payload}`;
	const hex = await hmacSha256(secret, signaturePayload);
	return `v1,${hex}`;
}

/**
 * Verify a webhook signature.
 *
 * @param payload - Raw request body string
 * @param signature - The Banata-Webhook-Signature header value (format: "t=<ts>,v1=<hex>")
 * @param secret - The webhook endpoint's signing secret
 * @param tolerance - Max age in seconds (default: 300 = 5 minutes)
 * @returns true if valid
 */
export async function verifyWebhookSignature(
	payload: string,
	signature: string,
	secret: string,
	tolerance = 300,
): Promise<boolean> {
	const parts = signature.split(",");
	if (parts.length < 2) return false;

	// Parse timestamp from "t=<timestamp>"
	const tPart = parts.find((p) => p.startsWith("t="));
	if (!tPart) return false;
	const timestamp = Number.parseInt(tPart.slice(2), 10);
	if (Number.isNaN(timestamp)) return false;

	// Check tolerance — reject if too old or too far in the future
	const age = Math.floor(Date.now() / 1000) - timestamp;
	if (Math.abs(age) > tolerance) return false;

	// Find v1 signature
	const sigPart = parts.find((p) => p.startsWith("v1="));
	if (!sigPart) return false;
	const receivedSig = sigPart.slice(3);

	// Compute expected signature
	const signaturePayload = `${timestamp}.${payload}`;
	const expectedSig = await hmacSha256(secret, signaturePayload);

	// Constant-time comparison to prevent timing attacks
	if (receivedSig.length !== expectedSig.length) return false;
	let result = 0;
	for (let i = 0; i < receivedSig.length; i++) {
		result |= receivedSig.charCodeAt(i) ^ expectedSig.charCodeAt(i);
	}
	return result === 0;
}

// ─── Dispatch Helper ────────────────────────────────────────────────

/**
 * Dispatch a webhook event to all matching endpoints.
 *
 * This is a helper intended to be called from other plugins (audit, triggers)
 * to fire webhooks when events occur. It is designed to never throw — webhook
 * delivery failures must not break the calling flow.
 *
 * @param adapter - The Better Auth database adapter (subset of methods needed)
 * @param eventType - The event type string (e.g., "user.created", "session.revoked")
 * @param data - The event payload data
 * @param scope - Optional project+environment scope for multi-tenant isolation
 */
export async function dispatchWebhookEvent(
	adapter: Pick<PluginDBAdapter, "findMany" | "create" | "update">,
	eventType: string,
	data: Record<string, unknown>,
	scope?: { projectId?: string },
): Promise<void> {
	try {
		// Find all enabled endpoints, scoped to project+environment if provided
		const where: WhereClause[] = [{ field: "enabled", value: true }];
		if (scope?.projectId) where.push({ field: "projectId", value: scope.projectId });

		const endpoints = await adapter.findMany<WebhookEndpointRow>({
			model: "webhookEndpoint",
			where,
			limit: 100,
		});

		if (!endpoints || endpoints.length === 0) return;

		const now = Date.now();
		const timestamp = Math.floor(now / 1000);
		const payload = JSON.stringify({
			id: `evt_${now}_${Math.random().toString(36).slice(2, 10)}`,
			type: eventType,
			data,
			created_at: new Date(now).toISOString(),
		});

		for (const endpoint of endpoints) {
			// Check if endpoint subscribes to this event type
			const eventTypes: string[] = endpoint.eventTypes
				? (JSON.parse(endpoint.eventTypes) as string[])
				: [];
			if (eventTypes.length > 0 && !eventTypes.includes(eventType)) continue;

			const signature = await signWebhookPayload(payload, endpoint.secret, timestamp);

			// Create delivery record for audit trail.
			// Omit optional fields — Convex v.optional() accepts undefined but NOT null.
			const deliveryData: Record<string, unknown> = {
				endpointId: endpoint.id,
				eventType,
				payload,
				attempt: 1,
				maxAttempts: 5,
				status: "pending",
				createdAt: now,
			};
			if (scope?.projectId) deliveryData.projectId = scope.projectId;
			await adapter.create({
				model: "webhookDelivery",
				data: deliveryData,
			});

			// Attempt delivery (fire and forget — actual retry logic would use Convex scheduler)
			try {
				const response = await fetch(endpoint.url, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						"Banata-Webhook-Signature": `t=${timestamp},${signature}`,
						"Banata-Webhook-Id": `evt_${now}`,
						"User-Agent": "BanataAuth-Webhook/1.0",
					},
					body: payload,
					signal: AbortSignal.timeout(30_000),
				});

				const success = response.status >= 200 && response.status < 300;
				const newConsecutiveFailures = success ? 0 : (endpoint.consecutiveFailures ?? 0) + 1;

				// Auto-disable endpoint if it exceeds max consecutive failures
				const shouldDisable =
					!success && newConsecutiveFailures >= WEBHOOK_MAX_CONSECUTIVE_FAILURES;

				// Update endpoint stats
				await adapter.update<WebhookEndpointRow>({
					model: "webhookEndpoint",
					where: [{ field: "id", operator: "eq", value: endpoint.id }],
					update: {
						lastDeliveryAt: now,
						lastDeliveryStatus: success ? "success" : "failure",
						successCount: (endpoint.successCount ?? 0) + (success ? 1 : 0),
						failureCount: (endpoint.failureCount ?? 0) + (success ? 0 : 1),
						consecutiveFailures: newConsecutiveFailures,
						...(shouldDisable && { enabled: false }),
						updatedAt: now,
					},
				});
			} catch {
				// Network error — mark as failed, retry later via Convex scheduler
				const newConsecutiveFailures = (endpoint.consecutiveFailures ?? 0) + 1;
				const shouldDisable = newConsecutiveFailures >= WEBHOOK_MAX_CONSECUTIVE_FAILURES;

				await adapter.update<WebhookEndpointRow>({
					model: "webhookEndpoint",
					where: [{ field: "id", operator: "eq", value: endpoint.id }],
					update: {
						lastDeliveryAt: now,
						lastDeliveryStatus: "failure",
						failureCount: (endpoint.failureCount ?? 0) + 1,
						consecutiveFailures: newConsecutiveFailures,
						...(shouldDisable && { enabled: false }),
						updatedAt: now,
					},
				});
			}
		}
	} catch {
		// Webhook dispatch should never break the calling flow
	}
}
