"use client";

import {
	DisabledAuthMethodCard,
	LoadingProjectAuthCard,
	MissingProjectScopeCard,
	ProjectAuthErrorCard,
} from "@/components/project-auth-state";
import { authClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard, SignUpForm, SocialButtons } from "@banata-auth/react";
import Link from "next/link";

export default function SignUpPage() {
	const { config, error, enabledSocialProviders, hasScope, isLoading, scopedPath } =
		useProjectAuthConfig();

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
	const callbackURL = scopedPath("/verify-email");

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
				description="Email verification is required."
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
