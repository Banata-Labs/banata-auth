import {
	type BanataAuthConfig,
	createBanataAuth,
	createBanataAuthComponent,
	createBanataAuthOptions,
} from "@banata-auth/convex";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

export const authComponent = createBanataAuthComponent<DataModel, typeof schema>(
	components.banataAuth,
	schema,
);

// ─── Email Sending ─────────────────────────────────────────────────────
// Uses Resend API if RESEND_API_KEY is set, otherwise logs to console.
// In production, set RESEND_API_KEY and RESEND_FROM_EMAIL via:
//   npx convex env set RESEND_API_KEY re_xxx
//   npx convex env set RESEND_FROM_EMAIL "Banata Auth <auth@yourdomain.com>"

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
	const apiKey = process.env.RESEND_API_KEY;
	const from = process.env.RESEND_FROM_EMAIL ?? "Banata Auth <noreply@banata.dev>";

	if (!apiKey) {
		console.warn(
			`[banata-auth] RESEND_API_KEY is not set — email to ${to} ("${subject}") was NOT delivered. Set RESEND_API_KEY via npx convex env set RESEND_API_KEY re_xxx to enable email delivery.`,
		);
		return;
	}

	const res = await fetch("https://api.resend.com/emails", {
		method: "POST",
		headers: {
			Authorization: `Bearer ${apiKey}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({ from, to, subject, html }),
	});

	if (!res.ok) {
		const error = await res.text();
		console.error(`[email] Failed to send to ${to}: ${error}`);
	}
}

export function getConfig(): BanataAuthConfig {
	const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

	return {
		appName: "Banata Auth Dashboard",
		siteUrl,
		// During Convex module analysis env vars are unavailable, so we fall back
		// to a placeholder.  At actual request time we enforce a real secret.
		secret:
			process.env.BETTER_AUTH_SECRET ?? "placeholder-for-module-analysis",
		trustedOrigins: [
			"http://localhost:3000",
			"http://localhost:3001",
			"http://localhost:3002",
			"http://localhost:3003",
			...(process.env.TRUSTED_ORIGINS
				? process.env.TRUSTED_ORIGINS.split(",").map((o) => o.trim())
				: []),
		],
		authMethods: {
			emailPassword: true,
			magicLink: false,
			emailOtp: false,
			passkey: false,
			twoFactor: false,
			organization: true,
		},
		email: {
			sendVerificationEmail: async ({
				user,
				url,
			}: { user: { email: string; name: string }; url: string; token: string }) => {
				await sendEmail(
					user.email,
					"Verify your email - Banata Auth",
					`<h2>Verify your email</h2><p>Click the link below to verify your email address:</p><p><a href="${url}">${url}</a></p>`,
				);
			},
			sendResetPassword: async ({
				user,
				url,
			}: { user: { email: string; name: string }; url: string; token: string }) => {
				await sendEmail(
					user.email,
					"Reset your password - Banata Auth",
					`<h2>Reset your password</h2><p>Click the link below to reset your password:</p><p><a href="${url}">${url}</a></p>`,
				);
			},
			sendMagicLink: async ({ email, url }: { email: string; url: string }) => {
				await sendEmail(
					email,
					"Sign in to Banata Auth",
					`<h2>Sign in</h2><p>Click the link below to sign in:</p><p><a href="${url}">${url}</a></p>`,
				);
			},
			sendOtp: async ({ email, otp }: { email: string; otp: string }) => {
				await sendEmail(
					email,
					"Your verification code - Banata Auth",
					`<h2>Your verification code</h2><p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${otp}</p><p>This code expires in 10 minutes.</p>`,
				);
			},
			sendInvitationEmail: async ({
				email,
				organizationName,
				inviterName,
			}: { email: string; organizationName: string; inviterName: string }) => {
				await sendEmail(
					email,
					`You've been invited to ${organizationName}`,
					`<h2>Organization Invitation</h2><p>${inviterName} has invited you to join <strong>${organizationName}</strong>.</p><p>Sign in to your dashboard to accept the invitation.</p>`,
				);
			},
		},
		socialProviders:
			process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET
				? {
						github: {
							clientId: process.env.GITHUB_CLIENT_ID,
							clientSecret: process.env.GITHUB_CLIENT_SECRET,
						},
					}
				: undefined,
	};
}

export const createAuthOptions = (ctx: GenericCtx<DataModel>) =>
	createBanataAuthOptions(ctx, {
		authComponent,
		authConfig,
		config: getConfig(),
	});

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	createBanataAuth(ctx, {
		authComponent,
		authConfig,
		config: getConfig(),
	});
