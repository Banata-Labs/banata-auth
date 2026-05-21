import { describe, expect, it, vi } from "vitest";
import {
	BANATA_DEFAULT_BOT_PROTECTED_PATHS,
	type BotCheckFn,
	withBotProtection,
} from "../bot-protection";

describe("bot protection readiness helpers", () => {
	it("protects sensitive auth routes by default", () => {
		expect(BANATA_DEFAULT_BOT_PROTECTED_PATHS).toEqual(
			expect.arrayContaining([
				"/api/auth/sign-in",
				"/api/auth/sign-up",
				"/api/auth/forget-password",
				"/api/auth/reset-password",
				"/api/auth/magic-link",
				"/api/auth/email-otp",
				"/api/auth/phone",
				"/api/auth/device/start",
				"/api/auth/device/poll",
			]),
		);
	});

	it("blocks bot traffic on phone OTP routes without custom path configuration", async () => {
		const handler = vi.fn(async (_request: Request) => Response.json({ ok: true }));
		const verify: BotCheckFn = vi.fn(async () => ({ isBot: true, reason: "automated" }));
		const protectedHandler = withBotProtection(handler, { verify });

		const response = await protectedHandler(
			new Request("https://app.example.com/api/auth/phone/start", { method: "POST" }),
		);

		expect(response.status).toBe(403);
		expect(handler).not.toHaveBeenCalled();
		expect(verify).toHaveBeenCalledOnce();
	});

	it("does not verify unprotected auth reads", async () => {
		const handler = vi.fn(async (_request: Request) => Response.json({ ok: true }));
		const verify: BotCheckFn = vi.fn(async () => ({ isBot: true }));
		const protectedHandler = withBotProtection(handler, { verify });

		const response = await protectedHandler(
			new Request("https://app.example.com/api/auth/session", { method: "POST" }),
		);

		expect(response.status).toBe(200);
		expect(handler).toHaveBeenCalledOnce();
		expect(verify).not.toHaveBeenCalled();
	});

	it("fails closed when provider verification is unavailable and failOpen is false", async () => {
		const handler = vi.fn(async (_request: Request) => Response.json({ ok: true }));
		const verify: BotCheckFn = vi.fn(async () => {
			throw new Error("provider unavailable");
		});
		const protectedHandler = withBotProtection(handler, { verify, failOpen: false });

		const response = await protectedHandler(
			new Request("https://app.example.com/api/auth/device/start", { method: "POST" }),
		);

		expect(response.status).toBe(503);
		expect(handler).not.toHaveBeenCalled();
	});
});
