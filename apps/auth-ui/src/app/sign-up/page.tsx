"use client";

import {
	DisabledAuthMethodCard,
	LoadingProjectAuthCard,
	MissingProjectScopeCard,
	ProjectAuthErrorCard,
} from "@/components/project-auth-state";
import { useProjectAuthClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard, SignUpForm, SocialButtons } from "@banata-auth/react";
import Link from "next/link";

export default function SignUpPage() {
	const {
		config,
		customerAuthBaseUrl,
		error,
		enabledSocialProviders,
		hasScope,
		isLoading,
		scopedPath,
	} = useProjectAuthConfig();
	const authClient = useProjectAuthClient(customerAuthBaseUrl);

	if (!hasScope) {
		return <MissingProjectScopeCard />;
	}

	if (isLoading) {
		return <LoadingProjectAuthCard title="Create account" />;
	}

	if (error) {
		return <ProjectAuthErrorCard title="Create account" message={error} />;
	}

	const emailPasswordEnabled = config?.authMethods.emailPassword ?? false;
	const verificationRequired = config?.emailPassword.requireEmailVerification ?? true;
	const callbackURL = verificationRequired ? scopedPath("/verify-email") : scopedPath("/callback");

	if (!emailPasswordEnabled && enabledSocialProviders.length === 0) {
		return (
			<DisabledAuthMethodCard
				title="Create account"
				description="This project is not accepting new sign-ups with hosted auth."
				backHref={scopedPath("/sign-in")}
			/>
		);
	}

	if (!emailPasswordEnabled) {
		return (
			<div className="mt-14">
				<AuthCard
					title="Create account"
					description="Use one of the providers enabled for this Banata project."
				>
					<SocialButtons
						authClient={authClient}
						providers={enabledSocialProviders}
						callbackURL={callbackURL}
					/>
					<p className="text-sm text-muted-foreground">
						Already have an account?{" "}
						<Link href={scopedPath("/sign-in")} className="underline">
							Sign in
						</Link>
					</p>
				</AuthCard>
			</div>
		);
	}

	return (
		<div className="mt-14">
			<SignUpForm
				authClient={authClient}
				callbackURL={callbackURL}
				socialProviders={enabledSocialProviders}
				description={
					verificationRequired
						? "Email verification is required before the account can sign in."
						: "Create an account for this Banata project."
				}
				footer={
					<p>
						Already have an account?{" "}
						<Link href={scopedPath("/sign-in")} className="underline">
							Sign in
						</Link>
					</p>
				}
			/>
		</div>
	);
}
