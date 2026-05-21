"use client";

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

export default function MfaPage() {
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);
	const { config, scopedPath } = useProjectAuthConfig();
	const authClient = useProjectAuthClient();

	return (
		<AuthCard
			title="MFA challenge"
			description="Enter your 6-digit TOTP code."
			logo={<ProjectAuthLogo branding={config?.branding} />}
		>
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					setError(null);
					const response = await postCrossDomainAuthJson(
						authClient,
						HOSTED_AUTH_BASE_URL,
						"/two-factor/verify",
						{ code },
					);
					if (!response.ok) {
						setError("Invalid code");
						return;
					}
					window.location.href = scopedPath("/callback");
				}}
				className="grid gap-3"
			>
				<Label htmlFor="code">Verification code</Label>
				<Input
					id="code"
					value={code}
					onChange={(event) => setCode(event.target.value)}
					placeholder="123456"
					inputMode="numeric"
					maxLength={6}
					required
				/>
				<Button type="submit">Verify</Button>
			</form>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</AuthCard>
	);
}
