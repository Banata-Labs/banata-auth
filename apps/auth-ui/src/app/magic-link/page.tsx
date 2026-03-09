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

export default function MagicLinkPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);
	const { config, error, hasScope, isLoading, scopedApiPath, scopedPath } = useProjectAuthConfig();

	if (!hasScope) {
		return <MissingProjectScopeCard />;
	}

	if (isLoading) {
		return <LoadingProjectAuthCard title="Magic Link" />;
	}

	if (error) {
		return <ProjectAuthErrorCard title="Magic Link" message={error} />;
	}

	if (!(config?.authMethods.magicLink ?? false)) {
		return (
			<DisabledAuthMethodCard
				title="Magic Link"
				description="Request a secure sign-in link by email."
				backHref={scopedPath("/sign-in")}
			/>
		);
	}

	return (
		<AuthCard title="Magic Link" description="Get a secure sign-in link sent to your inbox.">
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					await fetch(scopedApiPath("/api/auth/sign-in/magic-link"), {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ email, callbackURL: scopedPath("/org-selector") }),
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
