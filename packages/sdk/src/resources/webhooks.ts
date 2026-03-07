import type { WebhookEndpoint, WebhookEvent, PaginatedResult } from "@banata-auth/shared";
import type { HttpClient } from "../client";

/**
 * Webhooks resource.
 * Handles webhook endpoint management and signature verification.
 */
export class Webhooks {
	constructor(private readonly http: HttpClient) {}

	// ─── Endpoint Management ───────────────────────────────────────────────

	async listEndpoints(options?: {
		limit?: number;
		before?: string;
		after?: string;
	}): Promise<PaginatedResult<WebhookEndpoint>> {
		return this.http.post<PaginatedResult<WebhookEndpoint>>("/api/auth/banata/webhooks/list", {
			limit: options?.limit,
			before: options?.before,
			after: options?.after,
		});
	}

	async createEndpoint(options: {
		url: string;
		eventTypes?: string[];
		enabled?: boolean;
	}): Promise<WebhookEndpoint & { secret: string }> {
		return this.http.post("/api/auth/banata/webhooks/create", options);
	}

	async updateEndpoint(options: {
		endpointId: string;
		url?: string;
		eventTypes?: string[];
		enabled?: boolean;
	}): Promise<WebhookEndpoint> {
		const { endpointId, ...body } = options;
		return this.http.post<WebhookEndpoint>("/api/auth/banata/webhooks/update", {
			id: endpointId,
			...body,
		});
	}

	async deleteEndpoint(endpointId: string): Promise<void> {
		return this.http.post<void>("/api/auth/banata/webhooks/delete", {
			id: endpointId,
		});
	}

	// ─── Signature Verification ────────────────────────────────────────────

	/**
	 * Verify a webhook signature and construct the event payload.
	 * Uses the Web Crypto API for HMAC-SHA256 signature verification.
	 *
	 * @example
	 * ```ts
	 * const event = await banataAuth.webhooks.constructEvent({
	 *   payload: req.body,
	 *   sigHeader: req.headers["x-banataauth-signature"],
	 *   secret: webhookSecret,
	 * });
	 * ```
	 */
	async constructEvent(options: {
		payload: string;
		sigHeader: string;
		secret: string;
		tolerance?: number;
	}): Promise<WebhookEvent> {
		const { payload, sigHeader, secret, tolerance = 300 } = options;

		if (!(await this.verifySignature({ payload, sigHeader, secret, tolerance }))) {
			throw new Error("Invalid webhook signature");
		}

		return JSON.parse(payload) as WebhookEvent;
	}

	/**
	 * Verify a webhook signature using the Web Crypto API (HMAC-SHA256).
	 */
	async verifySignature(options: {
		payload: string;
		sigHeader: string;
		secret: string;
		tolerance?: number;
	}): Promise<boolean> {
		const { payload, sigHeader, secret, tolerance = 300 } = options;

		// Parse signature header: t=timestamp,v1=signature
		const parts = sigHeader.split(",");
		const timestampPart = parts.find((p) => p.startsWith("t="));
		const signaturePart = parts.find((p) => p.startsWith("v1="));

		if (!timestampPart || !signaturePart) {
			return false;
		}

		const timestamp = Number.parseInt(timestampPart.slice(2), 10);
		const signature = signaturePart.slice(3);

		// Check timestamp tolerance
		const now = Math.floor(Date.now() / 1000);
		if (Math.abs(now - timestamp) > tolerance) {
			return false;
		}

		// Compute expected signature using Web Crypto API
		const signedPayload = `${timestamp}.${payload}`;
		const expectedSignature = await this.computeHmacAsync(secret, signedPayload);

		// Constant-time comparison
		return this.timingSafeEqual(signature, expectedSignature);
	}

	private async computeHmacAsync(secret: string, payload: string): Promise<string> {
		const encoder = new TextEncoder();

		const key = await crypto.subtle.importKey(
			"raw",
			encoder.encode(secret),
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		);

		const signatureBuffer = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));

		return Array.from(new Uint8Array(signatureBuffer))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

	private timingSafeEqual(a: string, b: string): boolean {
		if (a.length !== b.length) return false;
		let result = 0;
		for (let i = 0; i < a.length; i++) {
			result |= a.charCodeAt(i) ^ b.charCodeAt(i);
		}
		return result === 0;
	}
}
