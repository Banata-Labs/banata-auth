/**
 * Provider-agnostic email sending abstraction for Banata Auth.
 *
 * All providers use the Fetch API directly (no Node.js SDKs), making this
 * compatible with Convex's runtime, Cloudflare Workers, Deno, and any
 * other edge/serverless environment.
 *
 * Supported providers:
 * - Resend (https://resend.com)
 * - SendGrid (https://sendgrid.com)
 * - Amazon SES (https://aws.amazon.com/ses) — via SES v2 HTTP API
 * - Mailgun (https://mailgun.com)
 * - Postmark (https://postmarkapp.com)
 */

// ─── Types ─────────────────────────────────────────────────────────

export type EmailProviderId = "resend" | "sendgrid" | "ses" | "mailgun" | "postmark";

export interface EmailMessage {
	/** Sender address (e.g., "noreply@acme.com" or "Acme <noreply@acme.com>"). */
	from: string;
	/** Recipient address. */
	to: string;
	/** Email subject. */
	subject: string;
	/** HTML body. */
	html: string;
	/** Plain text body (fallback). */
	text?: string;
	/** Reply-to address. */
	replyTo?: string;
}

export interface EmailProviderCredentials {
	/** API key (used by Resend, SendGrid, Mailgun, Postmark). */
	apiKey?: string;
	/** AWS region (used by SES). */
	region?: string;
	/** AWS access key ID (used by SES). */
	accessKeyId?: string;
	/** AWS secret access key (used by SES). */
	secretAccessKey?: string;
	/** Mailgun domain (e.g., "mg.example.com"). */
	domain?: string;
}

export interface SendResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

// ─── Provider Implementations ──────────────────────────────────────

async function sendViaResend(
	msg: EmailMessage,
	creds: EmailProviderCredentials,
): Promise<SendResult> {
	if (!creds.apiKey) return { success: false, error: "Resend API key not configured" };

	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${creds.apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			from: msg.from,
			to: [msg.to],
			subject: msg.subject,
			html: msg.html,
			text: msg.text,
			reply_to: msg.replyTo,
		}),
	});

	if (res.ok) {
		const data = (await res.json()) as { id?: string };
		return { success: true, messageId: data.id };
	}

	const err = await res.text();
	return { success: false, error: `Resend ${res.status}: ${err}` };
}

async function sendViaSendGrid(
	msg: EmailMessage,
	creds: EmailProviderCredentials,
): Promise<SendResult> {
	if (!creds.apiKey) return { success: false, error: "SendGrid API key not configured" };

	const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${creds.apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			personalizations: [{ to: [{ email: msg.to }] }],
			from: parseEmailAddress(msg.from),
			subject: msg.subject,
			content: [
				...(msg.text ? [{ type: "text/plain", value: msg.text }] : []),
				{ type: "text/html", value: msg.html },
			],
			...(msg.replyTo ? { reply_to: parseEmailAddress(msg.replyTo) } : {}),
		}),
	});

	if (res.ok || res.status === 202) {
		const messageId = res.headers.get("x-message-id") ?? undefined;
		return { success: true, messageId };
	}

	const err = await res.text();
	return { success: false, error: `SendGrid ${res.status}: ${err}` };
}

async function sendViaMailgun(
	msg: EmailMessage,
	creds: EmailProviderCredentials,
): Promise<SendResult> {
	if (!creds.apiKey) return { success: false, error: "Mailgun API key not configured" };

	const domain = creds.domain ?? "mg.example.com";
	const authHeader = `Basic ${btoa(`api:${creds.apiKey}`)}`;

	const formData = new URLSearchParams();
	formData.append("from", msg.from);
	formData.append("to", msg.to);
	formData.append("subject", msg.subject);
	formData.append("html", msg.html);
	if (msg.text) formData.append("text", msg.text);
	if (msg.replyTo) formData.append("h:Reply-To", msg.replyTo);

	const res = await fetch(`https://api.mailgun.net/v3/${domain}/messages`, {
		method: "POST",
		headers: {
			Authorization: authHeader,
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: formData.toString(),
	});

	if (res.ok) {
		const data = (await res.json()) as { id?: string };
		return { success: true, messageId: data.id };
	}

	const err = await res.text();
	return { success: false, error: `Mailgun ${res.status}: ${err}` };
}

async function sendViaPostmark(
	msg: EmailMessage,
	creds: EmailProviderCredentials,
): Promise<SendResult> {
	if (!creds.apiKey) return { success: false, error: "Postmark server token not configured" };

	const res = await fetch("https://api.postmarkapp.com/email", {
		method: "POST",
		headers: {
			"X-Postmark-Server-Token": creds.apiKey,
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			From: msg.from,
			To: msg.to,
			Subject: msg.subject,
			HtmlBody: msg.html,
			TextBody: msg.text,
			ReplyTo: msg.replyTo,
			MessageStream: "outbound",
		}),
	});

	if (res.ok) {
		const data = (await res.json()) as { MessageID?: string };
		return { success: true, messageId: data.MessageID };
	}

	const err = await res.text();
	return { success: false, error: `Postmark ${res.status}: ${err}` };
}

async function sendViaSes(msg: EmailMessage, creds: EmailProviderCredentials): Promise<SendResult> {
	// SES v2 SendEmail via HTTP API using AWS Signature v4
	// For simplicity in edge runtimes, we use the SES v1 simple email format
	// via the query string API which is simpler to sign.
	if (!creds.accessKeyId || !creds.secretAccessKey) {
		// Fall back to using apiKey as a basic auth mechanism if SES is configured
		// with an SMTP-style credential via a gateway
		if (creds.apiKey) {
			return sendViaSesSimple(msg, creds.apiKey, creds.region ?? "us-east-1");
		}
		return { success: false, error: "AWS SES credentials not configured" };
	}

	return sendViaSesSimple(
		msg,
		creds.accessKeyId,
		creds.region ?? "us-east-1",
		creds.secretAccessKey,
	);
}

/**
 * Simplified SES sending using the v2 SendEmail API.
 * Uses pre-signed requests with AWS Signature v4.
 */
async function sendViaSesSimple(
	msg: EmailMessage,
	accessKeyId: string,
	region: string,
	secretAccessKey?: string,
): Promise<SendResult> {
	// If no secret key, we can't sign the request properly
	// In this case, the apiKey field is treated as an SES SMTP password
	// and we use the SES v2 API with simple bearer auth (not standard, but
	// some SES gateways support this pattern)
	if (!secretAccessKey) {
		return {
			success: false,
			error:
				"AWS SES requires both accessKeyId and secretAccessKey. Configure these in the email provider settings.",
		};
	}

	const endpoint = `https://email.${region}.amazonaws.com`;
	const now = new Date();
	const dateStamp = now.toISOString().replace(/[-:]/g, "").slice(0, 8);
	const amzDate = now
		.toISOString()
		.replace(/[-:]/g, "")
		.replace(/\.\d{3}/, "");

	// Build the SES v2 SendEmail request body
	const body = JSON.stringify({
		Content: {
			Simple: {
				Subject: { Data: msg.subject, Charset: "UTF-8" },
				Body: {
					Html: { Data: msg.html, Charset: "UTF-8" },
					...(msg.text ? { Text: { Data: msg.text, Charset: "UTF-8" } } : {}),
				},
			},
		},
		Destination: { ToAddresses: [msg.to] },
		FromEmailAddress: msg.from,
		...(msg.replyTo ? { ReplyToAddresses: [msg.replyTo] } : {}),
	});

	// AWS Signature v4 signing
	const service = "ses";
	const credentialScope = `${dateStamp}/${region}/${service}/aws4_request`;

	const encoder = new TextEncoder();

	async function hmac(key: ArrayBuffer | Uint8Array, data: string): Promise<ArrayBuffer> {
		const cryptoKey = await crypto.subtle.importKey(
			"raw",
			key instanceof ArrayBuffer ? new Uint8Array(key) : key,
			{ name: "HMAC", hash: "SHA-256" },
			false,
			["sign"],
		);
		return crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
	}

	async function sha256(data: string): Promise<string> {
		const hash = await crypto.subtle.digest("SHA-256", encoder.encode(data));
		return Array.from(new Uint8Array(hash))
			.map((b) => b.toString(16).padStart(2, "0"))
			.join("");
	}

	const payloadHash = await sha256(body);

	const canonicalHeaders = [
		"content-type:application/json",
		`host:email.${region}.amazonaws.com`,
		`x-amz-date:${amzDate}`,
		"",
	].join("\n");

	const signedHeaders = "content-type;host;x-amz-date";

	const canonicalRequest = [
		"POST",
		"/v2/email/outbound-emails",
		"",
		canonicalHeaders,
		signedHeaders,
		payloadHash,
	].join("\n");

	const canonicalRequestHash = await sha256(canonicalRequest);

	const stringToSign = ["AWS4-HMAC-SHA256", amzDate, credentialScope, canonicalRequestHash].join(
		"\n",
	);

	// Derive signing key
	const kDate = await hmac(encoder.encode(`AWS4${secretAccessKey}`), dateStamp);
	const kRegion = await hmac(kDate, region);
	const kService = await hmac(kRegion, service);
	const kSigning = await hmac(kService, "aws4_request");
	const signatureBytes = await hmac(kSigning, stringToSign);
	const signature = Array.from(new Uint8Array(signatureBytes))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	const authorizationHeader = `AWS4-HMAC-SHA256 Credential=${accessKeyId}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`;

	const res = await fetch(`${endpoint}/v2/email/outbound-emails`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"X-Amz-Date": amzDate,
			Authorization: authorizationHeader,
		},
		body,
	});

	if (res.ok) {
		const data = (await res.json()) as { MessageId?: string };
		return { success: true, messageId: data.MessageId };
	}

	const err = await res.text();
	return { success: false, error: `SES ${res.status}: ${err}` };
}

// ─── Helpers ───────────────────────────────────────────────────────

/**
 * Parse "Name <email>" or "email" into { name, email } for SendGrid format.
 */
function parseEmailAddress(address: string): { email: string; name?: string } {
	const match = address.match(/^(.+?)\s*<(.+)>$/);
	if (match?.[1] && match[2]) {
		return { name: match[1].trim(), email: match[2].trim() };
	}
	return { email: address.trim() };
}

// ─── Main Send Function ────────────────────────────────────────────

/**
 * Send an email using the specified provider.
 *
 * This is the main entry point for sending emails. It dispatches to the
 * appropriate provider implementation based on the `provider` parameter.
 *
 * @example
 * ```ts
 * import { sendEmail } from "@banata-auth/convex/plugins";
 *
 * await sendEmail("resend", {
 *   from: "noreply@acme.com",
 *   to: "user@example.com",
 *   subject: "Welcome!",
 *   html: "<h1>Welcome</h1>",
 * }, {
 *   apiKey: "re_xxxxx",
 * });
 * ```
 */
export async function sendEmail(
	provider: EmailProviderId,
	message: EmailMessage,
	credentials: EmailProviderCredentials,
): Promise<SendResult> {
	switch (provider) {
		case "resend":
			return sendViaResend(message, credentials);
		case "sendgrid":
			return sendViaSendGrid(message, credentials);
		case "ses":
			return sendViaSes(message, credentials);
		case "mailgun":
			return sendViaMailgun(message, credentials);
		case "postmark":
			return sendViaPostmark(message, credentials);
		default: {
			const _exhaustive: never = provider;
			return {
				success: false,
				error: `Unknown email provider: ${_exhaustive as string}`,
			};
		}
	}
}

/**
 * Validate that the required credentials are present for a given provider.
 */
export function validateCredentials(
	provider: EmailProviderId,
	credentials: EmailProviderCredentials,
): { valid: boolean; missing: string[] } {
	const missing: string[] = [];

	switch (provider) {
		case "resend":
		case "sendgrid":
		case "postmark":
			if (!credentials.apiKey) missing.push("apiKey");
			break;
		case "mailgun":
			if (!credentials.apiKey) missing.push("apiKey");
			if (!credentials.domain) missing.push("domain");
			break;
		case "ses":
			if (!credentials.accessKeyId) missing.push("accessKeyId");
			if (!credentials.secretAccessKey) missing.push("secretAccessKey");
			break;
	}

	return { valid: missing.length === 0, missing };
}
