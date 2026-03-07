import type { HttpClient } from "../client";

/**
 * Built-in email template types supported by Banata Auth.
 */
export type BuiltInEmailTemplateType =
	| "verification"
	| "password-reset"
	| "magic-link"
	| "email-otp"
	| "invitation"
	| "welcome";

/**
 * Options for sending an email via the SDK.
 */
export interface SendEmailOptions {
	/** Recipient email address. */
	to: string;
	/**
	 * Template to render.
	 * Can be a built-in type (e.g. "verification") or a custom template slug
	 * (e.g. "marketing-welcome", "onboarding-day-3").
	 */
	template: string;
	/**
	 * Data/variables for the template. Shape depends on the template:
	 *
	 * Built-in templates:
	 * - `verification`: `{ userName, verificationUrl, token }`
	 * - `password-reset`: `{ userName, resetUrl, token }`
	 * - `magic-link`: `{ email, magicLinkUrl, token }`
	 * - `email-otp`: `{ email, otp }`
	 * - `invitation`: `{ email, invitationId, organizationName, inviterName, acceptUrl? }`
	 * - `welcome`: `{ userName, dashboardUrl? }`
	 *
	 * Custom templates: Keys match `{{variable}}` placeholders in the template blocks.
	 */
	data: Record<string, unknown>;
}

/**
 * Result of sending an email.
 */
export interface SendEmailResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

/**
 * Preview of a rendered email template.
 */
export interface EmailPreview {
	subject: string;
	html: string;
	text: string;
}

/**
 * Email template category.
 */
export type EmailTemplateCategory =
	| "auth"
	| "marketing"
	| "transactional"
	| "onboarding"
	| "notification"
	| "custom";

/**
 * An email template definition (returned by the API).
 */
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

/**
 * Options for creating a new email template.
 */
export interface CreateEmailTemplateOptions {
	name: string;
	slug: string;
	subject: string;
	previewText?: string;
	category: EmailTemplateCategory;
	description?: string;
	/** JSON-serialized EmailBlock[] array. */
	blocksJson: string;
	/** JSON-serialized EmailTemplateVariable[] array. */
	variablesJson?: string;
}

/**
 * Options for updating an existing email template.
 */
export interface UpdateEmailTemplateOptions {
	name?: string;
	slug?: string;
	subject?: string;
	previewText?: string;
	category?: EmailTemplateCategory;
	description?: string;
	blocksJson?: string;
	variablesJson?: string;
}

/**
 * Emails resource.
 * Send transactional emails, manage custom email templates, and preview
 * templates using the configured email provider.
 *
 * @example
 * ```ts
 * const banataAuth = new BanataAuth({ apiKey: "sk_live_..." });
 *
 * // Send a built-in welcome email
 * await banataAuth.emails.send({
 *   to: "user@example.com",
 *   template: "welcome",
 *   data: { userName: "Jane Doe", dashboardUrl: "https://app.example.com" },
 * });
 *
 * // Send a custom template
 * await banataAuth.emails.send({
 *   to: "user@example.com",
 *   template: "marketing-welcome",
 *   data: { userName: "Jane", promoCode: "WELCOME10" },
 * });
 *
 * // List all templates
 * const templates = await banataAuth.emails.templates.list();
 *
 * // Create a custom template
 * await banataAuth.emails.templates.create({
 *   name: "Marketing Welcome",
 *   slug: "marketing-welcome",
 *   subject: "Welcome, {{userName}}!",
 *   category: "marketing",
 *   blocksJson: JSON.stringify([...blocks]),
 * });
 * ```
 */
export class Emails {
	public readonly templates: EmailTemplates;

	constructor(private readonly http: HttpClient) {
		this.templates = new EmailTemplates(http);
	}

	/**
	 * Send a transactional email using a built-in or custom template.
	 *
	 * The email is rendered using the configured branding (colors, logo,
	 * app name) and sent via the active email provider configured in the
	 * dashboard.
	 */
	async send(options: SendEmailOptions): Promise<SendEmailResult> {
		return this.http.post<SendEmailResult>("/api/auth/banata/emails/send", {
			to: options.to,
			template: options.template,
			data: options.data,
		});
	}

	/**
	 * Preview a rendered email template.
	 *
	 * Returns the subject, HTML, and plain text of the template with
	 * the current branding applied. Uses sample data if none provided.
	 */
	async preview(template: string, data?: Record<string, unknown>): Promise<EmailPreview> {
		return this.http.post<EmailPreview>("/api/auth/banata/emails/preview", {
			template,
			data,
		});
	}

	/**
	 * Send a test email to verify the email provider configuration.
	 *
	 * Uses the "welcome" template by default with sample data.
	 */
	async sendTest(to: string, template?: string): Promise<{ success: boolean; message?: string }> {
		return this.http.post<{ success: boolean; message?: string }>("/api/auth/banata/test-email", {
			to,
			template,
		});
	}
}

/**
 * Email templates sub-resource for CRUD operations on custom email templates.
 */
class EmailTemplates {
	constructor(private readonly http: HttpClient) {}

	/**
	 * List all email templates, optionally filtered by category.
	 */
	async list(category?: EmailTemplateCategory): Promise<EmailTemplate[]> {
		const payload = await this.http.post<{ templates: EmailTemplate[] }>(
			"/api/auth/banata/emails/templates/list",
			{ category },
		);
		return payload.templates ?? [];
	}

	/**
	 * Get a single email template by ID or slug.
	 */
	async get(idOrSlug: string): Promise<EmailTemplate | null> {
		const payload = await this.http.post<{ template: EmailTemplate | null }>(
			"/api/auth/banata/emails/templates/get",
			{ idOrSlug },
		);
		return payload.template ?? null;
	}

	/**
	 * Create a new custom email template.
	 */
	async create(options: CreateEmailTemplateOptions): Promise<EmailTemplate> {
		const payload = await this.http.post<{
			success: boolean;
			template: EmailTemplate;
			error?: string;
		}>("/api/auth/banata/emails/templates/create", options);
		if (!payload.success) {
			throw new Error(payload.error ?? "Failed to create template");
		}
		return payload.template;
	}

	/**
	 * Update an existing email template.
	 */
	async update(id: string, options: UpdateEmailTemplateOptions): Promise<EmailTemplate> {
		const payload = await this.http.post<{
			success: boolean;
			template: EmailTemplate;
			error?: string;
		}>("/api/auth/banata/emails/templates/update", { id, ...options });
		if (!payload.success) {
			throw new Error(payload.error ?? "Failed to update template");
		}
		return payload.template;
	}

	/**
	 * Delete a custom email template.
	 * Built-in templates cannot be deleted.
	 */
	async delete(id: string): Promise<void> {
		const payload = await this.http.post<{ success: boolean; error?: string }>(
			"/api/auth/banata/emails/templates/delete",
			{ id },
		);
		if (!payload.success) {
			throw new Error(payload.error ?? "Failed to delete template");
		}
	}
}
