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
import {
	HOSTED_AUTH_BASE_URL,
	postCrossDomainAuthJson,
	useProjectAuthClient,
} from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import { useState } from "react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const { config, error, hasScope, hostedAuthUrl, isLoading, scopedPath } = useProjectAuthConfig();
	const authClient = useProjectAuthClient();

	if (!hasScope) {
		return <MissingProjectScopeCard branding={config?.branding} />;
	}

	if (isLoading) {
		return <LoadingProjectAuthCard title="Reset password" branding={config?.branding} />;
	}

	if (error) {
		return (
			<ProjectAuthErrorCard title="Reset password" message={error} branding={config?.branding} />
		);
	}

	if (!(config?.authMethods.emailPassword ?? false)) {
		return (
			<DisabledAuthMethodCard
				title="Reset password"
				description="Send a secure reset link by email."
				backHref={scopedPath("/sign-in")}
				branding={config?.branding}
			/>
		);
	}

	return (
		<AuthCard
			title="Reset password"
			description="Send a secure reset link by email."
			logo={<ProjectAuthLogo branding={config?.branding} />}
		>
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					await postCrossDomainAuthJson(authClient, HOSTED_AUTH_BASE_URL, "/forget-password", {
						email,
						redirectTo: hostedAuthUrl("/reset-password") ?? scopedPath("/reset-password"),
					});
					setSent(true);
				}}
				className="grid gap-3"
			>
				<Label htmlFor="email">Email</Label>
				<Input
					id="email"
					type="email"
					placeholder="you@company.com"
					value={email}
					onChange={(event) => setEmail(event.target.value)}
					required
				/>
				<Button type="submit">Send reset link</Button>
			</form>
			{sent ? (
				<p className="text-sm text-muted-foreground">
					If this account exists, an email is on the way.
				</p>
			) : null}
		</AuthCard>
	);
}
