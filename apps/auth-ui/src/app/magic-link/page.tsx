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

export default function MagicLinkPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const { config, customerAuthBaseUrl, error, hasScope, hostedAuthUrl, isLoading, scopedPath } =
		useProjectAuthConfig();
	const authClient = useProjectAuthClient(customerAuthBaseUrl);

	if (!hasScope) {
		return <MissingProjectScopeCard branding={config?.branding} />;
	}

	if (isLoading) {
		return <LoadingProjectAuthCard title="Magic Link" branding={config?.branding} />;
	}

	if (error) {
		return <ProjectAuthErrorCard title="Magic Link" message={error} branding={config?.branding} />;
	}

	if (!(config?.authMethods.magicLink ?? false)) {
		return (
			<DisabledAuthMethodCard
				title="Magic Link"
				description="Request a secure sign-in link by email."
				backHref={scopedPath("/sign-in")}
				branding={config?.branding}
			/>
		);
	}

	return (
		<AuthCard
			title="Magic Link"
			description="Get a secure sign-in link sent to your inbox."
			logo={<ProjectAuthLogo branding={config?.branding} />}
		>
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					if (!customerAuthBaseUrl) return;
					await postCrossDomainAuthJson(authClient, customerAuthBaseUrl, "/sign-in/magic-link", {
						email,
						callbackURL: hostedAuthUrl("/callback") ?? scopedPath("/callback"),
					});
					setSent(true);
				}}
				className="grid gap-3"
			>
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					placeholder="you@company.com"
					required
				/>
				<Button type="submit">Send magic link</Button>
			</form>
			{sent ? (
				<p className="text-sm text-muted-foreground">
					If the account exists, a magic link is on the way.
				</p>
			) : null}
		</AuthCard>
	);
}
