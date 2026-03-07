"use client";

import { useState } from "react";
import { AuthCard } from "@banata-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function MfaPage() {
	const [code, setCode] = useState("");
	const [error, setError] = useState<string | null>(null);

	return (
		<AuthCard title="MFA challenge" description="Enter your 6-digit TOTP code.">
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					setError(null);
					const response = await fetch("/api/auth/two-factor/verify", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ code }),
					});
					if (!response.ok) {
						setError("Invalid code");
					}
				}}
				className="grid gap-3"
			>
				<Label htmlFor="code">Verification code</Label>
				<Input id="code" value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" inputMode="numeric" maxLength={6} required />
				<Button type="submit">Verify</Button>
			</form>
			{error ? <p className="text-sm text-destructive">{error}</p> : null}
		</AuthCard>
	);
}
