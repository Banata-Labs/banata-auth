"use client";

import { useState } from "react";
import { AuthCard } from "@banata-auth/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
	const [email, setEmail] = useState("");
	const [sent, setSent] = useState(false);

	return (
		<AuthCard title="Reset password" description="Send a secure reset link by email.">
			<form
				onSubmit={async (event) => {
					event.preventDefault();
					await fetch("/api/auth/forget-password", {
						method: "POST",
						headers: { "content-type": "application/json" },
						body: JSON.stringify({ email, redirectTo: "/reset-password" }),
					});
					setSent(true);
				}}
				className="grid gap-3"
			>
				<Label htmlFor="email">Email</Label>
				<Input id="email" type="email" placeholder="you@company.com" value={email} onChange={(event) => setEmail(event.target.value)} required />
				<Button type="submit">Send reset link</Button>
			</form>
			{sent ? <p className="text-sm text-muted-foreground">If this account exists, an email is on the way.</p> : null}
		</AuthCard>
	);
}
