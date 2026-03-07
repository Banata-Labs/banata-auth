/**
 * Built-in email templates for Banata Auth.
 *
 * Server-renderable HTML email templates designed for maximum email client
 * compatibility. Uses inline styles and table-based layouts (the email
 * industry standard) for consistent rendering across Gmail, Outlook,
 * Apple Mail, Yahoo Mail, and others.
 *
 * Templates are parameterized with branding (colors, logo, app name)
 * and can be overridden per-template via the dashboard.
 *
 * The visual design follows React Email / Resend conventions:
 * - Clean, minimal layout
 * - Centered card with subtle border
 * - Primary-colored CTA button
 * - Muted footer with legal text
 */

// ─── Branding ──────────────────────────────────────────────────────

export interface EmailBranding {
	/** Application name displayed in the email header. */
	appName: string;
	/** Primary color for buttons and accents (hex). */
	primaryColor: string;
	/** Background color of the email body (hex). */
	bgColor: string;
	/** Logo URL (optional, displayed above the heading). */
	logoUrl?: string;
	/** Border radius for buttons in pixels. */
	borderRadius: number;
	/** Font family stack (full CSS value). */
	fontFamily: string;
	/** Whether dark mode is enabled. Affects card/text colors. */
	darkMode: boolean;
	/** Custom CSS to inject into a <style> block in the email. */
	customCss?: string;
}

const DEFAULT_BRANDING: EmailBranding = {
	appName: "Banata Auth",
	primaryColor: "#6366f1",
	bgColor: "#f8fafc",
	borderRadius: 8,
	fontFamily:
		'-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
	darkMode: false,
};

/**
 * Map a short font name (stored in DB) to a full CSS font-family stack.
 */
export function fontNameToStack(font: string | null | undefined): string | undefined {
	switch (font) {
		case "inter":
			return '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		case "system":
			return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif';
		case "roboto":
			return '"Roboto", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
		case "open-sans":
			return '"Open Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		case "lato":
			return '"Lato", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		case "poppins":
			return '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
		default:
			return undefined;
	}
}

// ─── Template Types ────────────────────────────────────────────────

export type EmailTemplateType =
	| "verification"
	| "password-reset"
	| "magic-link"
	| "email-otp"
	| "invitation"
	| "welcome";

export interface VerificationEmailData {
	type: "verification";
	userName: string;
	verificationUrl: string;
	token: string;
}

export interface PasswordResetEmailData {
	type: "password-reset";
	userName: string;
	resetUrl: string;
	token: string;
}

export interface MagicLinkEmailData {
	type: "magic-link";
	email: string;
	magicLinkUrl: string;
	token: string;
}

export interface EmailOtpData {
	type: "email-otp";
	email: string;
	otp: string;
}

export interface InvitationEmailData {
	type: "invitation";
	email: string;
	invitationId: string;
	organizationName: string;
	inviterName: string;
	/** If the consumer provides a URL builder, we can include a direct link. */
	acceptUrl?: string;
}

export interface WelcomeEmailData {
	type: "welcome";
	userName: string;
	/** URL to the app dashboard or getting-started page. */
	dashboardUrl?: string;
}

export type EmailData =
	| VerificationEmailData
	| PasswordResetEmailData
	| MagicLinkEmailData
	| EmailOtpData
	| InvitationEmailData
	| WelcomeEmailData;

// ─── Rendered Email ────────────────────────────────────────────────

export interface RenderedEmail {
	subject: string;
	html: string;
	text: string;
}

// ─── HTML Helpers ──────────────────────────────────────────────────

function esc(str: string): string {
	return str
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#x27;");
}

function layout(b: EmailBranding, content: string): string {
	const logo = b.logoUrl
		? `<img src="${esc(b.logoUrl)}" alt="${esc(b.appName)}" width="48" height="48" style="display:block;margin:0 auto 16px;border-radius:8px;" />`
		: "";

	// Dark / light palette for the card and text
	const cardBg = b.darkMode ? "#1a1a2e" : "#ffffff";
	const cardBorder = b.darkMode ? "#2a2a3e" : "#e2e8f0";
	const footerColor = b.darkMode ? "#64748b" : "#94a3b8";
	const colorScheme = b.darkMode ? "dark" : "light";

	// Custom CSS block (sanitized at save-time by the dashboard)
	const customStyleBlock = b.customCss ? `<style>${b.customCss}</style>` : "";

	return [
		"<!DOCTYPE html>",
		'<html lang="en">',
		"<head>",
		'<meta charset="utf-8" />',
		'<meta name="viewport" content="width=device-width, initial-scale=1" />',
		`<meta name="color-scheme" content="${colorScheme}" />`,
		`<meta name="supported-color-schemes" content="${colorScheme}" />`,
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

function btn(label: string, url: string, b: EmailBranding): string {
	const arc = Math.round((b.borderRadius / 44) * 100);
	return [
		'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">',
		"<tr>",
		'<td align="center">',
		"<!--[if mso]>",
		`<v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" href="${esc(url)}" style="height:44px;v-text-anchor:middle;width:200px;" arcsize="${arc}%" fillcolor="${b.primaryColor}">`,
		`<center style="color:#ffffff;font-family:Arial,sans-serif;font-size:14px;font-weight:600;">${esc(label)}</center>`,
		"</v:roundrect>",
		"<![endif]-->",
		"<!--[if !mso]><!-->",
		`<a href="${esc(url)}" target="_blank" style="display:inline-block;padding:12px 32px;background-color:${b.primaryColor};color:#ffffff;font-size:14px;font-weight:600;text-decoration:none;border-radius:${b.borderRadius}px;line-height:1.2;">`,
		esc(label),
		"</a>",
		"<!--<![endif]-->",
		"</td>",
		"</tr>",
		"</table>",
	].join("\n");
}

function h1(text: string, dark = false): string {
	const color = dark ? "#e2e8f0" : "#0f172a";
	return `<h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${color};text-align:center;line-height:1.3;">${esc(text)}</h1>`;
}

function p(html: string, dark = false): string {
	const color = dark ? "#94a3b8" : "#475569";
	return `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:${color};">${html}</p>`;
}

function code(value: string, dark = false): string {
	const codeBg = dark ? "#1e293b" : "#f1f5f9";
	const codeBorder = dark ? "#334155" : "#e2e8f0";
	const codeColor = dark ? "#e2e8f0" : "#0f172a";
	return [
		'<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:24px 0;">',
		"<tr>",
		'<td align="center">',
		`<div style="display:inline-block;padding:16px 32px;background-color:${codeBg};border:1px solid ${codeBorder};border-radius:8px;font-family:'Courier New',monospace;font-size:28px;font-weight:700;letter-spacing:6px;color:${codeColor};">`,
		esc(value),
		"</div>",
		"</td>",
		"</tr>",
		"</table>",
	].join("\n");
}

function hr(dark = false): string {
	const color = dark ? "#334155" : "#e2e8f0";
	return `<hr style="margin:24px 0;border:none;border-top:1px solid ${color};" />`;
}

function urlFallback(url: string, b: EmailBranding): string {
	return `<p style="margin:0;font-size:12px;color:${b.primaryColor};word-break:break-all;">${esc(url)}</p>`;
}

function muted(text: string, dark = false): string {
	const color = dark ? "#64748b" : "#94a3b8";
	return p(`<span style="font-size:12px;color:${color};">${text}</span>`, dark);
}

// ─── Plaintext Builder ─────────────────────────────────────────────

function txt(lines: string[]): string {
	return lines.join("\n");
}

// ─── Template Renderers ────────────────────────────────────────────

function renderVerification(d: VerificationEmailData, b: EmailBranding): RenderedEmail {
	const subject = `Verify your email \u2014 ${b.appName}`;
	const dk = b.darkMode;

	const html = layout(
		b,
		[
			h1("Verify your email address", dk),
			p(`Hi ${esc(d.userName)},`, dk),
			p(
				"Thanks for signing up! Please verify your email address by clicking the button below.",
				dk,
			),
			btn("Verify Email", d.verificationUrl, b),
			hr(dk),
			muted("If the button doesn't work, copy and paste this URL into your browser:", dk),
			urlFallback(d.verificationUrl, b),
		].join("\n"),
	);

	const text = txt([
		"Verify your email address",
		"",
		`Hi ${d.userName},`,
		"",
		"Thanks for signing up! Please verify your email address by visiting:",
		d.verificationUrl,
		"",
		`\u2014 ${b.appName}`,
	]);

	return { subject, html, text };
}

function renderPasswordReset(d: PasswordResetEmailData, b: EmailBranding): RenderedEmail {
	const subject = `Reset your password \u2014 ${b.appName}`;
	const dk = b.darkMode;

	const html = layout(
		b,
		[
			h1("Reset your password", dk),
			p(`Hi ${esc(d.userName)},`, dk),
			p(
				"We received a request to reset your password. Click the button below to choose a new password.",
				dk,
			),
			btn("Reset Password", d.resetUrl, b),
			hr(dk),
			muted(
				"This link expires in 1 hour. If you didn't request a password reset, you can safely ignore this email.",
				dk,
			),
			urlFallback(d.resetUrl, b),
		].join("\n"),
	);

	const text = txt([
		"Reset your password",
		"",
		`Hi ${d.userName},`,
		"",
		"We received a request to reset your password. Visit this link:",
		d.resetUrl,
		"",
		"This link expires in 1 hour.",
		"If you didn't request this, you can safely ignore this email.",
		"",
		`\u2014 ${b.appName}`,
	]);

	return { subject, html, text };
}

function renderMagicLink(d: MagicLinkEmailData, b: EmailBranding): RenderedEmail {
	const subject = `Sign in to ${b.appName}`;
	const dk = b.darkMode;

	const html = layout(
		b,
		[
			h1("Sign in to your account", dk),
			p("Hi there,", dk),
			p("Click the button below to sign in to your account. This link expires in 10 minutes.", dk),
			btn("Sign In", d.magicLinkUrl, b),
			hr(dk),
			muted("If you didn't request this link, you can safely ignore this email.", dk),
			urlFallback(d.magicLinkUrl, b),
		].join("\n"),
	);

	const text = txt([
		"Sign in to your account",
		"",
		"Click this link to sign in (expires in 10 minutes):",
		d.magicLinkUrl,
		"",
		"If you didn't request this, you can safely ignore this email.",
		"",
		`\u2014 ${b.appName}`,
	]);

	return { subject, html, text };
}

function renderEmailOtp(d: EmailOtpData, b: EmailBranding): RenderedEmail {
	const subject = `${d.otp} is your verification code \u2014 ${b.appName}`;
	const dk = b.darkMode;

	const html = layout(
		b,
		[
			h1("Your verification code", dk),
			p("Use the code below to verify your identity. It expires in 10 minutes.", dk),
			code(d.otp, dk),
			hr(dk),
			muted(
				"If you didn't request this code, you can safely ignore this email. Never share this code with anyone.",
				dk,
			),
		].join("\n"),
	);

	const text = txt([
		"Your verification code",
		"",
		`Your code: ${d.otp}`,
		"",
		"This code expires in 10 minutes.",
		"If you didn't request this, you can safely ignore this email.",
		"",
		`\u2014 ${b.appName}`,
	]);

	return { subject, html, text };
}

function renderInvitation(d: InvitationEmailData, b: EmailBranding): RenderedEmail {
	const subject = `${d.inviterName} invited you to ${d.organizationName} \u2014 ${b.appName}`;
	const dk = b.darkMode;
	const codeBg = dk ? "#1e293b" : "#f1f5f9";

	const parts: string[] = [
		h1("You've been invited", dk),
		p(
			`<strong>${esc(d.inviterName)}</strong> has invited you to join <strong>${esc(d.organizationName)}</strong> on ${esc(b.appName)}.`,
			dk,
		),
	];

	if (d.acceptUrl) {
		parts.push(btn("Accept Invitation", d.acceptUrl, b));
		parts.push(hr(dk));
		parts.push(urlFallback(d.acceptUrl, b));
	} else {
		parts.push(
			muted(
				`Invitation ID: <code style="font-family:'Courier New',monospace;background:${codeBg};padding:2px 6px;border-radius:4px;">${esc(d.invitationId)}</code>`,
				dk,
			),
		);
	}

	const html = layout(b, parts.join("\n"));

	const textLines = [
		"You've been invited",
		"",
		`${d.inviterName} has invited you to join ${d.organizationName} on ${b.appName}.`,
		"",
	];
	if (d.acceptUrl) {
		textLines.push(`Accept the invitation: ${d.acceptUrl}`);
	} else {
		textLines.push(`Invitation ID: ${d.invitationId}`);
	}
	textLines.push("", `\u2014 ${b.appName}`);

	return { subject, html, text: txt(textLines) };
}

function renderWelcome(d: WelcomeEmailData, b: EmailBranding): RenderedEmail {
	const subject = `Welcome to ${b.appName}`;
	const dk = b.darkMode;

	const parts: string[] = [
		h1(`Welcome to ${esc(b.appName)}`, dk),
		p(`Hi ${esc(d.userName)},`, dk),
		p("Your account has been created successfully. You're all set to get started.", dk),
	];

	if (d.dashboardUrl) {
		parts.push(btn("Go to Dashboard", d.dashboardUrl, b));
	}

	parts.push(hr(dk));
	parts.push(muted("If you didn't create this account, please contact support.", dk));

	const html = layout(b, parts.join("\n"));

	const textLines = [
		`Welcome to ${b.appName}`,
		"",
		`Hi ${d.userName},`,
		"",
		"Your account has been created successfully.",
	];
	if (d.dashboardUrl) {
		textLines.push(`Get started: ${d.dashboardUrl}`);
	}
	textLines.push("", `\u2014 ${b.appName}`);

	return { subject, html, text: txt(textLines) };
}

// ─── Main Render Function ──────────────────────────────────────────

/**
 * Render an email template with the given data and branding.
 *
 * Can be called from:
 * - The Convex auth plugin (automatic sending on auth events)
 * - The SDK (`banataAuth.emails.send(...)`)
 * - The dashboard (template preview)
 *
 * @param data - The email data (type-discriminated union)
 * @param brandingOverrides - Partial branding, merged with defaults
 * @returns The rendered email with subject, HTML, and plain text
 */
export function renderEmail(
	data: EmailData,
	brandingOverrides?: Partial<EmailBranding>,
): RenderedEmail {
	const branding: EmailBranding = { ...DEFAULT_BRANDING, ...brandingOverrides };

	switch (data.type) {
		case "verification":
			return renderVerification(data, branding);
		case "password-reset":
			return renderPasswordReset(data, branding);
		case "magic-link":
			return renderMagicLink(data, branding);
		case "email-otp":
			return renderEmailOtp(data, branding);
		case "invitation":
			return renderInvitation(data, branding);
		case "welcome":
			return renderWelcome(data, branding);
		default: {
			const _exhaustive: never = data;
			throw new Error(`Unknown email template type: ${(_exhaustive as EmailData).type}`);
		}
	}
}

/**
 * Get the subject line for a given email template type.
 * Useful for the dashboard template preview.
 */
export function getTemplateSubject(type: EmailTemplateType, appName = "Banata Auth"): string {
	switch (type) {
		case "verification":
			return `Verify your email \u2014 ${appName}`;
		case "password-reset":
			return `Reset your password \u2014 ${appName}`;
		case "magic-link":
			return `Sign in to ${appName}`;
		case "email-otp":
			return `Your verification code \u2014 ${appName}`;
		case "invitation":
			return `You've been invited \u2014 ${appName}`;
		case "welcome":
			return `Welcome to ${appName}`;
	}
}

/**
 * Generate preview data for a template type.
 * Used by the dashboard template preview and the SDK.
 */
export function getPreviewData(type: EmailTemplateType): EmailData {
	switch (type) {
		case "verification":
			return {
				type: "verification",
				userName: "Jane Doe",
				verificationUrl: "https://app.example.com/verify?token=abc123",
				token: "abc123",
			};
		case "password-reset":
			return {
				type: "password-reset",
				userName: "Jane Doe",
				resetUrl: "https://app.example.com/reset-password?token=xyz789",
				token: "xyz789",
			};
		case "magic-link":
			return {
				type: "magic-link",
				email: "jane@example.com",
				magicLinkUrl: "https://app.example.com/auth/magic?token=mlk456",
				token: "mlk456",
			};
		case "email-otp":
			return {
				type: "email-otp",
				email: "jane@example.com",
				otp: "847291",
			};
		case "invitation":
			return {
				type: "invitation",
				email: "jane@example.com",
				invitationId: "inv_abc123",
				organizationName: "Acme Corp",
				inviterName: "John Smith",
				acceptUrl: "https://app.example.com/invite/accept?id=inv_abc123",
			};
		case "welcome":
			return {
				type: "welcome",
				userName: "Jane Doe",
				dashboardUrl: "https://app.example.com/dashboard",
			};
	}
}
