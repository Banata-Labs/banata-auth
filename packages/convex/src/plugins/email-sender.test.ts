import { afterEach, describe, expect, it, vi } from "vitest";
import { sendEmail, validateCredentials } from "./email-sender";

describe("email sender providers", () => {
	afterEach(() => {
		vi.unstubAllGlobals();
	});

	it("validates Cloudflare Email Service credentials", () => {
		expect(validateCredentials("cloudflare", {})).toEqual({
			valid: false,
			missing: ["apiKey", "accountId"],
		});
		expect(
			validateCredentials("cloudflare", {
				apiKey: "cf_token",
				accountId: "account_123",
			}),
		).toEqual({ valid: true, missing: [] });
	});

	it("sends Cloudflare email through the REST API", async () => {
		const fetchMock = vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					success: true,
					errors: [],
					messages: [],
					result: { delivered: ["user@example.com"] },
				}),
				{ status: 200, headers: { "content-type": "application/json" } },
			),
		);
		vi.stubGlobal("fetch", fetchMock);

		const result = await sendEmail(
			"cloudflare",
			{
				from: "Banata <noreply@example.com>",
				to: "user@example.com",
				subject: "Welcome",
				html: "<p>Welcome</p>",
				text: "Welcome",
				replyTo: "support@example.com",
			},
			{ apiKey: "cf_token", accountId: "account_123" },
		);

		expect(result.success).toBe(true);
		expect(fetchMock).toHaveBeenCalledWith(
			"https://api.cloudflare.com/client/v4/accounts/account_123/email/sending/send",
			expect.objectContaining({
				method: "POST",
				headers: expect.objectContaining({
					Authorization: "Bearer cf_token",
					"Content-Type": "application/json",
				}),
			}),
		);
		const body = JSON.parse(fetchMock.mock.calls[0]?.[1]?.body as string) as Record<string, unknown>;
		expect(body).toMatchObject({
			from: "Banata <noreply@example.com>",
			to: "user@example.com",
			subject: "Welcome",
			html: "<p>Welcome</p>",
			text: "Welcome",
			reply_to: "support@example.com",
		});
	});
});
