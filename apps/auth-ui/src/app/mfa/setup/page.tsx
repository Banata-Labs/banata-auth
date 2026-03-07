"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthCard } from "@banata-auth/react";
import { useState } from "react";

export default function MfaSetupPage() {
	const [password, setPassword] = useState("");
	const [code, setCode] = useState("");
	const [secret, setSecret] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	return (
		<AuthCard
			title="Set up MFA"
			description="Enter your password, then scan the secret in your authenticator app."
		>
			<div className="grid gap-2">
				<Label htmlFor="password">Current password</Label>
				<Input
					id="password"
					type="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					placeholder="Enter your password"
					required
				/>
			</div>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
			<Button
				type="button"
				variant="secondary"
				disabled={!password}
				onClick={async () => {
					setError(null);
					const response = await fetch("/api/auth/two-factor/enable", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ password }),
					});
					if (!response.ok) {
						setSecret(null);
						setError("Failed to enable MFA. Check your password and try again.");
						return;
					}
					const payload = (await response.json()) as { totpURI?: string };
					setSecret(payload.totpURI ?? null);
				}}
			>
				Generate setup secret
			</Button>
			{secret ? (
				<p className="rounded-md border bg-muted p-2 font-mono text-xs text-muted-foreground">
					{secret}
				</p>
			) : null}
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					await fetch("/api/auth/two-factor/verify", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ code }),
					});
				}}
				className="grid gap-3"
			>
				<Label htmlFor="code">Verification code</Label>
				<Input
					id="code"
					value={code}
					onChange={(event) => setCode(event.target.value)}
					placeholder="Verification code"
					inputMode="numeric"
					required
				/>
				<Button type="submit">Complete setup</Button>
			</form>
		</AuthCard>
	);
}
