"use client";

import { PasskeyButton } from "@/components/passkey-button";
import {
	LoadingProjectAuthCard,
	MissingProjectScopeCard,
	ProjectAuthErrorCard,
} from "@/components/project-auth-state";
import { ProjectAuthLogo } from "@/components/project-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useProjectAuthClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard, SocialButtons } from "@banata-auth/react";
import Link from "next/link";
import { useState } from "react";

type SignInViewModel = {
	emailPasswordEnabled: boolean;
	passkeyEnabled: boolean;
	magicLinkEnabled: boolean;
	emailOtpEnabled: boolean;
	ssoEnabled: boolean;
	signUpEnabled: boolean;
	showDivider: boolean;
	hasAnyMethod: boolean;
	callbackURL: string;
};

function formatAuthError(
	error:
		| {
				message?: string;
				code?: string;
				status?: number;
				details?: { tryAgainIn?: number };
		  }
		| null
		| undefined,
	fallbackMessage: string,
) {
	if (!error) {
		return fallbackMessage;
	}

	const baseMessage = error.message?.trim() || fallbackMessage;
	const isRateLimited =
		error.code === "RATE_LIMITED" ||
		error.status === 429 ||
		baseMessage.toLowerCase() === "rate limit exceeded.";
	if (!isRateLimited) {
		return baseMessage;
	}

	const retryAfter = error.details?.tryAgainIn;
	if (typeof retryAfter !== "number" || !Number.isFinite(retryAfter) || retryAfter <= 0) {
		return baseMessage;
	}

	const seconds = Math.max(1, Math.ceil(retryAfter));
	return `${baseMessage} Try again in about ${seconds} second${seconds === 1 ? "" : "s"}.`;
}

function getSignInViewModel(
	config: ReturnType<typeof useProjectAuthConfig>["config"],
	socialProviderCount: number,
	hostedAuthUrl: (path: string) => string | null,
	scopedPath: (path: string) => string,
): SignInViewModel {
	const emailPasswordEnabled = config?.authMethods.emailPassword ?? false;
	const passkeyEnabled = config?.authMethods.passkey ?? false;
	const magicLinkEnabled = config?.authMethods.magicLink ?? false;
	const emailOtpEnabled = config?.authMethods.emailOtp ?? false;
	const ssoEnabled = config?.authMethods.sso ?? false;
	const signUpFeatureEnabled = config?.features.signUp ?? true;

	return {
		emailPasswordEnabled,
		passkeyEnabled,
		magicLinkEnabled,
		emailOtpEnabled,
		ssoEnabled,
		signUpEnabled: signUpFeatureEnabled && (emailPasswordEnabled || socialProviderCount > 0),
		showDivider: passkeyEnabled || socialProviderCount > 0 || ssoEnabled,
		hasAnyMethod:
			emailPasswordEnabled ||
			passkeyEnabled ||
			magicLinkEnabled ||
			emailOtpEnabled ||
			ssoEnabled ||
			socialProviderCount > 0,
		callbackURL: hostedAuthUrl("/callback") ?? scopedPath("/callback"),
	};
}

function PasswordlessLinks({
	emailOtpEnabled,
	magicLinkEnabled,
	scopedPath,
}: {
	emailOtpEnabled: boolean;
	magicLinkEnabled: boolean;
	scopedPath: (path: string) => string;
}) {
	if (!magicLinkEnabled && !emailOtpEnabled) {
		return null;
	}

	return (
		<p className="text-sm text-muted-foreground">
			Prefer passwordless?{" "}
			{magicLinkEnabled ? <Link href={scopedPath("/magic-link")}>Magic link</Link> : null}
			{magicLinkEnabled && emailOtpEnabled ? " or " : null}
			{emailOtpEnabled ? <Link href={scopedPath("/email-otp")}>Email OTP</Link> : null}
		</p>
	);
}

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const {
		config,
		customerAuthBaseUrl,
		error: configError,
		enabledSocialProviders,
		hasScope,
		hostedAuthUrl,
		isLoading,
		scopedPath,
	} = useProjectAuthConfig();
	const authClient = useProjectAuthClient(customerAuthBaseUrl);

	if (!hasScope) {
		return <MissingProjectScopeCard branding={config?.branding} />;
	}

	if (isLoading) {
		return <LoadingProjectAuthCard title="Sign in" branding={config?.branding} />;
	}

	if (configError) {
		return (
			<ProjectAuthErrorCard title="Sign in" message={configError} branding={config?.branding} />
		);
	}

	const viewModel = getSignInViewModel(
		config,
		enabledSocialProviders.length,
		hostedAuthUrl,
		scopedPath,
	);

	return (
		<div className="mt-14">
			<AuthCard
				title="Sign in"
				description="Use the methods enabled for this Banata project."
				logo={<ProjectAuthLogo branding={config?.branding} />}
			>
				{!viewModel.hasAnyMethod ? (
					<p className="text-sm text-muted-foreground">
						No sign-in methods are enabled for this project yet.
					</p>
				) : null}
				{viewModel.emailPasswordEnabled ? (
					<form
						onSubmit={async (event) => {
							event.preventDefault();
							setError(null);
							const result = await authClient.signIn.email({
								email,
								password,
								callbackURL: viewModel.callbackURL,
							});
							if (result.error) {
								setError(formatAuthError(result.error, "Unable to sign in"));
								return;
							}
							window.location.href = viewModel.callbackURL;
						}}
						className="grid gap-3"
					>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input
								id="email"
								placeholder="Email"
								type="email"
								value={email}
								onChange={(event) => setEmail(event.target.value)}
								required
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input
								id="password"
								placeholder="Password"
								type="password"
								value={password}
								onChange={(event) => setPassword(event.target.value)}
								required
							/>
						</div>
						<Button type="submit">Continue</Button>
					</form>
				) : null}
				{error ? <p className="text-sm text-destructive">{error}</p> : null}
				{viewModel.showDivider && viewModel.emailPasswordEnabled ? <Separator /> : null}
				{viewModel.passkeyEnabled ? <PasskeyButton callbackURL={viewModel.callbackURL} /> : null}
				{enabledSocialProviders.length > 0 ? (
					<SocialButtons
						authClient={authClient}
						providers={enabledSocialProviders}
						callbackURL={viewModel.callbackURL}
					/>
				) : null}
				{viewModel.ssoEnabled ? (
					<p className="text-sm text-muted-foreground">
						Use your company identity provider?{" "}
						<Link href={scopedPath("/sso")} className="underline">
							Continue with enterprise SSO
						</Link>
					</p>
				) : null}
				{viewModel.signUpEnabled ? (
					<p className="text-sm text-muted-foreground">
						Need an account? <Link href={scopedPath("/sign-up")}>Create one</Link>
					</p>
				) : null}
				<PasswordlessLinks
					emailOtpEnabled={viewModel.emailOtpEnabled}
					magicLinkEnabled={viewModel.magicLinkEnabled}
					scopedPath={scopedPath}
				/>
				{viewModel.emailPasswordEnabled ? (
					<p className="text-sm text-muted-foreground">
						Forgot your password? <Link href={scopedPath("/forgot-password")}>Reset it</Link>
					</p>
				) : null}
			</AuthCard>
		</div>
	);
}
