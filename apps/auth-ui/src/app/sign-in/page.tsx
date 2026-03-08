"use client";

import Link from "next/link";
import { useState } from "react";
import { AuthCard, SocialButtons } from "@banata-auth/react";
import { PasskeyButton } from "@/components/passkey-button";
import {
	LoadingProjectAuthCard,
	MissingProjectScopeCard,
	ProjectAuthErrorCard,
} from "@/components/project-auth-state";
import { authClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState<string | null>(null);
	const {
		config,
		error: configError,
		enabledSocialProviders,
		hasScope,
		isLoading,
		scopedPath,
	} = useProjectAuthConfig();

	if (!hasScope) {
		return <MissingProjectScopeCard />;
	}

	if (isLoading) {
		return <LoadingProjectAuthCard title="Sign in" />;
	}

	if (configError) {
		return <ProjectAuthErrorCard title="Sign in" message={configError} />;
	}

	const emailPasswordEnabled = config?.authMethods.emailPassword ?? false;
	const passkeyEnabled = config?.authMethods.passkey ?? false;
	const magicLinkEnabled = config?.authMethods.magicLink ?? false;
	const emailOtpEnabled = config?.authMethods.emailOtp ?? false;
	const signUpEnabled = emailPasswordEnabled || enabledSocialProviders.length > 0;
	const showDivider = passkeyEnabled || enabledSocialProviders.length > 0;
	const callbackURL = scopedPath("/org-selector");
	const hasAnyMethod =
		emailPasswordEnabled ||
		passkeyEnabled ||
		magicLinkEnabled ||
		emailOtpEnabled ||
		enabledSocialProviders.length > 0;

	return (
		<div className="mt-14">
			<AuthCard title="Sign in" description="Use the methods enabled for this Banata project.">
				{!hasAnyMethod ? (
					<p className="text-sm text-muted-foreground">
						No sign-in methods are enabled for this project yet.
					</p>
				) : null}
				{emailPasswordEnabled ? (
					<form
						onSubmit={async (event) => {
							event.preventDefault();
							setError(null);
							const result = await authClient.signIn.email({
								email,
								password,
								callbackURL,
							});
							if (result.error) {
								setError(result.error.message ?? "Unable to sign in");
								return;
							}
							window.location.href = callbackURL;
						}}
						className="grid gap-3"
					>
						<div className="grid gap-2">
							<Label htmlFor="email">Email</Label>
							<Input id="email" placeholder="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
						</div>
						<div className="grid gap-2">
							<Label htmlFor="password">Password</Label>
							<Input id="password" placeholder="Password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required />
						</div>
						<Button type="submit">Continue</Button>
					</form>
				) : null}
				{error ? <p className="text-sm text-destructive">{error}</p> : null}
				{showDivider && emailPasswordEnabled ? <Separator /> : null}
				{passkeyEnabled ? <PasskeyButton callbackURL={callbackURL} /> : null}
				{enabledSocialProviders.length > 0 ? (
					<SocialButtons
						authClient={authClient}
						providers={enabledSocialProviders}
						callbackURL={callbackURL}
					/>
				) : null}
				{signUpEnabled ? (
					<p className="text-sm text-muted-foreground">
						Need an account? <Link href={scopedPath("/sign-up")}>Create one</Link>
					</p>
				) : null}
				{magicLinkEnabled || emailOtpEnabled ? (
					<p className="text-sm text-muted-foreground">
						Prefer passwordless?{" "}
						{magicLinkEnabled ? <Link href={scopedPath("/magic-link")}>Magic link</Link> : null}
						{magicLinkEnabled && emailOtpEnabled ? " or " : null}
						{emailOtpEnabled ? <Link href={scopedPath("/email-otp")}>Email OTP</Link> : null}
					</p>
				) : null}
				{emailPasswordEnabled ? (
					<p className="text-sm text-muted-foreground">
						Forgot your password?{" "}
						<Link href={scopedPath("/forgot-password")}>Reset it</Link>
					</p>
				) : null}
			</AuthCard>
		</div>
	);
}
