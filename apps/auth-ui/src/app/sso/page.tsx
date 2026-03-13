"use client";

import {
	DisabledAuthMethodCard,
	LoadingProjectAuthCard,
	MissingProjectScopeCard,
	ProjectAuthErrorCard,
} from "@/components/project-auth-state";
import { ProjectAuthLogo } from "@/components/project-branding";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postCrossDomainAuthJson, useProjectAuthClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import { useState } from "react";

export default function SsoPage() {
	const [emailDomain, setEmailDomain] = useState("");
	const [error, setError] = useState<string | null>(null);
	const {
		config,
		customerAuthBaseUrl,
		error: configError,
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
		return <LoadingProjectAuthCard title="Enterprise SSO" branding={config?.branding} />;
	}

	if (configError) {
		return (
			<ProjectAuthErrorCard
				title="Enterprise SSO"
				message={configError}
				branding={config?.branding}
			/>
		);
	}

	if (!(config?.authMethods.sso ?? false)) {
		return (
			<DisabledAuthMethodCard
				title="Enterprise SSO"
				description="Enterprise SSO is disabled for this project."
				backHref={scopedPath("/sign-in")}
				backLabel="Back to sign in"
				branding={config?.branding}
			/>
		);
	}

	return (
		<AuthCard
			title="Enterprise SSO"
			description="Route users to their identity provider."
			logo={<ProjectAuthLogo branding={config?.branding} />}
		>
			<form
				className="grid gap-3"
				onSubmit={async (event) => {
					event.preventDefault();
					setError(null);
					if (!customerAuthBaseUrl) {
						setError("Hosted auth is missing the customer app auth endpoint.");
						return;
					}
					const response = await postCrossDomainAuthJson(
						authClient,
						customerAuthBaseUrl,
						"/sign-in/sso",
						{
							domain: emailDomain,
							callbackURL: hostedAuthUrl("/callback") ?? scopedPath("/callback"),
						},
					);
					if (!response.ok) {
						setError("Unable to start enterprise SSO.");
						return;
					}
					const payload = (await response.json()) as { url?: string };
					if (!payload.url) {
						setError("Missing SSO redirect URL.");
						return;
					}
					window.location.href = payload.url;
				}}
			>
				<Label htmlFor="domain_hint">Company domain</Label>
				<Input
					id="domain_hint"
					placeholder="company.com"
					value={emailDomain}
					onChange={(event) => setEmailDomain(event.target.value)}
					required
				/>
				<Button type="submit">Continue with SSO</Button>
				{error ? <p className="text-sm text-destructive">{error}</p> : null}
			</form>
		</AuthCard>
	);
}
