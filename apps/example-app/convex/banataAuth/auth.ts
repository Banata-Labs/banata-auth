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

export function buildConfig(): BanataAuthConfig {
	const secret = process.env.BETTER_AUTH_SECRET;
	if (!secret || secret === "placeholder-for-module-analysis") {
		console.warn(
			"[BanataAuth] BETTER_AUTH_SECRET is not set. " +
				"Auth will not work correctly in production. " +
				"Set the BETTER_AUTH_SECRET environment variable.",
		);
	}

	return {
		appName: "Banata Auth Example",
		siteUrl: process.env.SITE_URL ?? "http://localhost:3000",
		secret: secret ?? "INSECURE-PLACEHOLDER-DO-NOT-USE-IN-PRODUCTION",
		authMethods: {
			emailPassword: true,
			magicLink: true,
			emailOtp: true,
			passkey: true,
			twoFactor: true,
			organization: true,
		},
		passkey: {
			rpId: process.env.PASSKEY_RP_ID ?? "localhost",
			rpName: "Banata Auth",
			origin: process.env.PASSKEY_ORIGIN ?? "http://localhost:3000",
		},
		email: {
			sendVerificationEmail: async (_data) => {
				console.warn("[BanataAuth] sendVerificationEmail not configured — email not sent.");
			},
			sendResetPassword: async (_data) => {
				console.warn("[BanataAuth] sendResetPassword not configured — email not sent.");
			},
			sendMagicLink: async (_data) => {
				console.warn("[BanataAuth] sendMagicLink not configured — email not sent.");
			},
			sendOtp: async (_data) => {
				console.warn("[BanataAuth] sendOtp not configured — email not sent.");
			},
			sendInvitationEmail: async (_data) => {
				console.warn("[BanataAuth] sendInvitationEmail not configured — email not sent.");
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
		config: buildConfig(),
	});

export const options = createAuthOptions({} as GenericCtx<DataModel>);

export const createAuth = (ctx: GenericCtx<DataModel>) =>
	createBanataAuth(ctx, {
		authComponent,
		authConfig,
		config: buildConfig(),
	});
