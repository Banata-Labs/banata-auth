/**
 * Built-in email plugin for Banata Auth.
 *
 * Provides automatic email sending on auth events (verification,
 * password reset, magic link, OTP, invitation, welcome) using the
 * provider and credentials configured through the dashboard.
 *
 * The plugin:
 * 1. Reads the active email provider + API key from the DB (set via dashboard)
 * 2. Reads branding config from the DB (colors, logo, app name)
 * 3. Renders built-in HTML email templates with the branding
 * 4. Sends via the configured provider's HTTP API (no Node.js SDKs)
 *
 * Consumer callbacks (in BanataAuthEmailConfig) still work as overrides:
 * if a consumer provides e.g. `sendVerificationEmail`, it takes priority
 * over the built-in sending for that email type.
 *
 * Also exposes API endpoints for the SDK and dashboard:
 * - POST /banata/emails/send    — SDK-driven email sending
 * - POST /banata/emails/preview — Template preview for dashboard
 * - POST /banata/test-email     — Send test email
 */

import type { BetterAuthPlugin } from "better-auth";
import { createAuthEndpoint } from "better-auth/api";
import { z } from "zod";
import {
	type EmailProviderId,
	type EmailProviderCredentials as SenderCredentials,
	sendEmail,
	validateCredentials,
} from "./email-sender";
import {
	type EmailBranding,
	type EmailData,
	type EmailTemplateType,
	fontNameToStack,
	getPreviewData,
	renderEmail,
} from "./email-templates";
import {
	type BrandingConfigRow,
	type EmailProviderConfigRow,
	type EmailTemplateRow,
	type PluginDBAdapter,
	type WhereClause,
	getProjectScope,
	projectScopeSchema,
	requireProjectPermission,
} from "./types";

// ─── Types ─────────────────────────────────────────────────────────

/** Shape of the emailProviderConfig JSON blob. */
interface ProviderConfigJson {
	providers: Record<
		string,
		{
			enabled?: boolean;
			apiKey?: string;
			domain?: string;
			region?: string;
			accessKeyId?: string;
			secretAccessKey?: string;
		}
	>;
	activeProvider: string | null;
}

/** Options for the banataEmail plugin. */
export interface BanataEmailOptions {
	/**
	 * Default "from" address for all outgoing emails.
	 * Can include a name: "Acme <noreply@acme.com>"
	 */
	fromAddress?: string;

	/**
	 * Default "reply-to" address for outgoing emails.
	 */
	replyTo?: string;

	/**
	 * Application name used in email templates.
	 * Falls back to branding config, then "Banata Auth".
	 */
	appName?: string;
}

// ─── Zod Schemas ───────────────────────────────────────────────────

const builtInTemplateEnum = z.enum([
	"verification",
	"password-reset",
	"magic-link",
	"email-otp",
	"invitation",
	"welcome",
]);

const sendEmailSchema = z
	.object({
		to: z.string(),
		/** Either a built-in template type or a custom template slug. */
		template: z.string(),
		data: z.record(z.unknown()),
	})
	.merge(projectScopeSchema);

const previewEmailSchema = z
	.object({
		template: z.string(),
		data: z.record(z.unknown()).optional(),
	})
	.merge(projectScopeSchema);

const testEmailSchema = z
	.object({
		to: z.string(),
		template: z.string().optional(),
	})
	.merge(projectScopeSchema);

// Template CRUD schemas
const templateCategoryEnum = z.enum([
	"auth",
	"marketing",
	"transactional",
	"onboarding",
	"notification",
	"custom",
]);

const createTemplateSchema = z
	.object({
		name: z.string().min(1).max(200),
		slug: z.string().min(1).max(200),
		subject: z.string().min(1).max(500),
		previewText: z.string().max(200).optional(),
		category: templateCategoryEnum.default("custom"),
		description: z.string().max(1000).optional(),
		blocksJson: z.string(),
		variablesJson: z.string().optional(),
		builtIn: z.boolean().optional(),
		builtInType: builtInTemplateEnum.optional(),
	})
	.merge(projectScopeSchema);

const updateTemplateSchema = z
	.object({
		id: z.string(),
		name: z.string().min(1).max(200).optional(),
		slug: z.string().min(1).max(200).optional(),
		subject: z.string().min(1).max(500).optional(),
		previewText: z.string().max(200).optional(),
		category: templateCategoryEnum.optional(),
		description: z.string().max(1000).optional(),
		blocksJson: z.string().optional(),
		variablesJson: z.string().optional(),
	})
	.merge(projectScopeSchema);

const deleteTemplateSchema = z
	.object({
		id: z.string(),
	})
	.merge(projectScopeSchema);

const getTemplateSchema = z
	.object({
		/** Either an ID or a slug. */
		idOrSlug: z.string(),
	})
	.merge(projectScopeSchema);

const listTemplatesSchema = z
	.object({
		category: templateCategoryEnum.optional(),
		limit: z.number().int().min(1).max(100).optional(),
	})
	.merge(projectScopeSchema);

// ─── Helper: Load Provider Config from DB ──────────────────────────

async function loadProviderConfig(
	db: PluginDBAdapter,
	scopeWhere?: WhereClause[],
): Promise<{ provider: EmailProviderId; credentials: SenderCredentials } | null> {
	const rows = await db.findMany<EmailProviderConfigRow>({
		model: "emailProviderConfig",
		where: scopeWhere ?? [],
		limit: 1,
	});

	if (rows.length === 0 || !rows[0]?.configJson) return null;

	let config: ProviderConfigJson;
	try {
		config = JSON.parse(rows[0].configJson) as ProviderConfigJson;
	} catch {
		return null;
	}

	const activeId = config.activeProvider;
	if (!activeId) return null;

	const providerConfig = config.providers[activeId];
	if (!providerConfig?.enabled || !providerConfig.apiKey) return null;

	const credentials: SenderCredentials = {
		apiKey: providerConfig.apiKey,
		domain: providerConfig.domain,
		region: providerConfig.region,
		accessKeyId: providerConfig.accessKeyId,
		secretAccessKey: providerConfig.secretAccessKey,
	};

	const validation = validateCredentials(activeId as EmailProviderId, credentials);
	if (!validation.valid) return null;

	return { provider: activeId as EmailProviderId, credentials };
}

// ─── Helper: Load Branding from DB ─────────────────────────────────

async function loadBranding(
	db: PluginDBAdapter,
	scopeWhere?: WhereClause[],
): Promise<Partial<EmailBranding>> {
	const rows = await db.findMany<BrandingConfigRow>({
		model: "brandingConfig",
		where: scopeWhere ?? [],
		limit: 1,
	});

	if (rows.length === 0 || !rows[0]) return {};

	const row = rows[0];
	return {
		primaryColor: row.primaryColor ?? undefined,
		bgColor: row.bgColor ?? undefined,
		borderRadius: row.borderRadius ?? undefined,
		logoUrl: row.logoUrl ?? undefined,
		darkMode: row.darkMode ?? undefined,
		customCss: row.customCss ?? undefined,
		fontFamily: fontNameToStack(row.font),
	};
}

// ─── Helper: Load Custom Template from DB ──────────────────────────

async function loadTemplateBySlug(
	db: PluginDBAdapter,
	slug: string,
	scopeWhere?: WhereClause[],
): Promise<EmailTemplateRow | null> {
	const rows = await db.findMany<EmailTemplateRow>({
		model: "emailTemplate",
		where: [{ field: "slug", value: slug }, ...(scopeWhere ?? [])],
		limit: 1,
	});
	return rows[0] ?? null;
}

async function loadTemplateById(
	db: PluginDBAdapter,
	id: string,
	scopeWhere?: WhereClause[],
): Promise<EmailTemplateRow | null> {
	return db.findOne<EmailTemplateRow>({
		model: "emailTemplate",
		where: [{ field: "id", value: id }, ...(scopeWhere ?? [])],
	});
}

async function loadTemplateByBuiltInType(
	db: PluginDBAdapter,
	builtInType: string,
	scopeWhere?: WhereClause[],
): Promise<EmailTemplateRow | null> {
	const rows = await db.findMany<EmailTemplateRow>({
		model: "emailTemplate",
		where: [{ field: "builtInType", value: builtInType }, ...(scopeWhere ?? [])],
		limit: 1,
	});
	return rows[0] ?? null;
}

// ─── Helper: Render Custom Template Blocks to HTML ─────────────────

/**
 * Render custom template blocks to HTML.
 * This is a server-side renderer for the Convex runtime (no React/JSX).
 * Uses the same table-based layout as the built-in templates for email
 * client compatibility.
 */
function renderBlocksToHtml(
	blocksJson: string,
	variables: Record<string, string>,
	branding: Partial<EmailBranding>,
): { html: string; text: string } {
	let blocks: Array<Record<string, unknown>>;
	try {
		blocks = JSON.parse(blocksJson) as Array<Record<string, unknown>>;
	} catch {
		return { html: "<p>Invalid template</p>", text: "Invalid template" };
	}

	const pc = branding.primaryColor ?? "#6366f1";
	const br = branding.borderRadius ?? 8;
	const dk = branding.darkMode ?? false;
	const textColor = dk ? "#94a3b8" : "#475569";
	const headingColor = dk ? "#e2e8f0" : "#0f172a";
	const mutedColor = dk ? "#64748b" : "#94a3b8";
	const codeBg = dk ? "#1e293b" : "#f1f5f9";
	const codeBorder = dk ? "#334155" : "#e2e8f0";
	const codeColor = dk ? "#e2e8f0" : "#0f172a";
	const dividerColor = dk ? "#334155" : "#e2e8f0";

	function interp(text: string): string {
		return text.replace(/\{\{(\w+)\}\}/g, (match, name: string) => variables[name] ?? match);
	}

	function escHtml(str: string): string {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	const htmlParts: string[] = [];
	const textParts: string[] = [];

	for (const block of blocks) {
		const type = block.type as string;
		const style = (block.style as Record<string, unknown> | undefined) ?? {};
		const fontSize = (style.fontSize as number | undefined) ?? (type === "heading" ? 22 : 14);
		const color =
			(style.color as string | undefined) ?? (type === "heading" ? headingColor : textColor);
		const align =
			(style.textAlign as string | undefined) ?? (type === "heading" ? "center" : "left");

		switch (type) {
			case "heading": {
				const as = (block.as as string) ?? "h1";
				const text = interp((block.text as string) ?? "");
				htmlParts.push(
					`<${as} style="margin:0 0 8px;font-size:${fontSize}px;font-weight:700;color:${color};text-align:${align};line-height:1.3;">${text}</${as}>`,
				);
				textParts.push(text, "");
				break;
			}
			case "text": {
				const rawText = (block.text as string) ?? "";
				const text = interp(rawText);
				// Allow basic HTML in text blocks (bold, italic, links)
				htmlParts.push(
					`<p style="margin:0 0 16px;font-size:${fontSize}px;line-height:1.6;color:${color};text-align:${align};">${text}</p>`,
				);
				// Strip HTML for plain text
				textParts.push(text.replace(/<[^>]*>/g, ""), "");
				break;
			}
			case "button": {
				const text = interp((block.text as string) ?? "Click");
				const href = interp((block.href as string) ?? "#");
				const variant = (block.variant as string) ?? "primary";
				const bg = variant === "primary" ? pc : "transparent";
				const fc = variant === "primary" ? "#ffffff" : pc;
				const border = variant === "outline" ? `1px solid ${pc}` : "none";
				htmlParts.push(
					`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td align="center"><a href="${escHtml(href)}" target="_blank" style="display:inline-block;padding:12px 32px;background-color:${bg};color:${fc};font-size:14px;font-weight:600;text-decoration:none;border-radius:${br}px;border:${border};line-height:1.2;">${escHtml(text)}</a></td></tr></table>`,
				);
				textParts.push(`[${text}](${href})`, "");
				break;
			}
			case "image": {
				const src = interp((block.src as string) ?? "");
				const alt = (block.alt as string) ?? "";
				const w = (block.width as number | undefined) ?? 600;
				htmlParts.push(
					`<img src="${escHtml(src)}" alt="${escHtml(alt)}" width="${w}" style="display:block;margin:16px auto;max-width:100%;border-radius:${br}px;" />`,
				);
				textParts.push(`[Image: ${alt}]`, "");
				break;
			}
			case "divider": {
				htmlParts.push(
					`<hr style="margin:24px 0;border:none;border-top:1px solid ${dividerColor};" />`,
				);
				textParts.push("---", "");
				break;
			}
			case "spacer": {
				const h = (block.height as number) ?? 24;
				htmlParts.push(`<div style="height:${h}px;"></div>`);
				textParts.push("");
				break;
			}
			case "code": {
				const text = interp((block.text as string) ?? "");
				htmlParts.push(
					`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td align="center"><div style="display:inline-block;padding:16px 32px;background-color:${codeBg};border:1px solid ${codeBorder};border-radius:8px;font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:6px;color:${codeColor};">${escHtml(text)}</div></td></tr></table>`,
				);
				textParts.push(`Code: ${text}`, "");
				break;
			}
			case "link": {
				const text = interp((block.text as string) ?? "");
				const href = interp((block.href as string) ?? "#");
				const lc = (style.color as string | undefined) ?? pc;
				const lfs = (style.fontSize as number | undefined) ?? 14;
				htmlParts.push(
					`<p style="margin:0 0 8px;font-size:${lfs}px;"><a href="${escHtml(href)}" target="_blank" style="color:${lc};text-decoration:underline;word-break:break-all;">${text}</a></p>`,
				);
				textParts.push(`${text} [${href}]`, "");
				break;
			}
			// Columns are rendered as a simple table row
			case "columns": {
				const cols =
					(block.columns as Array<{ width?: string; blocks: Array<Record<string, unknown>> }>) ??
					[];
				htmlParts.push(
					'<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>',
				);
				for (const col of cols) {
					const w = col.width ?? `${Math.floor(100 / cols.length)}%`;
					htmlParts.push(`<td style="width:${w};vertical-align:top;padding:0 8px;">`);
					// Recursively render nested blocks (simplified — just text/heading for now)
					const nested = renderBlocksToHtml(JSON.stringify(col.blocks ?? []), variables, branding);
					htmlParts.push(nested.html);
					textParts.push(nested.text);
					htmlParts.push("</td>");
				}
				htmlParts.push("</tr></table>");
				break;
			}
		}
	}

	return { html: htmlParts.join("\n"), text: textParts.join("\n") };
}

/**
 * Wrap rendered block content in a full email layout (identical to built-in templates).
 */
function wrapBlocksInLayout(content: string, branding: Partial<EmailBranding>): string {
	const b = {
		appName: branding.appName ?? "Banata Auth",
		primaryColor: branding.primaryColor ?? "#6366f1",
		bgColor: branding.bgColor ?? "#f8fafc",
		borderRadius: branding.borderRadius ?? 8,
		fontFamily:
			branding.fontFamily ??
			'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
		darkMode: branding.darkMode ?? false,
		customCss: branding.customCss,
		logoUrl: branding.logoUrl,
	};

	const cardBg = b.darkMode ? "#1a1a2e" : "#ffffff";
	const cardBorder = b.darkMode ? "#2a2a3e" : "#e2e8f0";
	const footerColor = b.darkMode ? "#64748b" : "#94a3b8";
	const colorScheme = b.darkMode ? "dark" : "light";
	const customStyleBlock = b.customCss ? `<style>${b.customCss}</style>` : "";

	function esc(str: string): string {
		return str
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	}

	const logo = b.logoUrl
		? `<img src="${esc(b.logoUrl)}" alt="${esc(b.appName)}" width="48" height="48" style="display:block;margin:0 auto 16px;border-radius:8px;" />`
		: "";

	return [
		"<!DOCTYPE html>",
		'<html lang="en">',
		"<head>",
		'<meta charset="utf-8" />',
		'<meta name="viewport" content="width=device-width, initial-scale=1" />',
		`<meta name="color-scheme" content="${colorScheme}" />`,
		`<title>${esc(b.appName)}</title>`,
		"<!--[if mso]>",
		"<style>table,td,div,p,a{font-family:Arial,sans-serif;}</style>",
		"<![endif]-->",
		customStyleBlock,
		"</head>",
		`<body style="margin:0;padding:0;background-color:${b.bgColor};font-family:${b.fontFamily};-webkit-font-smoothing:antialiased;">`,
		`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:${b.bgColor};">`,
		"<tr>",
		'<td align="center" style="padding:40px 16px;">',
		'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:480px;margin:0 auto;">',
		"<tr>",
		`<td style="padding:32px;background-color:${cardBg};border:1px solid ${cardBorder};border-radius:12px;">`,
		logo,
		content,
		"</td>",
		"</tr>",
		"<tr>",
		'<td style="padding:24px 0 0;text-align:center;">',
		`<p style="margin:0;font-size:12px;line-height:1.5;color:${footerColor};">`,
		`This email was sent by ${esc(b.appName)}.`,
		"If you didn't expect this email, you can safely ignore it.",
		"</p>",
		"</td>",
		"</tr>",
		"</table>",
		"</td>",
		"</tr>",
		"</table>",
		"</body>",
		"</html>",
	].join("\n");
}

// ─── Helper: Send One Email ────────────────────────────────────────

async function sendOneEmail(
	db: PluginDBAdapter,
	to: string,
	data: EmailData,
	options: BanataEmailOptions,
	scope?: { envWhere?: WhereClause[]; projectWhere?: WhereClause[] },
): Promise<{ success: boolean; error?: string }> {
	const providerResult = await loadProviderConfig(db, scope?.envWhere);
	if (!providerResult) {
		return { success: false, error: "No email provider configured. Set one in the dashboard." };
	}

	const branding = await loadBranding(db, scope?.projectWhere);
	if (options.appName) branding.appName = options.appName;

	const rendered = renderEmail(data, branding);

	const fromAddress =
		options.fromAddress ?? `${branding.appName ?? "Banata Auth"} <noreply@example.com>`;

	const result = await sendEmail(
		providerResult.provider,
		{
			from: fromAddress,
			to,
			subject: rendered.subject,
			html: rendered.html,
			text: rendered.text,
			replyTo: options.replyTo,
		},
		providerResult.credentials,
	);

	return result;
}

/**
 * Send a branded email using the dashboard-configured provider and branding.
 *
 * This is the public entry-point for plugins (e.g. organization-rbac) that
 * need to send branded emails outside the auto-callback flow.
 */
export async function sendBrandedEmail(
	db: PluginDBAdapter,
	to: string,
	data: EmailData,
	options: BanataEmailOptions,
	projectWhere?: WhereClause[],
): Promise<{ success: boolean; error?: string }> {
	return sendOneEmail(db, to, data, options, {
		envWhere: projectWhere,
		projectWhere,
	});
}

/**
 * Send an email using a custom template (by slug or built-in type).
 */
async function sendCustomTemplateEmail(
	db: PluginDBAdapter,
	to: string,
	templateSlug: string,
	variables: Record<string, string>,
	options: BanataEmailOptions,
	scope?: { envWhere?: WhereClause[]; projectWhere?: WhereClause[] },
): Promise<{ success: boolean; error?: string }> {
	const providerResult = await loadProviderConfig(db, scope?.envWhere);
	if (!providerResult) {
		return { success: false, error: "No email provider configured. Set one in the dashboard." };
	}

	const template = await loadTemplateBySlug(db, templateSlug, scope?.projectWhere);
	if (!template) {
		return { success: false, error: `Template "${templateSlug}" not found` };
	}

	const branding = await loadBranding(db, scope?.projectWhere);
	if (options.appName) branding.appName = options.appName;

	// Interpolate subject
	const subject = template.subject.replace(
		/\{\{(\w+)\}\}/g,
		(match, name: string) => variables[name] ?? match,
	);

	// Render blocks to HTML
	const { html: blockHtml, text } = renderBlocksToHtml(template.blocksJson, variables, branding);
	const html = wrapBlocksInLayout(blockHtml, branding);

	const fromAddress =
		options.fromAddress ?? `${branding.appName ?? "Banata Auth"} <noreply@example.com>`;

	const result = await sendEmail(
		providerResult.provider,
		{
			from: fromAddress,
			to,
			subject,
			html,
			text,
			replyTo: options.replyTo,
		},
		providerResult.credentials,
	);

	return result;
}

// ─── Plugin Factory ────────────────────────────────────────────────

/**
 * Create the Banata Auth email plugin.
 *
 * Registers API endpoints for SDK-driven email sending, template
 * preview, and test email delivery.
 */
export function banataEmail(options: BanataEmailOptions = {}): BetterAuthPlugin {
	const BUILT_IN_TYPES = [
		"verification",
		"password-reset",
		"magic-link",
		"email-otp",
		"invitation",
		"welcome",
	];

	return {
		id: "banata-email",

		// ─── Schema Registration ──────────────────────────────────
		// Declare all custom models so Better Auth's adapter recognises them.
		schema: {
			emailTemplate: {
				fields: {
					projectId: { type: "string" as const, required: false },
					name: { type: "string", required: true },
					slug: { type: "string", required: true },
					subject: { type: "string", required: true },
					previewText: { type: "string", required: false },
					category: { type: "string", required: true },
					description: { type: "string", required: false },
					blocksJson: { type: "string", required: true },
					variablesJson: { type: "string", required: false },
					builtIn: { type: "boolean", required: false, defaultValue: false },
					builtInType: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			brandingConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					primaryColor: { type: "string", required: false },
					bgColor: { type: "string", required: false },
					borderRadius: { type: "number", required: false },
					darkMode: { type: "boolean", required: false },
					customCss: { type: "string", required: false },
					font: { type: "string", required: false },
					logoUrl: { type: "string", required: false },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
			emailProviderConfig: {
				fields: {
					projectId: { type: "string" as const, required: false },
					configJson: { type: "string", required: true },
					createdAt: { type: "number", required: true },
					updatedAt: { type: "number", required: true },
				},
			},
		},

		endpoints: {
			// ─── Send Email (supports built-in + custom templates) ──────
			sendEmailEndpoint: createAuthEndpoint(
				"/banata/emails/send",
				{
					method: "POST", requireHeaders: true,
					body: sendEmailSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const templateKey = body.template as string;
					const projScope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "email.manage",
						projectId: projScope.projectId,
					});
					const emailScope = { envWhere: projScope.where, projectWhere: projScope.where };

					// Check if it's a built-in template type
					if (BUILT_IN_TYPES.includes(templateKey)) {
						// Check if there's a custom template override for this built-in type
						const customOverride = await loadTemplateByBuiltInType(
							db,
							templateKey,
							projScope.where,
						);
						if (customOverride) {
							const vars: Record<string, string> = {};
							for (const [k, v] of Object.entries(body.data as Record<string, unknown>)) {
								vars[k] = String(v ?? "");
							}
							const result = await sendCustomTemplateEmail(
								db,
								body.to,
								customOverride.slug,
								vars,
								options,
								emailScope,
							);
							return ctx.json(result);
						}

						// Use built-in renderer
						const emailData = buildEmailData(
							templateKey as EmailTemplateType,
							body.data as Record<string, unknown>,
						);
						if (!emailData) {
							return ctx.json({ success: false, error: "Invalid template data" });
						}
						const result = await sendOneEmail(db, body.to, emailData, options, emailScope);
						return ctx.json(result);
					}

					// Custom template (by slug)
					const vars: Record<string, string> = {};
					for (const [k, v] of Object.entries(body.data as Record<string, unknown>)) {
						vars[k] = String(v ?? "");
					}
					const result = await sendCustomTemplateEmail(
						db,
						body.to,
						templateKey,
						vars,
						options,
						emailScope,
					);
					return ctx.json(result);
				},
			),

			// ─── Preview Email Template ────────────────────────────────
			previewEmailTemplate: createAuthEndpoint(
				"/banata/emails/preview",
				{
					method: "POST", requireHeaders: true,
					body: previewEmailSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const templateKey = body.template as string;
					const data = body.data as Record<string, unknown> | undefined;
					const projScope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "email.manage",
						projectId: projScope.projectId,
					});

					// Try custom template first
					const customTemplate = await loadTemplateBySlug(db, templateKey, projScope.where);
					if (customTemplate) {
						const vars: Record<string, string> = {};
						if (data) {
							for (const [k, v] of Object.entries(data)) {
								vars[k] = String(v ?? "");
							}
						}
						const branding = await loadBranding(db, projScope.where);
						if (options.appName) branding.appName = options.appName;

						const subject = customTemplate.subject.replace(
							/\{\{(\w+)\}\}/g,
							(match, name: string) => vars[name] ?? match,
						);
						const { html: blockHtml, text } = renderBlocksToHtml(
							customTemplate.blocksJson,
							vars,
							branding,
						);
						const html = wrapBlocksInLayout(blockHtml, branding);
						return ctx.json({ subject, html, text });
					}

					// Fall back to built-in
					if (BUILT_IN_TYPES.includes(templateKey)) {
						const template = templateKey as EmailTemplateType;
						const emailData = data
							? (buildEmailData(template, data) ?? getPreviewData(template))
							: getPreviewData(template);

						const branding = await loadBranding(db, projScope.where);
						if (options.appName) branding.appName = options.appName;

						const rendered = renderEmail(emailData, branding);
						return ctx.json({
							subject: rendered.subject,
							html: rendered.html,
							text: rendered.text,
						});
					}

					return ctx.json({
						subject: "",
						html: "<p>Template not found</p>",
						text: "Template not found",
					});
				},
			),

			// ─── Send Test Email ───────────────────────────────────────
			sendTestEmail: createAuthEndpoint(
				"/banata/test-email",
				{
					method: "POST", requireHeaders: true,
					body: testEmailSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const projScope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "email.manage",
						projectId: projScope.projectId,
					});
					const emailScope = { envWhere: projScope.where, projectWhere: projScope.where };

					const template = (body.template as string | undefined) ?? "welcome";

					// Try custom template first
					const customTemplate = await loadTemplateBySlug(db, template, projScope.where);
					if (customTemplate) {
						const result = await sendCustomTemplateEmail(
							db,
							body.to,
							template,
							{},
							options,
							emailScope,
						);
						if (!result.success) {
							return ctx.json({ success: false, message: result.error });
						}
						return ctx.json({ success: true, message: "Test email sent" });
					}

					// Fall back to built-in
					if (BUILT_IN_TYPES.includes(template)) {
						const previewData = getPreviewData(template as EmailTemplateType);
						const result = await sendOneEmail(db, body.to, previewData, options, emailScope);
						if (!result.success) {
							return ctx.json({ success: false, message: result.error });
						}
						return ctx.json({ success: true, message: "Test email sent" });
					}

					return ctx.json({ success: false, message: `Template "${template}" not found` });
				},
			),

			// ─── Template CRUD ─────────────────────────────────────────

			listEmailTemplates: createAuthEndpoint(
				"/banata/emails/templates/list",
				{
					method: "POST", requireHeaders: true,
					body: listTemplatesSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const projScope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "email.manage",
						projectId: projScope.projectId,
					});

					const where: WhereClause[] = [...projScope.where];
					if (body.category) {
						where.push({ field: "category", value: body.category });
					}

					const rows = await db.findMany<EmailTemplateRow>({
						model: "emailTemplate",
						where: where.length > 0 ? where : undefined,
						limit: body.limit ?? 50,
						sortBy: { field: "createdAt", direction: "desc" },
					});

					const templates = rows.map((row) => ({
						id: row.id,
						name: row.name,
						slug: row.slug,
						subject: row.subject,
						previewText: row.previewText,
						category: row.category,
						description: row.description,
						blocksJson: row.blocksJson,
						variablesJson: row.variablesJson,
						builtIn: row.builtIn ?? false,
						builtInType: row.builtInType,
						createdAt: row.createdAt,
						updatedAt: row.updatedAt,
					}));

					return ctx.json({ templates });
				},
			),

			getEmailTemplate: createAuthEndpoint(
				"/banata/emails/templates/get",
				{
					method: "POST", requireHeaders: true,
					body: getTemplateSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const { idOrSlug } = body;
					const projScope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "email.manage",
						projectId: projScope.projectId,
					});

					let row = await loadTemplateBySlug(db, idOrSlug, projScope.where);
					if (!row) {
						row = await loadTemplateById(db, idOrSlug, projScope.where);
					}

					if (!row) {
						return ctx.json({ template: null });
					}

					return ctx.json({
						template: {
							id: row.id,
							name: row.name,
							slug: row.slug,
							subject: row.subject,
							previewText: row.previewText,
							category: row.category,
							description: row.description,
							blocksJson: row.blocksJson,
							variablesJson: row.variablesJson,
							builtIn: row.builtIn ?? false,
							builtInType: row.builtInType,
							createdAt: row.createdAt,
							updatedAt: row.updatedAt,
						},
					});
				},
			),

			createEmailTemplate: createAuthEndpoint(
				"/banata/emails/templates/create",
				{
					method: "POST", requireHeaders: true,
					body: createTemplateSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const projScope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "email.manage",
						projectId: projScope.projectId,
					});

					// Check slug uniqueness within the project scope
					const existing = await loadTemplateBySlug(db, body.slug, projScope.where);
					if (existing) {
						return ctx.json({
							success: false,
							error: `Template slug "${body.slug}" already exists`,
						});
					}

					const now = Date.now();
					const data: Record<string, unknown> = {
						...projScope.data,
						name: body.name,
						slug: body.slug,
						subject: body.subject,
						category: body.category,
						blocksJson: body.blocksJson,
						// Auto-set builtIn flag when builtInType is provided
						builtIn: body.builtIn ?? !!body.builtInType,
						createdAt: now,
						updatedAt: now,
					};
					// Only include optional fields if they have actual string values.
					// Convex validators use v.optional() which accepts undefined but NOT null.
					if (body.previewText) data.previewText = body.previewText;
					if (body.description) data.description = body.description;
					if (body.variablesJson) data.variablesJson = body.variablesJson;
					if (body.builtInType) data.builtInType = body.builtInType;

					const row = await db.create<EmailTemplateRow>({
						model: "emailTemplate",
						data: data as EmailTemplateRow,
					});

					return ctx.json({ success: true, template: row });
				},
			),

			updateEmailTemplate: createAuthEndpoint(
				"/banata/emails/templates/update",
				{
					method: "POST", requireHeaders: true,
					body: updateTemplateSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const projScope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "email.manage",
						projectId: projScope.projectId,
					});

					const existing = await loadTemplateById(db, body.id, projScope.where);
					if (!existing) {
						return ctx.json({ success: false, error: "Template not found" });
					}

					// If slug is being changed, check uniqueness within the project scope
					if (body.slug && body.slug !== existing.slug) {
						const conflict = await loadTemplateBySlug(db, body.slug, projScope.where);
						if (conflict) {
							return ctx.json({
								success: false,
								error: `Template slug "${body.slug}" already exists`,
							});
						}
					}

					const update: Record<string, unknown> = { updatedAt: Date.now() };
					if (body.name !== undefined) update.name = body.name;
					if (body.slug !== undefined) update.slug = body.slug;
					if (body.subject !== undefined) update.subject = body.subject;
					if (body.previewText !== undefined) update.previewText = body.previewText;
					if (body.category !== undefined) update.category = body.category;
					if (body.description !== undefined) update.description = body.description;
					if (body.blocksJson !== undefined) update.blocksJson = body.blocksJson;
					if (body.variablesJson !== undefined) update.variablesJson = body.variablesJson;

					const updated = await db.update<EmailTemplateRow>({
						model: "emailTemplate",
						where: [{ field: "id", value: body.id }, ...projScope.where],
						update,
					});

					return ctx.json({ success: true, template: updated });
				},
			),

			deleteEmailTemplate: createAuthEndpoint(
				"/banata/emails/templates/delete",
				{
					method: "POST", requireHeaders: true,
					body: deleteTemplateSchema,
				},
				async (ctx) => {
					const db = ctx.context.adapter as unknown as PluginDBAdapter;
					const body = ctx.body;
					const { id } = body;
					const projScope = getProjectScope(body as Record<string, unknown>);
					await requireProjectPermission(ctx, {
						db,
						permission: "email.manage",
						projectId: projScope.projectId,
					});

					const existing = await loadTemplateById(db, id, projScope.where);
					if (!existing) {
						return ctx.json({ success: false, error: "Template not found" });
					}

					if (existing.builtIn) {
						return ctx.json({
							success: false,
							error: "Cannot delete built-in templates. You can customize them instead.",
						});
					}

					await db.delete({
						model: "emailTemplate",
						where: [{ field: "id", value: id }, ...projScope.where],
					});

					return ctx.json({ success: true });
				},
			),
		},
	};
}

// ─── Auto-Send Callbacks ───────────────────────────────────────────

/**
 * Create email callback functions that use the built-in email system.
 *
 * These are wired into Better Auth's email hooks (sendVerificationEmail,
 * sendResetPassword, sendMagicLink, sendOtp, sendInvitationEmail).
 *
 * Consumer-provided callbacks take priority — these are only used
 * as the fallback when no consumer callback is provided.
 */
/**
 * Look up a user's projectId by email so we can load the correct
 * project's email provider and branding for auto-sent emails.
 */
async function resolveProjectScope(
	db: PluginDBAdapter,
	email: string,
): Promise<{ envWhere: WhereClause[]; projectWhere: WhereClause[] } | undefined> {
	const users = await db.findMany<Record<string, unknown>>({
		model: "user",
		where: [{ field: "email", value: email }],
		limit: 1,
		select: ["projectId"],
	});
	const projectId = typeof users[0]?.projectId === "string" ? users[0].projectId : undefined;
	if (!projectId) return undefined;
	const where: WhereClause[] = [{ field: "projectId", value: projectId }];
	return { envWhere: where, projectWhere: where };
}

export function createAutoEmailCallbacks(
	getDb: () => PluginDBAdapter,
	emailOptions: BanataEmailOptions,
) {
	return {
		sendVerificationEmail: async (params: {
			user: { email: string; name: string };
			url: string;
			token: string;
		}) => {
			try {
				const db = getDb();
				const scope = await resolveProjectScope(db, params.user.email);
				const result = await sendOneEmail(
					db,
					params.user.email,
					{
						type: "verification",
						userName: params.user.name || "there",
						verificationUrl: params.url,
						token: params.token,
					},
					emailOptions,
					scope,
				);
				if (!result.success) {
					console.error(
						`[BanataAuth] Failed to send verification email to ${params.user.email}: ${result.error}`,
					);
				}
			} catch (err) {
				console.error("[BanataAuth] Error sending verification email:", err);
			}
		},

		sendResetPassword: async (params: {
			user: { email: string; name: string };
			url: string;
			token: string;
		}) => {
			try {
				const db = getDb();
				const scope = await resolveProjectScope(db, params.user.email);
				const result = await sendOneEmail(
					db,
					params.user.email,
					{
						type: "password-reset",
						userName: params.user.name || "there",
						resetUrl: params.url,
						token: params.token,
					},
					emailOptions,
					scope,
				);
				if (!result.success) {
					console.error(
						`[BanataAuth] Failed to send password reset email to ${params.user.email}: ${result.error}`,
					);
				}
			} catch (err) {
				console.error("[BanataAuth] Error sending password reset email:", err);
			}
		},

		sendMagicLink: async (params: { email: string; url: string; token: string }) => {
			try {
				const db = getDb();
				const scope = await resolveProjectScope(db, params.email);
				const result = await sendOneEmail(
					db,
					params.email,
					{
						type: "magic-link",
						email: params.email,
						magicLinkUrl: params.url,
						token: params.token,
					},
					emailOptions,
					scope,
				);
				if (!result.success) {
					console.error(
						`[BanataAuth] Failed to send magic link email to ${params.email}: ${result.error}`,
					);
				}
			} catch (err) {
				console.error("[BanataAuth] Error sending magic link email:", err);
			}
		},

		sendOtp: async (params: { email: string; otp: string }) => {
			try {
				const db = getDb();
				const scope = await resolveProjectScope(db, params.email);
				const result = await sendOneEmail(
					db,
					params.email,
					{
						type: "email-otp",
						email: params.email,
						otp: params.otp,
					},
					emailOptions,
					scope,
				);
				if (!result.success) {
					console.error(
						`[BanataAuth] Failed to send OTP email to ${params.email}: ${result.error}`,
					);
				}
			} catch (err) {
				console.error("[BanataAuth] Error sending OTP email:", err);
			}
		},

		sendInvitationEmail: async (params: {
			email: string;
			invitationId: string;
			organizationName: string;
			inviterName: string;
		}) => {
			try {
				const db = getDb();
				const scope = await resolveProjectScope(db, params.email);
				const result = await sendOneEmail(
					db,
					params.email,
					{
						type: "invitation",
						email: params.email,
						invitationId: params.invitationId,
						organizationName: params.organizationName,
						inviterName: params.inviterName,
					},
					emailOptions,
					scope,
				);
				if (!result.success) {
					console.error(
						`[BanataAuth] Failed to send invitation email to ${params.email}: ${result.error}`,
					);
				}
			} catch (err) {
				console.error("[BanataAuth] Error sending invitation email:", err);
			}
		},
	};
}

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Build a typed EmailData object from a template name and plain data.
 */
function buildEmailData(
	template: EmailTemplateType,
	data: Record<string, unknown>,
): EmailData | null {
	switch (template) {
		case "verification":
			return {
				type: "verification",
				userName: String(data.userName ?? ""),
				verificationUrl: String(data.verificationUrl ?? ""),
				token: String(data.token ?? ""),
			};
		case "password-reset":
			return {
				type: "password-reset",
				userName: String(data.userName ?? ""),
				resetUrl: String(data.resetUrl ?? ""),
				token: String(data.token ?? ""),
			};
		case "magic-link":
			return {
				type: "magic-link",
				email: String(data.email ?? ""),
				magicLinkUrl: String(data.magicLinkUrl ?? ""),
				token: String(data.token ?? ""),
			};
		case "email-otp":
			return {
				type: "email-otp",
				email: String(data.email ?? ""),
				otp: String(data.otp ?? ""),
			};
		case "invitation":
			return {
				type: "invitation",
				email: String(data.email ?? ""),
				invitationId: String(data.invitationId ?? ""),
				organizationName: String(data.organizationName ?? ""),
				inviterName: String(data.inviterName ?? ""),
				acceptUrl: data.acceptUrl ? String(data.acceptUrl) : undefined,
			};
		case "welcome":
			return {
				type: "welcome",
				userName: String(data.userName ?? ""),
				dashboardUrl: data.dashboardUrl ? String(data.dashboardUrl) : undefined,
			};
		default:
			return null;
	}
}
