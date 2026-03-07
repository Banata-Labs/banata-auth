import { handler } from "@/lib/auth-server";
import { createBotIdVerifier, withBotProtection } from "@banata-auth/nextjs/bot-protection";
import { checkBotId } from "botid/server";

export const GET = handler.GET;

/**
 * POST handler with bot protection on auth-sensitive routes.
 *
 * Uses `@banata-auth/nextjs/bot-protection` to wrap the handler with
 * Vercel BotID verification. The `withBotProtection` wrapper checks
 * requests against protected paths and verifies them before forwarding.
 *
 * In local development, BotID returns `isBot: false` by default.
 */
export const POST = withBotProtection(handler.POST, {
	verify: createBotIdVerifier(checkBotId),
});
