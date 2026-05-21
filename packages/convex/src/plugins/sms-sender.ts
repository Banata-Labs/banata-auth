/**
 * Provider-agnostic SMS and WhatsApp OTP delivery for Banata Auth.
 *
 * Providers use the Fetch API directly so the sender works in Convex and
 * edge/serverless runtimes without provider SDKs.
 */

export type SmsProviderId =
	| "twilio"
	| "messagebird"
	| "vonage"
	| "africas_talking"
	| "termii"
	| "mobitech"
	| "meta_whatsapp";

export interface SmsOtpMessage {
	to: string;
	channel: "sms" | "whatsapp" | "voice";
	body: string;
	otp: string;
	purpose: string;
}

export interface SmsProviderCredentials {
	apiKey?: string;
	apiSecret?: string;
	accountSid?: string;
	authToken?: string;
	fromNumber?: string;
	senderId?: string;
	username?: string;
	phoneNumberId?: string;
	templateName?: string;
	templateLanguage?: string;
	apiBaseUrl?: string;
}

export interface SmsSendResult {
	success: boolean;
	messageId?: string;
	error?: string;
}

function basicAuth(username: string, password: string): string {
	return `Basic ${btoa(`${username}:${password}`)}`;
}

function whatsappRecipient(value: string): string {
	return value.startsWith("whatsapp:") ? value : `whatsapp:${value}`;
}

async function sendViaTwilio(
	msg: SmsOtpMessage,
	creds: SmsProviderCredentials,
): Promise<SmsSendResult> {
	if (!creds.accountSid || !creds.authToken) {
		return { success: false, error: "Twilio account SID and auth token are required" };
	}
	if (!creds.fromNumber) {
		return { success: false, error: "Twilio sender phone number is required" };
	}

	const body = new URLSearchParams();
	body.set("To", msg.channel === "whatsapp" ? whatsappRecipient(msg.to) : msg.to);
	body.set(
		"From",
		msg.channel === "whatsapp" ? whatsappRecipient(creds.fromNumber) : creds.fromNumber,
	);
	body.set("Body", msg.body);

	const res = await fetch(
		`https://api.twilio.com/2010-04-01/Accounts/${creds.accountSid}/Messages.json`,
		{
			method: "POST",
			headers: {
				Authorization: basicAuth(creds.accountSid, creds.authToken),
				"Content-Type": "application/x-www-form-urlencoded",
			},
			body: body.toString(),
		},
	);

	if (res.ok) {
		const data = (await res.json()) as { sid?: string };
		return { success: true, messageId: data.sid };
	}

	return { success: false, error: `Twilio ${res.status}: ${await res.text()}` };
}

async function sendViaMessageBird(
	msg: SmsOtpMessage,
	creds: SmsProviderCredentials,
): Promise<SmsSendResult> {
	if (!creds.apiKey) return { success: false, error: "MessageBird API key is required" };
	if (!creds.senderId && !creds.fromNumber) {
		return { success: false, error: "MessageBird originator is required" };
	}

	const res = await fetch("https://rest.messagebird.com/messages", {
		method: "POST",
		headers: {
			Authorization: `AccessKey ${creds.apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			originator: creds.senderId ?? creds.fromNumber,
			recipients: [msg.to],
			body: msg.body,
		}),
	});

	if (res.ok || res.status === 201) {
		const data = (await res.json()) as { id?: string };
		return { success: true, messageId: data.id };
	}

	return { success: false, error: `MessageBird ${res.status}: ${await res.text()}` };
}

async function sendViaVonage(
	msg: SmsOtpMessage,
	creds: SmsProviderCredentials,
): Promise<SmsSendResult> {
	if (!creds.apiKey || !creds.apiSecret) {
		return { success: false, error: "Vonage API key and API secret are required" };
	}
	if (!creds.senderId && !creds.fromNumber) {
		return { success: false, error: "Vonage sender is required" };
	}

	const res = await fetch("https://rest.nexmo.com/sms/json", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			api_key: creds.apiKey,
			api_secret: creds.apiSecret,
			to: msg.to,
			from: creds.senderId ?? creds.fromNumber,
			text: msg.body,
		}),
	});

	const data = (await res.json().catch(() => null)) as
		| { messages?: Array<{ status?: string; "message-id"?: string; "error-text"?: string }> }
		| null;
	const first = data?.messages?.[0];
	if (res.ok && first?.status === "0") {
		return { success: true, messageId: first["message-id"] };
	}

	return {
		success: false,
		error: `Vonage ${res.status}: ${first?.["error-text"] ?? JSON.stringify(data)}`,
	};
}

async function sendViaAfricasTalking(
	msg: SmsOtpMessage,
	creds: SmsProviderCredentials,
): Promise<SmsSendResult> {
	if (!creds.apiKey || !creds.username) {
		return { success: false, error: "Africa's Talking username and API key are required" };
	}

	const body = new URLSearchParams();
	body.set("username", creds.username);
	body.set("to", msg.to);
	body.set("message", msg.body);
	if (creds.senderId) body.set("from", creds.senderId);

	const res = await fetch("https://api.africastalking.com/version1/messaging", {
		method: "POST",
		headers: {
			apiKey: creds.apiKey,
			Accept: "application/json",
			"Content-Type": "application/x-www-form-urlencoded",
		},
		body: body.toString(),
	});

	if (res.ok || res.status === 201) {
		const data = (await res.json()) as {
			SMSMessageData?: { Recipients?: Array<{ messageId?: string }> };
		};
		return {
			success: true,
			messageId: data.SMSMessageData?.Recipients?.[0]?.messageId,
		};
	}

	return { success: false, error: `Africa's Talking ${res.status}: ${await res.text()}` };
}

async function sendViaTermii(
	msg: SmsOtpMessage,
	creds: SmsProviderCredentials,
): Promise<SmsSendResult> {
	if (!creds.apiKey) return { success: false, error: "Termii API key is required" };
	if (!creds.senderId && !creds.fromNumber) {
		return { success: false, error: "Termii sender ID is required" };
	}

	const res = await fetch("https://api.ng.termii.com/api/sms/send", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			to: msg.to,
			from: creds.senderId ?? creds.fromNumber,
			sms: msg.body,
			type: "plain",
			channel: "generic",
			api_key: creds.apiKey,
		}),
	});

	if (res.ok) {
		const data = (await res.json()) as { message_id?: string; message?: string };
		return { success: true, messageId: data.message_id ?? data.message };
	}

	return { success: false, error: `Termii ${res.status}: ${await res.text()}` };
}

async function sendViaMobitech(
	msg: SmsOtpMessage,
	creds: SmsProviderCredentials,
): Promise<SmsSendResult> {
	if (!creds.apiKey) return { success: false, error: "Mobitech API key is required" };
	if (!creds.senderId && !creds.fromNumber) {
		return { success: false, error: "Mobitech sender ID is required" };
	}
	if (msg.channel !== "sms") {
		return { success: false, error: "Mobitech can only send SMS OTP messages" };
	}

	const endpoint =
		creds.apiBaseUrl?.trim() || "https://bulk.mobitechtechnologies.com/api/sms/send";
	const res = await fetch(endpoint, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${creds.apiKey}`,
			h_api_key: creds.apiKey,
			"Content-Type": "application/json",
			Accept: "application/json",
		},
		body: JSON.stringify({
			to: msg.to.replace(/^\+/, ""),
			mobile: msg.to.replace(/^\+/, ""),
			recipient: msg.to.replace(/^\+/, ""),
			from: creds.senderId ?? creds.fromNumber,
			sender: creds.senderId ?? creds.fromNumber,
			message: msg.body,
			text: msg.body,
		}),
	});

	if (res.ok || res.status === 201 || res.status === 202) {
		const data = (await res.json().catch(() => null)) as
			| { id?: string | number; messageId?: string | number; message_id?: string | number }
			| null;
		const messageId = data?.messageId ?? data?.message_id ?? data?.id;
		return { success: true, messageId: messageId?.toString() };
	}

	return { success: false, error: `Mobitech ${res.status}: ${await res.text()}` };
}

async function sendViaMetaWhatsApp(
	msg: SmsOtpMessage,
	creds: SmsProviderCredentials,
): Promise<SmsSendResult> {
	if (!creds.apiKey || !creds.phoneNumberId) {
		return { success: false, error: "Meta WhatsApp token and phone number ID are required" };
	}
	if (msg.channel !== "whatsapp") {
		return { success: false, error: "Meta WhatsApp can only send WhatsApp OTP messages" };
	}

	const templateName = creds.templateName?.trim();
	const templateLanguage = creds.templateLanguage?.trim() || "en_US";
	const payload = templateName
		? {
				messaging_product: "whatsapp",
				to: msg.to.replace(/^\+/, ""),
				type: "template",
				template: {
					name: templateName,
					language: { code: templateLanguage },
					components: [
						{
							type: "body",
							parameters: [{ type: "text", text: msg.otp }],
						},
					],
				},
			}
		: {
				messaging_product: "whatsapp",
				to: msg.to.replace(/^\+/, ""),
				type: "text",
				text: { preview_url: false, body: msg.body },
			};

	const res = await fetch(`https://graph.facebook.com/v20.0/${creds.phoneNumberId}/messages`, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${creds.apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify(payload),
	});

	if (res.ok) {
		const data = (await res.json()) as { messages?: Array<{ id?: string }> };
		return { success: true, messageId: data.messages?.[0]?.id };
	}

	return { success: false, error: `Meta WhatsApp ${res.status}: ${await res.text()}` };
}

export async function sendSmsOtp(
	provider: SmsProviderId,
	message: SmsOtpMessage,
	credentials: SmsProviderCredentials,
): Promise<SmsSendResult> {
	switch (provider) {
		case "twilio":
			return sendViaTwilio(message, credentials);
		case "messagebird":
			return sendViaMessageBird(message, credentials);
		case "vonage":
			return sendViaVonage(message, credentials);
		case "africas_talking":
			return sendViaAfricasTalking(message, credentials);
		case "termii":
			return sendViaTermii(message, credentials);
		case "mobitech":
			return sendViaMobitech(message, credentials);
		case "meta_whatsapp":
			return sendViaMetaWhatsApp(message, credentials);
		default: {
			const _exhaustive: never = provider;
			return { success: false, error: `Unknown SMS provider: ${_exhaustive as string}` };
		}
	}
}

export function validateSmsCredentials(
	provider: SmsProviderId,
	credentials: SmsProviderCredentials,
): { valid: boolean; missing: string[] } {
	const missing: string[] = [];
	const requireAnySender = () => {
		if (!credentials.senderId && !credentials.fromNumber) missing.push("senderId");
	};

	switch (provider) {
		case "twilio":
			if (!credentials.accountSid) missing.push("accountSid");
			if (!credentials.authToken) missing.push("authToken");
			if (!credentials.fromNumber) missing.push("fromNumber");
			break;
		case "messagebird":
			if (!credentials.apiKey) missing.push("apiKey");
			requireAnySender();
			break;
		case "vonage":
			if (!credentials.apiKey) missing.push("apiKey");
			if (!credentials.apiSecret) missing.push("apiSecret");
			requireAnySender();
			break;
		case "africas_talking":
			if (!credentials.username) missing.push("username");
			if (!credentials.apiKey) missing.push("apiKey");
			break;
		case "termii":
			if (!credentials.apiKey) missing.push("apiKey");
			requireAnySender();
			break;
		case "mobitech":
			if (!credentials.apiKey) missing.push("apiKey");
			requireAnySender();
			break;
		case "meta_whatsapp":
			if (!credentials.apiKey) missing.push("apiKey");
			if (!credentials.phoneNumberId) missing.push("phoneNumberId");
			break;
	}

	return { valid: missing.length === 0, missing };
}
