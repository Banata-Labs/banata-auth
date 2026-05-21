import { afterEach, describe, expect, it, vi } from "vitest";
import { sendSmsOtp, validateSmsCredentials } from "./sms-sender";

const message = {
	to: "+254712345678",
	channel: "sms" as const,
	body: "Your Banata verification code is 123456.",
	otp: "123456",
	purpose: "sign_in",
};

describe("SMS sender providers", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("validates required credentials for configured providers", () => {
		expect(validateSmsCredentials("twilio", {}).missing).toEqual([
			"accountSid",
			"authToken",
			"fromNumber",
		]);
		expect(
			validateSmsCredentials("meta_whatsapp", {
				apiKey: "token",
				phoneNumberId: "123",
			}),
		).toEqual({ valid: true, missing: [] });
	});

	it("formats Twilio WhatsApp recipients with the whatsapp prefix", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ sid: "SM123" }), {
				status: 201,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await sendSmsOtp(
			"twilio",
			{ ...message, channel: "whatsapp" },
			{
				accountSid: "AC123",
				authToken: "secret",
				fromNumber: "+15551234567",
			},
		);

		expect(result).toEqual({ success: true, messageId: "SM123" });
		const body = fetchMock.mock.calls[0]?.[1]?.body as string;
		const params = new URLSearchParams(body);
		expect(params.get("To")).toBe("whatsapp:+254712345678");
		expect(params.get("From")).toBe("whatsapp:+15551234567");
		expect(params.get("Body")).toBe(message.body);
	});

	it("sends Meta WhatsApp OTP with an approved template when configured", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ messages: [{ id: "wamid.123" }] }), {
				status: 200,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await sendSmsOtp(
			"meta_whatsapp",
			{ ...message, channel: "whatsapp" },
			{
				apiKey: "wa_token",
				phoneNumberId: "phone_123",
				templateName: "otp_code",
				templateLanguage: "en_US",
			},
		);

		expect(result).toEqual({ success: true, messageId: "wamid.123" });
		expect(fetchMock).toHaveBeenCalledWith(
			"https://graph.facebook.com/v20.0/phone_123/messages",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer wa_token",
					"Content-Type": "application/json",
				}),
			}),
		);
		const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as {
			type: string;
			template: { name: string; language: { code: string }; components: Array<unknown> };
			to: string;
		};
		expect(body.type).toBe("template");
		expect(body.to).toBe("254712345678");
		expect(body.template.name).toBe("otp_code");
		expect(body.template.language.code).toBe("en_US");
		expect(JSON.stringify(body.template.components)).toContain("123456");
	});

	it("sends Mobitech SMS OTP with API key headers and sender ID", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(JSON.stringify({ messageId: "mobitech-123" }), {
				status: 202,
				headers: { "content-type": "application/json" },
			}),
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await sendSmsOtp("mobitech", message, {
			apiKey: "mobitech_key",
			senderId: "Banata",
			apiBaseUrl: "https://bulk.example.test/api/sms/send",
		});

		expect(result).toEqual({ success: true, messageId: "mobitech-123" });
		expect(fetchMock).toHaveBeenCalledWith(
			"https://bulk.example.test/api/sms/send",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer mobitech_key",
					h_api_key: "mobitech_key",
					"Content-Type": "application/json",
				}),
			}),
		);
		const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as {
			to: string;
			from: string;
			message: string;
		};
		expect(body.to).toBe("254712345678");
		expect(body.from).toBe("Banata");
		expect(body.message).toBe(message.body);
	});
});
