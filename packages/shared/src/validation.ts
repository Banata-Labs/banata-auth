import { z } from "zod";
import { SIZE_LIMITS } from "./constants";

// ─── Primitives ──────────────────────────────────────────────────────────────

export const emailSchema = z.string().email("Invalid email address").max(255).toLowerCase().trim();

export const passwordSchema = z
	.string()
	.min(SIZE_LIMITS.passwordMinLength, `Password must be at least ${SIZE_LIMITS.passwordMinLength} characters`)
	.max(SIZE_LIMITS.passwordMaxLength, `Password must be at most ${SIZE_LIMITS.passwordMaxLength} characters`);

export const nameSchema = z
	.string()
	.trim()
	.min(1, "Name is required")
	.max(255);

export const slugSchema = z
	.string()
	.min(2, "Slug must be at least 2 characters")
	.max(128)
	.regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/, "Slug must be lowercase alphanumeric with hyphens")
	.trim();

export const urlSchema = z.string().url("Invalid URL").max(2048);

export const httpsUrlSchema = urlSchema.refine((url) => url.startsWith("https://"), {
	message: "URL must use HTTPS",
});

export const metadataSchema = z
	.record(z.unknown())
	.refine((data) => JSON.stringify(data).length <= SIZE_LIMITS.metadataMaxBytes, {
		message: `Metadata must be less than ${SIZE_LIMITS.metadataMaxBytes / 1024}KB`,
	})
	.optional();

export const domainSchema = z
	.string()
	.trim()
	.toLowerCase()
	.min(3)
	.max(255)
	.regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*\.[a-z]{2,}$/, {
		message: "Invalid domain format",
	});

// ─── Pagination ──────────────────────────────────────────────────────────────

export const paginationSchema = z.object({
	limit: z.coerce.number().int().min(1).max(100).default(10),
	before: z.string().optional(),
	after: z.string().optional(),
	order: z.enum(["asc", "desc"]).default("desc"),
});

export type PaginationOptions = z.infer<typeof paginationSchema>;

// ─── User ────────────────────────────────────────────────────────────────────

export const createUserSchema = z.object({
	email: emailSchema,
	password: passwordSchema.optional(),
	name: nameSchema,
	image: urlSchema.optional(),
	username: z.string().min(2).max(64).optional(),
	phoneNumber: z.string().optional(),
	emailVerified: z.boolean().default(false),
	role: z.enum(["user", "admin"]).default("user"),
	metadata: metadataSchema,
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

export const updateUserSchema = z.object({
	name: nameSchema.optional(),
	image: urlSchema.optional().nullable(),
	username: z.string().min(2).max(64).optional(),
	phoneNumber: z.string().optional().nullable(),
	metadata: metadataSchema,
});

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

// ─── Organization ────────────────────────────────────────────────────────────

export const createOrganizationSchema = z.object({
	name: nameSchema,
	slug: slugSchema.optional(),
	logo: urlSchema.optional(),
	metadata: metadataSchema,
	requireMfa: z.boolean().default(false),
	allowedEmailDomains: z.array(domainSchema).optional(),
	maxMembers: z.number().int().positive().optional(),
});

export type CreateOrganizationInput = z.infer<typeof createOrganizationSchema>;

export const updateOrganizationSchema = z.object({
	name: nameSchema.optional(),
	slug: slugSchema.optional(),
	logo: urlSchema.optional().nullable(),
	metadata: metadataSchema,
	requireMfa: z.boolean().optional(),
	ssoEnforced: z.boolean().optional(),
	allowedEmailDomains: z.array(domainSchema).optional().nullable(),
	maxMembers: z.number().int().positive().optional().nullable(),
});

export type UpdateOrganizationInput = z.infer<typeof updateOrganizationSchema>;

export const inviteMemberSchema = z.object({
	email: emailSchema,
	role: z.string().min(1),
});

export type InviteMemberInput = z.infer<typeof inviteMemberSchema>;

// ─── SSO Connection ──────────────────────────────────────────────────────────

export const createSsoConnectionSchema = z.object({
	organizationId: z.string(),
	type: z.enum(["saml", "oidc"]),
	name: nameSchema,
	domains: z.array(domainSchema).min(1),
	samlConfig: z
		.object({
			idpEntityId: z.string(),
			idpSsoUrl: urlSchema,
			idpCertificate: z.string().min(1),
			nameIdFormat: z.string().optional(),
			signRequest: z.boolean().default(false),
			allowIdpInitiated: z.boolean().default(false),
			attributeMapping: z.record(z.string()).optional(),
		})
		.optional(),
	oidcConfig: z
		.object({
			issuer: urlSchema,
			clientId: z.string().min(1),
			clientSecret: z.string().min(1),
			scopes: z.array(z.string()).default(["openid", "email", "profile"]),
		})
		.optional(),
});

export type CreateSsoConnectionInput = z.infer<typeof createSsoConnectionSchema>;

// ─── Webhook ─────────────────────────────────────────────────────────────────

export const createWebhookEndpointSchema = z.object({
	url: httpsUrlSchema,
	eventTypes: z.array(z.string()).default([]),
	enabled: z.boolean().default(true),
});

export type CreateWebhookEndpointInput = z.infer<typeof createWebhookEndpointSchema>;

// ─── Audit Log ───────────────────────────────────────────────────────────────

export const createAuditEventSchema = z.object({
	action: z.string().min(1),
	actor: z.object({
		type: z.enum(["user", "admin", "system", "api_key", "scim"]),
		id: z.string(),
		name: z.string().optional(),
		email: z.string().optional(),
		metadata: z.record(z.string()).optional(),
	}),
	targets: z
		.array(
			z.object({
				type: z.string(),
				id: z.string(),
				name: z.string().optional(),
				metadata: z.record(z.string()).optional(),
			}),
		)
		.default([]),
	context: z
		.object({
			organizationId: z.string().optional(),
			ipAddress: z.string().optional(),
			userAgent: z.string().optional(),
			requestId: z.string().optional(),
		})
		.default({}),
	changes: z
		.object({
			before: z.record(z.unknown()).optional(),
			after: z.record(z.unknown()).optional(),
		})
		.optional(),
	idempotencyKey: z.string().optional(),
	metadata: z.record(z.string()).optional(),
	occurredAt: z.number().optional(),
});

export type CreateAuditEventInput = z.infer<typeof createAuditEventSchema>;
