/**
 * Portal plugin for Banata Auth.
 *
 * Provides an Admin Portal link generation API that creates short-lived,
 * scoped portal sessions for organization IT admins. Each portal link
 * grants access to a specific intent (SSO, Directory Sync, Audit Logs, etc.)
 * within an organization context.
 *
 * This mirrors WorkOS's Admin Portal feature, allowing you to generate
 * a URL that redirects an org admin to a self-serve configuration page.
 *
 * @see {@link ../../../shared/src/types.ts} for the PortalSession SDK type
 */

import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import {
	type PluginDBAdapter,
	getProjectScope,
	projectScopeSchema,
	requireProjectPermission,
} from "./types";

// ─── Constants ──────────────────────────────────────────────────────

/** Default portal session lifetime: 5 minutes (300 000 ms). */
const DEFAULT_EXPIRES_IN_MS = 5 * 60 * 1000;

/** Maximum portal session lifetime: 1 hour (3 600 000 ms). */
const MAX_EXPIRES_IN_MS = 60 * 60 * 1000;

/** Valid portal intent values. */
const PORTAL_INTENTS = [
	"sso",
	"dsync",
	"domain_verification",
	"audit_logs",
	"log_streams",
	"users",
] as const;

// ─── Row Type ───────────────────────────────────────────────────────

interface PortalSessionRow extends Record<string, unknown> {
	id: string;
	organizationId: string;
	intent: string;
	returnUrl: string | null;
	token: string;
	expiresAt: number;
	projectId?: string;
	createdAt: number;
}

// ─── Zod Schemas ────────────────────────────────────────────────────

const generateLinkSchema = z
	.object({
		/** The organization to generate a portal link for. */
		organizationId: z.string().min(1),
		/** The portal section to open. */
		intent: z.enum(PORTAL_INTENTS),
		/** URL to redirect the admin back to after completing the portal flow. */
		returnUrl: z.string().url().optional(),
		/** Session lifetime in seconds. Default: 300 (5 minutes). Max: 3600 (1 hour). */
		expiresIn: z.number().int().positive().max(3600).optional(),
	})
	.merge(projectScopeSchema);

// ─── Helpers ────────────────────────────────────────────────────────

/**
 * Generate a cryptographically random token for the portal session.
 * Uses 32 bytes of randomness encoded as hex (64 chars).
 */
function generateToken(): string {
	const bytes = new Uint8Array(32);
	crypto.getRandomValues(bytes);
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");
}

// ─── Plugin Factory ─────────────────────────────────────────────────

/**
 * Portal plugin for Banata Auth.
 *
 * Registers API endpoints under `/api/auth/banata/portal/*` that allow
 * programmatic generation of short-lived admin portal links.
 *
 * @returns A Better Auth plugin descriptor
 *
 * @example
 * ```ts
 * import { portalPlugin } from "./plugins/portal";
 *
 * const plugins = [
 *   portalPlugin(),
 *   // ... other plugins
 * ];
 * ```
 */
export function portalPlugin(): BetterAuthPlugin {
	return {
		id: "banata-portal",

		schema: {
			portalSession: {
				fields: {
					organizationId: {
						type: "string",
						required: true,
					},
					intent: {
						type: "string",
						required: true,
					},
					returnUrl: {
						type: "string",
						required: false,
					},
					token: {
						type: "string",
						required: true,
						unique: true,
					},
					projectId: {
						type: "string",
						required: false,
					},
					expiresAt: {
						type: "number",
						required: true,
					},
					createdAt: {
						type: "number",
						required: true,
					},
				},
			},
		},

		endpoints: {
			/**
			 * Generate a short-lived admin portal link.
			 *
			 * POST /api/auth/banata/portal/generate-link
			 *
			 * Creates a portal session and returns the portal URL with an
			 * embedded session token. The link expires after the configured
			 * lifetime (default: 5 minutes).
			 */
			generatePortalLink: createAuthEndpoint(
				"/banata/portal/generate-link",
				{
					method: "POST",
					body: generateLinkSchema,
					requireHeaders: true,
				},
				async (ctx) => {
					try {
						const body = ctx.body;
						const db = ctx.context.adapter as unknown as PluginDBAdapter;
						const scope = getProjectScope(body as Record<string, unknown>);
						await requireProjectPermission(ctx, {
							db,
							permission: "portal.create",
							projectId: scope.projectId,
						});

						// Verify the organization exists
						const orgRows = await db.findMany({
							model: "organization",
							where: [{ field: "id", value: body.organizationId }, ...scope.where],
							limit: 1,
						});
						if (orgRows.length === 0) {
							throw ctx.error("NOT_FOUND", {
								message: `Organization not found: ${body.organizationId}`,
							});
						}

						const now = Date.now();
						const expiresInMs = body.expiresIn
							? Math.min(body.expiresIn * 1000, MAX_EXPIRES_IN_MS)
							: DEFAULT_EXPIRES_IN_MS;
						const expiresAt = now + expiresInMs;
						const token = generateToken();

						const row = await db.create({
							model: "portalSession",
							data: {
								organizationId: body.organizationId,
								intent: body.intent,
								returnUrl: body.returnUrl || undefined,
								token,
								expiresAt,
								createdAt: now,
								...scope.data,
							},
						});

						const id = (row as Record<string, unknown>).id as string;

						// Build the portal URL using the auth base URL
						const baseUrl = ctx.context.baseURL;
						const portalUrl = `${baseUrl}/portal?token=${token}&intent=${body.intent}`;

						return ctx.json({
							link: portalUrl,
							sessionId: id,
							intent: body.intent,
							organizationId: body.organizationId,
							expiresAt: new Date(expiresAt).toISOString(),
						});
					} catch (err) {
						if (err && typeof err === "object" && "status" in err) throw err;
						const message = err instanceof Error ? err.message : "Unknown error";
						return ctx.json(
							{ error: `Portal link generation failed: ${message}` },
						);
					}
				},
			),

			/**
			 * Validate a portal session token.
			 *
			 * POST /api/auth/banata/portal/validate-session
			 *
			 * Validates that the token is valid, not expired, and returns
			 * the session details. Used by the portal frontend to verify
			 * access before rendering the portal UI.
			 */
			validatePortalSession: createAuthEndpoint(
				"/banata/portal/validate-session",
				{
					method: "POST",
					body: z.object({
						token: z.string().min(1),
					}),
					requireHeaders: true,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const { token } = ctx.body;

					const rows = await db.findMany<PortalSessionRow>({
						model: "portalSession",
						where: [{ field: "token", value: token }],
						limit: 1,
					});

					const session = rows[0];
					if (!session) {
						throw ctx.error("NOT_FOUND", {
							message: "Portal session not found or expired",
						});
					}

					if (session.expiresAt < Date.now()) {
						// Clean up expired session
						await db.delete({
							model: "portalSession",
							where: [{ field: "id", value: session.id }],
						});
						throw ctx.error("UNAUTHORIZED", {
							message: "Portal session has expired",
						});
					}

					return ctx.json({
						sessionId: session.id,
						organizationId: session.organizationId,
						intent: session.intent,
						returnUrl: session.returnUrl,
						expiresAt: new Date(session.expiresAt).toISOString(),
					});
				},
			),
		},
	};
}
