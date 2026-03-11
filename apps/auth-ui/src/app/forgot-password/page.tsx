"use client";

import {
	DisabledAuthMethodCard,
	LoadingProjectAuthCard,
	MissingProjectScopeCard,
	ProjectAuthErrorCard,
} from "@/components/project-auth-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { postCrossDomainAuthJson, useProjectAuthClient } from "@/lib/auth-client";
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import { useState } from "react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const { config, customerAuthBaseUrl, error, hasScope, isLoading, scopedPath } =
		useProjectAuthConfig();
	const authClient = useProjectAuthClient(customerAuthBaseUrl);

	if (!hasScope) {
		return <MissingProjectScopeCard />;
	}

	if (isLoading) {
		return <LoadingProjectAuthCard title="Reset password" />;
	}

	if (error) {
		return <ProjectAuthErrorCard title="Reset password" message={error} />;
	}

	if (!(config?.authMethods.emailPassword ?? false)) {
		return (
			<DisabledAuthMethodCard
				title="Reset password"
				description="Send a secure reset link by email."
				backHref={scopedPath("/sign-in")}
			/>
		);
	}

	return (
		<AuthCard title="Reset password" description="Send a secure reset link by email.">
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					if (!customerAuthBaseUrl) return;
					await postCrossDomainAuthJson(authClient, customerAuthBaseUrl, "/forget-password", {
						email,
						redirectTo: scopedPath("/reset-password"),
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
