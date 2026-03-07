"use client";

import { useState } from "react";
import { AuthCard } from "@banata-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function SsoPage() {
	const [emailDomain, setEmailDomain] = useState("");
	const [error, setError] = useState<string | null>(null);

	return (
		<AuthCard title="Enterprise SSO" description="Route users to their identity provider.">
			<form
				className="grid gap-3"
				onSubmit={async (event) => {
					event.preventDefault();
					setError(null);
					const response = await fetch("/api/auth/sign-in/sso", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({
							domain: emailDomain,
							callbackURL: `${window.location.origin}/`,
						}),
					});
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
