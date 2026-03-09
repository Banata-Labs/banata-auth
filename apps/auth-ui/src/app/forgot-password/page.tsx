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
import { useProjectAuthConfig } from "@/lib/project-auth";
import { AuthCard } from "@banata-auth/react";
import { useState } from "react";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const { config, error, hasScope, isLoading, scopedApiPath, scopedPath } = useProjectAuthConfig();

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
					await fetch(scopedApiPath("/api/auth/forget-password"), {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							email,
							redirectTo: scopedPath("/reset-password"),
						}),
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
